import React from "react";
import { ArrowUp } from "lucide-react";
import { AbsoluteDirections } from "@/lib/type_admin_fe";


const directionRotation: Record<AbsoluteDirections, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SO: 225,
  O: 270,
  NO: 315,
};

interface BaseDirectionIndicatorProps {
  size?: number;
  centerIcon?: React.ElementType;
  direction?: AbsoluteDirections;
  arrowColor?: string;
  tickColor?: string;
}

const directions: AbsoluteDirections[] = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];

export const DirectionIndicator: React.FC<BaseDirectionIndicatorProps> = ({
  size = 60,
  centerIcon: CenterIcon,
  direction,
  arrowColor = "hsl(var(--primary))",
  tickColor = "hsl(var(--muted-foreground))",
}) => {
  const center = size / 2;
  const radius = size * 0.45;

  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      {/* Compass ticks */}
      {directions.map((dir) => {
        const angle = (directionRotation[dir] * Math.PI) / 180;
        const tickSize = size * 0.06;
        const x = center + radius * Math.sin(angle) - tickSize / 2;
        const y = center - radius * Math.cos(angle) - tickSize / 2;

        return (
          <div
            key={dir}
            style={{
              position: "absolute",
              width: tickSize,
              height: tickSize,
              backgroundColor: tickColor,
              borderRadius: "50%",
              left: x,
              top: y,
            }}
          />
        );
      })}

      {/* Arrow */}
      {direction && (
        <ArrowUp
          size={size * 0.6}
          color={arrowColor}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) rotate(${directionRotation[direction]}deg)`,
            transformOrigin: "50% 50%",
            transition: "transform 0.3s ease-out",
          }}
        />
      )}

      {/* Center Icon */}
      {CenterIcon && (
        <CenterIcon
          size={size * 0.3}
          color={arrowColor}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </div>
  );
};
