import React from "react";

/**
 * A component that displays the current breakpoint for development purposes
 * This helps with responsive design by showing which breakpoint is active
 */
const ResponsiveHelper: React.FC<{ className?: string }> = ({ className }) => {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 right-0 z-50 m-4 rounded bg-black/80 px-2 py-1 text-xs font-mono text-white ${className}`}
    >
      <div className="sm:hidden">xs</div>
      <div className="hidden sm:block md:hidden">sm</div>
      <div className="hidden md:block lg:hidden">md</div>
      <div className="hidden lg:block xl:hidden">lg</div>
      <div className="hidden xl:block 2xl:hidden">xl</div>
      <div className="hidden 2xl:block">2xl</div>
    </div>
  );
};

export default ResponsiveHelper;
