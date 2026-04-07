import type { ComponentPropsWithoutRef, ElementType } from "react";
import clsx from "clsx";

type TypographyVariant = "inherit" | "body" | "muted" | "caption" | "label";

type TypographyProps<T extends ElementType> = {
  as?: T;
  variant?: TypographyVariant;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

const variantClasses: Record<TypographyVariant, string> = {
  inherit: "",
  body: "text-foreground leading-relaxed",
  muted: "text-foreground-dimmed2 leading-relaxed",
  caption: "text-foreground-dimmed3 text-sm leading-normal",
  label: "text-foreground text-sm font-medium leading-none",
};

export default function Typography<T extends ElementType = "p">({
  as,
  variant = "inherit",
  className,
  ...props
}: TypographyProps<T>) {
  const Component = as ?? "p";

  return <Component className={clsx(variantClasses[variant], className)} {...props} />;
}
