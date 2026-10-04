import { useEffect, useRef } from "react";
import {
  createSignalParticlesRenderer,
  SIGNAL_PARTICLES_DEFAULTS,
  type SignalParticlesOptions,
} from "./signalParticlesRenderer";

export type SignalParticlesCanvasProps = Partial<SignalParticlesOptions> & {
  className?: string;
};

export function SignalParticlesCanvas({
  className = "",
  ...props
}: SignalParticlesCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const optionsRef = useRef({ ...SIGNAL_PARTICLES_DEFAULTS, ...props });
  optionsRef.current = { ...SIGNAL_PARTICLES_DEFAULTS, ...props };

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return undefined;

    const renderer = createSignalParticlesRenderer(canvas, () => optionsRef.current);
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

  const hue = optionsRef.current.hue ?? 0;
  const saturation = optionsRef.current.saturation ?? 1;

  return (
    <div
      ref={hostRef}
      className={`threeui-background signal-particles signal-particles--${optionsRef.current.mode ?? "dark"}${className ? ` ${className}` : ""}`}
      data-mode={optionsRef.current.mode ?? "dark"}
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
          filter:
            hue === 0 && saturation === 1
              ? undefined
              : `hue-rotate(${hue}deg) saturate(${saturation})`,
        }}
      />
    </div>
  );
}
