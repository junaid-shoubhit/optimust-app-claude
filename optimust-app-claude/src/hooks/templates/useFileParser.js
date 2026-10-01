import { useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import mammoth from "mammoth";
import { toast } from "react-toastify";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const useFileParser = () => {
  const extractTextFromPDF = useCallback(async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const htmlParts = await Promise.all(
      Array.from({ length: pdf.numPages }, async (_, i) => {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();

        let lastY = null;
        const lines = [];
        let line = [];

        for (const item of textContent.items) {
          const y = Math.round(item.transform[5]);
          if (lastY === null || Math.abs(y - lastY) < 5) {
            line.push(item.str);
          } else {
            lines.push(line.join(" "));
            line = [item.str];
          }
          lastY = y;
        }
        if (line.length) lines.push(line.join(" "));

        return `<div>${lines.map((l) => `<p>${l}</p>`).join("")}</div><hr/>`;
      })
    );

    return htmlParts.join("");
  }, []);

  const extractTextFromDOCX = useCallback(async (file) => {
    const { value } = await mammoth.convertToHtml({
      arrayBuffer: await file.arrayBuffer(),
    });
    return value;
  }, []);

  const parseFile = useCallback(
    async (file) => {
      if (!file) return "";

      try {
        let content = "";
        const { type } = file;

        if (type === "application/pdf") content = await extractTextFromPDF(file);
        else if (
          type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
          content = await extractTextFromDOCX(file);
        else {
          toast.error("Only PDF or DOCX files are supported.");
          return "";
        }

        toast.success("File loaded!");
        return content;
      } catch (err) {
        console.error("File conversion error:", err);
        toast.error("Error reading file.");
        return "";
      }
    },
    [extractTextFromPDF, extractTextFromDOCX]
  );

  return { parseFile };
};
