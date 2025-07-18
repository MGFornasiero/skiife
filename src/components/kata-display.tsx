"use client";

import { useState, useEffect } from "react";
import { type Sequenze, type Passaggio } from "@/lib/data";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function KataDisplay() {
  const [selectedSequenzaKey, setSelectedSequenzaKey] = useState<string | null>(null);
  const [gradeType, setGradeType] = useState<"dan" | "kyu">("dan");
  const [grade, setGrade] = useState<number | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [sequenzeData, setSequenzeData] = useState<Sequenze | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGradeSelection, setShowGradeSelection] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Reset state when grade or type changes
    setGradeId(null);
    setSequenzeData(null);
    setSelectedSequenzaKey(null);

    if (grade === null) {
      return;
    }

    setLoading(true);
    let gradeRes: Response;
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
        // setShowGradeSelection(false); // Hide selection on success
        return fetch(`/api/kihons/${newGradeId}`);
      })
      .then(async (res) => {
        gradeRes = res;
        if (!res.ok) {
            const errorBody = await res.text();
            throw new Error(`Network response was not ok for kihons. Status: ${res.status}. Body: ${errorBody}`);
        }
        return res.json();
      })
      .then((kihonsData) => {
        if (kihonsData && kihonsData.kihons) {
          const keys = Object.keys(kihonsData.kihons);
          setSequenzeData(kihonsData.kihons);
          if (keys.length > 0) {
            // Default to the first sequenza, assuming it's '1' or the first in the sorted list
            const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
            setSelectedSequenzaKey(sortedKeys[0]);
          }
        } else {
          setSequenzeData(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setGradeId(null);
        setSequenzeData(null);
        // setShowGradeSelection(true); // Show selection on error
      })
      .finally(() => {
        setLoading(false);
      });
  }, [gradeType, grade]);

  const sequenzaKeys = sequenzeData ? Object.keys(sequenzeData).sort((a, b) => parseInt(a) - parseInt(b)) : [];
  const gradeNumbers = Array.from({ length: 9 }, (_, i) => i + 1);
  const selectedPassaggi =
    selectedSequenzaKey && sequenzeData
      ? sequenzeData[Number(selectedSequenzaKey)]
      : undefined;

  const handleGradeChange = (value: string) => {
    setGrade(Number(value));
    setSelectedSequenzaKey(null); // Reset sequenza selection when grade changes
  };
  
  const handleGradeTypeChange = (checked: boolean) => {
    setGradeType(checked ? "dan" : "kyu");
    setGrade(null); // Reset grade when type changes
    setSelectedSequenzaKey(null);
  }

  const handleRowClick = (passaggio: Passaggio) => {
    if (passaggio.notes) {
      toast({
        title: "Note",
        description: passaggio.notes,
      });
    }
  };

  const handleSequenzaChange = (direction: 'next' | 'prev') => {
    if (!sequenzaKeys.length) return;

    const currentIndex = selectedSequenzaKey ? sequenzaKeys.indexOf(selectedSequenzaKey) : -1;
    let nextIndex;

    if (direction === 'next') {
        nextIndex = currentIndex >= 0 ? (currentIndex + 1) % sequenzaKeys.length : 0;
    } else { // prev
        nextIndex = currentIndex > 0 ? currentIndex - 1 : sequenzaKeys.length - 1;
    }
    
    setSelectedSequenzaKey(sequenzaKeys[nextIndex]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setShowGradeSelection(!showGradeSelection)}>
            <div className="flex flex-col">
                 <h3 className="font-semibold">
                  {!showGradeSelection && grade ? (
                    <span className="capitalize">Grado: {grade}° {gradeType}</span>
                  ) : (
                    "Grade Selection"
                  )}
                 </h3>
            </div>
            <Button variant="ghost" size="sm">
                {showGradeSelection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span className="sr-only">Toggle Grade Selection</span>
            </Button>
        </div>
        {showGradeSelection && (
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-4 border-t">
              <div className="space-y-2">
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
          </CardContent>
        )}
      </Card>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      ) : gradeId && sequenzeData ? (
        <>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleSequenzaChange('prev')} disabled={sequenzaKeys.length < 2}>
                    <Minus className="h-4 w-4" />
                </Button>
                <div className="w-48 h-10 flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {selectedSequenzaKey ? `Sequenza ${selectedSequenzaKey}` : "Select a sequenza"}
                </div>
                 <Button variant="outline" size="icon" onClick={() => handleSequenzaChange('next')} disabled={sequenzaKeys.length < 2}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
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
                  {Object.keys(selectedPassaggi).map((passaggioKey) => {
                    const passaggio = selectedPassaggi[Number(passaggioKey)];
                    return (
                      <TableRow key={passaggioKey} onClick={() => handleRowClick(passaggio)} className={passaggio.notes ? "cursor-pointer" : ""}>
                        <TableCell className="font-medium">{passaggioKey}</TableCell>
                        <TableCell>{passaggio.movement}</TableCell>
                        <TableCell>{passaggio.tecnica}</TableCell>
                        <TableCell>{passaggio.Stand}</TableCell>
                        <TableCell>{passaggio.Target}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Please select a sequenza to view its details.
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
