 const ACTIONS = {
  SHOW: {
    label: "Show",
    conflicts: ["HIDE"],
    oncePerField: true,
  },
  HIDE: {
    label: "Hide",
    conflicts: ["SHOW", "REQUIRED", "DISABLE"],
    oncePerField: true,
  },
  REQUIRED: {
    label: "Required",
    conflicts: ["DISABLE", "HIDE"],
    oncePerField: true,
  },
  DISABLE: {
    label: "Disable",
    conflicts: ["REQUIRED", "HIDE"],
    oncePerField: true,
  },
};

/* Get allowed actions for a field */
export const getAvailableActions = (
  targetFieldId,
  actions,
  currentIndex
) => {
  if (!targetFieldId) return [];

  const sameFieldActions =
    actions?.filter(
      (a, i) =>
        i !== currentIndex && a?.targetFieldId === targetFieldId
    ) || [];

  const blocked = new Set();

  sameFieldActions.forEach((a) => {
    const config = ACTIONS[a.actionType];
    if (!config) return;

    if (config.oncePerField) blocked.add(a.actionType);

    config.conflicts?.forEach((c) => blocked.add(c));
  });

  return Object.entries(ACTIONS)
    .filter(([key]) => !blocked.has(key))
    .map(([key, value]) => ({
      label: value.label,
      value: key,
    }));
};

/* Filter target fields that still have actions available */
export const getAvailableTargetFields = (
  fieldOptions,
  actions,
  currentFieldId
) => {
  return fieldOptions.filter((field) => {

    // Always keep currently selected field
    if (field.value === currentFieldId) return true;

    const available = getAvailableActions(
      field.value,
      actions,
      -1
    );

    return available.length > 0;
  });
};



export const buildRuleJson = (rules) => {
  const grouped = {
    create: [],
    edit: [],
    all: [],
  };

  rules.forEach((rule) => {
    const applyOn = rule.applyOn || "all";

    const cleanedRule = {
      logic: rule.logic,
      conditions: rule.conditions,
      actions: rule.actions,
    };

    grouped[applyOn].push(cleanedRule);
  });

  return grouped;
};


export const normalizeRuleJson = (ruleJson) => {
  try {
    const parsed = JSON.parse(ruleJson || "{}");

    // OLD ARRAY FORMAT
    if (Array.isArray(parsed)) {
      return {
        create: [],
        edit: [],
        all: parsed.map((r) => ({
          ...r,
          applyOn: "all",
        })),
      };
    }

    // OLD SINGLE OBJECT FORMAT
    if (
      parsed.logic &&
      parsed.conditions &&
      parsed.actions
    ) {
      return {
        create: [],
        edit: [],
        all: [
          {
            ...parsed,
            applyOn: "all",
          },
        ],
      };
    }

    // NEW FORMAT
    return {
      create: (parsed.create || []).map((r) => ({
        ...r,
        applyOn: "create",
      })),
      edit: (parsed.edit || []).map((r) => ({
        ...r,
        applyOn: "edit",
      })),
      all: (parsed.all || []).map((r) => ({
        ...r,
        applyOn: "all",
      })),
    };
  } catch {
    return {
      create: [],
      edit: [],
      all: [],
    };
  }
};