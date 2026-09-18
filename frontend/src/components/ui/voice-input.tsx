"use client";

import React from "react";
import { Mic, MicOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface VoiceInputProps {
  onStart?: () => void;
  onStop?: () => void;
  onTranscript?: (transcript: string) => void;
}

export function VoiceInput({
  className,
  onStart,
  onStop,
  onTranscript,
}: React.ComponentProps<"div"> & VoiceInputProps) {
  const [_listening, _setListening] = React.useState<boolean>(false);
  const [_time, _setTime] = React.useState<number>(0);
  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    let intervalId: any;

    if (_listening) {
      onStart?.();
      intervalId = setInterval(() => {
        _setTime((t) => t + 1);
      }, 1000);

      // Initialize Web Speech API if supported
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";

          recognition.onresult = (event: any) => {
            let current = "";
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript;
            }
            if (current.trim()) {
              onTranscript?.(current);
            }
          };

          recognition.onerror = (err: any) => {
            console.warn("Speech recognition error:", err);
            _setListening(false);
          };

          recognition.onend = () => {
            _setListening(false);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn("Speech recognition init error:", e);
        }
      }
    } else {
      onStop?.();
      _setTime(0);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
    }

    return () => {
      clearInterval(intervalId);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [_listening]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const onClickHandler = () => {
    _setListening(!_listening);
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <motion.div
        className={cn(
          "flex p-2 border items-center justify-center rounded-full cursor-pointer transition-colors shadow-sm",
          _listening
            ? "border-red-500/80 bg-red-950/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white"
        )}
        layout
        transition={{
          layout: {
            duration: 0.4,
          },
        }}
        onClick={onClickHandler}
        title={_listening ? "Click to stop listening" : "Click to speak your quantum query"}
      >
        <div className="h-5 w-5 items-center justify-center flex">
          {_listening ? (
            <motion.div
              className="w-3.5 h-3.5 bg-red-400 rounded-sm"
              animate={{
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ) : (
            <Mic size={16} />
          )}
        </div>
        <AnimatePresence mode="wait">
          {_listening && (
            <motion.div
              initial={{ opacity: 0, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, width: "auto", marginLeft: 8 }}
              exit={{ opacity: 0, width: 0, marginLeft: 0 }}
              transition={{
                duration: 0.4,
              }}
              className="overflow-hidden flex gap-2 items-center justify-center"
            >
              {/* Frequency Animation */}
              <div className="flex gap-0.5 items-center justify-center">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-red-400 rounded-full"
                    initial={{ height: 2 }}
                    animate={{
                      height: _listening
                        ? [2, 3 + Math.random() * 12, 3 + Math.random() * 6, 2]
                        : 2,
                    }}
                    transition={{
                      duration: _listening ? 0.8 : 0.3,
                      repeat: _listening ? Infinity : 0,
                      delay: _listening ? i * 0.05 : 0,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              {/* Timer */}
              <div className="text-[11px] font-mono text-red-300 w-10 text-center font-bold">
                {formatTime(_time)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
