import React, { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import { MdClose } from "react-icons/md";

const ESignTag = ({ coord, onRemove, onUpdate, containerSize }) => {
  const handleDragStop = (e, d) => {
    if (!containerSize.width) return;

    const newX = (d.x / containerSize.width) * 100;
    const newY = (d.y / containerSize.height) * 100;

    // 🔥 prevent unnecessary re-render loop
    if (Math.abs(newX - coord.x) < 0.1 && Math.abs(newY - coord.y) < 0.1)
      return;

    onUpdate({
      ...coord,
      x: newX,
      y: newY,
    });
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    if (!containerSize.width) return;

    const newWidthPx = parseFloat(ref.style.width);
    const newHeightPx = parseFloat(ref.style.height);

    const newWidth = Math.max(
      8,
      Math.min(100, (newWidthPx / containerSize.width) * 100),
    );
    const newHeight = Math.max(
      6,
      Math.min(100, (newHeightPx / containerSize.height) * 100),
    );

    const newX = Math.max(
      0,
      Math.min(100, (position.x / containerSize.width) * 100),
    );
    const newY = Math.max(
      0,
      Math.min(100, (position.y / containerSize.height) * 100),
    );

    onUpdate({
      ...coord,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  };

  const renderContent = () => {
    const typeValue = coord.tagType?.value;

    // Create a shared class string for consistency
    const contentClass =
      "w-full h-full flex items-center justify-center text-gray-500 text-[10px] font-bold uppercase leading-none";

    if (typeValue === "signature") {
      return <div className={contentClass}>SIGNATURE</div>;
    }

    if (typeValue === "date") {
      return <div className={contentClass}>DATE SIGNED</div>;
    }

    if (typeValue === "initials") {
      return <div className={contentClass}>INITIALS</div>;
    }

    return <div className="text-[10px] p-1 text-gray-700">Tag</div>;
  };

  const position = {
    x: (coord.x / 100) * containerSize.width,
    y: (coord.y / 100) * containerSize.height,
  };

  const size = {
    width: (coord.width / 100) * containerSize.width,
    height: (coord.height / 100) * containerSize.height,
  };

  return (
    <Rnd
      position={position}
      size={size}
      bounds="parent"
      minWidth={60} // Reduced from 72
      minHeight={30} // Reduced from 42 
      onDragStop={(e, d) => {
        const newX = (d.x / containerSize.width) * 100;
        const newY = (d.y / containerSize.height) * 100;

        onUpdate({
          ...coord,
          x: newX,
          y: newY,
        });
      }}
      onResizeStop={(e, direction, ref, delta, pos) => {
        const newWidthPx = parseFloat(ref.style.width);
        const newHeightPx = parseFloat(ref.style.height);

        onUpdate({
          ...coord,
          x: (pos.x / containerSize.width) * 100,
          y: (pos.y / containerSize.height) * 100,
          width: (newWidthPx / containerSize.width) * 100,
          height: (newHeightPx / containerSize.height) * 100,
        });
      }}
      className="bg-white/95 backdrop-blur-md border border-gray-300 shadow-xl rounded-md flex items-center justify-center cursor-move select-none overflow-visible "
      style={{ zIndex: 30 }}
    >
      {/* Inner content wrapper */}
      <div
        className="relative w-full h-full flex items-center justify-center p-0 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(coord.id);
          }}
          className="absolute -top-1 -right-1 z-50 text-black rounded-lg w-6 h-6 flex items-center justify-center text-xs transition-colors cursor-pointer hover:text-red-600"
        >
          <MdClose size={10} />
        </button>
      </div>
    </Rnd>
  );
};

export default ESignTag;
