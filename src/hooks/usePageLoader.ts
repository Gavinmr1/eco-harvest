import { useContext, useEffect, useId } from "react";
import { PageLoaderContext } from "../contexts/PageLoaderContext";

export const usePageLoader = (active: boolean, label: string) => {
  const context = useContext(PageLoaderContext);
  const requestId = useId();

  useEffect(() => {
    if (!context) {
      return;
    }

    if (!active) {
      context.clearRequest(requestId);
      return;
    }

    context.setRequest(requestId, label);

    return () => {
      context.clearRequest(requestId);
    };
  }, [active, context, label, requestId]);
};
