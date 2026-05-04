import { type RefObject, useEffect, useRef } from "react";

/**
 * Generic addEventListener / removeEventListener hook.
 * When no element is provided, attaches to window.
 */
export function useEventListener(
  eventName: string,
  handler: EventListener,
  element?: RefObject<EventTarget | null> | EventTarget
): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    let target: EventTarget | null;
    if (!element) {
      target = window;
    } else if ("current" in (element as RefObject<EventTarget | null>)) {
      target = (element as RefObject<EventTarget | null>).current;
    } else {
      target = element as EventTarget;
    }

    if (!target) return;

    const listener: EventListener = e => handlerRef.current(e);
    target.addEventListener(eventName, listener);
    return () => target!.removeEventListener(eventName, listener);
  }, [eventName, element]);
}
