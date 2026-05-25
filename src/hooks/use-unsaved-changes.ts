import { useEffect, useCallback, useRef } from "react";

export function useUnsavedChanges(dirty: boolean, message?: string) {
  const defaultMsg = "You have unsaved changes. Are you sure you want to leave?";
  const dirtyRef = useRef(dirty);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // Browser back/refresh/close
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Navigation within the app
  useEffect(() => {
    if (!dirty) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link && link.href && link.href !== window.location.href) {
        if (!window.confirm(message || defaultMsg)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [dirty, message]);
}
