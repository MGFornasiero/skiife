"use client";

import { useState } from "react";
import { sequenze, type Passaggi } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function KataDisplay() {
  const [selectedSequenzaKey, setSelectedSequenzaKey] = useState<string | null>(
    null
  );

  const selectedPassaggi: Passaggi | undefined = selectedSequenzaKey
    ? sequenze[Number(selectedSequenzaKey)]
    : undefined;

  const sequenzaKeys = Object.keys(sequenze);

  return (
    <div className="space-y-6">
      <div className="w-full sm:w-64">
        <Select onValueChange={setSelectedSequenzaKey}>
          <SelectTrigger>
            <SelectValue placeholder="Select a sequenza..." />
          </SelectTrigger>
          <SelectContent>
            {sequenzaKeys.map((key) => (
              <SelectItem key={key} value={key}>
                Sequenza {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPassaggi ? (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Movement</TableHead>
                <TableHead>Tecnica</TableHead>
                <TableHead>Stand</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(selectedPassaggi).map(([passaggioKey, passaggio]) => (
                <TableRow key={passaggioKey}>
                  <TableCell className="font-medium">{passaggioKey}</TableCell>
                  <TableCell>{passaggio.movement}</TableCell>
                  <TableCell>{passaggio.tecnica}</TableCell>
                  <TableCell>{passaggio.Stand}</TableCell>
                  <TableCell>{passaggio.Target}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            Please select a sequenza from the dropdown menu to view its details.
          </p>
        </div>
      )}
    </div>
  );
}
