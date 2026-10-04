import { lazy, Suspense, useEffect, useRef } from "react";
import {
  DataPixelArcCanvas,
  type DataPixelArcCanvasProps,
} from "../data-pixel-arc/DataPixelArcCanvas";
import {
  SignalParticlesCanvas,
  type SignalParticlesCanvasProps,
} from "../signal-particles/SignalParticlesCanvas";
import type { NeuformBatchEffectProps } from "../neuform-isolated/NeuformBatchEffects";
import {
  createPredictiveArcRenderer,
  PREDICTIVE_ARC_DEFAULTS,
  type PredictiveArcOptions,
} from "./predictiveArcRenderer";

export type PredictiveArcVariant = "predictive" | "data-pixel" | "signal-particles" | "override-grid";

type PredictiveVariantProps = Partial<PredictiveArcOptions> & {
  className?: string;
  variant?: "predictive";
};

type DataPixelVariantProps = DataPixelArcCanvasProps & {
  variant: "data-pixel";
};

type SignalParticlesVariantProps = SignalParticlesCanvasProps & {
  variant: "signal-particles";
};

type BatchVariantProps = Partial<NeuformBatchEffectProps> & {
  variant: "override-grid";
};

export type PredictiveArcCanvasProps =
  | PredictiveVariantProps
  | DataPixelVariantProps
  | SignalParticlesVariantProps
  | BatchVariantProps;

const OverrideGridVariant = lazy(() =>
  import("../neuform-isolated/NeuformBatchEffects").then((module) => ({ default: module.OverrideGrid })),
);

function PredictiveArcRenderer({ className = "", ...props }: PredictiveVariantProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const optionsRef = useRef({ ...PREDICTIVE_ARC_DEFAULTS, ...props });
  optionsRef.current = { ...PREDICTIVE_ARC_DEFAULTS, ...props };

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return undefined;
    const renderer = createPredictiveArcRenderer(canvas, () => optionsRef.current);
    if (!renderer) return undefined;
    let frame = 0;
    let visible = true;
    const resize = () => {
      const bounds = host.getBoundingClientRect();
      renderer.resize(bounds.width, bounds.height);
      renderer.render();
    };
    const tick = () => {
      renderer.render();
      if (visible && !document.hidden) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };
    const observer = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible && !frame) {
        frame = requestAnimationFrame(tick);
      }
      if (!visible && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    const visibility = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!document.hidden && visible && !frame) {
        frame = requestAnimationFrame(tick);
      }
    };
    observer.observe(host);
    intersection.observe(host);
    document.addEventListener("visibilitychange", visibility);
    resize();
    frame = requestAnimationFrame(tick);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={`threeui-background predictive-arc predictive-arc--${optionsRef.current.mode}${className ? ` ${className}` : ""}`}
      data-mode={optionsRef.current.mode}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          filter: `hue-rotate(${optionsRef.current.hue}deg) saturate(${optionsRef.current.saturation})`,
        }}
      />
    </div>
  );
}

export function PredictiveArcCanvas(props: PredictiveArcCanvasProps) {
  if (props.variant === "data-pixel") {
    const { variant: _, ...canvasProps } = props;
    void _;
    return <DataPixelArcCanvas {...canvasProps} />;
  }

  if (props.variant === "signal-particles") {
    const { variant: _, ...particleProps } = props;
    void _;
    return <SignalParticlesCanvas {...particleProps} />;
  }

  if (props.variant === "override-grid") {
    const { variant: _, ...effectProps } = props;
    void _;
    return (
      <Suspense fallback={<div className="threeui-background predictive-arc" />}>
        <OverrideGridVariant {...effectProps} />
      </Suspense>
    );
  }

  const { variant: _, ...canvasProps } = props as PredictiveVariantProps;
  void _;
  return <PredictiveArcRenderer {...canvasProps} />;
}
