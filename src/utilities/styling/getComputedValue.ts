/**
 * Reads a CSS custom property from an element and returns its pixel value.
 * Handles px, rem, and em units.
 */
export function getComputedValue(el: Element, prop: string): number {
  const raw = getComputedStyle(el).getPropertyValue(prop).trim();
  const match = raw.match(/^([\d.]+)(\D+)$/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = match[2];
  if (unit === "px") return num;
  if (unit === "rem") return num * parseFloat(getComputedStyle(document.documentElement).fontSize);
  if (unit === "em") return num * parseFloat(getComputedStyle(el as HTMLElement).fontSize);
  return 0;
}
