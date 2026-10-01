import { useState, useRef, useMemo, useCallback } from "react";
import "./BodySelect.css";
import HumanBodyUI from "./HumanBodyUI";
import SelectField from "../../Forms/Select/Select";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../services/apiBinding";

// ✅ CONFIG
// Keys must match HumanBodyUI data-position values.
// type/parts match the API data.
const bodyPartDetails = {
  head: {
    type: "head",
    parts: ["Head", "Neck"],
  },

  left_shoulder: {
    type: "left_shoulder",
    parts: ["Left Shoulder"],
  },

  right_shoulder: {
    type: "right_shoulder",
    parts: ["Right Shoulder"],
  },

  chest: {
    type: "chest",
    parts: ["Chest", "Ribs", "Upper Back"],
  },

  left_arm: {
    type: "left_hand_arm",
    parts: ["Left Hand Arm", "Left Hand Elbow", "Left Hand Wrist"],
  },

  right_arm: {
    type: "right_hand_arm",
    parts: ["Right Hand Arm", "Right Hand Elbow", "Right Hand Wrist"],
  },

  left_hand: {
    type: "left_hand_Finger",
    parts: [
      "Left Hand Index Finger",
      "Left Hand Middle Finger",
      "Left Hand Ring Finger",
      "Left Hand Little Finger",
      "Left Hand Thumb",
    ],
  },

  right_hand: {
    type: "right_hand_Finger",
    parts: [
      "Right Hand Index Finger",
      "Right Hand Middle Finger",
      "Right Hand Ring Finger",
      "Right Hand Little Finger",
      "Right Hand Thumb",
    ],
  },

  stomach: {
    type: "stomach",
    parts: ["Lower Back", "Abdomen"],
  },

  right_leg: {
    type: "right_leg",
    parts: ["Right HipPelvic", "Right Thigh", "Right Knee", "Right Ankle"],
  },

  left_leg: {
    type: "left_leg",
    parts: ["Left HipPelvic", "Left Thigh", "Left Knee", "Left Ankle"],
  },

  left_foot: {
    type: "left_foot",
    parts: [
      "Left Foot",
      "Left Foot Big Toe",
      "Left Foot Index Toe",
      "Left Foot Middle Toe",
      "Left Foot Ring Toe",
      "Left Foot Little Toe",
    ],
  },

  right_foot: {
    type: "right_foot",
    parts: [
      "Right Foot",
      "Right Foot Big Toe",
      "Right Foot Index Toe",
      "Right Foot Middle Toe",
      "Right Foot Ring Toe",
      "Right Foot Little Toe",
    ],
  },
};

const normalize = (str) =>
  String(str ?? "")
    .trim()
    .toLowerCase();

