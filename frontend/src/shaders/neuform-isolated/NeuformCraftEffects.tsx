import React from "react";

export type NeuformCraftEffectProps = {
  mode?: "dark" | "light";
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function HalftoneFlow(props: NeuformCraftEffectProps) {
  return <div className="threeui-background halftone-flow" />;
}
