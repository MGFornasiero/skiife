"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { type Rilevanze, type Obiettivi, type Tecniche, type Posizioni, type Parti } from "@/lib/data";

interface SearchResult {
  ts: string;
  max_relevance: number;
  Targets_relevance: Rilevanze;
  Technics_relevance: Rilevanze;
  Stands_relevance: Rilevanze;
  Striking_parts_relevance: Rilevanze;
  Targets: any[];
  Technics: any[];
  Stands: any[];
  Striking_parts: any[];
}


export default function SearchDisplay() {
  const [searchText, setSearchText] = useState("");
  const [searched, setSearched] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchText) return;

    setLoading(true);
    setError(null);
    setSearched(null);

    try {
      const response = await fetch(`/api/finder?search=${encodeURIComponent(searchText)}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
      }

      const data: SearchResult = await response.json();
      setSearched(data);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStands = () => {
    if (!searched?.Stands?.length) return null;
    return (
      <AccordionItem value="stands">
        <AccordionTrigger>Stands ({searched.Stands.length})</AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searched.Stands.map((stand) => (
                <TableRow key={stand[2]}>
                  <TableCell>{stand[3]}</TableCell>
                  <TableCell>{stand[4]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  };
  
  const renderTechnics = () => {
    if (!searched?.Technics?.length) return null;
    return (
      <AccordionItem value="technics">
        <AccordionTrigger>Techniques ({searched.Technics.length})</AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searched.Technics.map((tech) => (
                <TableRow key={tech[2]}>
                  <TableCell>{tech[4]}</TableCell>
                  <TableCell>{tech[5]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  };

  const renderTargets = () => {
    if (!searched?.Targets?.length) return null;
    return (
      <AccordionItem value="targets">
        <AccordionTrigger>Targets ({searched.Targets.length})</AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searched.Targets.map((target) => (
                <TableRow key={target[2]}>
                  <TableCell>{target[3]}</TableCell>
                  <TableCell>{target[4]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  };

  const renderStrikingParts = () => {
    if (!searched?.Striking_parts?.length) return null;
    return (
      <AccordionItem value="striking_parts">
        <AccordionTrigger>Striking Parts ({searched.Striking_parts.length})</AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searched.Striking_parts.map((part) => (
                <TableRow key={part[2]}>
                  <TableCell>{part[3]}</TableCell>
                  <TableCell>{part[5]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ricerca</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button type="submit" onClick={handleSearch} disabled={!searchText || loading}>
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="mt-6">
          {error && (
            <div className="text-destructive p-4 border border-destructive/50 rounded-md">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
          {loading && <p>Loading search results...</p>}
          {searched && (
            <div className="space-y-4">
               <Accordion type="multiple" className="w-full">
                  {renderStands()}
                  {renderTechnics()}
                  {renderTargets()}
                  {renderStrikingParts()}
              </Accordion>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
