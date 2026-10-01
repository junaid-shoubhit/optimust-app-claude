/* -------------------------------------------------------------------------- */
/*                                 QUERY KEYS                                 */
/* -------------------------------------------------------------------------- */

export const navigationKeys = {
  modules: ["modules"],
  tabs: (moduleId) => ["tabs", moduleId],
};

/* -------------------------------------------------------------------------- */
/*                                CACHE TIMING                                */
/* -------------------------------------------------------------------------- */

export const MODULES_STALE_TIME = 5 * 60 * 1000;

// Tabs rarely change within a session, so keep them until the cache evicts them.
export const TABS_STALE_TIME = Infinity;
export const TABS_GC_TIME = 30 * 60 * 1000;

/* -------------------------------------------------------------------------- */
/*                               MENU PLACEHOLDERS                            */
/* -------------------------------------------------------------------------- */

export const PLACEHOLDER = {
  SIDEBAR_PROFILE_MENU: "Side Bar Profile Menu",
  RIGHT_TAB_MENU: "Right Tab Menu",
  BUTTON_MENU: "Button Menu",
};

/* -------------------------------------------------------------------------- */
/*                               AUTO REDIRECT                                */
/* -------------------------------------------------------------------------- */

/** Query params kept when restoring a module's last visited URL. */
export const MODULE_PRESERVED_PARAMS = {
  "/cases": ["id"],
  "/intakes": ["id"],
  "/workflow": ["id"],
  "/party": ["id"],
  "/documents": ["id", "versionId"],
};

export const DEFAULT_PRESERVED_PARAMS = ["id"];

// Debounces the redirect so transient route states don't trigger it.
export const REDIRECT_DELAY_MS = 50;

// Window in which a repeat redirect from the same URL is suppressed.
export const REDIRECT_COOLDOWN_MS = 300;

/* -------------------------------------------------------------------------- */
/*                                  PREFETCH                                  */
/* -------------------------------------------------------------------------- */

export const HOVER_PREFETCH_THROTTLE_MS = 120;
