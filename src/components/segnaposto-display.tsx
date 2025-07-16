"use client";

import { useState, useEffect } from "react";
import { Tecniche, Tecnica, Posizioni, Posizione, Parti, Parte } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ITEMS_PER_PAGE = 10;

export default function SegnapostoDisplay() {
  const [inventoryTechnics, setInventoryTechnics] = useState<Tecniche | null>(null);
  const [inventoryStands, setInventoryStands] = useState<Posizioni | null>(null);
  const [inventoryStrikingParts, setInventoryStrikingParts] = useState<Parti | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentTechnicsPage, setCurrentTechnicsPage] = useState(1);
  const [currentStandsPage, setCurrentStandsPage] = useState(1);
  const [currentStrikingPartsPage, setCurrentStrikingPartsPage] = useState(1);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [technicsRes, standsRes, strikingPartsRes] = await Promise.all([
            fetch("/api/technic_inventory"),
            fetch("/api/stand_inventory"),
            fetch("/api/strikingparts_inventory"),
        ]);
        
        if (!technicsRes.ok) throw new Error("Failed to fetch technic inventory");
        const technicsData = await technicsRes.json();
        setInventoryTechnics(technicsData.technics_inventory);

        if (!standsRes.ok) throw new Error("Failed to fetch stand inventory");
        const standsData = await standsRes.json();
        setInventoryStands(standsData.stands_inventory);

        if (!strikingPartsRes.ok) throw new Error("Failed to fetch striking parts inventory");
        const strikingPartsData = await strikingPartsRes.json();
        setInventoryStrikingParts(strikingPartsData.strikingparts_inventory);

      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const technicsArray = inventoryTechnics ? Object.values(inventoryTechnics) : [];
  const totalTechnicsPages = Math.ceil(technicsArray.length / ITEMS_PER_PAGE);
  const paginatedTechnics = technicsArray.slice(
    (currentTechnicsPage - 1) * ITEMS_PER_PAGE,
    currentTechnicsPage * ITEMS_PER_PAGE
  );

  const standsArray = inventoryStands ? Object.values(inventoryStands) : [];
  const totalStandsPages = Math.ceil(standsArray.length / ITEMS_PER_PAGE);
  const paginatedStands = standsArray.slice(
    (currentStandsPage - 1) * ITEMS_PER_PAGE,
    currentStandsPage * ITEMS_PER_PAGE
  );

  const strikingPartsArray = inventoryStrikingParts ? Object.values(inventoryStrikingParts) : [];
  const totalStrikingPartsPages = Math.ceil(strikingPartsArray.length / ITEMS_PER_PAGE);
  const paginatedStrikingParts = strikingPartsArray.slice(
    (currentStrikingPartsPage - 1) * ITEMS_PER_PAGE,
    currentStrikingPartsPage * ITEMS_PER_PAGE
  );


  return (
    <Card>
      <CardHeader>
        <CardTitle>Segnaposto</CardTitle>
        <CardDescription>This is a placeholder tab showing various inventories.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-destructive">Error: {error}</p>}
        
        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            <AccordionItem value="item-1">
                <AccordionTrigger>Techniques Inventory</AccordionTrigger>
                <AccordionContent>
                    {inventoryTechnics && (
                        <>
                            <div className="overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedTechnics.map((tecnica) => (
                                            <TableRow key={tecnica.id_technic}>
                                                <TableCell>{tecnica.name}</TableCell>
                                                <TableCell>{tecnica.description}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentTechnicsPage(p => Math.max(1, p - 1))}
                                    disabled={currentTechnicsPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {currentTechnicsPage} of {totalTechnicsPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentTechnicsPage(p => Math.min(totalTechnicsPages, p + 1))}
                                    disabled={currentTechnicsPage === totalTechnicsPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </>
                    )}
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Stands Inventory</AccordionTrigger>
                <AccordionContent>
                    {inventoryStands && (
                        <>
                            <div className="overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedStands.map((stand) => (
                                            <TableRow key={stand.id_stand}>
                                                <TableCell>{stand.name}</TableCell>
                                                <TableCell>{stand.description}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentStandsPage(p => Math.max(1, p - 1))}
                                    disabled={currentStandsPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {currentStandsPage} of {totalStandsPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentStandsPage(p => Math.min(totalStandsPages, p + 1))}
                                    disabled={currentStandsPage === totalStandsPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </>
                    )}
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Striking Parts Inventory</AccordionTrigger>
                <AccordionContent>
                    {inventoryStrikingParts && (
                        <>
                            <div className="overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedStrikingParts.map((part) => (
                                            <TableRow key={part.id_part}>
                                                <TableCell>{part.name}</TableCell>
                                                <TableCell>{part.description}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentStrikingPartsPage(p => Math.max(1, p - 1))}
                                    disabled={currentStrikingPartsPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {currentStrikingPartsPage} of {totalStrikingPartsPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentStrikingPartsPage(p => Math.min(totalStrikingPartsPages, p + 1))}
                                    disabled={currentStrikingPartsPage === totalStrikingPartsPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
