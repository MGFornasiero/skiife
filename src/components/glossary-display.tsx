"use client";

import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type Technic = {
    id_technic: number;
    name: string;
    description: string;
    waza: string;
};

type Stand = {
    id_stand: number;
    name: string;
    description: string;
};

type StrikingPart = {
    id_strikingpart: number;
    name: string;
    description: string;
};

type Target = {
    id_target: number;
    name: string;
    description: string;
};


type TechnicsInventory = { [key: string]: Technic };
type StandsInventory = { [key: string]: Stand };
type StrikingPartsInventory = { [key: string]: StrikingPart };
type TargetsInventory = { [key: string]: Target };

export default function GlossaryDisplay() {
  const [technicsInventory, setTechnicsInventory] = useState<TechnicsInventory | null>(null);
  const [standsInventory, setStandsInventory] = useState<StandsInventory | null>(null);
  const [strikingPartsInventory, setStrikingPartsInventory] = useState<StrikingPartsInventory | null>(null);
  const [targetsInventory, setTargetsInventory] = useState<TargetsInventory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [technicsRes, standsRes, strikingPartsRes, targetsRes] = await Promise.all([
          fetch("/api/technic_inventory"),
          fetch("/api/stand_inventory"),
          fetch("/api/strikingparts_inventory"),
          fetch("/api/target_inventory"),
        ]);

        if (!technicsRes.ok) throw new Error("Failed to fetch technics");
        const technicsData = await technicsRes.json();
        setTechnicsInventory(technicsData);

        if (!standsRes.ok) throw new Error("Failed to fetch stands");
        const standsData = await standsRes.json();
        setStandsInventory(standsData);

        if (!strikingPartsRes.ok) throw new Error("Failed to fetch striking parts");
        const strikingPartsData = await strikingPartsRes.json();
        setStrikingPartsInventory(strikingPartsData);
        
        if (!targetsRes.ok) throw new Error("Failed to fetch targets");
        const targetsData = await targetsRes.json();
        setTargetsInventory(targetsData);

      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
        console.error("Glossary fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading glossary...</p>;
  }

  if (error) {
    return <p className="text-destructive">Error: {error}</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Tecniche</AccordionTrigger>
        <AccordionContent>
          {technicsInventory && Object.keys(technicsInventory).length > 0 ? (
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.entries(technicsInventory).map(([key, item]) => (
                        <TableRow key={key}>
                            <TableCell className="font-medium">{item.name} {item.waza && `(${item.waza})`}</TableCell>
                            <TableCell>{item.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          ) : (
            <p>No techniques found.</p>
          )}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Posizioni</AccordionTrigger>
        <AccordionContent>
          {standsInventory && Object.keys(standsInventory).length > 0 ? (
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.entries(standsInventory).map(([key, item]) => (
                        <TableRow key={key}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          ) : (
            <p>No stands found.</p>
          )}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Parti del corpo</AccordionTrigger>
        <AccordionContent>
          {strikingPartsInventory && Object.keys(strikingPartsInventory).length > 0 ? (
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.entries(strikingPartsInventory).map(([key, item]) => (
                        <TableRow key={key}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          ) : (
            <p>No striking parts found.</p>
          )}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>Obiettivi</AccordionTrigger>
        <AccordionContent>
          {targetsInventory && Object.keys(targetsInventory).length > 0 ? (
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.entries(targetsInventory).map(([key, item]) => (
                        <TableRow key={key}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          ) : (
            <p>No targets found.</p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
