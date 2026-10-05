/** Route matching is case-insensitive, like React Router's. */
const normalize = (path = "") =>
  path.split("?")[0].replace(/\/+$/, "").toLowerCase();

export const splitPath = (path = "") =>
  normalize(path).split("/").filter(Boolean);

/** True when `pathname` is `basePath` itself or nested below it. */
export const isPathWithin = (pathname, basePath) => {
  const base = normalize(basePath);

  if (!base) return false;

  const path = normalize(pathname);

  return path === base || path.startsWith(`${base}/`);
};

/** Module path without a trailing slash, as used to build tab routes. */
export const modulePathOf = (module) =>
  (module?.path || "").replace(/\/+$/, "");
