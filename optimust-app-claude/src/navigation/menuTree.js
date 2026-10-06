import {
  DEFAULT_PRESERVED_PARAMS,
  MODULE_PRESERVED_PARAMS,
  PLACEHOLDER,
} from "./constants";
import { modulePathOf, splitPath } from "./paths";

/* -------------------------------------------------------------------------- */
/*                                 PATH TRIE                                  */
/* -------------------------------------------------------------------------- */

const createNode = () => ({ children: new Map(), id: null });

const insertRoute = (root, route, id) => {
  let node = root;

  for (const segment of splitPath(route)) {
    if (!node.children.has(segment)) node.children.set(segment, createNode());

    node = node.children.get(segment);
  }

  node.id = id;
};

/** Id of the deepest menu whose route is a prefix of `segments`. */
const matchDeepest = (root, segments) => {
  let node = root;
  let matchedId = null;

  for (const segment of segments) {
    node = node.children.get(segment);

    if (!node) break;

    if (node.id) matchedId = node.id;
  }

  return matchedId;
};

/* -------------------------------------------------------------------------- */
/*                                  BUILDING                                  */
/* -------------------------------------------------------------------------- */

const byOrder = (a, b) =>
  (a.orderByExpression ?? 9999) - (b.orderByExpression ?? 9999);

const sortByOrder = (items = []) =>
  items.length > 1 ? [...items].sort(byOrder) : items;

const toRouteSegment = (designType) =>
  designType?.toLowerCase().replace(/\s+/g, "-");

/**
 * Route of a menu item:
 *   `${modulePath}/${design-type}/${path}` when it has a design type,
 *   `${modulePath}/${path}` otherwise, and null for "#" / missing paths.
 */
const buildRoute = (modulePath, item) => {
  if (!item?.path || item.path === "#") return null;

  const itemPath = item.path.replace(/^\//, "");

  return item.designType
    ? `${modulePath}/${toRouteSegment(item.designType)}/${itemPath}`
    : `${modulePath}/${itemPath}`;
};

const isDataMenu = (item, placeHolder) =>
  item.isDataMenu && item.placeHolder === placeHolder;

export const EMPTY_TREE = Object.freeze({
  tabs: [],
  menuById: new Map(),
  parentById: new Map(),
  root: null,
});

/**
 * Builds a module's tab tree from `/Module/userChild` data.
 *
 * Each node is the API item plus:
 *   fullPath    resolved route (null when not navigable)
 *   children    nested tabs
 *   dataMenu    record-level actions ("Right Tab Menu")
 *   buttonMenu  record-level buttons ("Button Menu")
 * Data/button menus are attached to their parent instead of becoming tabs.
 */
export const buildMenuTree = (items, module) => {
  if (!items?.length) return EMPTY_TREE;

  const modulePath = modulePathOf(module);

  const root = createNode();
  const menuById = new Map();
  const parentById = new Map();

  const buildNode = (item, parent) => {
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

    if (fullPath) insertRoute(root, fullPath, item.id);

    for (const child of sortByOrder(item.items)) {
      const childPath = buildRoute(modulePath, child);

      if (isDataMenu(child, PLACEHOLDER.RIGHT_TAB_MENU)) {
        node.dataMenu.push({ ...child, fullPath: childPath });
      } else if (isDataMenu(child, PLACEHOLDER.BUTTON_MENU)) {
        node.buttonMenu.push({ ...child, fullPath: childPath });
      } else {
        node.children.push(buildNode(child, node));
      }
    }

    return node;
  };

  return {
    tabs: sortByOrder(items).map((item) => buildNode(item, null)),
    menuById,
    parentById,
    root,
  };
};

/* -------------------------------------------------------------------------- */
/*                                  QUERIES                                   */
/* -------------------------------------------------------------------------- */

/** Menu whose route best matches `pathname`, or null. */
export const matchMenu = (tree, pathname) => {
  if (!tree.root) return null;

  const id = matchDeepest(tree.root, splitPath(pathname));

  return id ? (tree.menuById.get(id) ?? null) : null;
};

/** First navigable leaf, breadth-first (so top-level tabs win). */
export const findFirstLeaf = (tabs) => {
  const queue = [...tabs];

  while (queue.length) {
    const item = queue.shift();

    if (!item.children?.length && item.fullPath) return item;

    if (item.children) queue.push(...item.children);
  }

  return null;
};

/** A module without tabs acts as its own (only) menu. */
export const moduleAsMenu = (module) => ({
  ...module,
  fullPath: module.path,
  children: [],
  dataMenu: [],
  buttonMenu: [],
});

/** `[moduleCrumb, ...ancestors, activeMenu]`. */
export const buildBreadcrumb = (module, menu, parentById) => {
  if (!module) return [];

  const chain = [];

  for (let node = menu; node; node = parentById.get(node.id)) {
    // A tab-less module is its own menu; don't list it twice.
    if (node.id !== module.id) chain.unshift(node);
  }

  return [
    { id: module.id, label: module.label, fullPath: module.path },
    ...chain,
  ];
};

/**
 * URL to restore for a module: its remembered URL, keeping only the query
 * params the module allows (e.g. the open record's `id`).
 */
export const toRestoreUrl = ({ pathname, search }, module) => {
  const allowed =
    MODULE_PRESERVED_PARAMS[modulePathOf(module).toLowerCase()] ||
    DEFAULT_PRESERVED_PARAMS;

  const current = new URLSearchParams(search);
  const kept = new URLSearchParams();

  allowed.forEach((key) => {
    const value = current.get(key);

    if (value) kept.set(key, value);
  });

  const query = kept.toString();

  return pathname + (query ? `?${query}` : "");
};
