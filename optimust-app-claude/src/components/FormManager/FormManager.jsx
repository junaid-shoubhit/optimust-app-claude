/* ===================== MAIN ===================== */

import React, { Suspense, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { formConfig } from "./formConfig";
import { capitalize } from "../../utils/constant";

const FormManager = ({ type, page }) => {
  const params = useParams();
  const { formManager } = params;

  const moduleConfig = formConfig[type];

  /* ---------------- RESOLVE COMPONENT ---------------- */
  const LazyComponent = useMemo(() => {
    if (!type || !moduleConfig) return null;

    try {
      const comp = moduleConfig.resolver({ formManager });
      comp?.preload?.();
      return comp;
    } catch (err) {
      console.error("⚠️ [FormManager] Resolver error:", err);
      return null;
    }
  }, [type, moduleConfig, formManager]);

  /* ---------------- PRELOAD SAFETY ---------------- */
  useEffect(() => {
    LazyComponent?.preload?.();
  }, [LazyComponent]);

  /* ---------------- TITLE ---------------- */
  useEffect(() => {
    if (!type) return;

    document.title = `${capitalize(type)} ${capitalize(
      formManager || "",
    )} | App`;
  }, [type, formManager]);

  /* ---------------- VALIDATION (AFTER HOOKS) ---------------- */

  if (!type) {
    console.warn("⚠️ Missing type");
    return <ErrorDisplay message="Form type not specified." />;
  }

  if (!moduleConfig) {
    return <ErrorDisplay message={`Invalid module type: ${type}`} />;
  }

  if (!LazyComponent) {
    return (
      <ErrorDisplay
        message="Invalid form type or path."
        details={<pre>{JSON.stringify(params, null, 2)}</pre>}
      />
    );
  }

  /* ---------------- RENDER ---------------- */

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <LazyComponent page={page} />
    </Suspense>
  );
};

export default FormManager;

/* ===================== HELPERS ===================== */

const ErrorDisplay = React.memo(({ message, details }) => (
  <div className="p-6 text-center">
    <h2 className="text-red-600 text-xl font-semibold mb-2">⚠️ Error</h2>
    <p>{message}</p>
    {details && <div className="mt-2 text-sm text-gray-600">{details}</div>}
  </div>
));

const LoadingIndicator = React.memo(() => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
    <span className="ml-3 text-gray-700">Loading form...</span>
  </div>
));
