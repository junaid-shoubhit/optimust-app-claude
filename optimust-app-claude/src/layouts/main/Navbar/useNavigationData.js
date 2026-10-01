import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useMemo, useRef, useCallback } from "react";
import { apiRequest } from "../../../services/apiBinding";

/* -------------------------------------------------------------------------- */
/*                                    TRIE                                    */
/* -------------------------------------------------------------------------- */

class TrieNode {
  constructor() {
    this.children = new Map();
    this.id = null;
  }
}

const insertTrie = (root, path, id) => {
  if (!path) return;

  const parts = path.split("/").filter(Boolean);
  let node = root;

  for (const part of parts) {
    if (!node.children.has(part)) {
      node.children.set(part, new TrieNode());
    }

    node = node.children.get(part);
  }

  node.id = id;
};

const matchTrie = (root, parts) => {
  let node = root;
  let lastMatchId = null;

  for (const part of parts) {
    const nextNode = node.children.get(part);

    if (!nextNode) break;

    node = nextNode;

    if (node.id) {
      lastMatchId = node.id;
    }
  }

  return lastMatchId;
};

/* -------------------------------------------------------------------------- */
/*                                 UTILITIES                                  */
/* -------------------------------------------------------------------------- */

const orderSorter = (a, b) =>
  (a.orderByExpression ?? 9999) - (b.orderByExpression ?? 9999);

const sortByOrder = (items = []) =>
  items.length > 1 ? [...items].sort(orderSorter) : items;

const formatDesignType = (type) => type?.toLowerCase().replace(/\s+/g, "-");

const createRouteBuilder = (modulePath) => (item) => {
  if (!item?.path || item.path === "#") return null;

  const itemPath = item.path.replace(/^\//, "");

  return item.designType
    ? `${modulePath}/${formatDesignType(item.designType)}/${itemPath}`
    : `${modulePath}/${itemPath}`;
};

/* -------------------------------------------------------------------------- */
/*                              NAVIGATION BUILD                              */
/* -------------------------------------------------------------------------- */

const buildAll = (data = [], modulePath = "") => {
  const trieRoot = new TrieNode();

  const parentMap = new Map();
  const idMap = new Map();

  const buildRoute = createRouteBuilder(modulePath);

  const buildNode = (item, parent = null) => {
    const fullPath = buildRoute(item);

    const node = {
      ...item,
      fullPath,
      children: [],
      dataMenu: [],
      buttonMenu: [],
    };

    idMap.set(item.id, node);

    if (parent) {
      parentMap.set(item.id, parent);
    }

    if (fullPath) {
      insertTrie(trieRoot, fullPath, item.id);
    }

    const children = sortByOrder(item.items);

    for (const child of children) {
      const childPath = buildRoute(child);

      if (child.isDataMenu && child.placeHolder === "Right Tab Menu") {
        node.dataMenu.push({
          ...child,
          fullPath: childPath,
        });

        continue;
      }

      if (child.isDataMenu && child.placeHolder === "Button Menu") {
        node.buttonMenu.push({
          ...child,
          fullPath: childPath,
        });

        continue;
      }

      node.children.push(buildNode(child, node));
    }

    return node;
  };

  const tabs = sortByOrder(data).map((item) => buildNode(item));

  return {
    tabs,
    trieRoot,
    parentMap,
    idMap,
  };
};

const EMPTY_NAVIGATION = {
  tabs: [],
  trieRoot: null,
  parentMap: new Map(),
  idMap: new Map(),
};

/* -------------------------------------------------------------------------- */
/*                                    HOOK                                    */
/* -------------------------------------------------------------------------- */

export const useNavigationData = (activeModule) => {
  const location = useLocation();
  const lastActiveRef = useRef(null);

  const moduleId = activeModule?.id;
  const modulePath = activeModule?.path?.replace(/\/$/, "") || "";

  const pathnameParts = useMemo(
    () => location.pathname.split("/").filter(Boolean),
    [location.pathname],
  );

  const selectNavigation = useCallback(
    (res) => {
      const menuData = res?.data;

      if (!menuData?.length) {
        return EMPTY_NAVIGATION;
      }

      return buildAll(menuData, modulePath);
    },
    [modulePath],
  );

  const { data = EMPTY_NAVIGATION, isLoading } = useQuery({
    queryKey: ["tabs", moduleId],

    enabled: !!moduleId && activeModule?.hasChildren,

    queryFn: () => {
      return apiRequest({
        apiPath: `/Module/userChild/${moduleId}`,
        method: "get",
      });
    },

    select: selectNavigation,

    // No placeholderData: the key changes per module, so "previous data" would be
    // another module's menus rebuilt under this module's path. That made
    // TabMenus redirect to a wrong first tab (e.g. /management/dashboard) while
    // this module's menus were still loading.

    staleTime: Infinity, // 10 mins
    gcTime: 1000 * 60 * 30, // 30 mins

    refetchOnWindowFocus: false,
  });
  const { tabs, trieRoot, parentMap, idMap } = data;
  /* ---------------------------------------------------------------------- */
  /*                               ACTIVE MENU                              */
  /* ---------------------------------------------------------------------- */

  const activeMenu = useMemo(() => {
    if (
      activeModule?.path &&
      !activeModule?.hasChildren &&
      location.pathname.startsWith(activeModule.path)
    ) {
      return {
        ...activeModule,
        fullPath: activeModule.path,
      };
    }

    // Only reuse the last menu while still inside the module it came from.
    // While navigating to another module, activeModule and its tabs lag behind
    // the URL for a few renders; falling back then would leak the previous
    // module's menu (e.g. Dashboard, entityCodeId null) into the new page.
    const isInsideActiveModule =
      !modulePath ||
      location.pathname === modulePath ||
      location.pathname.startsWith(`${modulePath}/`);

    const getFallbackMenu = () => {
      const last = lastActiveRef.current;

      return last && isInsideActiveModule && last.moduleId === moduleId
        ? last.menu
        : null;
    };

    if (!trieRoot) {
      return getFallbackMenu();
    }

    const matchedId = matchTrie(trieRoot, pathnameParts);

    const matchedMenu = matchedId ? idMap.get(matchedId) : null;

    if (matchedMenu) {
      lastActiveRef.current = { moduleId, menu: matchedMenu };
      return matchedMenu;
    }

    return getFallbackMenu();
  }, [
    trieRoot,
    pathnameParts,
    idMap,
    activeModule,
    location.pathname,
    modulePath,
    moduleId,
  ]);

  /* ---------------------------------------------------------------------- */
  /*                               BREADCRUMB                               */
  /* ---------------------------------------------------------------------- */

  const moduleBreadcrumb = useMemo(() => {
    if (!activeModule) return null;

    return {
      id: activeModule.id,
      label: activeModule.label,
      fullPath: activeModule.path,
    };
  }, [activeModule]);

  const breadcrumb = useMemo(() => {
    if (!activeMenu) {
      return moduleBreadcrumb ? [moduleBreadcrumb] : [];
    }

    const chain = [];

    let current = activeMenu;

    while (current) {
      chain.unshift(current);
      current = parentMap.get(current.id);
    }

    if (moduleBreadcrumb) {
      chain.unshift(moduleBreadcrumb);
    }

    return chain;
  }, [activeMenu, parentMap, moduleBreadcrumb]);

  return {
    tabs,
    activeMenu,
    breadcrumb,
    isLoading,
  };
};
