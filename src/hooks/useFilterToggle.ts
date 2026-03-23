import { useCallback, type Dispatch, type SetStateAction } from "react";

export function useFilterToggle<T>(
  setter: Dispatch<SetStateAction<Set<T>>>
) {
  return useCallback(
    (value: T) => {
      setter((prev) => {
        const next = new Set(prev);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        return next;
      });
    },
    [setter]
  );
}
