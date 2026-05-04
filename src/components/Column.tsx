import { forwardRef, useMemo } from "react";
import clsx from "clsx";

interface ColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Disables sticky behaviour (sets position: static !important).
   * Pass this when columns are stacked vertically (e.g. mobile) so the
   * scroll hook doesn't fight the natural document flow.
   */
  off?: boolean;
  children: React.ReactNode;
}

const COL_CLASS = "multi-column sticky top-0 h-fit";

/**
 * A sticky-scroll column. The `useMultiColumnScroll` hook queries for
 * `.multi-column` elements and drives their `style.top` on every scroll
 * event, giving each column independent sticky-scroll behaviour.
 */
const Column = forwardRef<HTMLDivElement, ColumnProps>(
  ({ off, className, children, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={useMemo(() => clsx(COL_CLASS, off && "!static", className), [off, className])}
    >
      {children}
    </div>
  )
);

Column.displayName = "Column";

export default Column;
