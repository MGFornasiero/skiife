"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"

import { useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

const themeIcons = {
  light: <Sun className="h-[1.2rem] w-[1.2rem]" />,
  dark: <Moon className="h-[1.2rem] w-[1.2rem]" />,
  system: <Monitor className="h-[1.2rem] w-[1.2rem]" />,
}

const themeOrder: ("light" | "dark" | "system")[] = ["light", "dark", "system"];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleToggle = () => {
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const currentIcon = themeIcons[theme] || themeIcons.system;
  const capitalizedTheme = theme.charAt(0).toUpperCase() + theme.slice(1);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={handleToggle}>
            {currentIcon}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Theme: {capitalizedTheme}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
