
"use client";

import React, { useState, useEffect } from "react";
import { KataSequenceStep } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const facingToDegree: Record<string, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SO: 225, // Corrected from SW
  O: 270, // Corrected from W
  NO: 315, // Corrected from NW
};

interface KataPlayerProps {
  steps: KataSequenceStep[];
  stepDuration?: number;
  scale?: number;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}

export const KataPlayer: React.FC<KataPlayerProps> = ({
  steps,
  stepDuration = 500,
  scale = 20,
  currentStepIndex,
  onStepChange,
}) => {
  const [position, setPosition] = useState(() => {
    const initialStep = steps[currentStepIndex];
    if (!initialStep || !initialStep.embusen) {
      return { x: 0, y: 0, facing: 0 };
    }
    return {
      x: initialStep.embusen.x,
      y: initialStep.embusen.y,
      facing: facingToDegree[initialStep.facing || "N"] || 0,
    };
  });

  // Animate step changes
  useEffect(() => {
    const step = steps[currentStepIndex];
    if (!step || !step.embusen) return;

    const targetX = step.embusen.x;
    const targetY = step.embusen.y;
    const targetFacing = facingToDegree[step.facing || "N"] || 0;

    const animationFrames = 20;
    let frame = 0;

    const startX = position.x;
    const startY = position.y;
    let startFacing = position.facing;

    // Handle angle wrapping for smooth rotation
    const angleDiff = targetFacing - startFacing;
    if (angleDiff > 180) {
      startFacing += 360;
    } else if (angleDiff < -180) {
      startFacing -= 360;
    }

    const interval = setInterval(() => {
      frame++;
      const progress = frame / animationFrames;
      setPosition({
        x: startX + (targetX - startX) * progress,
        y: startY + (targetY - startY) * progress,
        facing: startFacing + (targetFacing - startFacing) * progress,
      });

      if (frame === animationFrames) clearInterval(interval);
    }, stepDuration / animationFrames);

    return () => clearInterval(interval);
  }, [currentStepIndex, steps, stepDuration, position.x, position.y, position.facing]);


  const currentStep = steps[currentStepIndex];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embusen</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <svg viewBox="0 0 400 400" className="border rounded-md bg-secondary/30 h-80 w-80">
          {/* Mark origin (0,0) */}
          <circle cx={200} cy={200} r={3} className="fill-muted-foreground/50" />
          
          {/* Draw faint previous steps */}
          {steps.slice(0, currentStepIndex).map((s, idx) => (
            s.embusen ? (
              <circle
                key={`past-${idx}`}
                cx={200 + s.embusen.x * scale}
                cy={200 - s.embusen.y * scale}
                r={5}
                className="fill-muted-foreground/30"
              />
            ) : null
          ))}
          
           {/* Draw future steps */}
           {steps.slice(currentStepIndex + 1).map((s, idx) => (
            s.embusen ? (
              <circle
                key={`future-${idx}`}
                cx={200 + s.embusen.x * scale}
                cy={200 - s.embusen.y * scale}
                r={3}
                className="fill-muted-foreground/20"
              />
            ) : null
          ))}

          {/* Draw current arrow */}
          {currentStep && currentStep.embusen && (
            <polygon
              points="0,-12 6,12 -6,12"
              className={cn(
                "transition-transform duration-100",
                currentStep.kiai ? "fill-destructive" : "fill-primary"
              )}
              transform={`translate(${200 + position.x * scale}, ${
                200 - position.y * scale
              }) rotate(${position.facing})`}
            />
          )}
        </svg>

        <div className="mt-4 w-full text-center">
            {currentStep.kiai && <p className="text-sm font-bold text-destructive">Kiai!</p>}
        </div>
      </CardContent>
    </Card>
  );
};
