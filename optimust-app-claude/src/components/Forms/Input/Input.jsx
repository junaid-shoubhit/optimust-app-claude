// import React from "react";
// import { IconField } from "primereact/iconfield";
// import { InputIcon } from "primereact/inputicon";
// import { InputMask } from "primereact/inputmask";
// import { InputText } from "primereact/inputtext";
// import { Password } from "primereact/password";
// import { InputOtp } from "primereact/inputotp";
// import classNames from "classnames";
// import "./Input.scss";
// import { InputTextarea } from "primereact/inputtextarea";

// const Input = ({
//   type = "text",
//   iconName,
//   iconPosition,
//   featureName,
//   isChanged,
//   className,
//   noErrorMessage,
//   formatterName,
//   ...props
// }) => {
//   console.log("formatterName", formatterName);
//   const controlledValue = props.value ?? "";
//   return (
//     <div
//       className={`${classNames(featureName || (type === "textarea" ? "" : "default-input"))} flex flex-col justify-start ${className}`}
//     >
//       {/* {props?.label && ( */}
//       <label
//         className="uppercase text-xs! pl-0.5 mb-0.5 font-medium"
//         htmlFor={props?.name}
//       >
//         {props?.label || ""}
//         {props?.isRequired && <span className="required-asterisk">*</span>}
//       </label>
//       {/* )} */}
//       {type === "icon" && (
//         <IconField className="w-full" iconPosition={iconPosition || "left"}>
//           <InputIcon className={classNames(`pi ${iconName}`)}> </InputIcon>
//           <InputText invalid={props?.invalid?.message} {...props} />
//         </IconField>
//       )}
//       {type === "password" && (
//         <IconField className="w-full" iconPosition={iconPosition || "left"}>
//           <InputIcon className={classNames(`pi ${iconName}`)}> </InputIcon>
//           <Password
//             invalid={props?.invalid?.message}
//             className=""
//             feedback={false}
//             toggleMask
//             {...props}
//           />
//         </IconField>
//       )}
//       {type === "otp" && <InputOtp length={6} {...props} />}
//       {type === "textarea" && <InputTextarea rows={3} cols={30} {...props} />}
//       {type === "number" && props?.name === "SSN" ? (
//         <InputMask
//           mask="999-99-9999"
//           placeholder="XXX-XX-XXXX"
//           id={props?.name}
//           className={`w-full! ${isChanged ? "ischanged" : ""}`}
//           {...props}
//           value={controlledValue}
//         />
//       ) : (
//         (type === "text" || type === "number") && (
//           <InputText
//             placeholder="Enter"
//             id={props?.name}
//             invalid={props?.invalid?.message}
//             className={`w-full! ${isChanged ? "ischanged" : ""}`}
//             keyfilter={type === "number" ? "num" : undefined}
//             {...props}
//             value={controlledValue}
//           />
//         )
//       )}
//       {/* {(type === "text" || type === "number") && (
//         <InputText
//           placeholder="Enter"
//           id={props?.name}
//           invalid={props?.invalid?.message}
//           className={`w-full! ${isChanged ? "ischanged" : ""} `}
//           keyfilter={type === "number" ? "num" : undefined}
//           {...props}
//           value={controlledValue}
//         />
//       )} */}
//       {/* {props?.invalid && ( */}
//       {!noErrorMessage && (
//         <span
//           className={`error-message tracking-wider block min-h-0.5 ${
//             props?.invalid?.message ? "visible" : "invisible"
//           }`}
//         >
//           {props?.invalid?.message || "placeholder"}
//         </span>
//       )}
//       {/* )} */}
//     </div>
//   );
// };

// export default React.memo(Input);

import React from "react";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputMask } from "primereact/inputmask";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { InputOtp } from "primereact/inputotp";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import classNames from "classnames";
import "./Input.scss";

