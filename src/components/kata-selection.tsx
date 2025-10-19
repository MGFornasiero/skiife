
"use client";

import { useState, useEffect } from "react";
import { type KataInventory, type KataResponse, type KataSequenceStep, type StandInfo, type TechnicInfo, type BunkaiSummary, type KataTechnique } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Link as LinkIcon, Rabbit, Wind, Hourglass, PersonStanding, Turtle, Volume2, MapPin, Notebook } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AbsoluteDirections, EmbusenPoints, Sides, Tempo } from "@/lib/type_admin_fe";
import { KataPlayer } from "./kata-player";


const facingArrowMap: { [key in AbsoluteDirections]: string } = {
  'N': '↑',  // Upwards Arrow
  'NE': '↗', // North East Arrow
  'E': '→',  // Rightwards Arrow
  'SE': '↘', // South East Arrow
  'S': '↓',  // Downwards Arrow
  'SO': '↙', // South West Arrow
  'O': '←',  // Leftwards Arrow
  'NO': '↖'  // North West Arrow
};

const directionSymbolMap: { [key in Sides]: string } = {
  'sx': '↶',
  'dx': '↷',
  'frontal': '=',
};

const guardiaSymbolMap: { [key in Sides]: string } = {
  'sx': '◐', // U+25D0
  'dx': '◑', // U+25D1
  'frontal': '◒', // U+25D2
};

const gambaSymbolMap: { [key in string]: string } = {
  'sx': '◐',
  'dx': '◑',
  'frontal': '◒',
};

const tempoIconMap: { [key in Tempo]: React.ElementType } = {
    'Legato': LinkIcon,
    'Fast': Rabbit,
    'Normal': PersonStanding,
    'Slow': Turtle,
    'Breath': Wind,
};


const getFacingArrow = (facing: AbsoluteDirections | null) => {
  if (!facing) return '';
  return facingArrowMap[facing] || facing;
};

const getDirectionSymbol = (direction: Sides | null) => {
  if (!direction) return '⇓'; // Default for None or ""
  return directionSymbolMap[direction] || '⇓'; // Default for any other case
}

const getGuardiaSymbol = (guardia: Sides | null) => {
  if (!guardia) return '';
  return guardiaSymbolMap[guardia] || guardia;
}

const getTempoIcon = (tempo: Tempo | null) => {
    if (!tempo) return Hourglass;
    const Icon = tempoIconMap[tempo] || Hourglass;
    return <Icon className="h-4 w-4" />;
};

const getStepTempoIcon = (tempo: Tempo | null) => {
    if (!tempo) return null;
    const Icon = tempoIconMap[tempo];
    if (!Icon) return null;
    return <Icon className="h-5 w-5" />;
};

export const formatWazaNote = (note: any): string | null => {
    if (!note) return null;
    if (typeof note === 'string') return note;
    if (typeof note === 'object' && note !== null && 'limb' in note && 'side' in note) {
        return `Limb: ${note.limb}, Side: ${note.side}`;
    }
    try {
        const parsed = JSON.stringify(note);
        if (parsed !== '{}' && parsed !== '[]') {
            return parsed;
        }
    } catch (e) {
        return null;
    }
    return null;
}


const parseEmbusen = (embusen: EmbusenPoints | string | null): EmbusenPoints | null => {
    if (!embusen) return null;
    if (typeof embusen === 'object' && embusen !== null && 'x' in embusen && 'y' in embusen) {
      return embusen;
    }
    if (typeof embusen === 'string') {
      try {
          const match = embusen.match(/\(([^,]+),([^)]+)\)/);
          if (match) {
              const x = parseFloat(match[1]);
              const y = parseFloat(match[2]);
              if (!isNaN(x) && !isNaN(y)) {
                  return { x, y };
              }
          }
      } catch (e) {
          console.error("Error parsing embusen:", e);
      }
    }
    return null;
};

