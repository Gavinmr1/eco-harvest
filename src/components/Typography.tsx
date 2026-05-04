import type { ComponentPropsWithoutRef, ElementType } from "react";
import clsx from "clsx";

type TypographyVariant = "inherit" | "display" | "body" | "muted" | "caption" | "label";
type TypographyTone = "default" | "muted" | "subtle" | "inherit";
type TypographyWeight = "inherit" | "normal" | "medium" | "semibold" | "bold";
type TypographyLetterSpacing = "inherit" | "tight" | "normal" | "wide";
type TypographyLineHeight = "inherit" | "display" | "heading" | "body" | "tight" | "none";

const displayClassMap = {
  display: "typography--display",
  h1: "typography--h1",
  h2: "typography--h2",
  h3: "typography--h3",
  h4: "typography--h4",
  h5: "typography--h5",
  h6: "typography--h6",
  "body-lg": "typography--body-lg",
  body: "typography--body",
  caption: "typography--caption",
  label: "typography--label",
  p: "typography--body",
  li: "typography--body",
  small: "typography--caption",
} as const;

type TypographyDisplayAs = keyof typeof displayClassMap;

type TypographyProps<T extends ElementType> = {
  as?: T;
  displayAs?: TypographyDisplayAs;
  variant?: TypographyVariant;
  tone?: TypographyTone;
  weight?: TypographyWeight;
  letterSpacing?: TypographyLetterSpacing;
  lineHeight?: TypographyLineHeight;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

const tagDisplayFallbackMap = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  p: "body",
  li: "body",
  small: "caption",
  label: "label",
} as const satisfies Record<string, TypographyDisplayAs>;

const toneClassMap: Record<TypographyTone, string> = {
  default: "text-foreground",
  muted: "text-foreground-dimmed2",
  subtle: "text-foreground-dimmed3",
  inherit: "",
};

const weightClassMap: Record<TypographyWeight, string> = {
  inherit: "",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const letterSpacingClassMap: Record<TypographyLetterSpacing, string> = {
  inherit: "",
  tight: "tracking-tight",
  normal: "tracking-normal",
  wide: "tracking-wide",
};

const lineHeightClassMap: Record<TypographyLineHeight, string> = {
  inherit: "",
  display: "leading-[var(--type-line-display)]",
  heading: "leading-[var(--type-line-heading)]",
  body: "leading-[var(--type-line-body)]",
  tight: "leading-[var(--type-line-tight)]",
  none: "leading-none",
};

const tagToneFallbackMap = {
  h1: "default",
  h2: "default",
  h3: "default",
  h4: "default",
  h5: "default",
  h6: "default",
  p: "default",
  li: "default",
  small: "subtle",
  label: "default",
  strong: "default",
  span: "inherit",
} as const satisfies Record<string, TypographyTone>;

const tagWeightFallbackMap = {
  h1: "bold",
  h2: "semibold",
  h3: "semibold",
  h4: "semibold",
  h5: "medium",
  h6: "medium",
  p: "normal",
  li: "normal",
  small: "normal",
  label: "medium",
  strong: "semibold",
  span: "inherit",
} as const satisfies Record<string, TypographyWeight>;

const variantMap: Record<
  TypographyVariant,
  Partial<Pick<TypographyProps<ElementType>, "displayAs" | "tone" | "weight">>
> = {
  inherit: {},
  display: { displayAs: "display", tone: "default", weight: "bold" },
  body: { displayAs: "body", tone: "default", weight: "normal" },
  muted: { displayAs: "body", tone: "muted", weight: "normal" },
  caption: { displayAs: "caption", tone: "subtle", weight: "normal" },
  label: { displayAs: "label", tone: "default", weight: "medium" },
};

export default function Typography<T extends ElementType = "p">({
  as,
  displayAs,
  variant = "inherit",
  tone,
  weight,
  letterSpacing,
  lineHeight,
  className,
  ...props
}: TypographyProps<T>) {
  const Component = as ?? "p";
  const tagName = typeof Component === "string" ? Component : undefined;
  const variantPreset = variantMap[variant];

  const fallbackDisplayAs =
    tagName && tagName in tagDisplayFallbackMap
      ? tagDisplayFallbackMap[tagName as keyof typeof tagDisplayFallbackMap]
      : undefined;

  const resolvedDisplayAs = displayAs ?? variantPreset.displayAs ?? fallbackDisplayAs;
  const resolvedTone =
    tone ??
    variantPreset.tone ??
    (tagName && tagName in tagToneFallbackMap
      ? tagToneFallbackMap[tagName as keyof typeof tagToneFallbackMap]
      : "inherit");
  const resolvedWeight =
    weight ??
    variantPreset.weight ??
    (tagName && tagName in tagWeightFallbackMap
      ? tagWeightFallbackMap[tagName as keyof typeof tagWeightFallbackMap]
      : "inherit");

  return (
    <Component
      className={clsx(
        resolvedDisplayAs ? displayClassMap[resolvedDisplayAs] : "",
        toneClassMap[resolvedTone],
        weightClassMap[resolvedWeight],
        letterSpacing ? letterSpacingClassMap[letterSpacing] : "",
        lineHeight ? lineHeightClassMap[lineHeight] : "",
        className
      )}
      {...props}
    />
  );
}
