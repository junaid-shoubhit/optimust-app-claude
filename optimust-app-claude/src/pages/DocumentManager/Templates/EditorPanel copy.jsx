import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  FaChevronLeft,
  FaRegWindowMaximize,
  FaRegWindowMinimize,
  FaUpload,
} from "react-icons/fa";
import {
  loadOPSelectOptions,
  loadSelectOptions,
} from "../../../utils/constant";
import SelectField from "../../../components/Forms/Select/Select";
import Field from "../../../components/Forms/Field";
import { apiRequest } from "../../../services/apiBinding";
import VersionSelectField from "./VersionSelectionField";
import { Skeleton } from "primereact/skeleton";
const EditorPanel = ({
  value,
  onChange,
  handleFileUpload,
  isFullscreen,
  setIsFullscreen,
  sidebarOpen,
  setSidebarOpen,
  caseId, // getting extra prop from Document Manager TemplateForm.jsx
  mode,
  page,
  control,
  setValue, // getting from Document Manager TemplateForm.jsx
  errors,
  versionOptions,
  setIsTemplateLoading,
  isTemplateLoading,
}) => {
  const [editorRef, setEditorRef] = useState(null);
  const [mergeCodes, setMergeCodes] = useState([]);
  const [selectedMergeCode, setSelectedMergeCode] = useState(null);
  const fileInputRef = useRef(null);
  // ----------------- Fetch merge codes from API -----------------
  useEffect(() => {
    const fetchMergeCodes = async () => {
      const codes = await loadOPSelectOptions(
        `Template/GetMargeCodeMaster?CaseId=${caseId || ""}`,
        {},
        "",
        { labelKey: "name", valueKey: "code" },
      );
      setMergeCodes(
        codes?.length > 0
          ? codes
          : [{ label: "No Merge Codes Available", value: null }],
      );
    };
    fetchMergeCodes();
  }, []);

  // ----------------- Insert merge code into CKEditor -----------------
  const insertMergeCode = (code) => {
    if (!editorRef) return;
    editorRef.model.change((writer) => {
      const insertPosition =
        editorRef.model.document.selection.getFirstPosition();
      writer.insertText(code, insertPosition);
    });
    editorRef.editing.view.focus();
  };

  // ----------------- Handle Merge Code Selection -----------------
  const handleMergeCodeSelect = (option) => {
    if (option?.value) {
      insertMergeCode(option.value);
      setSelectedMergeCode(null); // reset select
    } else {
      insertMergeCode("{Data Not Avaiable}");
      setSelectedMergeCode(null); // reset select
    }
  };

  const loadTemplateOptions = useCallback(
    (inputValue = "") =>
      loadSelectOptions(
        "template",
        {},
        inputValue,
        {
          labelKey: "Name",
          valueKey: "Id",
        },
        "get",
        ["VersionId"],
      ),
    [caseId],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="sticky top-[2.7rem] z-40 flex flex-wrap items-center justify-between gap-3 bg-[#f6f1eb] border-b border-gray-200 py-1 px-1">
        {/* Merge Code SelectField */}
        <div className="flex gap-2">
          <div className="w-[250px]">
            <SelectField
              placeholder="Insert Merge Code"
              value={selectedMergeCode}
              onChange={handleMergeCodeSelect}
              disabled={mergeCodes.length === 0 || mergeCodes[0].value === null}
              defaultOptions={mergeCodes}
              isCustomLoading={mergeCodes.length === 0}
              isMulti={false}
              isClearable={false}
              fetchBefore={false} // no need to prefetch, already fetched via useEffect
              isViewAllEnabled={false} // hide view all if not needed
              selecthHeight="32px"
            />
          </div>

          {mode === "DMTemplates" && (
            <div className="w-[250px]">
              <Field
                controller={{
                  name: "selectedTemplate",
                  control,
                  render: ({ field }) => {
                    const handleTemplateChange = async (val) => {
                      field.onChange(val);
                      console.log("val", val);
                      // Reset fields helper
                      const resetTemplateFields = () => {
                        setValue("templateValue", "");
                        setValue("name", "");
                        setValue("defaultCaseFolderId", "");
                        setValue("UnbindedCodes", []);
                        setValue("versionId", "");
                      };

                      if (!val?.value) {
                        resetTemplateFields();
                        return;
                      }

                      try {
                        setIsTemplateLoading(true);
                        const res = await apiRequest({
                          apiPath: `Template/GetTemplateValueDetails?CaseId=${caseId}&templateId=${val.value}`,
                          apiClient: "dm",
                        });
                        setValue(
                          "templateValue",
                          res?.Result || "No Template Found",
                        );
                        setValue("name", val?.label);
                        setValue("versionId", val?.VersionId || "");
                        setValue(
                          "defaultCaseFolderId",
                          res?.FolderNames?.[0] || "",
                        );
                        setValue("UnbindedCodes", res?.UnbindedCodes || []);
                        setValue("BindedMargeCodes", res?.BindedCodes || []);
                        setIsTemplateLoading(false);
                      } catch (error) {
                        console.error("Template fetch error:", error);
                        resetTemplateFields();
                        setIsTemplateLoading(false);
                      }
                    };

                    return (
                      <SelectField
                        {...field}
                        placeholder="Template"
                        onChange={handleTemplateChange}
                        invalid={field?.error}
                        payload={{
                          dataTable: "dmTemplates",
                          dataField: "name",
                          searchTerm: "",
                        }}
                      />
                    );
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".pdf,.docx"
            ref={fileInputRef}
            onChange={async (e) => {
              if (e.target.files[0] && handleFileUpload) {
                const content = await handleFileUpload(e.target.files[0]);
                onChange(content);
              }
            }}
            className="hidden"
          />
          <FaUpload
            className="text-gray-600 cursor-pointer"
            size={18}
            onClick={() => fileInputRef.current.click()}
          />
          {mode !== "DMTemplates" && (
            <>
              {/* Fullscreen toggle */}
              <button
                type="button"
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <FaRegWindowMinimize className="text-gray-600" size={16} />
                ) : (
                  <FaRegWindowMaximize className="text-gray-600" size={16} />
                )}
              </button>
            </>
          )}
          {page === "templates" && mode === "edit" && versionOptions && (
            <div className="border px-3">
              <VersionSelectField
                control={control}
                versionOptions={versionOptions}
              />
            </div>
          )}

          {/* Sidebar toggle */}
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
            >
              <FaChevronLeft />
            </button>
          )}
        </div>
      </div>
      {errors?.templateValue && (
        <p className="text-red-500 text-xs ml-1 my-1">
          {" "}
          {errors?.templateValue?.message}{" "}
        </p>
      )}

      {/* CKEditor */}
      {isTemplateLoading ? (
        <div className="lg:col-span-5 flex flex-col gap-2">
          <Skeleton width="100%" height="60vh" borderRadius="0.5rem" />
        </div>
      ) : (
        <CKEditor
          editor={ClassicEditor}
          data={value}
          onReady={(editor) => {
            setEditorRef(editor);
            editor.editing.view.change((writer) => {
              writer.setStyle(
                "min-height",
                isFullscreen ? "100vh" : "calc(100vh - 200px)",
                editor.editing.view.document.getRoot(),
              );
            });
          }}
          onChange={(event, editor) => onChange(editor.getData())}
        />
      )}
    </div>
  );
};

export default EditorPanel;
