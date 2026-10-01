import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  DEFAULT_PRESERVED_PARAMS,
  MODULE_PRESERVED_PARAMS,
  REDIRECT_COOLDOWN_MS,
  REDIRECT_DELAY_MS,
} from "./constants";
import { findFirstLeaf } from "./menuTree";
import { stripTrailingSlash } from "./pathUtils";

/**
 * Rebuilds a stored module URL, keeping only the query params the module
 * allows (e.g. the record `id`) so stale UI state isn't restored.
 */
const buildRestoreUrl = (entry, moduleKey) => {
  const url = new URL(
    entry.path + (entry.search || ""),
    window.location.origin,
  );

  const allowed =
    MODULE_PRESERVED_PARAMS[moduleKey] || DEFAULT_PRESERVED_PARAMS;

  const params = new URLSearchParams();

  allowed.forEach((key) => {
    const value = url.searchParams.get(key);

    if (value) params.set(key, value);
  });

  const query = params.toString();

  return url.pathname + (query ? `?${query}` : "");
};

/**
 * Keeps a module with tabs on a valid page:
 *  - remembers the last URL visited inside each module, and
 *  - when the URL matches no menu of the active module (typically right after
 *    switching modules from the sidebar), redirects to that remembered URL or,
 *    failing that, to the module's first tab.
 *
 * @returns {() => void} call before a user-initiated navigation so the
 *   redirect guard doesn't block it.
 */
export const useModuleAutoRedirect = ({
  activeModule,
  tabs,
  activeMenu,
  lastModuleUrlsRef,
}) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const fullUrl = pathname + search;

  const timeoutRef = useRef(null);

  // Guards against redirecting twice from the same URL within the cooldown.
  const hasRedirectedRef = useRef(false);
  const redirectedFromRef = useRef("");

  /* ---------------------------------------------------------------------- */
  /*                          REMEMBER LAST MODULE URL                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!activeModule?.id || !activeModule?.path || !activeMenu) return;

    if (!pathname.startsWith(stripTrailingSlash(activeModule.path))) return;

    lastModuleUrlsRef.current[activeModule.id] = { path: pathname, search };
  }, [pathname, search, activeModule, activeMenu, lastModuleUrlsRef]);

  /* ---------------------------------------------------------------------- */
  /*                                 REDIRECT                               */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!activeModule?.hasChildren || !tabs.length) return;

    const modulePath = stripTrailingSlash(activeModule.path);

    const isInsideModule = stripTrailingSlash(pathname).startsWith(modulePath);

    // Already on a known page of this module: nothing to do.
    if (isInsideModule && activeMenu) {
      hasRedirectedRef.current = false;
      redirectedFromRef.current = fullUrl;
      return;
    }

    const lastEntry = lastModuleUrlsRef.current[activeModule.id];

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (hasRedirectedRef.current && redirectedFromRef.current === fullUrl) {
        return;
      }

      const targetUrl = lastEntry?.path?.startsWith(modulePath)
        ? buildRestoreUrl(lastEntry, activeModule.path)
        : (findFirstLeaf(tabs)?.fullPath ?? null);

      if (!targetUrl || targetUrl === fullUrl) return;

      hasRedirectedRef.current = true;
      redirectedFromRef.current = fullUrl;

      navigate(targetUrl, { replace: true });

      setTimeout(() => {
        hasRedirectedRef.current = false;
      }, REDIRECT_COOLDOWN_MS);
    }, REDIRECT_DELAY_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [
    tabs,
    activeModule,
    activeMenu,
    pathname,
    fullUrl,
    navigate,
    lastModuleUrlsRef,
  ]);

  return useCallback(() => {
    hasRedirectedRef.current = false;
  }, []);
};
