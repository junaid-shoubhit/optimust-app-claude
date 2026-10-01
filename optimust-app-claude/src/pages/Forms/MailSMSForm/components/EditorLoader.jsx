import React from "react";

const EditorLoader = React.memo(() => (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />

      <p className="text-sm text-gray-600">Replacing tags...</p>
    </div>
  </div>
));

EditorLoader.displayName = "EditorLoader";

export default EditorLoader;
