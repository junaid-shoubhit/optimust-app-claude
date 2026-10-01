import { useMemo, useState, useEffect } from "react";
import ValidationList from "./ValidationList";
import RuleBuilder from "./RuleBuilder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../../../../services/apiBinding";
import { toast } from "react-toastify";
// import { buildRuleJson, normalizeRuleJson } from "./ruleEngineConfig";

const emptyRule = {
  logic: "AND",
  conditions: [
    {
      fieldId: "",
      operator: "",
      value: "",
      message: "",
    },
  ],
  actions: [
    {
      actionType: "",
      targetFieldId: "",
    },
  ],
};

const ValidationTab = ({ fields, workflowId }) => {
  const queryClient = useQueryClient();
  const fieldOptions = useMemo(() => {
    return fields?.map((f) => ({
      label: f.name || `Field ${f.fieldDefinitionId}`,
      value: f.fieldDefinitionId,
      type: f.type,
      dataType: f.dataType,
      ...f,
    }));
  }, [fields]);

  const { data: validationData, isLoading } = useQuery({
    queryKey: ["workflowValidation", workflowId],
    enabled: !!workflowId,
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "WorkflowRelation/GetDataValidationPage",
        payload: {
          page: 1,
          pageSize: 9999,
          workFlowId: workflowId,
        },
        method: "post",
        signal,
      }),
  });

  const [validations, setValidations] = useState([]);
  const [rules, setRules] = useState([emptyRule]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  console.log("validations", validations);
  /* ---------------- NORMALIZE API DATA ---------------- */

  useEffect(() => {
    if (!validationData?.workFlowDataValidation) {
      setValidations([]);
      return;
    }

    const normalizeRuleJson = (ruleJson) => {
      try {
        const parsed = JSON.parse(ruleJson || "{}");

        /* OLD ARRAY FORMAT */
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

        /* OLD SINGLE OBJECT */
        if (parsed.logic && parsed.conditions && parsed.actions) {
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

        /* NEW STRUCTURE */
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

    const normalized = validationData.workFlowDataValidation.map((item) => {
      const groupedRules = normalizeRuleJson(item.ruleJson);

      const allRules = [
        ...groupedRules.create,
        ...groupedRules.edit,
        ...groupedRules.all,
      ];

      const fieldId = allRules?.[0]?.conditions?.[0]?.fieldId;

      return {
        id: item?.id,
        workFlowId: item.workFlowId,
        fieldId,
        fieldName: item.fieldDefinationName,

        ruleJson: groupedRules,

        allRules,
      };
    });

    setValidations(normalized);
  }, [validationData]);

  /* ---------------- ADD RULE ---------------- */

  const startAddValidation = () => {
    setRules([JSON.parse(JSON.stringify(emptyRule))]);
    setEditingIndex(null);
    setIsEditing(true);
  };

  /* ---------------- SAVE RULE ---------------- */
  const createValidationMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "WorkflowRelation/DataValidation",
        method: "post",
        payload,
      }),
    onSuccess: (response) => {
      const validation = response?.data;
      if (!validation) return;
      /* ---------- Update Details Cache ---------- */
      queryClient.invalidateQueries({
        queryKey: ["workflowValidation", workflowId],
      });
    },
  });

  const updateValidationMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "WorkflowRelation/DataValidation",
        method: "patch",
        payload,
      }),
    onSuccess: (response) => {
      const validation = response?.data;
      if (!validation) return;
      /* ---------- Update Details Cache ---------- */
      queryClient.invalidateQueries({
        queryKey: ["workflowValidation", workflowId],
      });
    },
  });

  const saveValidation = (formRules) => {
    const rule = formRules[0];

    const fieldId = rule?.conditions?.[0]?.fieldId;

    if (!fieldId) return;

    const fieldLabel =
      fieldOptions.find((f) => f.value === fieldId)?.label || "";

    let newValidations = [...validations];

    /* ---------------------------------- */
    /* EDIT EXISTING RULE */
    /* ---------------------------------- */

    if (editingIndex !== null) {
      const { validationIndex, ruleIndex } = editingIndex;

      const validation = newValidations[validationIndex];

      if (!validation) return;

      const updatedAllRules = [...validation.allRules];

      updatedAllRules[ruleIndex] = {
        ...rule,
        applyOn: rule.applyOn || "all",
      };

      /* GROUP RULES AGAIN */
      const groupedRules = {
        create: [],
        edit: [],
        all: [],
      };

      updatedAllRules.forEach((r) => {
        const applyOn = r.applyOn || "all";

        groupedRules[applyOn].push({
          logic: r.logic,
          conditions: r.conditions,
          actions: r.actions,
        });
      });

      validation.ruleJson = groupedRules;

      validation.allRules = updatedAllRules;

      const payload = {
        id: validation.id || 0,
        workFlowId: workflowId,
        fieldDefinitionId: validation.fieldId,
        ruleJson: JSON.stringify(groupedRules),
      };

      updateValidationMutation.mutate(payload);

      toast.success("Validation Updated Successfully");
    } else {
      /* ---------------------------------- */
      /* CREATE NEW RULE */
      /* ---------------------------------- */
      const existingIndex = newValidations.findIndex(
        (v) => v.fieldId === fieldId,
      );

      /* EXISTING FIELD */
      if (existingIndex !== -1) {
        const validation = newValidations[existingIndex];

        const updatedAllRules = [
          ...(validation.allRules || []),
          {
            ...rule,
            applyOn: rule.applyOn || "all",
          },
        ];

        /* GROUP RULES */
        const groupedRules = {
          create: [],
          edit: [],
          all: [],
        };

        updatedAllRules.forEach((r) => {
          const applyOn = r.applyOn || "all";

          groupedRules[applyOn].push({
            logic: r.logic,
            conditions: r.conditions,
            actions: r.actions,
          });
        });

        validation.ruleJson = groupedRules;

        validation.allRules = updatedAllRules;

        const payload = {
          id: validation.id || 0,
          workFlowId: workflowId,
          fieldDefinitionId: fieldId,
          ruleJson: JSON.stringify(groupedRules),
        };

        updateValidationMutation.mutate(payload);

        toast.success("Validation Updated Successfully");
      } else {
        /* NEW FIELD */
        const groupedRules = {
          create: [],
          edit: [],
          all: [],
        };

        groupedRules[rule.applyOn || "all"].push({
          logic: rule.logic,
          conditions: rule.conditions,
          actions: rule.actions,
        });

        const newValidation = {
          workFlowId: workflowId,
          fieldId,
          fieldName: fieldLabel,

          ruleJson: groupedRules,

          allRules: [
            {
              ...rule,
              applyOn: rule.applyOn || "all",
            },
          ],
        };

        newValidations.push(newValidation);

        const payload = {
          id: 0,
          workFlowId: workflowId,
          fieldDefinitionId: fieldId,
          ruleJson: JSON.stringify(groupedRules),
        };

        createValidationMutation.mutate(payload);

        toast.success("Validation Created Successfully");
      }
    }

    setValidations(newValidations);

    setIsEditing(false);

    setEditingIndex(null);
  };

  /* ---------------- EDIT RULE ---------------- */

  const editValidation = (validationIndex, ruleIndex) => {
    const validation = validations[validationIndex];

    if (!validation) return;

    const rule = validation.allRules?.[ruleIndex];

    if (!rule) return;

    setRules([
      {
        ...rule,
        applyOn: rule.applyOn || "all",
      },
    ]);

    setEditingIndex({
      validationIndex,
      ruleIndex,
      applyOn: rule.applyOn || "all",
    });

    setIsEditing(true);
  };

  /* ---------------- DELETE RULE ---------------- */

  const deleteValidation = (validationIndex) => {
    console.log("validationIndex", validationIndex);
    setValidations((prev) => {
      const updated = [...prev];

      updated.splice(validationIndex, 1);
      return updated;
    });
  };
  const deleteRule = (validationIndex, ruleIndex) => {
    const newValidations = [...validations];

    const validation = newValidations[validationIndex];

    if (!validation) return;

    // Remove clicked rule
    const updatedAllRules = validation.allRules.filter(
      (_, index) => index !== ruleIndex,
    );

    // Build grouped json again
    const groupedRules = {
      create: [],
      edit: [],
      all: [],
    };

    updatedAllRules.forEach((rule) => {
      const applyOn = rule.applyOn || "all";

      groupedRules[applyOn].push({
        logic: rule.logic,
        conditions: rule.conditions,
        actions: rule.actions,
      });
    });
    console.log("updatedAllRules", updatedAllRules);
    if (updatedAllRules.length === 0) {
      deleteValidation(validationIndex);
      return;
    }
    validation.allRules = updatedAllRules;
    validation.ruleJson = groupedRules;

    newValidations[validationIndex] = validation;

    setValidations(newValidations);

    updateValidationMutation.mutate({
      id: validation.id,
      workFlowId: workflowId,
      fieldDefinitionId: validation.fieldId,
      ruleJson: JSON.stringify(groupedRules),
    });

    toast.success("Rule deleted successfully");
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {!isEditing && (
        <ValidationList
          validations={validations}
          editValidation={editValidation}
          deleteValidation={deleteValidation}
          fieldOptions={fieldOptions}
          deleteRule={deleteRule}
          onAdd={startAddValidation}
          isLoading={isLoading}
        />
      )}

      {isEditing && (
        <RuleBuilder
          rules={rules}
          setRules={setRules}
          fieldOptions={fieldOptions}
          onCancel={() => setIsEditing(false)}
          onSave={saveValidation}
        />
      )}
    </div>
  );
};

export default ValidationTab;
