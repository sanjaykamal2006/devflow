import React from "react";

export type NeuformCraftEffectProps = {
  mode?: "dark" | "light";
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function HalftoneFlow({ className = "", style }: NeuformCraftEffectProps) {
  return <div className={`threeui-background halftone-flow ${className}`} style={style} />;
}
