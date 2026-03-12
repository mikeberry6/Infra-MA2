"use client";

interface AmbientGradientProps {
  primaryColor: string;
  secondaryColor?: string;
}

export function AmbientGradient({
  primaryColor,
  secondaryColor = "#34B27B",
}: AmbientGradientProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary blob */}
      <div
        className="absolute -top-1/2 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.07] animate-pulse-slow"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
        }}
      />
      {/* Secondary blob */}
      <div
        className="absolute -bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-[0.04] animate-pulse-slower"
        style={{
          background: `radial-gradient(circle, ${secondaryColor} 0%, transparent 70%)`,
        }}
      />
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.015]" />
    </div>
  );
}
