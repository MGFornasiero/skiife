"use client";

import { useState, useEffect } from "react";
import { type Passaggi, type Sequenze, type Passaggio } from "@/lib/data";
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
  const [selectedSequenzaKey, setSelectedSequenzaKey] = useState<string | null>(null);
  const [gradeType, setGradeType] = useState<"dan" | "kyu">("dan");
  const [grade, setGrade] = useState<number | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [sequenzeData, setSequenzeData] = useState<Sequenze | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset state when grade or type changes
    setGradeId(null);
    setSequenzeData(null);
    setSelectedSequenzaKey(null);

    if (grade === null) {
      return;
    }

    setLoading(true);
    fetch(`/api/grade_id/${gradeType}/${grade}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok for grade ID");
        }
        return res.json();
      })
      .then((gradeData) => {
        const newGradeId = String(gradeData.grade);
        setGradeId(newGradeId);
        return fetch(`/api/kihons/${newGradeId}`);
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok for kihons");
        }
        return res.json();
      })
      .then((kihonsData) => {
        if (kihonsData && kihonsData.kihons) {
          setSequenzeData(kihonsData.kihons);
        } else {
          setSequenzeData(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setGradeId(null);
        setSequenzeData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [gradeType, grade]);

  const sequenzaKeys = sequenzeData ? Object.keys(sequenzeData) : [];
  const gradeNumbers = Array.from({ length: 9 }, (_, i) => i + 1);
  const selectedPassaggi: Passaggi | undefined =
    selectedSequenzaKey && sequenzeData
      ? sequenzeData[Number(selectedSequenzaKey)]
      : undefined;

  const handleGradeChange = (value: string) => {
    setGrade(Number(value));
    setSelectedSequenzaKey(null); // Reset sequenza selection when grade changes
  };
  
  const handleGradeTypeChange = (checked: boolean) => {
    setGradeType(checked ? "dan" : "kyu");
    setSelectedSequenzaKey(null);
  }

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
              onCheckedChange={handleGradeTypeChange}
            />
            <Label htmlFor="grade-type-switch" className={gradeType === 'dan' ? '' : 'text-muted-foreground'}>Dan</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade-select">Grado</Label>
          <Select onValueChange={handleGradeChange} value={grade?.toString() || ""}>
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
      
      {loading ? (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      ) : gradeId && sequenzeData ? (
        <>
          <div className="h-6 mb-4">
            <p className="font-medium">Grade ID: <span className="font-mono p-1 bg-muted rounded-md text-sm">{gradeId}</span></p>
          </div>
          <div className="w-full sm:w-64">
            <Select onValueChange={setSelectedSequenzaKey} value={selectedSequenzaKey || ""}>
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
                      <TableCell>{(passaggio as Passaggio).movement}</TableCell>
                      <TableCell>{(passaggio as Passaggio).tecnica}</TableCell>
                      <TableCell>{(passaggio as Passaggio).Stand}</TableCell>
                      <TableCell>{(passaggio as Passaggio).Target}</TableCell>
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
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            {grade ? "No kihons data found for this grade." : "Please select a grade to see available sequenze."}
          </p>
        </div>
      )}
    </div>
  );
}
