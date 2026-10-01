import { getFieldKey } from "../tabConstant";

const normalizeKey = (key = "") => key.replace(/\s+/g, "_");

/**
 * Get the row prefix from:
 *
 * multiFields.1106.2.Source_Category
 *
 * => multiFields.1106.2
 */
const getMultiFieldRowPrefix = (name = "") => {
  const match = name.match(/^(multiFields\.[^.]+\.\d+)\./);

  return match?.[1] || null;
};

/**
 * Get only the actual field name from:
 *
 * Referral
 *
 * OR
 *
 * multiFields.1106.2.Referral
 *
 * => Referral
 */
const getChildFieldName = (name = "") => {
  if (!name) return "";

  return name.split(".").pop();
};

export const clearCascadeField = ({
  relations = [],
  dependentFields = [],
  getValues,
  setValue,
  getFieldPath,
  currentFieldName,
}) => {
  if (!relations.length) return;

  /**
   * Get current row prefix directly from the parent field.
   *
   * Example:
   * multiFields.1106.2.Source_Category
   *
   * => multiFields.1106.2
   */
  const rowPrefix = getMultiFieldRowPrefix(currentFieldName);

  relations.forEach((relation) => {
    const childField = dependentFields.find(
      (field) => Number(field.id) === Number(relation.childFieldId),
    );

    console.log("CHILD FIELD:", childField);

    if (!childField) {
      console.warn("Cascade child field not found:", relation.childFieldId);
      return;
    }

    /**
     * =========================================================
     * TABLE / CUSTOM PATH
     * =========================================================
     */
    if (getFieldPath) {
      const path = getFieldPath({
        field: childField,
        relation,
      });

      if (!path) return;

      setValue(path, null, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      return;
    }

    /**
     * =========================================================
     * MULTI FIELD
     * =========================================================
     */
    if (rowPrefix) {
      const childName = getChildFieldName(childField.name);

      if (!childName) return;

      const path = `${rowPrefix}.${normalizeKey(childName)}`;

      console.log("MULTI CHILD NAME:", childName);
      console.log("CLEARING PATH:", path);
      console.log("VALUE BEFORE:", getValues(path));

      setValue(path, null, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      return;
    }

    /**
     * =========================================================
     * SINGLE FIELD
     * =========================================================
     */
    const path = getFieldKey(childField.name);
    setValue(path, null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  });
};

export const getCascadeRelations = (relationLookup, parentFieldId) => {
  const relations = [];
  const visited = new Set();

  let current = relationLookup?.[parentFieldId];

  while (current && !visited.has(current.childFieldId)) {
    relations.push(current);

    visited.add(current.childFieldId);

    current = relationLookup?.[current.childFieldId];
  }

  return relations;
};
