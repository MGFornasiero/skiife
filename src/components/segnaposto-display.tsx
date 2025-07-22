"use client";

import { useState, useEffect } from "react";
import { Tecniche, Tecnica, Posizioni, Posizione, Parti, Parte , Obbiettivi, Obiettivo} from "@/lib/data";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ITEMS_PER_PAGE = 10;

// Helper function for sorting
const sortByName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name);


export default function SegnapostoDisplay() {
  const [inventoryTechnics, setInventoryTechnics] = useState<Tecniche | null>(null);
  const [inventoryStands, setInventoryStands] = useState<Posizioni | null>(null);
  const [inventoryStrikingParts, setInventoryStrikingParts] = useState<Parti | null>(null);
  const [inventoryTargets, setInventoryTargets] = useState<Obiettivi | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentTechnicsPage, setCurrentTechnicsPage] = useState(1);
  const [currentStandsPage, setCurrentStandsPage] = useState(1);
  const [currentStrikingPartsPage, setCurrentStrikingPartsPage] = useState(1);
  const [currentTargetsPage, setCurrentTargetsPage] = useState(1);

  // Add state for popover info
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverInfo, setPopoverInfo] = useState<any>(null);


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
        const technicsData = await technicsRes.json();
        setInventoryTechnics(technicsData.technics_inventory);

        if (!standsRes.ok) throw new Error("Failed to fetch stand inventory");
        const standsData = await standsRes.json();
        setInventoryStands(standsData.stands_inventory);

        if (!strikingPartsRes.ok) throw new Error("Failed to fetch striking parts inventory");
        const strikingPartsData = await strikingPartsRes.json();
        setInventoryStrikingParts(strikingPartsData.strikingparts_inventory);
        
        if (!targetsRes.ok) throw new Error("Failed to fetch targets inventory");
        const targetsData = await targetsRes.json();
        setInventoryTargets(targetsData.targets_inventory);

      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const technicsArray = inventoryTechnics ? Object.values(inventoryTechnics).sort(sortByName) : [];
  const totalTechnicsPages = Math.ceil(technicsArray.length / ITEMS_PER_PAGE);
  const paginatedTechnics = technicsArray.slice(
    (currentTechnicsPage - 1) * ITEMS_PER_PAGE,
    currentTechnicsPage * ITEMS_PER_PAGE
  );

  const standsArray = inventoryStands ? Object.values(inventoryStands).sort(sortByName) : [];
  const totalStandsPages = Math.ceil(standsArray.length / ITEMS_PER_PAGE);
  const paginatedStands = standsArray.slice(
    (currentStandsPage - 1) * ITEMS_PER_PAGE,
    currentStandsPage * ITEMS_PER_PAGE
  );

  const strikingPartsArray = inventoryStrikingParts ? Object.values(inventoryStrikingParts).sort(sortByName) : [];
  const totalStrikingPartsPages = Math.ceil(strikingPartsArray.length / ITEMS_PER_PAGE);
  const paginatedStrikingParts = strikingPartsArray.slice(
    (currentStrikingPartsPage - 1) * ITEMS_PER_PAGE,
    currentStrikingPartsPage * ITEMS_PER_PAGE
  );

  const targetsArray = inventoryTargets ? Object.values(inventoryTargets).sort(sortByName) : [];
  const totalTargetsPages = Math.ceil(targetsArray.length / ITEMS_PER_PAGE);
  const paginatedTargets = targetsArray.slice(
    (currentTargetsPage - 1) * ITEMS_PER_PAGE,
    currentTargetsPage * ITEMS_PER_PAGE
  );

  const handleInfoClick = async (type: string, id: number, event: React.MouseEvent<HTMLElement>) => {
    setPopoverOpen(true);
    setPopoverAnchor(event.currentTarget);
    setPopoverInfo(null);
    try {
      const res = await fetch(`/api/info_${type}/${id}`);
      if (!res.ok) throw new Error("Failed to fetch info");
      const data = await res.json();
      setPopoverInfo(data[`info_${type}`]);
    } catch (err) {
      setPopoverInfo({ error: "Failed to load info." });
    }
  };

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
                                            <TableHead>Info</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedTechnics.map((tecnica) => (
                                            <TableRow key={tecnica.id_technic}>
                                                <TableCell>{tecnica.name}</TableCell>
                                                <TableCell>{tecnica.description}</TableCell>
                                                <TableCell>
                                                  <Button variant="ghost" size="icon" onClick={(e) => handleInfoClick("technic", tecnica.id_technic, e)}>
                                                    ℹ️
                                                  </Button>
                                                </TableCell>
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
                                            <TableHead>Info</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedStands.map((stand) => (
                                            <TableRow key={stand.id_stand}>
                                                <TableCell>{stand.name}</TableCell>
                                                <TableCell>{stand.description}</TableCell>
                                                <TableCell>
                                                  <Button variant="ghost" size="icon" onClick={(e) => handleInfoClick("stand", stand.id_stand, e)}>
                                                    ℹ️
                                                  </Button>
                                                </TableCell>
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
                                            <TableHead>Info</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedStrikingParts.map((part) => (
                                            <TableRow key={part.id_part}>
                                                <TableCell>{part.name}</TableCell>
                                                <TableCell>{part.description}</TableCell>
                                                <TableCell>
                                                  <Button variant="ghost" size="icon" onClick={(e) => handleInfoClick("strikingpart", part.id_part, e)}>
                                                    ℹ️
                                                  </Button>
                                                </TableCell>
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
                                            <TableHead>Info</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedTargets.map((target) => (
                                            <TableRow key={target.id_target}>
                                                <TableCell>{target.name}</TableCell>
                                                <TableCell>{target.description}</TableCell>
                                                <TableCell>
                                                  <Button variant="ghost" size="icon" onClick={(e) => handleInfoClick("target", target.id_target, e)}>
                                                    ℹ️
                                                  </Button>
                                                </TableCell>
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

        {/* Info Popover */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <span style={{ display: "none" }} />
          </PopoverTrigger>
          <PopoverContent side="right" align="start" className="max-w-md" style={{ minWidth: 300 }}>
            <div className="space-y-2">
              <h4 className="font-semibold">Details</h4>
              <div className="text-sm text-muted-foreground space-y-2 max-h-64 overflow-y-auto">
                {popoverInfo ? (
                  popoverInfo.error ? (
                    <p>{popoverInfo.error}</p>
                  ) : (
                    Object.entries(popoverInfo).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </div>
                    ))
                  )
                ) : (
                  <div className="flex justify-center items-center p-4">
                    Loading...
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

      </CardContent>
    </Card>
  );
}
