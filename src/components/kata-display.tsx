"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function KataDisplay() {
  const [selectedSequenzaKey, setSelectedSequenzaKey] = useState<string | null>(
    null
  );

  const [gradeType, setGradeType] = useState<"dan" | "kyu">("dan");
  const [grade, setGrade] = useState<number | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [loadingGradeId, setLoadingGradeId] = useState(false);


  const selectedPassaggi: Passaggi | undefined = selectedSequenzaKey
    ? sequenze[Number(selectedSequenzaKey)]
    : undefined;

  const sequenzaKeys = Object.keys(sequenze);
  const gradeNumbers = Array.from({ length: 9 }, (_, i) => i + 1);

  useEffect(() => {
    if (grade !== null) {
      setLoadingGradeId(true);
      setGradeId(null);
      fetch(
        `https://skiiapi-638356355820.europe-west12.run.app/grade_id/${gradeType}/${grade}`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((data) => {
          setGradeId(String(data.grade));
        })
        .catch((error) => {
          console.error("Error fetching grade ID:", error);
          setGradeId("Error fetching ID.");
        })
        .finally(() => {
          setLoadingGradeId(false);
        });
    } else {
      setGradeId(null);
    }
  }, [gradeType, grade]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mb-4">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <div className="flex items-center space-x-2">
            <Label htmlFor="grade-type-switch" className={gradeType === 'kyu' ? '' : 'text-muted-foreground'}>Kyu</Label>
            <Switch
              id="grade-type-switch"
              checked={gradeType === "dan"}
              onCheckedChange={(checked) => setGradeType(checked ? "dan" : "kyu")}
            />
            <Label htmlFor="grade-type-switch" className={gradeType === 'dan' ? '' : 'text-muted-foreground'}>Dan</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade-select">Grado</Label>
          <Select onValueChange={(value) => setGrade(Number(value))}>
            <SelectTrigger id="grade-select" className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select a grado..." />
            </SelectTrigger>
            <SelectContent>
              {gradeNumbers.map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="h-6 mb-4">
        {loadingGradeId && <p className="text-muted-foreground">Loading Grade ID...</p>}
        {gradeId && !loadingGradeId && <p className="font-medium">Grade ID: <span className="font-mono p-1 bg-muted rounded-md text-sm">{gradeId}</span></p>}
      </div>

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
