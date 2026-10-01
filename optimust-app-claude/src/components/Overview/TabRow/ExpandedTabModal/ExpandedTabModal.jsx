import { createPortal } from "react-dom";

const ExpandedCardPortal = ({
  children,
  transform,
  width,
  height,
  fadeOut,
  onClose,
}) => {
  return createPortal(
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[998] bg-black/40 transition-opacity duration-500 ${
          fadeOut ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        style={{
          position: "fixed",
          zIndex: 999,
          top: "50%",
          left: "50%",
          width,
          height,
          maxHeight: "80vh",
          transformOrigin: "center center",
          transform,
          transition: "transform 500ms cubic-bezier(.2,.8,.2,1)",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </>,
    document.body,
  );
};

export default ExpandedCardPortal;
