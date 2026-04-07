type LeafLoaderProps = {
  className?: string;
  size?: number;
  label?: string;
  variant?: "plant" | "crate";
};

export default function LeafLoader({ className }: LeafLoaderProps) {
  return <div className={className} />;
}
