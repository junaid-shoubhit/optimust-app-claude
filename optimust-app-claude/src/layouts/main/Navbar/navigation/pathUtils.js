export const stripTrailingSlash = (path = "") => path.replace(/\/$/, "");

export const splitPath = (path = "") => path.split("/").filter(Boolean);

/**
 * True when `pathname` is `basePath` itself or nested below it.
 * Any query string on `basePath` is ignored.
 */
export const isPathWithin = (pathname, basePath) => {
  if (!basePath) return false;

  const base = basePath.split("?")[0];

  return pathname === base || pathname.startsWith(`${base}/`);
};
