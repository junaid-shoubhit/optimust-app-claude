export const getId = (option) => option?.value || null;

export const getEntityId = (option) => option?.entityId || null;

export const getEmails = (items = []) =>
  Array.isArray(items)
    ? items
        .map((item) => item?.label)
        .filter(Boolean)
        .join(",")
    : "";

export const getRecipientNames = (items = []) =>
  Array.isArray(items)
    ? items
        .map((item) => item?.address)
        .filter(Boolean)
        .join(",")
    : "";

export const getTagTypeNumber = (type) => {
  switch (type) {
    case "signature":
      return 1;

    case "date":
      return 2;

    case "initials":
      return 3;

    default:
      return 1;
  }
};

export const buildSigningCoordinates = (filesList, coordinatesList) =>
  (coordinatesList || []).map((coord) => {
    const matchedFile = filesList?.[coord.currentFileIndex];

    return {
      id: coord.id,

      currentFileIndex: coord.currentFileIndex,

      pageNumber: coord.pageNumber,

      x: coord.x,
      y: coord.y,

      width: coord.width,
      height: coord.height,

      tagType: getTagTypeNumber(coord.tagType?.value || coord.tagType),

      xCoord: coord.xCoord ?? coord.x,

      yCoord: coord.yCoord ?? coord.y,

      fileName: matchedFile?.name || coord?.fileName || "",
    };
  });
