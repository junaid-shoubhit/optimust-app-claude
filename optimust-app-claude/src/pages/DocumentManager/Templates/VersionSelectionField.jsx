import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { OverlayPanel } from "primereact/overlaypanel";
import { FaChevronDown, FaHistory } from "react-icons/fa";
import Field from "../../../components/Forms/Field";
import classNames from "classnames";

function VersionSelectField({ control, versionOptions = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const op = useRef(null);

  const handleVersionChange = (val, onChange) => {
    onChange(val);
    // setValue("versionNumber", val);

    // Update URL param
    if (val?.value) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("versionId", val.value);
      setSearchParams(newParams);
    }
    op.current?.hide();
  };

  return (
    <Field
      controller={{
        name: "versionNumber",
        control,
        render: ({ field }) => {
          const selected = field.value;
          return (
            <div className="flex items-center gap-1">
              
               {/* Selected Version Label */}
              {selected ? (
                <p className="text-s">
                  Version {selected.label}
                  
                </p>
              ) : (
                <span className="text-sm text-gray-400 italic">No version</span>
              )}
              {/* History Icon */}
              <button
                type="button"
                onClick={(e) => op.current.toggle(e)}
                className="p-2 rounded-full flex gap-1"
                title="Select Version"
              >
                <FaHistory className="" />
                <FaChevronDown />
              </button>

             

              {/* Version Options Popup */}
              <OverlayPanel ref={op} className="w-fit">
                <div className="flex flex-col gap-1">
                  {versionOptions?.map((option) => {
                    const isActive = option.value === selected?.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleVersionChange(option, field.onChange)}
                        className={classNames(
                          "text-left px-3 py-2 text-sm transition",
                          isActive
                            ? "bg-blue-100 text-blue-700 font-semibold"
                            : "hover:bg-gray-100"
                        )}
                      >
                        Version {option.label}
                      </button>
                    );
                  })}
                </div>
              </OverlayPanel>
            </div>
          );
        },
      }}
    />
  );
}

export default VersionSelectField;
