export type SignalParticlesMode = "dark" | "light";

export type SignalParticlesOptions = {
  mode?: SignalParticlesMode;
  speed?: number;
  spacing?: number;
  dotRadius?: number;
  hue?: number;
  saturation?: number;
  brightness?: number;
};

export const SIGNAL_PARTICLES_DEFAULTS: Required<SignalParticlesOptions> = {
  mode: "dark",
  speed: 1,
  spacing: 16,
  dotRadius: 1.5,
  hue: 0,
  saturation: 1,
  brightness: 1,
};

function resolveMode(mode: SignalParticlesOptions["mode"] | number | string | undefined): SignalParticlesMode {
  if (mode === "light" || mode === 1 || mode === "1") return "light";
  return "dark";
}

export function createSignalParticlesRenderer(
  canvas: HTMLCanvasElement,
  getOptions: () => SignalParticlesOptions
) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return null;
  let width = 1;
  let height = 1;
  let time = 0;

  const resize = (nextWidth: number, nextHeight: number) => {
    width = Math.max(1, nextWidth);
    height = Math.max(1, nextHeight);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const render = () => {
    const rawOptions = getOptions();
    const options = { ...SIGNAL_PARTICLES_DEFAULTS, ...rawOptions };
    const mode = resolveMode(options.mode);
    const isDark = mode !== "light";

    // Clear with full transparency so underlying background and 3D orb shine through
    context.clearRect(0, 0, width, height);

    const spacing = Math.max(8, options.spacing);
    const dotRadius = Math.max(0.5, options.dotRadius);
    const cols = Math.floor(width / spacing);
    const rows = Math.floor(height / spacing);
    const offsetX = (width - cols * spacing) / 2;
    const offsetY = (height - rows * spacing) / 2;

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const x = offsetX + i * spacing;
        const y = offsetY + j * spacing;

        const nx = i * 0.1;
        const ny = j * 0.1;

        const wave1 = Math.sin(nx + time * 0.5) * Math.cos(ny - time * 0.3);
        const wave2 = Math.sin(nx * 0.5 - ny * 0.5 + time * 0.8);
        const value = wave1 + wave2;

        if (value > 0.1) {
          context.beginPath();
          context.arc(x, y, dotRadius, 0, Math.PI * 2);

          const highlightCheck = Math.sin(i * 12.34) * Math.cos(j * 56.78);

          if (highlightCheck > 0.98) {
            context.fillStyle = isDark ? "#38bdf8" : "#0284c7"; // Sky/Blue highlight
          } else if (highlightCheck < -0.98) {
            context.fillStyle = isDark ? "#a855f7" : "#7c3aed"; // Purple highlight
          } else {
            const alpha = Math.min(0.55, (value - 0.1) * 0.75) * options.brightness;
            context.fillStyle = isDark
              ? `rgba(148, 163, 184, ${alpha})`
              : `rgba(71, 85, 105, ${alpha})`;
          }

          context.fill();
        }
      }
    }

    time += 0.02 * options.speed;
  };

  return { resize, render };
}
