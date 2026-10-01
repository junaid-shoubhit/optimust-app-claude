// utils/menuUtils.js
export const joinPath = (base = "", path = "") =>
  `${base}/${path}`.replace(/\/+/g, "/");

export const getFirstValidPath = (items = [], parentPath = "") => {
  for (const item of items) {
    const currentPath =
      item.path && item.path !== "#"
        ? joinPath(parentPath, item.path)
        : parentPath;

    // If navigable
    if (item.path && item.path !== "#") {
      if (!item.items || item.items.length === 0) {
        return currentPath;
      }

      const child = getFirstValidPath(item.items, currentPath);
      return child || currentPath;
    }

    // No path → go deeper
    if (item.items?.length) {
      const child = getFirstValidPath(item.items, currentPath);
      if (child) return child;
    }
  }

  return null;
};


export const resolveFirstRoute = (tabs = []) => {
  const findFirst = (items) => {
    for (const item of items) {
      if (item.path && item.path !== "#") return item.path;
      if (item.items?.length) {
        const child = findFirst(item.items);
        if (child) return child;
      }
    }
    return null;
  };

  for (const tab of tabs) {
    // direct tab
    if (tab.type === "tab" && tab.path) return tab.path;

    // menu
    if (tab.type === "menu" && tab.items) {
      const child = findFirst(tab.items);
      if (child) return child;
    }
  }

  return null;
};