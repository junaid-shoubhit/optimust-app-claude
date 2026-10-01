import React, { lazy, useState, useCallback, useMemo } from "react";
import Input from "../../../../../components/Forms/Input/Input";
import { FaSearch, FaSlidersH } from "react-icons/fa";
import { Sidebar } from "primereact/sidebar";
import { Tag } from "primereact/tag";
import { buildQueryString } from "../../../../../utils/constant";

const LazyDMAdvanceQuerySearch = lazy(() => import("./DMAdvanceQuerySearch"));

const DMSearch = ({
  searchDocuments,
  loading,
  onSaveQuery,
  onPrimarySearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("file");
  const [visible, setVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [querySummary, setQuerySummary] = useState([]);
  const [query, setQuery] = useState([
    {
      id: crypto.randomUUID(),
      type: "group",
      logic: "AND",
      children: [
        {
          id: crypto.randomUUID(),
          type: "condition",
          field: "",
          operator: "",
          operatorType: "",
          value: "",
        },
      ],
    },
  ]);

  // ------------------------------
  // 🔍 Basic Search
  // ------------------------------
  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) return;

    // Case No / Case Name search should clear File Name filter
    onPrimarySearch?.();

    const payload =
      searchType === "file"
        ? { FileNos: searchTerm.trim() }
        : { CaseName: searchTerm.trim() };

    searchDocuments(payload);
  }, [searchTerm, searchType, searchDocuments, onPrimarySearch]);

  // ------------------------------
  // 🧹 Clear Advanced Filters
  // ------------------------------
  const handleClearAdvanced = useCallback(() => {
    searchDocuments({}, "clearSearch");
    onSaveQuery([]);
    setQuery(null);
    setQuerySummary([]);
  }, []);

  // ------------------------------
  // ❌ Remove a Single Condition
  // ------------------------------
  const handleRemoveCondition = useCallback(
    (conditionId) => {
      if (!query) return;

      const removeById = (nodes) =>
        nodes
          .filter((n) => n.id !== conditionId)
          .map((n) =>
            n.type === "group" ? { ...n, children: removeById(n.children) } : n,
          );

      const updatedQuery = removeById(query);
      setQuery(updatedQuery);

      const updatedSummary = querySummary.filter((t) => t.id !== conditionId);
      setQuerySummary(updatedSummary);

      const finalQuery = buildQueryString(updatedQuery);
      searchDocuments({ SearchParm: finalQuery }, "clearSearch");
      onSaveQuery(finalQuery);
    },
    [query, querySummary, searchDocuments],
  );

  // ------------------------------
  // 📝 Compute Visible Summary Tags
  // ------------------------------
  const visibleTags = useMemo(
    () => (showAll ? querySummary : querySummary.slice(0, 2)),
    [showAll, querySummary],
  );

  // ------------------------------
  // 🖥️ Radio Options
  // ------------------------------
  const SEARCH_OPTIONS = [
    { value: "file", label: "Case No" },
    { value: "case", label: "Case Name" },
  ];

  return (
    <>
      {/* 🔍 Search Bar */}
      <div className="px-3 py-2 border-b-[0.5px] border-(--border-inverse)">
        {/* Radio options */}
        <div className="flex gap-3 items-center mb-1 text-sm text-[#333]">
          {SEARCH_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="text-xs flex items-center gap-1 cursor-pointer"
            >
              <input
                className="accent-(--background-secondary)"
                type="radio"
                name="searchType"
                value={opt.value}
                checked={searchType === opt.value}
                onChange={() => setSearchType(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>

        {/* Input & Action Buttons */}
        <div className="flex items-center gap-2">
          <Input
            name="documentSearch"
            type="text"
            className="h-8! text-xs! flex-1"
            placeholder={`Search by ${
              searchType === "file" ? "Case No" : "Case Name"
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            noErrorMessage={true}
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-(--background-secondary) text-white p-2 rounded-md hover:opacity-90 transition"
          >
            {loading ? <p className="text-xs"> ⏳ </p> : <FaSearch size={12} />}
          </button>

          <button
            onClick={() => setVisible(true)}
            className="bg-(--background) text-white p-2 rounded-md hover:opacity-90 transition"
          >
            <FaSlidersH size={12} />
          </button>
        </div>

        {/* 🧩 Summary Tags */}
        {querySummary.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {visibleTags.map((tag) => (
                <Tag
                  key={tag.id}
                  className="bg-(--color-creame)! text-black! border-none text-xs py-1 px-2 !flex items-center gap-1 group"
                >
                  <div className="flex">
                    <div className="max-w-[215px] overflow-hidden text-ellipsis whitespace-nowrap group-hover:whitespace-normal group-hover:overflow-visible group-hover:max-w-[600px] group-hover:break-all">
                      {tag.text}
                    </div>

                    <button
                      className="text-xs text-red-600 hover:text-red-800 ml-1 shrink-0"
                      onClick={() => handleRemoveCondition(tag.id)}
                    >
                      ✕
                    </button>
                  </div>
                </Tag>
              ))}
            </div>
            {querySummary.length > 2 && (
              <button
                className="text-xs text-blue-500 underline"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? "View Less" : `+${querySummary.length - 2} More`}
              </button>
            )}

            <button
              onClick={handleClearAdvanced}
              className="text-xs text-red-500 underline ml-2"
            >
              Clear All
            </button>
          </>
        )}
      </div>

      {/* ⚙️ Advanced Search Sidebar */}
      <Sidebar
        visible={visible}
        onHide={() => setVisible(false)}
        className="w-[30vw]! md:w-[25vw]! lg:w-[40vw]!"
        content={() => (
          <LazyDMAdvanceQuerySearch
            searchDocuments={searchDocuments}
            setVisible={setVisible}
            onSaveSummary={setQuerySummary}
            query={query}
            setQuery={setQuery}
            onSaveQuery={onSaveQuery}
          />
        )}
      />
    </>
  );
};

export default DMSearch;
