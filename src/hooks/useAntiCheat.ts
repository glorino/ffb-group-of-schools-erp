"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface AntiCheatOptions {
  maxViolations?: number;
  onAutoSubmit?: () => void;
  onViolation?: (count: number, type: string) => void;
}

interface AntiCheatReturn {
  violations: number;
  isBlocked: boolean;
  warningMessage: string;
  showWarning: boolean;
  violationType: string;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  dismissWarning: () => void;
}

export function useAntiCheat(options: AntiCheatOptions = {}): AntiCheatReturn {
  const { maxViolations = 5, onAutoSubmit, onViolation } = options;
  const [violations, setViolations] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [violationType, setViolationType] = useState("");
  const monitoringRef = useRef(false);
  const cleanupRef = useRef<(() => void)[]>([]);

  const triggerViolation = useCallback(
    (type: string, message: string) => {
      if (isBlocked) return;

      setViolations((prev) => {
        const next = prev + 1;
        if (next >= maxViolations) {
          setIsBlocked(true);
          setTimeout(() => {
            onAutoSubmit?.();
          }, 1500);
        }
        onViolation?.(next, type);
        return next;
      });

      setViolationType(type);
      setWarningMessage(message);
      setShowWarning(true);
    },
    [isBlocked, maxViolations, onAutoSubmit, onViolation]
  );

  const startMonitoring = useCallback(() => {
    if (monitoringRef.current) return;
    monitoringRef.current = true;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation(
          "tab_switch",
          "Exam Rule Violation! You attempted to switch tabs or minimize the window."
        );
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerViolation(
        "right_click",
        "Exam Rule Violation! Right-click is disabled during the exam."
      );
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation(
        "copy",
        "Exam Rule Violation! Copying is disabled during the exam."
      );
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation(
        "paste",
        "Exam Rule Violation! Pasting is disabled during the exam."
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
        triggerViolation(
          "devtools",
          "Exam Rule Violation! Developer tools access is blocked."
        );
      }
    };

    const handleBlur = () => {
      triggerViolation(
        "window_blur",
        "Exam Rule Violation! You left the exam window."
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);

    cleanupRef.current.push(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
    });
  }, [triggerViolation]);

  const stopMonitoring = useCallback(() => {
    monitoringRef.current = false;
    cleanupRef.current.forEach((cleanup) => cleanup());
    cleanupRef.current = [];
  }, []);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    violations,
    isBlocked,
    warningMessage,
    showWarning,
    violationType,
    startMonitoring,
    stopMonitoring,
    dismissWarning,
  };
}
