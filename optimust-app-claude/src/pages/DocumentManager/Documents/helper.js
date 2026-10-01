export const buildTreeNodes = (folders) => {
  return folders.map((f) => {
    return {
      key: f.id,
      label: f.name,
      value: f.nodeName,
      // ...f,
      children:
        f.folders && f.folders.length ? buildTreeNodes(f.folders) : null,
    };
  });
};

export const buildFolderTree1 = (type, nodes) => {
  const root = {
    id: type,
    name: type,
    folders: [],
  };
  const folderMap = {};

  nodes.forEach((node) => {
    const parts = node.name.split("\\");
    let parent = root;
    let currentPath = "";

    // skip first part (case id)
    const subParts = parts.slice(1);

    subParts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}\\${part}` : part;

      if (!folderMap[currentPath]) {
        // choose good ID
        const id =
          node.id && subParts.length === index + 1
            ? String(node.id) // last node -> real Id from API
            : currentPath.replace(/\\+/g, "_"); // fallback safe id

        const newFolder = {
          id,
          name: part,
          nodeName: currentPath,
          folders: [],
        };

        folderMap[currentPath] = newFolder;
        parent?.folders?.push(newFolder);
      }

      parent = folderMap[currentPath];
    });
  });

  return root;
};

export const getFileIconClass = (extension) => {
  switch (extension?.toLowerCase()) {
    case ".pdf":
    case "pdf":
      return "pi-file-pdf text-red-500";
    case ".doc":
    case "doc":
    case ".docx":
    case "docx":
      return "pi-file-word text-blue-500";
    case ".png":
    case "png":
    case ".jpg":
    case "jpg":
    case ".jpeg":
    case "jpeg":
      return "pi-image text-gray-500";
    default:
      return "pi-file text-gray-500";
  }
};
