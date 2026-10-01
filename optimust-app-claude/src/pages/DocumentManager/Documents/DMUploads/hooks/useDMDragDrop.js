import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";

const ALLOWED_EXTENSIONS = [
  "pdf",
  "docx",
  "jpeg",
  "jpg",
  "png",
  "mp4",
  "mov",
  "heic",
  "heif",
  "webp"
];

const useDMDragDrop = ({
  canDropFile,
  onFileDrop,
}) => {
  const [droppedFiles, setDroppedFiles] =
    useState([]);

  const [isDraggingFile, setIsDraggingFile] =
    useState(false);

  const [isDropUploading, setIsDropUploading] =
    useState(false);

  const dragCounter = useRef(0);

  const handleDragEnter = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!canDropFile || isDropUploading) {
        return;
      }

      if (
        e.dataTransfer?.types?.includes(
          "Files",
        )
      ) {
        dragCounter.current += 1;
        setIsDraggingFile(true);
      }
    },
    [canDropFile, isDropUploading],
  );

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!canDropFile || isDropUploading) {
        e.dataTransfer.dropEffect = "none";
        return;
      }

      e.dataTransfer.dropEffect = "copy";

      if (
        e.dataTransfer?.types?.includes(
          "Files",
        )
      ) {
        setIsDraggingFile(true);
      }
    },
    [canDropFile, isDropUploading],
  );

  const handleDragLeave = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isDropUploading) return;

      dragCounter.current -= 1;

      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDraggingFile(false);
      }
    },
    [isDropUploading],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounter.current = 0;
      setIsDraggingFile(false);

      if (!canDropFile || isDropUploading) {
        return;
      }

      const files = Array.from(
        e.dataTransfer?.files || [],
      );

      if (!files.length) {
        return;
      }

      const validFiles = [];
      const invalidFiles = [];

      files.forEach((file) => {
        if (!(file instanceof File)) {
          return;
        }

        if (file.size <= 0) {
          return;
        }

        const ext = file.name
          .split(".")
          .pop()
          .toLowerCase();

        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          invalidFiles.push(file);
          return;
        }

        validFiles.push(file);
      });

      if (invalidFiles.length) {
        toast.info(
          "Only PDF, DOCX, JPEG, JPG, PNG, MP4, MOV, HEIC, HEIF, and WEBP files are allowed",
        );
      }

      if (!validFiles.length) {
        return;
      }

      setIsDropUploading(true);
      setDroppedFiles(validFiles);

      onFileDrop?.(validFiles);
    },
    [
      canDropFile,
      isDropUploading,
      onFileDrop,
    ],
  );

  const handleDroppedFileHandled =
    useCallback(() => {
      setDroppedFiles([]);
      setIsDropUploading(false);
      dragCounter.current = 0;
      setIsDraggingFile(false);
    }, []);

  useEffect(() => {
    return () => {
      dragCounter.current = 0;
    };
  }, []);

  return {
    droppedFiles,
    isDraggingFile,
    isDropUploading,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDroppedFileHandled,
  };
};

export default useDMDragDrop;