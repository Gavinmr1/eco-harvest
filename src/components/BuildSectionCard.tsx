import clsx from "clsx";
import { type ReactNode } from "react";
import Typography from "./Typography";

type BuildSectionCardProps = {
  step: string;
  isComplete: boolean;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
};

export default function BuildSectionCard({
  step,
  isComplete,
  title,
  description,
  children,
  className,
  headerClassName,
}: BuildSectionCardProps) {
  return (
    <div
      className={clsx(
        "border-background-border/20 p-appInnerSpacing gap-appInnerSpacing flex flex-col rounded-2xl border bg-white/10 shadow-md backdrop-blur-lg",
        className
      )}
    >
      <div className={clsx("flex flex-col gap-2", headerClassName)}>
        <Typography as="h2" displayAs="h4" className="flex items-center gap-3">
          <Typography
            as="p"
            className={clsx(
              "inline-flex size-7 shrink-0 items-center justify-center rounded-full",
              isComplete ? "bg-green-500" : "bg-white/20"
            )}
          >
            {isComplete ? "✓" : step}
          </Typography>
          {title}
        </Typography>
        <Typography as="p" displayAs="body" variant="muted">
          {description}
        </Typography>
      </div>
      {children}
    </div>
  );
}
