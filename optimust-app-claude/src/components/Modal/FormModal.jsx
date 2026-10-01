import { Dialog } from "primereact/dialog";
import { memo } from "react";

const FormModal = ({
  visible,
  setVisible,
  title,
  children,
  width = "60vw",
  className,
  footer = null,
  style,
  ...props
}) => {
  const handleClose = () => {
    setVisible(false);
  };

  return (
    <Dialog
      header={title}
      visible={visible}
      onHide={handleClose}
      draggable={false}
      resizable={false}
      className={className}
      style={{
        width,
        transition: "width 300ms ease, min-height 300ms ease",
        ...style, // merge, don't blindly override
      }}
      contentStyle={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        maxHeight: "225vh",
        minHeight: 0, // lets this shrink instead of forcing children to overflow it
      }}
      footer={footer}
      {...props}
    >
      {children}
    </Dialog>
  );
};

export default memo(FormModal);
