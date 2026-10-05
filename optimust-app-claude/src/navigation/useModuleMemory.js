import { useCallback, useEffect, useRef } from "react";

import { findFirstLeaf, toRestoreUrl } from "./menuTree";
import { isPathWithin } from "./paths";

/**
 * Remembers the last URL visited inside each module so reopening a module
 * returns there, and resolves where a module should open.
 */
export const useModuleMemory = ({ activeModule, activeMenu, location }) => {
  // moduleId -> { pathname, search }
  const lastUrlsRef = useRef(new Map());

  const { pathname, search } = location;

  useEffect(() => {
    // Only remember pages that resolved to a menu, so restoring never lands
    // on an unknown URL.
    if (!activeModule || !activeMenu) return;

    lastUrlsRef.current.set(activeModule.id, { pathname, search });
  }, [activeModule, activeMenu, pathname, search]);

  /** Last visited URL of the module, else its first tab, else null. */
  const getEntryUrl = useCallback((module, tree) => {
    const last = lastUrlsRef.current.get(module.id);

    if (last && isPathWithin(last.pathname, module.path)) {
      return toRestoreUrl(last, module);
    }

    return findFirstLeaf(tree.tabs)?.fullPath ?? null;
  }, []);

  return getEntryUrl;
};
