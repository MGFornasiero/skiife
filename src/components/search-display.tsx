"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { type FinderResult } from "@/lib/data";


export default function SearchDisplay() {
  const [searchText, setSearchText] = useState("");
  const [searched, setSearched] = useState<FinderResult | null>(null);
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

      const data: FinderResult = await response.json();
      setSearched(data);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const stands = searched?.Stands ? Object.values(searched.Stands) : [];
  const technics = searched?.Technics ? Object.values(searched.Technics) : [];
  const targets = searched?.Targets ? Object.values(searched.Targets) : [];
  const strikingParts = searched?.Striking_parts ? Object.values(searched.Striking_parts) : [];

  const renderStands = () => {
    if (stands.length === 0) return null;
    return (
      <AccordionItem value="stands">
        <AccordionTrigger>Stands ({stands.length})</AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stands.map((stand) => (
                <TableRow key={stand.id_stand}>
                  <TableCell>{stand.name}</TableCell>
                  <TableCell>{stand.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  };
  
  const renderTechnics = () => {
    if (technics.length === 0) return null;
    return (
      <AccordionItem value="technics">
        <AccordionTrigger>Techniques ({technics.length})</AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technics.map((tech) => (
                <TableRow key={tech.id_technic}>
                  <TableCell>{tech.name}</TableCell>
                  <TableCell>{tech.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  };

  const renderTargets = () => {
    if (targets.length === 0) return null;
    return (
      <AccordionItem value="targets">
        <AccordionTrigger>Targets ({targets.length})</AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {targets.map((target) => (
                <TableRow key={target.id_target}>
                  <TableCell>{target.name}</TableCell>
                  <TableCell>{target.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  };

  const renderStrikingParts = () => {
    if (strikingParts.length === 0) return null;
    return (
      <AccordionItem value="striking_parts">
        <AccordionTrigger>Striking Parts ({strikingParts.length})</AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strikingParts.map((part) => (
                <TableRow key={part.id_part}>
                  <TableCell>{part.name}</TableCell>
                  <TableCell>{part.description}</TableCell>
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
