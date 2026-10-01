export const parseStatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return {
      value: 0,
      data: null,
    };
  }

  if (typeof value === "object") {
    return {
      value: value?.value ?? 0,
      data: value,
    };
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return {
        value: parsed?.value ?? 0,
        data: parsed,
      };
    } catch {
      return {
        value,
        data: null,
      };
    }
  }

  return {
    value,
    data: null,
  };
};
