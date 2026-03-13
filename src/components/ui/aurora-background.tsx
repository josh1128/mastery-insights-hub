"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-full items-center justify-center bg-background text-foreground transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              `
              [--aurora:repeating-linear-gradient(100deg,hsl(var(--primary))_10%,hsl(var(--primary-glow))_15%,hsl(var(--primary))_20%,hsl(var(--primary-glow))_25%,hsl(240_70%_60%/_0.3)_30%)]
              [background-image:var(--aurora)]
              [background-size:300%,_200%]
              [background-position:50%_50%,50%_50%]
              filter blur-[10px]
              after:content-[""] after:absolute after:inset-0
              after:[background-image:var(--aurora)]
              after:[background-size:200%,_100%]
              after:animate-aurora after:[background-attachment:fixed]
              after:mix-blend-difference
              pointer-events-none
              absolute -inset-[10px] opacity-40
              will-change-transform
              `,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
            )}
          />
        </div>
        <div className="relative z-10 w-full h-full">{children}</div>
      </div>
    </main>
  );
};
