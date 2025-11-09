
"use client";

import React, { useState, useEffect } from "react";
import { KataSequenceStep } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DirectionIndicator } from "./direction-indicator";

const facingToDegree: Record<string, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SO: 225, 
  O: 270, 
  NO: 315, 
};

interface KataPlayerProps {
  steps: KataSequenceStep[];
  stepDuration?: number;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}

export const KataPlayer: React.FC<KataPlayerProps> = ({
  steps,
  stepDuration = 500,
  currentStepIndex,
}) => {
  const currentStep = steps[currentStepIndex];

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

  // Calculate viewBox
  const padding = 5;
  const embusenPoints = steps.map(s => s.embusen).filter(Boolean);
  
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  if (embusenPoints.length > 0) {
      minX = Math.min(...embusenPoints.map(p => p!.x));
      maxX = Math.max(...embusenPoints.map(p => p!.x));
      minY = Math.min(...embusenPoints.map(p => p!.y));
      maxY = Math.max(...embusenPoints.map(p => p!.y));
  }

  const width = (maxX - minX) + (padding * 2);
  const height = (maxY - minY) + (padding * 2);
  const viewBox = `${minX - padding} ${-maxY - padding} ${width} ${height}`;

  const transformY = (y: number) => -y;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Embusen</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 items-center gap-4">
        <div className="flex flex-col items-center">
            <svg viewBox={viewBox} className="border rounded-md bg-secondary/30 h-64 w-64">
              <circle cx={0} cy={0} r={0.3} className="fill-muted-foreground/50" />
              
              {steps.slice(0, currentStepIndex).map((s, idx) => (
                s.embusen ? (
                  <circle
                    key={`past-${idx}`}
                    cx={s.embusen.x}
                    cy={transformY(s.embusen.y)}
                    r={0.5}
                    className="fill-muted-foreground/30"
                  />
                ) : null
              ))}
              
              {steps.slice(currentStepIndex + 1).map((s, idx) => (
                s.embusen ? (
                  <circle
                    key={`future-${idx}`}
                    cx={s.embusen.x}
                    cy={transformY(s.embusen.y)}
                    r={0.3}
                    className="fill-muted-foreground/20"
                  />
                ) : null
              ))}

              {currentStep && currentStep.embusen && (
                 <g transform={`translate(${position.x}, ${transformY(position.y)}) rotate(${position.facing})`}>
                    <polygon
                        points="0,-1.2 0.6,1.2 -0.6,1.2"
                        className={cn(
                            "transition-transform duration-100",
                            currentStep.kiai ? "fill-destructive" : "fill-primary"
                        )}
                    />
                </g>
              )}
            </svg>
            <div className="mt-4 w-full text-center">
                {currentStep.kiai && <p className="text-sm font-bold text-destructive">Kiai!</p>}
            </div>
        </div>
        <div className="flex items-center justify-center">
          {currentStep && (
              <DirectionIndicator
                  size={120}
                  direction={currentStep.facing}
                  guardia={currentStep.guardia}
              />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
