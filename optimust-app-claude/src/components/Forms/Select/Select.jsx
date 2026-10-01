import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import Select from "react-select";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getCascadeOptions,
  getDynamicOptions,
} from "../../../services/apiBinding";

const PAGE_SIZE = 50;

const CustomLoadingIndicator = () => {
  return (
    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-200 border-t-(--color-bgFive) shadow-sm" />
  );
};

const SelectField = ({
  defaultOptions = [],
  label,
  name,
  filterType,
  placeholder = "Select...",
  disabled = false,
  selectWidth,
  fontSize,
  dropdownWidth,
  optionFontSize,
  selecthMaxHeight,
  menuPlacement = "auto",
  selecthHeight,
  payload = {},
  noErrorMessage,
  isChanged,
  searchDelay = 1500,
  isRelation,
  isRequired,
  isCustomLoading,
  value,
  ...props
}) => {
  console.log("dropdownWidth", dropdownWidth);
  const [search, setSearch] = useState("");

  /* ---------------- API CONTROL ---------------- */
  const shouldUseAPI = defaultOptions.length === 0;
  const isLocalMode = !!filterType;

  /* ---------------- STABLE PAYLOAD ---------------- */
  const memoPayload = useMemo(() => payload, [payload]);

  /* ---------------- DEBOUNCE ---------------- */
  const debounceRef = useRef(null);

  const handleSearch = useCallback(
    (value) => {
      clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        setSearch(value);
      }, searchDelay);
    },
    [searchDelay],
  );

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  /* ---------------- FETCH FUNCTION ---------------- */
  const fetchOptions = async ({ pageParam = 1 }) => {
    const basePayload = {
      page: pageParam,
      pageSize: isLocalMode ? 999999 : PAGE_SIZE,
      ...memoPayload,
      searchTerm: isLocalMode ? "" : search || memoPayload?.searchTerm || "",
    };

    const res = isRelation
      ? await getCascadeOptions(basePayload)
      : await getDynamicOptions(basePayload);

    const optionList = res?.optionModelDT || res?.options || [];

    return {
      options: optionList,
      nextPage: isLocalMode
        ? undefined
        : pageParam * PAGE_SIZE < (res?.dataSize || 0)
          ? pageParam + 1
          : undefined,
    };
  };

  /* ---------------- QUERY KEY ---------------- */
  const queryKey = useMemo(
    () => ["selectOptions", name, memoPayload, isLocalMode ? "local" : search],
    [name, memoPayload, search, isLocalMode],
  );

  /* ---------------- API QUERY ---------------- */
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: fetchOptions,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: shouldUseAPI && (isLocalMode || !!search),
    staleTime: 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  /* ---------------- OPTIONS LOGIC ---------------- */
  const options = useMemo(() => {
    let result = shouldUseAPI
      ? data?.pages.flatMap((page) => page.options) || []
      : defaultOptions;

    if (filterType) {
      result = result.filter((item) => item.type === filterType);
    }

    if (search) {
      result = result.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return result;
  }, [data, defaultOptions, filterType, search, shouldUseAPI]);

  /* ---------------- MENU OPEN ---------------- */
  const handleMenuOpen = useCallback(() => {
    if (shouldUseAPI && options.length === 0) {
      refetch();
    }
  }, [options.length, refetch, shouldUseAPI]);

  /* ---------------- MENU CLOSE ---------------- */
  const handleMenuClose = useCallback(() => {
    clearTimeout(debounceRef.current);
    setSearch("");
  }, []);

  /* ---------------- STYLES ---------------- */
  const customStyles = useMemo(
    () => ({
      control: (p) => ({
        ...p,
        minHeight: selecthHeight || "38px",
        width: selectWidth || "100%",
        fontSize: fontSize || "12px",
        border: isChanged ? "1px solid #ffc549" : p.border,
      }),
      valueContainer: (p) => ({
        ...p,
        flexWrap: "wrap",
        maxHeight: selecthMaxHeight || "120px",
        overflowY: "auto",
      }),
      menu: (p) => ({
        ...p,
        width: dropdownWidth || "100%",
        minWidth: dropdownWidth || "100%",
      }),
      multiValue: (p) => ({
        ...p,
        fontSize: "10px",
      }),
      dropdownIndicator: (p) => ({
        ...p,
        padding: "4px",
      }),
      clearIndicator: (p) => ({
        ...p,
        padding: "4px",
      }),
      option: (p) => ({ ...p, fontSize: optionFontSize || "12px" }),
      menuPortal: (b) => ({ ...b, zIndex: 99999 }),
    }),
    [selectWidth, selecthHeight, selecthMaxHeight, isChanged],
  );

  /* ---------------- RENDER ---------------- */
  return (
    <div className="flex flex-col w-full">
      <label title={label} className="text-xs uppercase font-medium">
        {label} {isRequired && <span className="required-asterisk">*</span>}
      </label>

      <Select
        cacheOptions
        options={options}
        placeholder={placeholder}
        isDisabled={disabled}
        menuPlacement={menuPlacement}
        components={{ LoadingIndicator: CustomLoadingIndicator }}
        styles={customStyles}
        menuPortalTarget={document.body}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
        isLoading={
          shouldUseAPI && (isLoading || isFetchingNextPage || isCustomLoading)
        }
        noOptionsMessage={() =>
          shouldUseAPI
            ? isLoading
              ? "Loading..."
              : "No options"
            : "No match found"
        }
        onMenuScrollToBottom={() =>
          shouldUseAPI && hasNextPage && !isFetchingNextPage && fetchNextPage()
        }
        menuShouldBlockScroll={true}
        isClearable={true}
        onInputChange={(value, { action }) => {
          if (action === "input-change") {
            handleSearch(value);
          }
        }}
        value={value ?? null}
        {...props}
      />

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

export default SelectField;
