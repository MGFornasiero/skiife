"use client";

import { useState, useEffect } from "react";
import { type KataInventory } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function KataSelection() {
  const [kataInventory, setKataInventory] = useState<KataInventory | null>(null);
  const [kataId, setKataId] = useState<number | null>(null);

  useEffect(() => {
    // Fetch kata inventory on component mount
    fetch('/api/kata_inventory')
      .then(res => res.json())
      .then(data => {
        if (data && data.kata) {
            setKataInventory(data.kata);
        }
      })
      .catch(console.error);
  }, []);

  const handleKataChange = (value: string) => {
      if (kataInventory) {
          const selectedKataId = kataInventory[value];
          setKataId(selectedKataId);
      }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kata Selection</CardTitle>
        <CardDescription>Select a kata to see its details.</CardDescription>
      </CardHeader>
      <CardContent>
        {kataInventory ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kata-select">Kata</Label>
              <Select onValueChange={handleKataChange}>
                <SelectTrigger id="kata-select" className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Select a kata..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(kataInventory).map((kataName) => (
                    <SelectItem key={kataName} value={kataName}>
                      {kataName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {kataId !== null && <p className="text-sm text-muted-foreground pt-2">Selected Kata ID: {kataId}</p>}
            </div>
          </div>
        ) : (
            <div className="flex items-center justify-center h-24">
                <p className="text-muted-foreground">Loading kata inventory...</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
