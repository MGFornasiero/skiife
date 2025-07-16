"use client";

import { useState, useEffect } from "react";
import { Tecniche, Tecnica } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SegnapostoDisplay() {
  const [inventory_technics, setInventoryTechnics] = useState<Tecniche | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/technic_inventory");
        if (!response.ok) {
          throw new Error("Failed to fetch technic inventory");
        }
        const data = await response.json();
        setInventoryTechnics(data.technics_inventory);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Segnaposto</CardTitle>
        <CardDescription>This is a placeholder tab showing the Technic Inventory.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-destructive">Error: {error}</p>}
        {inventory_technics && (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(inventory_technics).map(([key, tecnica]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{key}</TableCell>
                      <TableCell>{tecnica.name}</TableCell>
                      <TableCell>{tecnica.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
