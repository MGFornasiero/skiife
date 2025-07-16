
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

type Tecnica = {
  name: string;
  description: string;
  waza: string;
};

type Tecniche = {
  [key: string]: Tecnica;
};

type Posizione = {
  name: string;
  description: string;
};

type Posizioni = {
  [key: string]: Posizione;
};

type Parte = {
    name: string;
    description: string;
};

type Parti = {
    [key: string]: Parte;
};

type Obiettivo = {
    name: string;
    description: string;
};

type Obiettivi = {
    [key: string]: Obiettivo;
};


export default function GlossaryDisplay() {
  const [technicsInventory, setTechnicsInventory] = useState<Tecniche | null>(null);
  const [standsInventory, setStandsInventory] = useState<Posizioni | null>(null);
  const [strikingPartsInventory, setStrikingPartsInventory] = useState<Parti | null>(null);
  const [targetsInventory, setTargetsInventory] = useState<Obiettivi | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({
      tecniche: true,
      posizioni: true,
      parti: true,
      obiettivi: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoints = {
            tecniche: '/api/technic_inventory',
            posizioni: '/api/stand_inventory',
            parti: '/api/strikingparts_inventory',
            obiettivi: '/api/target_inventory'
        };

        const responses = await Promise.all([
            fetch(endpoints.tecniche),
            fetch(endpoints.posizioni),
            fetch(endpoints.parti),
            fetch(endpoints.obiettivi)
        ]);

        const [technicsData, standsData, strikingPartsData, targetsData] = await Promise.all(responses.map(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        }));

        setTechnicsInventory(technicsData);
        setStandsInventory(standsData);
        setStrikingPartsInventory(strikingPartsData);
        setTargetsInventory(targetsData);

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading({
            tecniche: false,
            posizioni: false,
            parti: false,
            obiettivi: false
        });
      }
    };

    fetchData();
  }, []);

  const renderLoading = () => <p className="text-muted-foreground">Loading...</p>;
  const renderError = () => <p className="text-destructive">Error: {error}</p>;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="tecniche">
        <AccordionTrigger>Tecniche</AccordionTrigger>
        <AccordionContent>
          {loading.tecniche ? renderLoading() : error ? renderError() : (
            technicsInventory && Object.keys(technicsInventory).length > 0 ? (
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
                      <TableCell className="font-medium">{item.name}{item.waza && ` (${item.waza})`}</TableCell>
                      <TableCell>{item.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <p>No techniques found.</p>
          )}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="posizioni">
        <AccordionTrigger>Posizioni</AccordionTrigger>
        <AccordionContent>
          {loading.posizioni ? renderLoading() : error ? renderError() : (
            standsInventory && Object.keys(standsInventory).length > 0 ? (
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
            ) : <p>No stances found.</p>
          )}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="parti">
        <AccordionTrigger>Parti del corpo</AccordionTrigger>
        <AccordionContent>
          {loading.parti ? renderLoading() : error ? renderError() : (
             strikingPartsInventory && Object.keys(strikingPartsInventory).length > 0 ? (
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
            ) : <p>No body parts found.</p>
          )}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="obiettivi">
        <AccordionTrigger>Obiettivi</AccordionTrigger>
        <AccordionContent>
          {loading.obiettivi ? renderLoading() : error ? renderError() : (
            targetsInventory && Object.keys(targetsInventory).length > 0 ? (
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
            ) : <p>No targets found.</p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
