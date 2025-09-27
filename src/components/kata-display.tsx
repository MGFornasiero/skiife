
"use client";

import { useState, useEffect } from "react";
import { type StandInfo, type TechnicInfo, KihonsApiResponse } from "@/lib/data";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Loader2, Notebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const movementIconMap: { [key: string]: string } = {
  'Fwd': '⏭',
  'Bkw': '⏮',
  'Still': '⏸',
};

const getMovementIcon = (movement: string | null) => {
    if (!movement) {
        return ''; // Or some default icon/text
    }
    for (const key in movementIconMap) {
        if (movement.includes(key)) {
            return movementIconMap[key];
        }
    }
    return movement; // fallback to original text
};


export default function KataDisplay() {
  const [selectedSequenzaKey, setSelectedSequenzaKey] = useState<string | null>(null);
  const [gradeType, setGradeType] = useState<"dan" | "kyu">("kyu");
  const [grade, setGrade] = useState<number | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [kihonData, setKihonData] = useState<KihonsApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGradeSelection, setShowGradeSelection] = useState(true);
  const { toast } = useToast();
  
  const [isPosizioneInfoDialogOpen, setIsPosizioneInfoDialogOpen] = useState(false);
  const [selectedPosizioneInfo, setSelectedPosizioneInfo] = useState<StandInfo | null>(null);
  const [isPosizioneInfoLoading, setIsPosizioneInfoLoading] = useState(false);

  const [isTechnicInfoDialogOpen, setIsTechnicInfoDialogOpen] = useState(false);
  const [selectedTechnicInfo, setSelectedTechnicInfo] = useState<TechnicInfo | null>(null);
  const [isTechnicInfoLoading, setIsTechnicInfoLoading] = useState(false);


  useEffect(() => {
    setGradeId(null);
    setKihonData(null);
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
      .then(async (res) => {
        if (!res.ok) {
            const errorBody = await res.text();
            throw new Error(`Network response was not ok for kihons. Status: ${res.status}. Body: ${errorBody}`);
        }
        return res.json();
      })
      .then((data: KihonsApiResponse) => {
        if (data && data.kihons) {
          setKihonData(data);
          const keys = Object.keys(data.kihons);
          if (keys.length > 0) {
            const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
            setSelectedSequenzaKey(sortedKeys[0]);
          }
        } else {
          setKihonData(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setGradeId(null);
        setKihonData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [gradeType, grade]);

  const sequenzaKeys = kihonData?.kihons ? Object.keys(kihonData.kihons).sort((a, b) => parseInt(a) - parseInt(b)) : [];
  
  const selectedSequenza = selectedSequenzaKey && kihonData?.kihons ? kihonData.kihons[selectedSequenzaKey] : null;
  const selectedPassaggi = selectedSequenza ? Object.values(selectedSequenza).sort((a, b) => parseInt(Object.keys(a)[0]) - parseInt(Object.keys(b)[0])) : [];
  
  const handleGradeChange = (value: string) => {
    setGrade(Number(value));
    setSelectedSequenzaKey(null);
    setShowGradeSelection(false);
  };
  
  const handleGradeTypeChange = (checked: boolean) => {
    setGradeType(checked ? "dan" : "kyu");
    setGrade(null); 
    setSelectedSequenzaKey(null);
  }

  const handleStandClick = async (standId: number) => {
    setIsPosizioneInfoLoading(true);
    setIsPosizioneInfoDialogOpen(true);
    setSelectedPosizioneInfo(null);

    try {
      const res = await fetch(`/api/info_stand/${standId}`);
      const errorText = await res.text();
      if (!res.ok) {
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || `External API error: ${errorText}`);
        } catch (e) {
            throw new Error(errorText || `External API error with status: ${res.status}`);
        }
      }
      const data = JSON.parse(errorText);
      setSelectedPosizioneInfo(data.info_stand);
    } catch (error: any) {
      console.error("Error fetching stand info:", error);
      setIsPosizioneInfoDialogOpen(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred while fetching stand details.",
      });
    } finally {
      setIsPosizioneInfoLoading(false);
    }
  };

  const handleTechnicClick = async (technicId: number) => {
    setIsTechnicInfoLoading(true);
    setIsTechnicInfoDialogOpen(true);
    setSelectedTechnicInfo(null);

    try {
      const res = await fetch(`/api/info_technic/${technicId}`);
      if (!res.ok) {
        const errorText = await res.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || `External API error: ${errorText}`);
        } catch (e) {
            throw new Error(`External API error: ${errorText}`);
        }
      }
      const data = await res.json();
      setSelectedTechnicInfo(data.info_technic);
    } catch (error: any) {
      console.error("Error fetching technic info:", error);
      setIsTechnicInfoDialogOpen(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred while fetching technic details.",
      });
    } finally {
      setIsTechnicInfoLoading(false);
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
  
  const gradeNumbers = Array.from({ length: 9 }, (_, i) => i + 1);

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
                <div className="flex items-center space-x-2">
                    <Label htmlFor="grade-type-switch" className={cn("text-sm text-muted-foreground", gradeType === 'kyu' && 'text-foreground')}>Kyu</Label>
                    <Switch
                        id="grade-type-switch"
                        checked={gradeType === 'dan'}
                        onCheckedChange={handleGradeTypeChange}
                    />
                    <Label htmlFor="grade-type-switch" className={cn("text-sm text-muted-foreground", gradeType === 'dan' && 'text-foreground')}>Dan</Label>
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
      ) : gradeId && kihonData ? (
        <>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleSequenzaChange('prev')} disabled={sequenzaKeys.length < 2}>
                    <span className="text-xl">⧏</span>
                </Button>
                <div className="w-48 h-10 flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {selectedSequenzaKey ? `Sequenza ${selectedSequenzaKey}` : "Select a sequenza"}
                </div>
                 <Button variant="outline" size="icon" onClick={() => handleSequenzaChange('next')} disabled={sequenzaKeys.length < 2}>
                    <span className="text-xl">⧐</span>
                </Button>
            </div>
          </div>

          {selectedPassaggi.length > 0 && selectedSequenza ? (
            <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Mov</TableHead>
                      <TableHead>Tecnica</TableHead>
                      <TableHead>Posizione</TableHead>
                      <TableHead>Altezza</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(selectedSequenza).map(([passaggioNum, passaggio], index) => {

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{passaggioNum}</TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger>
                                  <span className="text-xl cursor-pointer">{getMovementIcon(passaggio.movement || null)}</span>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2">
                                <p>{passaggio.movement}</p>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell 
                            className="cursor-pointer hover:underline"
                            onClick={() => handleTechnicClick(passaggio.technic_id)}
                          >
                            {passaggio.tecnica}
                          </TableCell>
                          <TableCell 
                            className="cursor-pointer hover:underline"
                            onClick={() => handleStandClick(passaggio.stand_id)}
                          >
                            {passaggio.Stand}
                          </TableCell>
                          <TableCell>{passaggio.Target}</TableCell>
                          <TableCell>
                            {passaggio.Note && passaggio.Note.trim() !== '' && (
                                <Popover>
                                    <PopoverTrigger>
                                        <Notebook className="h-5 w-5 text-muted-foreground cursor-pointer" />
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <p>{passaggio.Note}</p>
                                    </PopoverContent>
                                </Popover>
                            )}
                          </TableCell>
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

      <AlertDialog open={isPosizioneInfoDialogOpen} onOpenChange={setIsPosizioneInfoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isPosizioneInfoLoading ? "Loading..." : selectedPosizioneInfo?.name || "Stand Details"}
            </AlertDialogTitle>
            <div className="text-sm text-muted-foreground space-y-4 max-h-96 overflow-y-auto pr-2 mt-2">
              {isPosizioneInfoLoading ? (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {selectedPosizioneInfo?.description && (
                      <div>
                          <h4 className="font-semibold text-foreground mb-1">Description</h4>
                          <p>{selectedPosizioneInfo.description}</p>
                      </div>
                  )}
                  {selectedPosizioneInfo?.notes && (
                      <div>
                          <h4 className="font-semibold text-foreground mb-1">Notes</h4>
                          <p>{selectedPosizioneInfo.notes}</p>
                      </div>
                  )}
                  {!selectedPosizioneInfo?.description && !selectedPosizioneInfo?.notes && (
                      <p>No details available for this stand.</p>
                  )}
                </>
              )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsPosizioneInfoDialogOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isTechnicInfoDialogOpen} onOpenChange={setIsTechnicInfoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isTechnicInfoLoading ? "Loading..." : selectedTechnicInfo?.name || "Technique Details"}
            </AlertDialogTitle>
             <div className="text-sm text-muted-foreground space-y-4 max-h-96 overflow-y-auto pr-2 mt-2">
              {isTechnicInfoLoading ? (
              <div className="flex justify-center items-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                  {selectedTechnicInfo?.name && (
                      <div>
                          <h4 className="font-semibold text-foreground mb-1">Name</h4>
                          <p>{selectedTechnicInfo.name}</p>
                      </div>
                  )}
                   {selectedTechnicInfo?.waza && (
                      <div>
                          <h4 className="font-semibold text-foreground mb-1">Waza</h4>
                          <p>{selectedTechnicInfo.waza}</p>
                      </div>
                  )}
                  {selectedTechnicInfo?.description && (
                      <div>
                          <h4 className="font-semibold text-foreground mb-1">Description</h4>
                          <p>{selectedTechnicInfo.description}</p>
                      </div>
                  )}
                  {selectedTechnicInfo?.notes && (
                      <div>
                          <h4 className="font-semibold text-foreground mb-1">Notes</h4>
                          <p>{selectedTechnicInfo.notes}</p>
                      </div>
                  )}
                  {!selectedTechnicInfo?.name && !selectedTechnicInfo?.waza && !selectedTechnicInfo?.description && !selectedTechnicInfo?.notes && (
                      <p>No details available for this technique.</p>
                  )}
              </>
            )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsTechnicInfoDialogOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
