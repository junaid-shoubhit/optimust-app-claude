import {
  DocumentEditorContainerComponent,
  Toolbar,
} from "@syncfusion/ej2-react-documenteditor";

DocumentEditorContainerComponent.Inject(Toolbar);

let container = DocumentEditorContainerComponent;

function TemplateEditor() {
  let saveItem = {
    prefixIcon: "e-save icon",
    tooltipText: "Save the Document",
    text: "Save",
    id: "save",
  };

  let mergeFieldItem = {
    prefixIcon: "e-mergefield",
    tooltipText: "Insert Merge Field",
    text: "Merge Field",
    id: "mergeField",
  };

  let items = [
    "New",
    "Open",
    saveItem,
    mergeFieldItem, // <-- merge field button
    "Separator",
    "Undo",
    "Redo",
    "Separator",
    "Image",
    "Table",
    "Hyperlink",
    "TableOfContents",
    "Separator",
    "Header",
    "Footer",
    "PageSetup",
    "PageNumber",
    "Break",
    "InsertFootnote",
    "InsertEndnote",
    "Separator",
    "Find",
    "Separator",
    "Comments",
    "TrackChanges",
    "Separator",
    "LocalClipboard",
    "RestrictEditing",
    "Separator",
    "FormFields",
    "UpdateFields",
    "ContentControl",
  ];

  function applyMargins() {
    if (!container?.documentEditor) return;

    const editor = container.documentEditor;
    editor.pageSettings.top = 20;
    editor.pageSettings.bottom = 20;
    editor.pageSettings.left = 20;
    editor.pageSettings.right = 20;
  }

  function onDocumentChange() {
    applyMargins();
  }

  function onToolbarClick(args) {
    switch (args.item.id) {
      case "save":
        container.documentEditor.save("sample", "Docx");
        break;

      case "mergeField":
        insertMergeField();
        break;

      default:
        break;
    }
  }

  function insertMergeField() {
    if (!container) return;

    const fieldName = prompt("Enter merge field name:");
    if (fieldName) {
      container.documentEditor.editor.insertField(`MERGEFIELD ${fieldName} `);
    }
  }

  return (
    <div>
      <DocumentEditorContainerComponent
        id="container"
        ref={(scope) => {
          container = scope;
        }}
        height={"calc(100vh - 88px)"}
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
        toolbarItems={items}
        toolbarClick={onToolbarClick}
        enableToolbar={true}
        enableSfdtExport={true}
        enableEditor={true}
         documentChange={onDocumentChange} 
      />
    </div>
  );
}

export default TemplateEditor;
