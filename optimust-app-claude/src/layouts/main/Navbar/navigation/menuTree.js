import { PLACEHOLDER } from "./constants";
import { splitPath } from "./pathUtils";

/* -------------------------------------------------------------------------- */
/*                                 PATH TRIE                                  */
/* -------------------------------------------------------------------------- */

/**
 * Prefix tree of menu routes, keyed by path segment. Lets the active menu be
 * resolved as the deepest menu whose route prefixes the current URL.
 */
class PathTrie {
  constructor() {
    this.root = { children: new Map(), id: null };
  }

  insert(path, id) {
    let node = this.root;

    for (const segment of splitPath(path)) {
      if (!node.children.has(segment)) {
        node.children.set(segment, { children: new Map(), id: null });
      }

      node = node.children.get(segment);
    }

    node.id = id;
  }

  /** Id of the deepest menu whose route is a prefix of `segments`. */
  matchDeepest(segments) {
    let node = this.root;
    let matchedId = null;

    for (const segment of segments) {
      node = node.children.get(segment);

      if (!node) break;

      if (node.id) matchedId = node.id;
    }

    return matchedId;
  }
}

/* -------------------------------------------------------------------------- */
/*                                  BUILDING                                  */
/* -------------------------------------------------------------------------- */

const byOrder = (a, b) =>
  (a.orderByExpression ?? 9999) - (b.orderByExpression ?? 9999);

const sortByOrder = (items = []) =>
  items.length > 1 ? [...items].sort(byOrder) : items;

const toRouteSegment = (designType) =>
  designType?.toLowerCase().replace(/\s+/g, "-");

const buildRoute = (modulePath, item) => {
  if (!item?.path || item.path === "#") return null;

  const itemPath = item.path.replace(/^\//, "");

  return item.designType
    ? `${modulePath}/${toRouteSegment(item.designType)}/${itemPath}`
    : `${modulePath}/${itemPath}`;
};

export const EMPTY_NAVIGATION = {
  tabs: [],
  trie: null,
  parentById: new Map(),
  menuById: new Map(),
};

/**
 * Builds the tab tree for a module plus lookup structures for it.
 *
 * Children flagged as data menus ("Right Tab Menu" / "Button Menu") are not
 * navigable tabs; they are attached to their parent as `dataMenu` /
 * `buttonMenu` instead.
 */
export const buildNavigation = (menuData, modulePath = "") => {
  if (!menuData?.length) return EMPTY_NAVIGATION;

  const trie = new PathTrie();
  const parentById = new Map();
  const menuById = new Map();

  const buildNode = (item, parent = null) => {
    const fullPath = buildRoute(modulePath, item);

    const node = {
      ...item,
      fullPath,
      children: [],
      dataMenu: [],
      buttonMenu: [],
    };

    menuById.set(item.id, node);

    if (parent) parentById.set(item.id, parent);

    if (fullPath) trie.insert(fullPath, item.id);

    for (const child of sortByOrder(item.items)) {
      if (
        child.isDataMenu &&
        child.placeHolder === PLACEHOLDER.RIGHT_TAB_MENU
      ) {
        node.dataMenu.push({
          ...child,
          fullPath: buildRoute(modulePath, child),
        });
        continue;
      }

      if (child.isDataMenu && child.placeHolder === PLACEHOLDER.BUTTON_MENU) {
        node.buttonMenu.push({
          ...child,
          fullPath: buildRoute(modulePath, child),
        });
        continue;
      }

      node.children.push(buildNode(child, node));
    }

    return node;
  };

  return {
    tabs: sortByOrder(menuData).map((item) => buildNode(item)),
    trie,
    parentById,
    menuById,
  };
};

/* -------------------------------------------------------------------------- */
/*                                  QUERIES                                   */
/* -------------------------------------------------------------------------- */

/** Menu whose route best matches `pathname`, or null. */
export const matchMenu = (navigation, pathname) => {
  if (!navigation.trie) return null;

  const id = navigation.trie.matchDeepest(splitPath(pathname));

  return id ? (navigation.menuById.get(id) ?? null) : null;
};

/** First navigable leaf in breadth-first order (top-level tabs win). */
export const findFirstLeaf = (tabs) => {
  const queue = [...tabs];

  while (queue.length) {
    const item = queue.shift();

    if (!item.children?.length && item.fullPath) return item;

    if (item.children) queue.push(...item.children);
  }

  return null;
};

/** `[moduleCrumb, ...ancestors, activeMenu]` for the breadcrumb trail. */
export const buildBreadcrumb = (activeModule, activeMenu, parentById) => {
  const moduleCrumb = activeModule
    ? {
        id: activeModule.id,
        label: activeModule.label,
        fullPath: activeModule.path,
      }
    : null;

  const chain = [];

  for (
    let current = activeMenu;
    current;
    current = parentById.get(current.id)
  ) {
    chain.unshift(current);
  }

  return moduleCrumb ? [moduleCrumb, ...chain] : chain;
};
