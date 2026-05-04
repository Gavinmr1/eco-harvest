import { useCallback, useEffect, useRef, useState } from "react";
import { type RefObject } from "react";
import { getComputedValue } from "../utilities/styling/getComputedValue";
import { useEventListener } from "./useEventListener";
import useMultiColumnScroll from "./useMultiColumnScroll";

export interface UseDynamicMultiColumnProps {
  scrollRef?: RefObject<HTMLElement | null>;
  /** Values (px numbers or CSS custom property names) summed to produce topOffset. */
  topOffsets?: (number | string)[];
  /** Values summed to produce bottomOffset. */
  bottomOffsets?: (number | string)[];
  /** Values summed to produce overScroll. Omit to use the default (topOffset + bottomOffset). */
  overScrolls?: (number | string)[];
  /** Values summed to produce headerHeight. */
  headerOffset?: (number | string)[];
}

function sumValues(values: (number | string)[]): number {
  return values.reduce<number>((acc, v) => {
    if (typeof v === "number") return acc + v;
    return acc + getComputedValue(document.documentElement, v);
  }, 0);
}

export default function useDynamicMultiColumn(props?: UseDynamicMultiColumnProps) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const [resolved, setResolved] = useState<{
    topOffset: number;
    bottomOffset: number;
    overScroll: number | undefined;
    headerHeight: number;
  }>({ topOffset: 10, bottomOffset: 10, overScroll: undefined, headerHeight: 0 });

  const resolveValues = useCallback(() => {
    const {
      topOffsets = [],
      bottomOffsets = [],
      overScrolls = [],
      headerOffset = [],
    } = propsRef.current ?? {};

    const topOffset = topOffsets.length > 0 ? sumValues(topOffsets) : 10;
    const bottomOffset = bottomOffsets.length > 0 ? sumValues(bottomOffsets) : 10;
    const overScroll = overScrolls.length > 0 ? sumValues(overScrolls) : undefined;
    const headerHeight = headerOffset.length > 0 ? sumValues(headerOffset) : 0;

    setResolved({ topOffset, bottomOffset, overScroll, headerHeight });
  }, []);

  // Resolve on mount
  useEffect(() => {
    resolveValues();
  }, [resolveValues]);

  // Re-resolve on resize
  useEventListener("resize", resolveValues as EventListener);

  const scrollRef = props?.scrollRef;
  return useMultiColumnScroll({ scrollRef, ...resolved });
}
