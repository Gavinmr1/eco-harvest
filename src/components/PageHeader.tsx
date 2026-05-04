import { type ReactNode } from "react";
import clsx from "clsx";
import Typography from "./Typography";

type PageHeaderProps = {
  title: ReactNode;
  subtitle: ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  maxWidthClassName?: string;
  align?: "center" | "left";
};

export default function PageHeader({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
}: PageHeaderProps) {
  return (
    <section
      className={clsx(
        "px-appSpacing gap-appInnerSpacing relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center",
        className
      )}
    >
      <Typography as="h1" className={titleClassName}>
        {title}
      </Typography>
      <Typography
        as="p"
        displayAs="body-lg"
        variant="muted"
        className={clsx("max-w-2xl", subtitleClassName)}
      >
        {subtitle}
      </Typography>
    </section>
  );
}
