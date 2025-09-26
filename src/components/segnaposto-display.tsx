"use client";

import { useState, useEffect } from "react";
import { TechnicInventory, StandInventory, StrikingPartsInventory, TargetInventory } from "@/lib/data";
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

// Helper function for sorting
const sortByName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name);


export default function SegnapostoDisplay() {
  const [inventoryTechnics, setInventoryTechnics] = useState<TechnicInventory | null>(null);
  const [inventoryStands, setInventoryStands] = useState<StandInventory | null>(null);
  const [inventoryStrikingParts, setInventoryStrikingParts] = useState<StrikingPartsInventory | null>(null);
  const [inventoryTargets, setInventoryTargets] = useState<TargetInventory | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentTechnicsPage, setCurrentTechnicsPage] = useState(1);
  const [currentStandsPage, setCurrentStandsPage] = useState(1);
  const [currentStrikingPartsPage, setCurrentStrikingPartsPage] = useState(1);
  const [currentTargetsPage, setCurrentTargetsPage] = useState(1);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [technicsRes, standsRes, strikingPartsRes,targetsRes] = await Promise.all([
            fetch("/api/technic_inventory"),
            fetch("/api/stand_inventory"),
            fetch("/api/strikingparts_inventory"),
            fetch("/api/target_inventory"),
        ]);
        
        if (!technicsRes.ok) throw new Error("Failed to fetch technic inventory");
        const technicsData: TechnicInventory = await technicsRes.json();
        setInventoryTechnics(technicsData);

        if (!standsRes.ok) throw new Error("Failed to fetch stand inventory");
        const standsData: StandInventory = await standsRes.json();
        setInventoryStands(standsData);

        if (!strikingPartsRes.ok) throw new Error("Failed to fetch striking parts inventory");
        const strikingPartsData: StrikingPartsInventory = await strikingPartsRes.json();
        setInventoryStrikingParts(strikingPartsData);
        
        if (!targetsRes.ok) throw new Error("Failed to fetch targets inventory");
        const targetsData: TargetInventory = await targetsRes.json();
        setInventoryTargets(targetsData);

      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const technicsArray = inventoryTechnics ? Object.values(inventoryTechnics.technics_inventory).sort(sortByName) : [];
  const totalTechnicsPages = Math.ceil(technicsArray.length / ITEMS_PER_PAGE);
  const paginatedTechnics = technicsArray.slice(
    (currentTechnicsPage - 1) * ITEMS_PER_PAGE,
    currentTechnicsPage * ITEMS_PER_PAGE
  );

  const standsArray = inventoryStands ? Object.values(inventoryStands.stands_inventory).sort(sortByName) : [];
  const totalStandsPages = Math.ceil(standsArray.length / ITEMS_PER_PAGE);
  const paginatedStands = standsArray.slice(
    (currentStandsPage - 1) * ITEMS_PER_PAGE,
    currentStandsPage * ITEMS_PER_PAGE
  );

  const strikingPartsArray = inventoryStrikingParts ? Object.values(inventoryStrikingParts.strikingparts_inventory).sort(sortByName) : [];
  const totalStrikingPartsPages = Math.ceil(strikingPartsArray.length / ITEMS_PER_PAGE);
  const paginatedStrikingParts = strikingPartsArray.slice(
    (currentStrikingPartsPage - 1) * ITEMS_PER_PAGE,
    currentStrikingPartsPage * ITEMS_PER_PAGE
  );

  const targetsArray = inventoryTargets ? Object.values(inventoryTargets.targets_inventory).sort(sortByName) : [];
  const totalTargetsPages = Math.ceil(targetsArray.length / ITEMS_PER_PAGE);
  const paginatedTargets = targetsArray.slice(
    (currentTargetsPage - 1) * ITEMS_PER_PAGE,
    currentTargetsPage * ITEMS_PER_PAGE
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Glossario</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-destructive">Error: {error}</p>}
        
        <Accordion type="single" collapsible className="w-full">
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

            <AccordionItem value="item-4">
                <AccordionTrigger>Targets Parts Inventory</AccordionTrigger>
                <AccordionContent>
                    {inventoryTargets && (
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
                                        {paginatedTargets.map((target) => (
                                            <TableRow key={target.id_target}>
                                                <TableCell>{target.name}</TableCell>
                                                <TableCell>{target.description}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentTargetsPage(p => Math.max(1, p - 1))}
                                    disabled={currentTargetsPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {currentTargetsPage} of {totalTargetsPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentTargetsPage(p => Math.min(totalTargetsPages, p + 1))}
                                    disabled={currentTargetsPage === totalTargetsPages}
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
