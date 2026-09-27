import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: React.ReactNode;
  hoverIcon?: React.ReactNode;
  hoverText?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", icon, hoverIcon, hoverText, className, children, ...props }, ref) => {
  const displayText = children && typeof children === 'string' ? children : text;
  const displayHoverText = hoverText || displayText;
  const activeHoverIcon = hoverIcon !== undefined ? hoverIcon : <ArrowRight size={14} />;

  return (
    <button
      ref={ref}
      className={cn(
        "group relative min-w-[100px] cursor-pointer overflow-hidden rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-center text-sm font-semibold text-white shadow-md transition-colors hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center justify-center gap-1.5 translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {icon}
        <span>{displayText}</span>
      </span>
      <div className="absolute inset-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-1.5 text-white opacity-0 transition-all duration-300 group-hover:-translate-x-0 group-hover:opacity-100">
        <span>{displayHoverText}</span>
        {activeHoverIcon}
      </div>
      <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-zinc-700 transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[2] group-hover:bg-zinc-800"></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
