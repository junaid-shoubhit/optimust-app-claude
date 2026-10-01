import { useCallback, useRef } from "react";

/**
 * Owns the CKEditor instance ref and exposes a stable `insertText` used by
 * the parent's imperative handle (e.g. inserting merge tags from outside
 * the form).
 */
export function useEmailEditor(setValue) {
  const editorRef = useRef(null);

  const handleEditorReady = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const insertText = useCallback(
    (text) => {
      if (!editorRef.current || !text) {
        return;
      }

      const editor = editorRef.current;

      try {
        editor.execute("insertText", { text });
      } catch (error) {
        const currentValue = editor.getData() || "";
        console.log("error", error);
        editor.setData(`${currentValue}${text}`);
      }

      const nextValue = editor.getData() || "";

      setValue("body", nextValue, {
        shouldDirty: true,
      });
    },
    [setValue],
  );

  return { editorRef, handleEditorReady, insertText };
}
