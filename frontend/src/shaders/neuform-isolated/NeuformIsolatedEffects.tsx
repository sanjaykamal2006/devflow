import React from "react";

export type NeuformIsolatedEffectProps = {
  mode?: "dark" | "light";
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function VoidField({ className = "", style }: NeuformIsolatedEffectProps) {
  return <div className={`threeui-background void-field ${className}`} style={style} />;
}
