import { memo, useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import Input from "../Forms/Input/Input";

import { apiRequest } from "../../services/apiBinding";

const SearchDropdown = ({
  apiPath,
  payloadBuilder,
  labelKey,
  idKey = "id",
  onSelect,
  onChange,
  placeholder = "Search",
  label,
  debounceDelay = 500,
  queryKey = "search",
  className = "",
  value,

  // NEW
  isMulti = false,
  iconName,
  iconPosition = "left",
  responseKey,
  secondLabelKey,
  loading = false,
}) => {
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const debounceRef = useRef(null);

  /* ================= DEBOUNCE ================= */

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, debounceDelay);

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, debounceDelay]);

  useEffect(() => {
    if (!isMulti) return;

    const nextItems = Array.isArray(value) ? value : value ? [value] : [];
    setSelectedItems(nextItems);
  }, [isMulti, value]);

  /* ================= QUERY ================= */

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, debouncedSearch],

    queryFn: ({ signal }) =>
      apiRequest({
        apiPath,

        method: "post",

        payload: payloadBuilder(debouncedSearch),

        signal,
      }),

    enabled: !!debouncedSearch?.trim(),
  });

  /* ================= RESULTS ================= */

  const results = useMemo(() => data?.[responseKey] || [], [data]);

  useEffect(() => {
    if (!showDropdown || !searchTerm?.trim()) {
      setOpenUpward(false);
      return;
    }

    const updateDropdownDirection = () => {
      const container = containerRef.current;

      if (!container) return;

      const rect = container.getBoundingClientRect();
      const estimatedMenuHeight = Math.min(
        320,
        dropdownRef.current?.scrollHeight || 320,
      );
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      setOpenUpward(
        spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow,
      );
    };

    updateDropdownDirection();

    window.addEventListener("resize", updateDropdownDirection);
    window.addEventListener("scroll", updateDropdownDirection, true);

    return () => {
      window.removeEventListener("resize", updateDropdownDirection);
      window.removeEventListener("scroll", updateDropdownDirection, true);
    };
  }, [showDropdown, searchTerm, results.length, isLoading]);

  /* ================= SELECT ================= */

  const handleSelect = (item) => {
    if (isMulti) {
      setSelectedItems((prev) => {
        const exists = prev.some(
          (selected) => selected?.[idKey] === item?.[idKey],
        );
        const updatedItems = exists ? prev : [...prev, item];

        console.log("updatedItems", updatedItems);
        onSelect?.(updatedItems);
        onChange?.(updatedItems);

        return updatedItems;
      });

      setSearchTerm("");
      setShowDropdown(true);

      return;
    }

    onSelect?.(item);
    onChange?.(item);

    setSearchTerm(item?.[labelKey] || "");

    setShowDropdown(true);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label
          title={label}
          className="truncate-1-lines text-xs uppercase font-medium"
        >
          {label}
        </label>
      )}
      {isMulti ? (
        <div
          className="
      min-h-[42px]
      border border-gray-300
      rounded-md
      px-2
      py-1
      flex
      flex-wrap
      items-center
      gap-1
      bg-white
    "
        >
          {selectedItems.map((item) => (
            <span
              key={item?.[idKey]}
              className="
          bg-gray-100
          rounded
          px-2
          py-1
          text-xs
          flex
          items-center
          gap-1
        "
            >
              {item?.[labelKey]}

              <button
                type="button"
                onClick={() => {
                  setSelectedItems((prev) => {
                    const updatedItems = prev.filter(
                      (selected) => selected?.[idKey] !== item?.[idKey],
                    );

                    onSelect?.(updatedItems);
                    onChange?.(updatedItems);

                    return updatedItems;
                  });
                }}
              >
                ×
              </button>
            </span>
          ))}

          {loading && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <i className="pi pi-spin pi-spinner text-xs" />
              Loading...
            </span>
          )}

          <input
            disabled={loading}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="
    flex-1
    min-w-[80px]
    outline-none
    border-none
    text-sm
    placeholder:text-xs
  "
            placeholder={loading || selectedItems.length ? "" : placeholder}
          />
        </div>
      ) : (
        <Input
          name="search"
          featureName="search"
          className="justify-center! w-full!"
          type={iconName ? "icon" : undefined}
          iconName={iconName}
          iconPosition={iconPosition}
          placeholder={placeholder}
          noErrorMessage={true}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
        />
      )}

      {showDropdown && !!searchTerm?.trim() && (
        <div
          ref={dropdownRef}
          className={`
              absolute
              left-0
              right-0
              bg-white
              border border-gray-300
              rounded-lg
              shadow-lg
              z-9999
              max-h-80
              overflow-auto
              ${openUpward ? "bottom-full mb-1" : "top-full mt-1"}
            `}
        >
          {isLoading && (
            <div className="p-3 text-sm text-gray-500">Searching...</div>
          )}

          {!isLoading && !results?.length && (
            <div className="p-3 text-sm text-gray-500">No results found</div>
          )}

          {!isLoading &&
            results.map((item) => (
              <button
                key={item?.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="
                    w-full
                    text-left
                    px-3
                    py-2
                    text-sm
                    text-gray-700
                    hover:bg-(--background-hover)
                    border-b
                    border-gray-200
                    last:border-b-0
                  "
              >
                <div>
                  <div className="mb-1">{item?.[labelKey]}</div>

                  {secondLabelKey && item?.[secondLabelKey] && (
                    <div className="text-xs text-gray-500">
                      {item?.[secondLabelKey]}
                    </div>
                  )}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default memo(SearchDropdown);
