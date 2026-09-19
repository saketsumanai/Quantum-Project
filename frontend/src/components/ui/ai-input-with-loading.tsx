"use client";

import React, { useState, useEffect } from "react";
import { CornerRightUp, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";

export interface AIInputWithLoadingProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  loadingDuration?: number;
  thinkingDuration?: number;
  onSubmit?: (value: string) => void | Promise<void>;
  className?: string;
  autoAnimate?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function AIInputWithLoading({
  id = "ai-input-with-loading",
  placeholder = "Ask me anything about quantum computing...",
  minHeight = 52,
  maxHeight = 180,
  loadingDuration = 3000,
  thinkingDuration = 1000,
  onSubmit,
  className,
  autoAnimate = false,
  value: externalValue,
  onChange: externalOnChange,
  isLoading = false,
  children,
}: AIInputWithLoadingProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = externalValue !== undefined;
  const inputValue = isControlled ? externalValue : internalValue;

  const [submitted, setSubmitted] = useState(autoAnimate);
  const [isAnimating, setIsAnimating] = useState(autoAnimate);

  const isActuallyLoading = isLoading || submitted;

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  useEffect(() => {
    let timeoutId: any;

    const runAnimation = () => {
      if (!isAnimating) return;
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, thinkingDuration);
      }, loadingDuration);
    };

    if (isAnimating) {
      runAnimation();
    }

    return () => clearTimeout(timeoutId);
  }, [isAnimating, loadingDuration, thinkingDuration]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isControlled) {
      externalOnChange?.(e.target.value);
    } else {
      setInternalValue(e.target.value);
    }
    adjustHeight();
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isActuallyLoading) return;

    const textToSend = inputValue;
    if (!isControlled) {
      setInternalValue("");
    } else {
      externalOnChange?.("");
    }
    adjustHeight(true);

    if (onSubmit) {
      await onSubmit(textToSend);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative w-full flex flex-col gap-2">
        <div className="relative w-full rounded-2xl bg-zinc-900/90 border border-zinc-700/80 shadow-lg focus-within:border-zinc-500 transition-colors">
          <Textarea
            id={id}
            placeholder={placeholder}
            className={cn(
              "w-full bg-transparent rounded-2xl pl-4 pr-24 py-3.5",
              "placeholder:text-zinc-500 text-white text-sm",
              "border-none ring-0 focus-visible:ring-0 focus-visible:outline-none",
              "resize-none text-wrap leading-relaxed",
              "scrollbar-thin scrollbar-thumb-zinc-700"
            )}
            style={{ minHeight: `${minHeight}px` }}
            ref={textareaRef}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isActuallyLoading}
          />

          {/* Action Tools Right Corner */}
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
            {children}

            <button
              onClick={handleSubmit}
              className={cn(
                "h-8 w-8 rounded-xl flex items-center justify-center transition-all",
                isActuallyLoading
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : inputValue.trim()
                  ? "bg-white text-black hover:bg-zinc-200 shadow-md cursor-pointer"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
              type="button"
              disabled={isActuallyLoading || !inputValue.trim()}
              title="Submit query (Enter)"
            >
              {isActuallyLoading ? (
                <div
                  className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-white rounded-full animate-spin"
                />
              ) : (
                <CornerRightUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center px-2 text-[11px] text-zinc-500 font-mono">
          <span>{isActuallyLoading ? "Quantum reasoning engine active..." : "Press Enter to query • Shift+Enter for newline"}</span>
          <span>Groq + ChromaDB RAG</span>
        </div>
      </div>
    </div>
  );
}
