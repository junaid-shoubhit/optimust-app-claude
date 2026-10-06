import React from "react";
import { Controller } from "react-hook-form";

import SearchDropdown from "../../../../components/SearchDropdown/SearchDropdown";

/**
 * Generic recipient-search field for react-hook-form.
 * Used for mail "to" / "cc" / "bcc" and the SMS mobile-number field -
 * only `payloadBuilder`, `queryKey` and `label` change between usages.
 */
const RecipientSearchDropdown = React.memo(
  ({
    name,
    control,
    label,
    queryKey,
    payloadBuilder,
    iconName = "pi pi-envelope",
    labelKey = "label",
    secondLabelKey = "address",
    placeholder = "Search",
    required = false,
    onChange,
    error,
    loading = false,
  }) => {
    const rules = required
      ? {
          required: "Recipient email is required",

          validate: (value) => {
            if (!value || (Array.isArray(value) && value.length === 0)) {
              return "Recipient email is required";
            }

            return true;
          },
        }
      : undefined;

    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <div>
            <SearchDropdown
              isMulti
              iconName={iconName}
              queryKey={queryKey}
              apiPath="/utility/relation/option"
              responseKey="optionModelDT"
              idKey="value"
              labelKey={labelKey}
              secondLabelKey={secondLabelKey}
              placeholder={placeholder}
              label={label}
              payloadBuilder={payloadBuilder}
              loading={loading}
              value={field.value || []}
              onSelect={(items) => {
                field.onChange(items);
                onChange?.(items);
              }}
            />

            {(fieldState.error || error) && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {fieldState.error?.message || error}
              </p>
            )}
          </div>
        )}
      />
    );
  },
);

RecipientSearchDropdown.displayName = "RecipientSearchDropdown";

export default RecipientSearchDropdown;
