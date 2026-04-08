import type { CSSProperties } from "react";
import "./Loader.css";

type LoaderProps = {
  className?: string;
  size?: number;
  label?: string;
  variant?: "plant" | "crate";
};

const loaderClassName = (className?: string, variant?: LoaderProps["variant"]) =>
  ["base-loader", variant ? `base-loader--${variant}` : "", className].filter(Boolean).join(" ");

export default function Loader({
  className,
  size = 132,
  label = "Loading",
  variant = "crate",
}: LoaderProps) {
  const style = {
    "--loader-size": `${size}px`,
  } as CSSProperties;

  return (
    <div className="z-10 flex size-full grow items-center justify-center">
      <section
        className={loaderClassName(className, variant)}
        style={style}
        role="status"
        aria-live="polite"
      >
        <div className="base-loader__visual" aria-hidden="true">
          <span className="base-loader__shadow" />

          <div className="base-loader__box base-loader__box-rear">
            <span className="base-loader__face base-loader__face-bottom" />
            <span className="base-loader__face base-loader__face-back" />
            <span className="base-loader__face base-loader__face-left" />
            <span className="base-loader__flap base-loader__flap-back" />
            <span className="base-loader__flap base-loader__flap-left" />
          </div>

          <div className="base-loader__produce-showcase">
            <span className="base-loader__produce base-loader__produce--tomato" />
            <span className="base-loader__produce base-loader__produce--apple" />
            <span className="base-loader__produce base-loader__produce--carrot" />
            <span className="base-loader__produce base-loader__produce--cucumber" />
            <span className="base-loader__produce base-loader__produce--onion" />
            <span className="base-loader__produce base-loader__produce--pepper" />
            <span className="base-loader__produce base-loader__produce--pear" />
            <span className="base-loader__produce base-loader__produce--potato-a" />
            <span className="base-loader__produce base-loader__produce--potato-b" />
            <span className="base-loader__produce base-loader__produce--potato-c" />
          </div>

          <div className="base-loader__box base-loader__box-front">
            <span className="base-loader__face base-loader__flap-front" />
            <span className="base-loader__face base-loader__face-front" />
            <span className="base-loader__flap base-loader__flap-right" />
            <span className="base-loader__flap base-loader__face-right" />
          </div>
        </div>
        <p className="base-loader__label">{label}</p>
      </section>
    </div>
  );
}
