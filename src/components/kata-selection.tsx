"use client";

import { useState, useEffect } from "react";
import { type KataInventory, type KataSteps, type Transactions, type TransactionsMapping } from "@/lib/data";
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
  const [loading, setLoading] = useState(false);
  const [kataData, setKataData] = useState<{
    kata_steps: KataSteps;
    transactions: Transactions;
    transactions_mapping_from: TransactionsMapping;
    transactions_mapping_to: TransactionsMapping;
  } | null>(null);

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

  useEffect(() => {
    if (kataId === null) {
      setKataData(null);
      return;
    }

    setLoading(true);
    setKataData(null);
    fetch(`/api/kata/${kataId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch kata data');
        }
        return res.json();
      })
      .then(data => {
        setKataData(data);
      })
      .catch(error => {
        console.error("Error fetching kata data:", error);
        setKataData(null);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [kataId]);

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
            </div>
          </div>
        ) : (
            <div className="flex items-center justify-center h-24">
                <p className="text-muted-foreground">Loading kata inventory...</p>
            </div>
        )}
        
        {loading && <p className="text-muted-foreground pt-4">Loading kata details...</p>}

        {kataData && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Kata Data Loaded</h4>
            <pre className="text-xs overflow-auto bg-background p-2 rounded">
              {JSON.stringify(kataData, null, 2)}
            </pre>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
