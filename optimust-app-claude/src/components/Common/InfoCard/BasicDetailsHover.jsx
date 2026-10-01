import { memo, useCallback, useRef, useState } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { Skeleton } from "primereact/skeleton";
import { apiRequest } from "../../../services/apiBinding";

const BasicDetailsHover = ({
  children,
  entityId,
  entityCodeId,
}) => {
  const overlayRef = useRef(null);
  const timeoutRef = useRef(null);
  const cacheRef = useRef(new Map());

  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (
      entityId === null ||
      entityId === undefined ||
      entityId === "" ||
      entityCodeId === null ||
      entityCodeId === undefined
    ) {
      return;
    }

    const cacheKey = `${entityCodeId}-${entityId}`;

    if (cacheRef.current.has(cacheKey)) {
      setDetails(cacheRef.current.get(cacheKey));
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const response = await apiRequest({
        apiPath: "/Case/CaseAdditionDetails",
        method: "get",
        payload: {
          entityId,
          entityCodeId,
        },
      });

      const data = Array.isArray(response?.data)
        ? response.data
        : [];

      cacheRef.current.set(cacheKey, data);

      setDetails(data);
    } catch (err) {
      console.error(
        "Error fetching basic details:",
        err,
      );

      setDetails([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [entityId, entityCodeId]);

  const handleMouseEnter = useCallback(
    (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      fetchDetails();

      overlayRef.current?.show(
        event,
        event.currentTarget,
      );
    },
    [fetchDetails],
  );

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      overlayRef.current?.hide();
    }, 150);
  }, []);

  const handlePanelEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handlePanelLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      overlayRef.current?.hide();
    }, 150);
  }, []);

  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>

      <OverlayPanel
        ref={overlayRef}
        dismissable={false}
        showCloseIcon={false}
        className="p-0!"
        onMouseEnter={handlePanelEnter}
        onMouseLeave={handlePanelLeave}
      >
        <div className="w-[300px] max-w-[300px] p-2">
          {/* <div className="font-semibold text-sm mb-2">
            Basic Details
          </div> */}

          {loading && (
            <div className="flex flex-col gap-2">
              <Skeleton
                width="70%"
                height="14px"
              />
              <Skeleton
                width="90%"
                height="14px"
              />
              <Skeleton
                width="60%"
                height="14px"
              />
              <Skeleton
                width="80%"
                height="14px"
              />
            </div>
          )}

          {!loading && error && (
            <div className="text-sm text-gray-500">
              Unable to load details.
            </div>
          )}

          {!loading &&
            !error &&
            details.length === 0 && (
              <div className="text-xs text-gray-500">
                No details available.
              </div>
            )}

          {!loading &&
            !error &&
            details.length > 0 && (
              <div className="flex flex-col gap-2">
                {details.map((detail, index) => (
                  <div
                    key={`${detail?.name}-${index}`}
                    className="flex gap-3 text-xs"
                  >
                    <div className="font-medium uppercase text-gray-500 min-w-[90px]">
                      {detail?.name}
                    </div>

                    <div className="text-gray-900 break-words">
                      {detail?.value ?? "--"}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </OverlayPanel>
    </>
  );
};

export default memo(BasicDetailsHover);