export default function KataSelection() {
  const [kataInventory, setKataInventory] = useState<KataInventory | null>(null);
  const [selectedKataName, setSelectedKataName] = useState<string | null>(null);
  const [kataId, setKataId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [kataDetails, setKataDetails] = useState<KataResponse | null>(null);

  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  const [isPosizioneInfoDialogOpen, setIsPosizioneInfoDialogOpen] = useState(false);
  const [selectedPosizioneInfo, setSelectedPosizioneInfo] = useState<StandInfo | null>(null);
  const [isPosizioneInfoLoading, setIsPosizioneInfoLoading] = useState(false);

  const [isTechnicInfoDialogOpen, setIsTechnicInfoDialogOpen] = useState(false);
  const [selectedTechnicInfo, setSelectedTechnicInfo] = useState<TechnicInfo | null>(null);
  const [isTechnicInfoLoading, setIsTechnicInfoLoading] = useState(false);

  const [viewMode, setViewMode] = useState<"generale" | "dettagli" | "bunkai">("generale");

  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/kata_inventory')
      .then(res => res.json())
      .then((data: KataInventory) => {
        if (data && data.kata) {
            setKataInventory(data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (kataId === null) {
      setKataDetails(null);
      setSelectedStepIndex(0);
      return;
    }

    setLoading(true);
    setKataDetails(null);
    setSelectedStepIndex(0);

    fetch(`/api/kata/${kataId}`)
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
           try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || `External API error: ${errorText}`);
          } catch (e) {
              throw new Error(`Failed to fetch kata data. Status: ${res.status}. Body: ${errorText}`);
          }
        }
        return res.json();
      })
      .then((data: KataResponse) => {
        const processedSteps = Object.values(data.steps).map(step => {
            const techniques = step.Tecniche || [];
            const processedTechniques = techniques.map(tech => ({
                ...tech,
                tecnica: tech.tecnica,
                obiettivo: tech.obiettivo
            }));
            return {
                ...step,
                Tecniche: processedTechniques,
            };
        });

        const stepsObject = processedSteps.reduce((acc, step) => {
            acc[step.id_sequence] = step;
            return acc;
        }, {} as Record<string, KataSequenceStep>);


        setKataDetails({...data, steps: stepsObject});
      })
      .catch((error: any) => {
        console.error("Error fetching kata data:", error);
        toast({
            variant: "destructive",
            title: "Error fetching kata data",
            description: <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4"><code className="text-white">{error.message}</code></pre>
        });
      })
      .finally(() => {
        setLoading(false);
      });

  }, [kataId, toast]);
  
  const handlePosizioneClick = async (standId: number) => {
    setIsPosizioneInfoLoading(true);
    setIsPosizioneInfoDialogOpen(true);
    setSelectedPosizioneInfo(null);

    try {
      const res = await fetch(`/api/info_stand/${standId}`);
      if (!res.ok) {
        const errorText = await res.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || `External API error: ${errorText}`);
        } catch (e) {
            throw new Error(errorText || `External API error with status: ${res.status}`);
        }
      }
      const data = await res.json();
      setSelectedPosizioneInfo(data.info_stand);
    } catch (error: any) {
      console.error("Error fetching stand info:", error);
      setIsPosizioneInfoDialogOpen(false); // Close dialog on error
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


  const handleKataChange = (value: string) => {
      if (kataInventory) {
          setSelectedKataName(value);
          const selectedKataId = kataInventory.kata[value];
          setKataId(selectedKataId);
      }
  };
  
  const sortedKataNames = kataInventory
    ? Object.keys(kataInventory.kata).sort((a, b) => kataInventory.kata[a] - kataInventory.kata[b])
    : [];

  const sortedKataSteps = kataDetails && kataDetails.steps
    ? Object.values(kataDetails.steps).sort((a, b) => a.seq_num - b.seq_num) 
    : [];
    
  const currentStep: KataSequenceStep | undefined = sortedKataSteps[selectedStepIndex];
  
  const transactionToNextId = currentStep && kataDetails ? kataDetails.transactions_mapping_from[currentStep.id_sequence] : null;
  const transactionToNext = transactionToNextId && kataDetails ? kataDetails.transactions[transactionToNextId] : null;

  const transactionToCurrentId = currentStep && kataDetails ? kataDetails.transactions_mapping_to[currentStep.id_sequence] : null;
  const transactionToCurrent = transactionToCurrentId && kataDetails ? kataDetails.transactions[transactionToCurrentId] : null;

  const gambaSymbol = kataDetails?.Gamba ? gambaSymbolMap[kataDetails.Gamba] : null;

  const handleStepChange = (direction: 'next' | 'prev') => {
    if (!sortedKataSteps.length) return;

    if (direction === 'next') {
        setSelectedStepIndex((prevIndex) => (prevIndex + 1) % sortedKataSteps.length);
    } else {
        setSelectedStepIndex((prevIndex) => (prevIndex - 1 + sortedKataSteps.length) % sortedKataSteps.length);
    }
  };


  return (
    <>
      <div className="w-full sm:w-[280px] mb-4">
        {kataInventory ? (
            <Select onValueChange={handleKataChange}>
              <SelectTrigger id="kata-select">
                <SelectValue placeholder="Select a kata..." />
              </SelectTrigger>
              <SelectContent>
                {sortedKataNames.map((kataName) => (
                  <SelectItem key={kataName} value={kataName}>
                    {kataName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        ) : (
            <div className="flex items-center justify-center h-10">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        )}
      </div>
      <Card>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "generale" | "dettagli" | "bunkai")}>
              <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                      <TabsList>
                          <TabsTrigger value="generale">Generale</TabsTrigger>
                          <TabsTrigger value="dettagli">Dettagli</TabsTrigger>
                          <TabsTrigger value="bunkai" disabled={!kataDetails || !kataDetails.bunkai_ids || Object.keys(kataDetails.bunkai_ids).length === 0}>Bunkai</TabsTrigger>
                      </TabsList>
                      <div className="flex-grow">
                          <CardTitle className="flex items-center justify-end gap-2">
                              {gambaSymbol && (
                                  <Popover>
                                      <PopoverTrigger asChild>
                                          <span className="text-2xl cursor-pointer">{gambaSymbol}</span>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-2">
                                          <p>Chiusura: {kataDetails?.Gamba}</p>
                                      </PopoverContent>
                                  </Popover>
                              )}
                              {selectedKataName ? `Kata: ${selectedKataName}` : "Kata Selection"}
                          </CardTitle>
                      </div>
                  </div>
                  {kataDetails?.notes && <CardDescription className="mt-2 text-left">{kataDetails.notes}</CardDescription>}
                  {!selectedKataName && !kataDetails?.notes && <CardDescription className="mt-2 text-right">Select a kata to see its details.</CardDescription>}
              </CardHeader>
              <CardContent>
                  {loading && <p className="text-muted-foreground pt-4">Loading kata details...</p>}

                  {kataDetails && (
                      <div className="w-full">
                          <TabsContent value="generale">
                              <div className="mt-6 flex flex-col items-center gap-2">
                                  {sortedKataSteps.map((step, index) => {
                                      const transactionId = kataDetails.transactions_mapping_from[step.id_sequence];
                                      const transaction = transactionId ? kataDetails.transactions[transactionId] : null;
                                      const techniques = step.Tecniche;

                                      return (
                                          <React.Fragment key={step.id_sequence}>
                                              <Card className={cn("w-full max-w-md flex flex-col", step.kiai && "border-primary")}>
                                                  <CardContent className="p-4 flex flex-col gap-2">
                                                      <div className="flex justify-between items-start">
                                                          <div className="flex-grow">
                                                              <p
                                                                  className="font-medium cursor-pointer hover:underline"
                                                                  onClick={() => handlePosizioneClick(step.stand_id)}
                                                              >
                                                                  {step.posizione}
                                                              </p>
                                                          </div>
                                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                              {step.speed && (
                                                                  <Popover>
                                                                      <PopoverTrigger asChild>
                                                                        <div className="cursor-pointer">
                                                                          {getStepTempoIcon(step.speed)}
                                                                          </div>
                                                                      </PopoverTrigger>
                                                                      <PopoverContent className="w-auto p-2">
                                                                          <p>{step.speed}</p>
                                                                      </PopoverContent>
                                                                  </Popover>
                                                              )}
                                                              {step.kiai && (
                                                                  <Popover>
                                                                      <PopoverTrigger asChild>
                                                                          <Volume2 className="h-5 w-5 text-destructive cursor-pointer" />
                                                                      </PopoverTrigger>
                                                                      <PopoverContent className="w-auto p-2">
                                                                          <p>Kiai!</p>
                                                                      </PopoverContent>
                                                                  </Popover>
                                                              )}
                                                              <Popover>
                                                                  <PopoverTrigger asChild>
                                                                      <span className="text-2xl cursor-pointer">{getGuardiaSymbol(step.guardia)}</span>
                                                                  </PopoverTrigger>
                                                                  <PopoverContent className="w-auto p-2">
                                                                      <p>{step.guardia}</p>
                                                                  </PopoverContent>
                                                              </Popover>
                                                              <span className="text-2xl font-bold" title={step.facing ?? undefined}>{getFacingArrow(step.facing)}</span>
                                                          </div>
                                                      </div>

                                                      <div>
                                                          <p className="text-sm text-muted-foreground">Techniques:</p>
                                                          <ul className="list-disc pl-5 font-medium">
                                                              {techniques && techniques.map((tech) => (
                                                                  <li key={tech.technic_id} className="truncate text-sm cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); handleTechnicClick(tech.technic_id); }}>
                                                                      {tech.tecnica}
                                                                  </li>
                                                              ))}
                                                          </ul>
                                                          {step.notes && (
                                                            <Popover>
                                                                <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                                                                    <Notebook className="h-5 w-5 text-muted-foreground cursor-pointer mt-2" />
                                                                </PopoverTrigger>
                                                                <PopoverContent onClick={(e) => e.stopPropagation()}>
                                                                    <p>{step.notes}</p>
                                                                </PopoverContent>
                                                            </Popover>
                                                          )}
                                                      </div>
                                                  </CardContent>
                                              </Card>
                                              {index < sortedKataSteps.length - 1 && (
                                                  <div className="flex items-center justify-center my-2 text-muted-foreground">
                                                      {transaction && (
                                                          <div className="flex items-center gap-2">
                                                              <Popover>
                                                                  <PopoverTrigger asChild>
                                                                      <div className="cursor-pointer">{getTempoIcon(transaction.tempo)}</div>
                                                                  </PopoverTrigger>
                                                                  <PopoverContent className="w-auto p-2">
                                                                      <p>{transaction.tempo}</p>
                                                                  </PopoverContent>
                                                              </Popover>
                                                              <p className="text-2xl font-bold" title={transaction.direction ?? undefined}>{getDirectionSymbol(transaction.direction)}</p>
                                                              {transaction.notes && (
                                                                  <Popover>
                                                                      <PopoverTrigger>
                                                                          <Notebook className="h-5 w-5 text-muted-foreground cursor-pointer" />
                                                                      </PopoverTrigger>
                                                                      <PopoverContent>
                                                                          <p>{transaction.notes}</p>
                                                                      </PopoverContent>
                                                                  </Popover>
                                                              )}
                                                          </div>
                                                      )}
                                                  </div>
                                              )}
                                          </React.Fragment>
                                      )
                                  })}
                              </div>
                          </TabsContent>
                           <TabsContent value="dettagli">
                             {currentStep ? (
                                  <div className="mt-4 flex flex-col items-center gap-4">
                                      <div className="flex items-center gap-4 w-full justify-center">
                                          <Button variant="outline" size="icon" onClick={() => handleStepChange('prev')}>
                                              <ChevronLeft className="h-4 w-4" />
                                          </Button>
                                          <p className="text-sm font-medium tabular-nums text-center">
                                              Step {selectedStepIndex + 1} / {sortedKataSteps.length}
                                          </p>
                                          <Button variant="outline" size="icon" onClick={() => handleStepChange('next')}>
                                              <ChevronRight className="h-4 w-4" />
                                          </Button>
                                      </div>

                                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                        <div className="flex flex-col gap-4">
                                            {/* Step Details Section */}
                                            <Card className={cn("w-full", currentStep.kiai && "border-primary")}>
                                                <CardHeader className="p-4">
                                                  <CardTitle className="text-lg">Step Details</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0">
                                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                        <span>Status</span>
                                                        <div className="flex items-center gap-3">
                                                            {currentStep.speed && (
                                                                <Popover>
                                                                    <PopoverTrigger className="cursor-pointer">{getStepTempoIcon(currentStep.speed)}</PopoverTrigger>
                                                                    <PopoverContent className="w-auto p-2"><p>{currentStep.speed}</p></PopoverContent>
                                                                </Popover>
                                                            )}
                                                            {currentStep.kiai && (
                                                                <Popover>
                                                                    <PopoverTrigger className="cursor-pointer"><Volume2 className="h-5 w-5 text-destructive" /></PopoverTrigger>
                                                                    <PopoverContent className="w-auto p-2"><p>Kiai!</p></PopoverContent>
                                                                </Popover>
                                                            )}
                                                            <Popover>
                                                                <PopoverTrigger className="cursor-pointer text-2xl">{getGuardiaSymbol(currentStep.guardia)}</PopoverTrigger>
                                                                <PopoverContent className="w-auto p-2"><p>Guardia: {currentStep.guardia}</p></PopoverContent>
                                                            </Popover>
                                                            <Popover>
                                                                <PopoverTrigger className="cursor-pointer text-2xl font-bold">{getFacingArrow(currentStep.facing)}</PopoverTrigger>
                                                                <PopoverContent className="w-auto p-2"><p>Facing: {currentStep.facing}</p></PopoverContent>
                                                            </Popover>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Position Section */}
                                            <Card>
                                              <CardHeader className="p-4">
                                                <CardTitle className="text-lg">Position</CardTitle>
                                              </CardHeader>
                                              <CardContent className="p-4 pt-0">
                                                 <p 
                                                   className="font-medium text-base cursor-pointer hover:underline"
                                                   onClick={() => handlePosizioneClick(currentStep.stand_id)}
                                                 >
                                                    {currentStep.posizione} {currentStep.hips && `(${currentStep.hips})`}
                                                 </p>
                                              </CardContent>
                                            </Card>

                                            {/* Techniques Section */}
                                            {currentStep.Tecniche && currentStep.Tecniche.length > 0 && (
                                                <Card>
                                                    <CardHeader className="p-4">
                                                        <CardTitle className="text-lg">Techniques</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4 pt-0">
                                                        <ul className="space-y-2">
                                                            {currentStep.Tecniche.map((tech, index) => {
                                                                const noteText = formatWazaNote(tech.waza_note);
                                                                return (
                                                                    <li key={index} className="text-sm border-b pb-2 last:border-b-0">
                                                                        <strong className="cursor-pointer hover:underline" onClick={() => handleTechnicClick(tech.technic_id)}>{tech.tecnica}</strong>
                                                                        <div className="text-xs text-muted-foreground pl-2">
                                                                            <p>Arto: {tech.arto}</p>
                                                                            <p>Obiettivo: {tech.obiettivo || 'N/A'}</p>
                                                                            {noteText && <p>Note: {noteText}</p>}
                                                                        </div>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </CardContent>
                                                </Card>
                                            )}
                                            
                                            {/* Notes Section */}
                                            {currentStep.notes && (
                                              <Card>
                                                <CardHeader className="p-4">
                                                  <CardTitle className="text-lg flex items-center gap-2">
                                                      <Notebook className="h-5 w-5" /> Notes
                                                  </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0">
                                                  <p className="text-sm text-muted-foreground">{currentStep.notes}</p>
                                                </CardContent>
                                              </Card>
                                            )}
                                        </div>
                                        
                                        {/* Embusen Section */}
                                        <div className="flex flex-col gap-4">
                                            <Card>
                                                <CardHeader className="p-4">
                                                    <CardTitle className="text-lg">Embusen</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0">
                                                  <KataPlayer 
                                                    steps={sortedKataSteps} 
                                                    currentStepIndex={selectedStepIndex}
                                                    onStepChange={setSelectedStepIndex}
                                                  />
                                                </CardContent>
                                            </Card>
                                        </div>

                                      </div>
                                  </div>
                              ) : (
                                  <p className="text-muted-foreground text-center">No step details available.</p>
                              )}
                          </TabsContent>
                          <TabsContent value="bunkai">
                               <div className="mt-6 flex flex-col items-center gap-4">
                                  {sortedKataSteps.map((step) => {
                                      const techniques = step.Tecniche;
                                      return (
                                          <React.Fragment key={step.id_sequence}>
                                              <Card className="w-full max-w-md">
                                                  <CardContent className="p-4 flex flex-col gap-2">
                                                      <p 
                                                        className="font-medium cursor-pointer hover:underline"
                                                        onClick={() => handlePosizioneClick(step.stand_id)}
                                                      >
                                                          {step.seq_num}. {step.posizione}
                                                      </p>
                                                      <ul className="list-disc pl-5 text-sm">
                                                          {techniques && techniques.map((tech) => (
                                                              <li key={tech.technic_id} className="truncate cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); handleTechnicClick(tech.technic_id);}}>
                                                                  {tech.tecnica}
                                                              </li>
                                                          ))}
                                                      </ul>
                                                  </CardContent>
                                              </Card>
                                          </React.Fragment>
                                      )
                                  })}
                              </div>
                          </TabsContent>
                      </div>
                  )}
              </CardContent>
          </Tabs>
      </Card>

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
    </>
  );
}

    

    