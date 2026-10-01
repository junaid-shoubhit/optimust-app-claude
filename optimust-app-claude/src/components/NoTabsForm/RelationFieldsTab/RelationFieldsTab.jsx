import React, { memo, useMemo } from "react";
import { useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../../services/apiBinding";
import NoTabsFieldsRenderer from "../NoTabsFieldsRenderer";
import { NoTabSkeleton } from "../NoTabSkeleton";

/*
 * Sort fields by their configured order.
 */

const sortByOrder = (a, b) => {
  const orderA = Number(a?.order ?? a?.displayOrder ?? 0);
  const orderB = Number(b?.order ?? b?.displayOrder ?? 0);

  return orderA - orderB;
};

/**
 * Fetch dynamically related No Tab fields.
 */
const fetchNoTabFields = async (
  entityCodeId,
  moduleId,
  workflowRelation,
  tabName = "No Tab",
  entityId = 0,
) => {
  return apiRequest({
    apiPath: "/FieldDefinition/tabs/definitions",
    method: "post",
    payload: {
      entityId: tabName === "No Tab" ? 0 : entityId,
      tabName,
      entityCodeId,
      moduleId,
      workflowRelation,
    },
  });
};

const RelationFieldsTab = ({
  fields = [],
  control,
  formMethods,
  entityCodeId,
  moduleId,
  entityId = 0,
  colSize,
  onColSizeChange,
  fieldDefinitionsRef,
  designType,
}) => {
  /**
   * Only fields which have relationFieldId
   * participate in the relation lookup.
   */
  const relationFields = useMemo(
    () =>
      fields.filter(
        (field) =>
          field?.relationFieldId !== null &&
          field?.relationFieldId !== undefined &&
          field?.relationFieldId !== 0,
      ),
    [fields],
  );

  /**
   * React Hook Form field names which need to be watched.
   *
   * Example:
   *
   * [
   *   "Category",
   *   "SubCategory"
   * ]
   */
  const fieldNames = useMemo(
    () => relationFields.map((field) => field.name),
    [relationFields],
  );

  /**
   * Watch relation fields using the SAME form control
   * from the root NoTabsForm.
   */
  const watchedValues = useWatch({
    control,
    name: fieldNames,
  });

  /**
   * Convert watched form values into the API structure:
   *
   * Single select:
   *
   * {
   *   relationalFieldDefinitionId: 5077,
   *   id: 10
   * }
   *
   * Multi select:
   *
   * {
   *   relationalFieldDefinitionId: 5078,
   *   id: "10,20,30"
   * }
   */
  const workflowRelation = useMemo(
    () =>
      relationFields.map((field, index) => {
        const value = watchedValues?.[index];

        let id = 0;

        /**
         * Multi-select
         */
        if (Array.isArray(value)) {
          id = value
            .map((option) => {
              /**
               * react-select option:
               *
               * {
               *   label: "Category A",
               *   value: 10
               * }
               */
              if (option && typeof option === "object") {
                return option?.value ?? option?.id;
              }

              /**
               * Primitive value
               */
              return option;
            })
            .filter(
              (value) => value !== null && value !== undefined && value !== "",
            )
            .join(",");
        } else if (value && typeof value === "object") {
          /**
           * Single select
           *
           * {
           *   label: "Category A",
           *   value: 10
           * }
           */
          id = value?.value ?? value?.id ?? 0;
        } else if (value !== null && value !== undefined && value !== "") {
          /**
           * Primitive value
           *
           * Example:
           *
           * Category: 10
           */
          id = value;
        }

        return {
          relationalFieldDefinitionId: field?.id,
          id: id || 0,
        };
      }),
    [relationFields, watchedValues],
  );

  /**
   * API should only be called when every relation
   * field has a valid selected value.
   */
  const allRelationFieldsHaveValue = useMemo(() => {
    /**
     * No relation fields means there is nothing
     * to fetch.
     */
    if (!relationFields.length) {
      return false;
    }

    return workflowRelation.every(
      ({ id }) => id !== null && id !== undefined && id !== "" && id !== 0,
    );
  }, [relationFields.length, workflowRelation]);

  /**
   * React Query
   *
   * workflowRelation is part of the query key so whenever
   * a relation value changes, React Query automatically
   * fetches the corresponding field definitions.
   */
  const {
    data: relationFieldData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "noTabRelationFields",
      entityCodeId,
      moduleId,
      entityId,
      workflowRelation,
      designType,
    ],

    queryFn: () =>
      fetchNoTabFields(
        entityCodeId,
        moduleId,
        workflowRelation,
        "No Tab",
        entityId,
      ),

    enabled:
      Boolean(entityCodeId) && Boolean(moduleId) && allRelationFieldsHaveValue,

    /**
     * SAME FUNCTIONALITY AS useNoTabFields
     *
     * Transform API response according to designType
     * without changing the original API response.
     */
    select: (res) => {
      const singleFieldDefinitions = [];
      const multipleFieldDefinitions = [];

      const isSingleFieldMode = designType === "no-tabs-single-field";

      (res?.fieldDefinitions || []).forEach((field) => {
        /**
         * no-tabs-single-field:
         *
         * Both tab types should be rendered as single fields.
         */
        if (isSingleFieldMode) {
          if (field?.tabTypeId === 1 || field?.tabTypeId === 2) {
            singleFieldDefinitions.push(field);
          }

          return;
        }

        /**
         * Normal mode:
         *
         * tabTypeId 1 -> single field
         * tabTypeId 2 -> multiple field
         */
        if (field?.tabTypeId === 1) {
          singleFieldDefinitions.push(field);
        }

        if (field?.tabTypeId === 2) {
          multipleFieldDefinitions.push(field);
        }
      });

      /**
       * Keep the same ordering behavior
       * as useNoTabFields.
       */
      singleFieldDefinitions.sort(sortByOrder);
      multipleFieldDefinitions.sort(sortByOrder);

      return {
        ...res,

        fieldDefinitions: singleFieldDefinitions,

        multipleFieldDefinitions: isSingleFieldMode
          ? []
          : multipleFieldDefinitions,
      };
    },

    staleTime: 5 * 60 * 1000,

    gcTime: 10 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: 0,
  });

  const dependentFields = useMemo(() => {
    if (!relationFieldData || !fields?.length) {
      return [];
    }

    const relationFieldIds = new Set(
      (relationFieldData?.relationData || [])
        .map((relation) => relation?.parentFieldId)
        .filter(Boolean)
        .map(String),
    );

    return fields.filter((field) => relationFieldIds.has(String(field?.id)));
  }, [fields, relationFieldData]);

  /**
   * Don't render anything until all relation
   * fields have been selected.
   */
  if (!allRelationFieldsHaveValue) {
    return null;
  }

  /**
   * Loading state.
   */
  if (isLoading || isFetching) {
    return (
      <div className="mt-2 rounded-md bg-(--background-hover) p-3">
        <div className="text-xs text-(--foreground-dark)">
          <NoTabSkeleton />
        </div>
      </div>
    );
  }

  /**
   * API error.
   */
  if (isError) {
    return (
      <div className="mt-2 rounded-md bg-red-50 p-3">
        <div className="text-xs text-red-500">
          {error?.message || "Failed to load related fields"}
        </div>
      </div>
    );
  }

  /**
   * Nothing returned.
   */
  if (!relationFieldData) {
    return null;
  }

  /**
   * No fields returned.
   */
  const hasFields =
    relationFieldData?.fieldDefinitions?.length > 0 ||
    relationFieldData?.multipleFieldDefinitions?.length > 0;

  if (!hasFields) {
    return null;
  }

  /**
   * Render the dynamically returned fields.
   *
   * IMPORTANT:
   *
   * We use the SAME:
   * - control
   * - formMethods
   * - automationFieldsRef
   *
   * No new useForm() is created here.
   */
  return (
    <div className="mt-2 rounded-md border border-(--border-inverse) bg-white">
      <NoTabsFieldsRenderer
        fieldData={relationFieldData}
        control={control}
        formMethods={formMethods}
        colSize={colSize}
        entityId={entityId}
        entityCodeId={entityCodeId}
        moduleId={moduleId}
        onColSizeChange={onColSizeChange}
        fieldDefinitionsRef={fieldDefinitionsRef}
        dependentFields={dependentFields}
      />
    </div>
  );
};

export default memo(RelationFieldsTab);
