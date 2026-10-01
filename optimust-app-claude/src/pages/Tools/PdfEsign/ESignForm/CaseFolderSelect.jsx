import { useMemo } from "react";
import Select from "react-select";
import { useQuery } from "@tanstack/react-query";
import axiosPrivate from "../../../../utils/lib/axiosPrivate"; // Adjust path as needed

const CaseFolderSelect = ({
  label,
  name,
  placeholder = "Select Folder...",
  disabled = false,
  selectWidth,
  selecthMaxHeight,
  menuPlacement = "auto",
  selecthHeight,
  isChanged,
  isRequired,
  firmId = null,
  ...props
}) => {
  
  /* ---------------- MANUAL AXIOS FETCH ---------------- */
 const fetchFolders = async () => {
  const response = await axiosPrivate({
    url: "/options/default-case-folders",
    method: "POST",
    data: {
      firmIds: firmId,   // pass firmId dynamically
      searchTerm: "",
    },
  });
  return response.data;
};


  /* ---------------- REACT QUERY ---------------- */
  const { data, isLoading } = useQuery({
    queryKey: ["caseFolders", firmId],
    queryFn: fetchFolders,
    staleTime: 5 * 60 * 1000,
  });

  /* ---------------- MAPPING OPTIONS ---------------- */
  const options = useMemo(() => {
    const list = data?.optionModelDT || data?.options || data || [];
    return list.map((opt) => ({
      label: opt.label || opt.name || opt.text,
      value: opt.value || opt.id,
      info: opt.info || "",
    }));
  }, [data]);

  /* ---------------- STYLES (Matching your SelectField) ---------------- */
  const customStyles = useMemo(
    () => ({
      control: (p) => ({
        ...p,
        minHeight: selecthHeight || "32px",
        width: selectWidth || "100%",
        fontSize: "12px",
        border: isChanged ? "1px solid #ffc549" : p.border,
      }),
      valueContainer: (p) => ({
        ...p,
        flexWrap: "wrap",
        maxHeight: selecthMaxHeight || "120px",
        overflowY: "auto",
      }),
      multiValue: (p) => ({ ...p, fontSize: "11px" }),
      option: (p) => ({ ...p, fontSize: "12px" }),
      menuPortal: (b) => ({ ...b, zIndex: 9999 }),
    }),
    [selectWidth, selecthHeight, selecthMaxHeight, isChanged]
  );

  return (
    <div className="flex flex-col w-full">
      <label className="truncate-1-lines text-xs uppercase font-medium">
        {label} {isRequired && <span className="required-asterisk">*</span>}
      </label>

      <Select
        options={options}
        placeholder={isLoading ? "Loading..." : placeholder}
        isDisabled={disabled || isLoading}
        isLoading={isLoading}
        menuPlacement={menuPlacement}
        styles={customStyles}
        menuPortalTarget={document.body}
        isClearable={true}
        // Links to React Hook Form values
        value={options.find(opt => opt.value === props.value) || null}
        onChange={(val) => props.onChange(val?.value || null)}
        {...props}
      />

      {props?.invalid?.message && (
        <span className="error-message tracking-wider block text-red-500 text-[10px] mt-1">
          {props.invalid.message}
        </span>
      )}
    </div>
  );
};

export default CaseFolderSelect;