const BodySelect = (fields) => {
  const containerRef = useRef(null);
  const [activePart, setActivePart] = useState(null);

  // ✅ API
  const { data } = useQuery({
    queryKey: ["selectOptions", fields?.name],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "utility/option/dynamic",
        payload: {
          dataTable: fields.dropdownTable,
          dataField: fields.dropdownTableColumn,
          page: 1,
          pageSize: 999999,
        },
        method: "post",
        signal,
      }),
  });

  // ✅ OPTIONS
  const cleanedOptions = useMemo(() => {
    return (data?.dataResponse || []).map((item) => ({
      label: item.name?.trim(),
      value: item.value,
    }));
  }, [data]);

  // ✅ API NAME -> VALUE
  const optionsMap = useMemo(() => {
    const map = {};

    (data?.dataResponse || []).forEach((item) => {
      map[normalize(item.name)] = item.value;
    });

    return map;
  }, [data]);

  // ✅ LABEL -> BODY PART KEY
  const partLookup = useMemo(() => {
    const map = {};

    Object.entries(bodyPartDetails).forEach(([key, config]) => {
      config.parts.forEach((part) => {
        map[normalize(part)] = key;
      });
    });

    return map;
  }, []);

  // ✅ BASE STATE
  const baseBodyState = useMemo(() => {
    const state = {};

    Object.entries(bodyPartDetails).forEach(([key, config]) => {
      state[key] = {
        subParts: config.parts.map((part) => ({
          label: part,
          normalized: normalize(part),
          checked: false,
        })),
      };
    });

    return state;
  }, []);

  // ✅ SELECTED SET
  const valueSet = useMemo(() => {
    return new Set((fields.value || []).map((v) => String(v.value)));
  }, [fields.value]);

  // ✅ FINAL STATE
  const bodyState = useMemo(() => {
    const newState = JSON.parse(JSON.stringify(baseBodyState));

    (fields?.value || []).forEach(({ label, value }) => {
      const normalizedLabel = normalize(label);

      // First try matching by label
      let parentPart = partLookup[normalizedLabel];

      // Fallback: find API option by value and then match its name
      if (!parentPart && value != null) {
        const apiItem = (data?.dataResponse || []).find(
          (item) => String(item.value) === String(value),
        );

        if (apiItem) {
          parentPart = partLookup[normalize(apiItem.name)];
        }
      }

      if (!parentPart) {
        return;
      }

      newState[parentPart].subParts = newState[parentPart].subParts.map((sp) =>
        sp.normalized === normalizedLabel ? { ...sp, checked: true } : sp,
      );
    });

    return newState;
  }, [fields?.value, baseBodyState, partLookup, data?.dataResponse]);

  // ✅ TOGGLE PART
  const togglePart = useCallback(
    (partKey) => {
      const config = bodyPartDetails[partKey];

      if (!config) {
        return;
      }

      // Group -> open/close subparts
      if (config.parts.length > 1) {
        setActivePart((prev) => (prev === partKey ? null : partKey));
        return;
      }

      // Single body part
      const label = config.parts[0];

      const value = optionsMap[normalize(label)];

      if (value == null) {
        return;
      }

      const exists = valueSet.has(String(value));

      const updated = exists
        ? (fields.value || []).filter((v) => String(v.value) !== String(value))
        : [...(fields.value || []), { label, value }];

      fields.onChange(updated);
    },
    [fields, optionsMap, valueSet],
  );

  // ✅ TOGGLE SUBPART
  const toggleSubPart = useCallback(
    (partKey, label) => {
      const value = optionsMap[normalize(label)];

      if (value == null) {
        return;
      }

      const exists = valueSet.has(String(value));

      const updated = exists
        ? (fields.value || []).filter((v) => String(v.value) !== String(value))
        : [...(fields.value || []), { label, value }];

      fields.onChange(updated);
    },
    [fields, optionsMap, valueSet],
  );

  const handleSubPartChange = useCallback(
    (partKey, label) => () => {
      toggleSubPart(partKey, label);
    },
    [toggleSubPart],
  );

  const handleClick = useCallback(
    (e) => {
      const svg = e.target.closest("svg");

      if (!svg) return;

      const part = svg.getAttribute("data-position");

      if (part) {
        togglePart(part);
      }
    },
    [togglePart],
  );

  const handleSelectChange = useCallback(
    (value) => {
      setActivePart(null);
      fields.onChange(value);
    },
    [fields.onChange],
  );

  return (
    <div className="col-span-3 flex w-full gap-4">
      <HumanBodyUI
        bodyState={bodyState}
        containerRef={containerRef}
        handleClick={handleClick}
        activePart={activePart}
      />

      <div className="w-[70%]">
        <SelectField
          {...fields}
          onChange={handleSelectChange}
          label={fields?.label || "Select Body Part"}
          defaultOptions={cleanedOptions}
          isMulti
        />

        {activePart && bodyState[activePart]?.subParts && (
          <div className="mb-4 pb-3 border rounded-xl p-4 bg-gray-50">
            {/* Header */}
            <div className="font-semibold capitalize mb-3 text-gray-700">
              {activePart.replaceAll("_", " ")}
            </div>

            {/* Subparts Grid */}
            <div className="flex flex-wrap gap-2">
              {bodyState[activePart].subParts.map((sp) => {
                const isChecked = sp.checked;

                return (
                  <label
                    key={sp.label}
                    className={`cursor-pointer px-3 py-2 rounded-lg text-sm border transition-all duration-200
                      
                      ${
                        isChecked
                          ? "bg-red-500 text-white border-red-500 shadow"
                          : "bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:text-red-500"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={handleSubPartChange(activePart, sp.label)}
                      className="hidden"
                    />

                    {sp.label}
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodySelect;