const Input = ({
  type = "text",
  iconName,
  iconPosition,
  featureName,
  isChanged,
  className,
  noErrorMessage,
  formatterId,
  // formatterName,
  ...props
}) => {
  const controlledValue = props.value ?? "";

  const toTitleCase = (value = "") =>
    value.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
    });

  const handleFormattedChange = (e) => {
    let value = e.target.value ?? "";

    switch (formatterId) {
      case 1: // Uppercase
        value = value.toUpperCase();
        break;

      case 2: // Lowercase
        value = value.toLowerCase();
        break;

      case 3: // Title Case
        value = toTitleCase(value);
        break;

      default:
        break;
    }

    props.onChange?.({
      ...e,
      target: {
        ...e.target,
        value,
      },
    });
  };

  const isPhoneFormatter = type === "number" && formatterId === 4;
  const isSSNFormatter = type === "number" && formatterId === 8;
  const isCurrencyFormatter = type === "number" && formatterId === 5;

  const renderInput = () => {
    if (isPhoneFormatter) {
      return (
        <InputMask
          mask="(999) 999-9999"
          placeholder="(123) 456-7890"
          id={props?.name}
          className={`w-full! ${isChanged ? "ischanged" : ""}`}
          {...props}
          value={controlledValue}
          unmask={true}
        />
      );
    }

    if (isSSNFormatter) {
      return (
        <InputMask
          mask="999-99-9999"
          placeholder="XXX-XX-XXXX"
          id={props?.name}
          className={`w-full! ${isChanged ? "ischanged" : ""}`}
          {...props}
          value={controlledValue}
          unmask={true}
        />
      );
    }

    if (isCurrencyFormatter) {
      return (
        <InputNumber
          id={props.name}
          value={controlledValue}
          locale="en-US"
          useGrouping
          minFractionDigits={2}
          maxFractionDigits={2}
          inputClassName="w-full"
          className={`w-full ${isChanged ? "ischanged" : ""}`}
          invalid={props?.invalid?.message}
          onValueChange={(e) => {
            props.onChange(e.value);
          }}
          onBlur={props.onBlur}
          name={props.name}
          disabled={props.disabled}
          mode="currency"
          currency="USD"
        />
      );
    }

    return (
      <InputText
        placeholder="Enter"
        id={props?.name}
        invalid={props?.invalid?.message}
        className={`w-full! ${isChanged ? "ischanged" : ""}`}
        keyfilter={type === "number" ? "num" : undefined}
        {...props}
        value={controlledValue}
        onChange={type === "text" ? handleFormattedChange : props.onChange}
      />
    );
  };

  return (
    <div
      className={`${classNames(
        featureName || (type === "textarea" ? "" : "default-input"),
      )} flex flex-col justify-start ${className}`}
    >
      <label
        className="uppercase text-xs! pl-0.5 font-medium"
        htmlFor={props?.name}
      >
        {props?.label || ""}
        {props?.isRequired && <span className="required-asterisk">*</span>}
      </label>

      {type === "icon" && (
        <IconField className="w-full" iconPosition={iconPosition || "left"}>
          <InputIcon className={classNames(`pi ${iconName}`)} />
          <InputText
            invalid={props?.invalid?.message}
            {...props}
            value={controlledValue}
          />
        </IconField>
      )}

      {type === "password" && (
        <IconField className="w-full" iconPosition={iconPosition || "left"}>
          <InputIcon className={classNames(`pi ${iconName}`)} />
          <Password
            invalid={props?.invalid?.message}
            feedback={false}
            toggleMask
            {...props}
          />
        </IconField>
      )}

      {type === "otp" && <InputOtp length={6} {...props} />}

      {type === "textarea" && <InputTextarea rows={3} cols={30} {...props} />}

      {(type === "text" || type === "number") && renderInput()}

      {!noErrorMessage && (
        <span
          className={`error-message tracking-wider block min-h-0.5 ${
            props?.invalid?.message ? "visible" : "invisible"
          }`}
        >
          {props?.invalid?.message || "placeholder"}
        </span>
      )}
    </div>
  );
};

export default React.memo(Input);
