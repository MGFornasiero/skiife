
import React from "react";
import { ArrowUp, Eye, Crosshair } from "lucide-react";
import { AbsoluteDirections, Sides } from "@/lib/type_admin_fe";

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

const guardiaSymbolMap: { [key in Sides]: string } = {
  'sx': '◐',
  'dx': '◑',
  'frontal': '◒',
};

interface DirectionIndicatorProps {
  size?: number;
  direction?: AbsoluteDirections;
  guardia?: Sides | null;
  centerIcon?: React.ElementType;
  arrowColor?: string;
  tickColor?: string;
  guardiaColor?: string;
}

const directions: AbsoluteDirections[] = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];

export const DirectionIndicator: React.FC<DirectionIndicatorProps> = ({
  size = 60,
  direction,
  guardia,
  centerIcon: CenterIcon,
  arrowColor = "hsl(var(--primary))",
  tickColor = "hsl(var(--muted-foreground))",
  guardiaColor = "hsl(var(--foreground))",
}) => {
  const center = size / 2;
  const radius = size * 0.4;

  const rotation = direction ? directionRotation[direction] : 0;
  const arrowAngle = (rotation * Math.PI) / 180;
  const arrowX = center + radius * Math.sin(arrowAngle);
  const arrowY = center - radius * Math.cos(arrowAngle);

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

      {/* Arrow on the ticks ring */}
      {direction && (
        <div
          style={{
            position: 'absolute',
            left: arrowX,
            top: arrowY,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
        >
          <ArrowUp size={size * 0.25} color={arrowColor} />
        </div>
      )}

      {/* Guardia or Center Icon */}
      {guardia ? (
        <div
            style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: guardiaColor,
                fontSize: `${size * 0.4}px`,
                lineHeight: 1,
            }}
        >
            {guardiaSymbolMap[guardia]}
        </div>
      ) : CenterIcon && (
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
