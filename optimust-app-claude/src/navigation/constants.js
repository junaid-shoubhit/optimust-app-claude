/* -------------------------------------------------------------------------- */
/*                               MENU PLACEHOLDERS                            */
/* -------------------------------------------------------------------------- */

/** `placeHolder` values sent by the module / tab APIs. */
export const PLACEHOLDER = {
  SIDEBAR_MENU: "Side Bar Menu",
  SIDEBAR_PROFILE_MENU: "Side Bar Profile Menu",
  LEFT_TAB_MENU: "Left Tab Menu",
  RIGHT_TAB_MENU: "Right Tab Menu",
  BUTTON_MENU: "Button Menu",
};

/* -------------------------------------------------------------------------- */
/*                                   QUERIES                                  */
/* -------------------------------------------------------------------------- */

export const navigationKeys = {
  modules: ["modules"],
  tabs: (moduleId) => ["tabs", moduleId],
};

export const MODULES_STALE_TIME = 5 * 60 * 1000;

/* -------------------------------------------------------------------------- */
/*                               MODULE MEMORY                                */
/* -------------------------------------------------------------------------- */

/**
 * Query params kept when reopening a module at its last visited URL
 * (keyed by module path, lower-cased). Anything else is UI state and dropped.
 */
export const MODULE_PRESERVED_PARAMS = {
  "/cases": ["id"],
  "/intakes": ["id"],
  "/workflow": ["id"],
  "/party": ["id"],
  "/documents": ["id", "versionId"],
};

export const DEFAULT_PRESERVED_PARAMS = ["id"];
