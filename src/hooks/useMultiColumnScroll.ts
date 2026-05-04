import { useCallback, useRef } from "react";
import { type RefObject } from "react";
import { clamp } from "../utilities/math/clamp";
import { useEventListener } from "./useEventListener";

export interface MultiColumnScrollOptions {
  /** Ref to the scrolling container. Defaults to document / window. */
  scrollRef?: RefObject<HTMLElement | null>;
  /** Minimum top offset in px — columns won't go above this. Default: 10 */
  topOffset?: number;
  /** Buffer at the bottom in px — columns stop this far above the viewport bottom. Default: 10 */
  bottomOffset?: number;
  /** Column is considered "overflowing" when its height exceeds viewportHeight − overScroll.
   *  Defaults to topOffset + bottomOffset. */
  overScroll?: number;
  /** Height of a collapsing sticky header in px. Columns shift down while the header is visible. Default: 0 */
  headerHeight?: number;
}

export default function useMultiColumnScroll(options: MultiColumnScrollOptions = {}) {
  const { scrollRef, topOffset = 10, bottomOffset = 10, headerHeight = 0 } = options;
  const overScroll = options.overScroll ?? topOffset + bottomOffset;

  const prevScrollTop = useRef(0);
  const prevDirection = useRef<"up" | "down" | null>(null);
  const topSnapshots = useRef<Map<Element, number>>(new Map());
  const directionScrollStart = useRef(0);
  const initialized = useRef(false);

  const getScrollTop = useCallback(() => {
    return scrollRef?.current ? scrollRef.current.scrollTop : window.scrollY;
  }, [scrollRef]);

  const getColumns = useCallback((): NodeListOf<HTMLElement> => {
    const container = scrollRef?.current ?? document;
    return container.querySelectorAll<HTMLElement>(".multi-column");
  }, [scrollRef]);

  const runScroll = useCallback(() => {
    const scrollTop = getScrollTop();
    const viewportHeight = window.innerHeight;
    const direction: "up" | "down" = scrollTop >= prevScrollTop.current ? "down" : "up";

    // Visible portion of a collapsing header
    const visibleHeader = headerHeight > 0 ? clamp(headerHeight - scrollTop, 0, headerHeight) : 0;
    const effectiveTop = topOffset + visibleHeader;

    const columns = getColumns();

    // First run — initialise all column tops and bail
    if (!initialized.current) {
      initialized.current = true;
      columns.forEach(col => {
        col.style.top = `${effectiveTop}px`;
        topSnapshots.current.set(col, effectiveTop);
      });
      prevDirection.current = direction;
      directionScrollStart.current = scrollTop;
      prevScrollTop.current = scrollTop;
      return;
    }

    // Detect direction change → snapshot current tops and reset counter
    if (direction !== prevDirection.current) {
      prevDirection.current = direction;
      directionScrollStart.current = scrollTop;
      columns.forEach(col => {
        const currentTop = parseFloat(col.style.top);
        topSnapshots.current.set(col, isNaN(currentTop) ? effectiveTop : currentTop);
      });
    }

    const scrolledInDirection = Math.abs(scrollTop - directionScrollStart.current);

    columns.forEach(col => {
      const colHeight = col.offsetHeight;
      const stickHeight = viewportHeight - colHeight;

      if (colHeight < viewportHeight - overScroll) {
        // Short column — pin at effectiveTop
        col.style.top = `${effectiveTop}px`;
      } else {
        // Tall column — slide up/down with scroll
        const snapshotTop = topSnapshots.current.get(col) ?? effectiveTop;
        const rawTop =
          direction === "down"
            ? snapshotTop - scrolledInDirection
            : snapshotTop + scrolledInDirection;
        col.style.top = `${clamp(rawTop, stickHeight - bottomOffset, effectiveTop)}px`;
      }
    });

    prevScrollTop.current = scrollTop;
  }, [getScrollTop, getColumns, topOffset, bottomOffset, overScroll, headerHeight]);

  /** Re-run the scroll handler immediately after a layout change. */
  const reAlign = useCallback(() => {
    runScroll();
  }, [runScroll]);

  useEventListener("scroll", runScroll as EventListener, scrollRef ?? undefined);

  return { reAlign };
}
