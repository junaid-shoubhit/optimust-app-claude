import React from "react";
import { Controller } from "react-hook-form";

import CustomToggle from "../../../../components/Forms/CustomToggle/CustomToggle";

const LabeledToggle = React.memo(
  ({ name, control, label, disabled = false }) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-gray-700">
            {label}
          </label>

          <CustomToggle
            checked={field.value}
            disabled={disabled}
            onChange={(event) => {
              field.onChange(event.value ?? event);
            }}
          />
        </div>
      )}
    />
  ),
);

LabeledToggle.displayName = "LabeledToggle";

export default LabeledToggle;
