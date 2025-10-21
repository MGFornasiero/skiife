
"use client";

import { useState, useEffect } from "react";
import { type KataInventory, type KataResponse, type KataSequenceStep, type StandInfo, type TechnicInfo, type BunkaiSummary, type KataTechnique, type BodyPart, DetailedNotes } from "@/lib/data";
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
import { Separator } from "./ui/separator";


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

const formatBodyPart = (arto: BodyPart) => {
  if (!arto) return null;
  const sideSymbol = guardiaSymbolMap[arto.side] || '';
  return <>{arto.limb} {sideSymbol}</>;
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
        setKataDetails(data);
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
                                                              {step.notes && (
                                                                <Popover>
                                                                    <PopoverTrigger>
                                                                        <Notebook className="h-5 w-5 text-muted-foreground cursor-pointer" />
                                                                    </PopoverTrigger>
                                                                    <PopoverContent>
                                                                        <p>{typeof step.notes === 'string' ? step.notes : JSON.stringify(step.notes)}</p>
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
                                                          {techniques && techniques.length > 0 && (
                                                            <>
                                                              <p className="text-sm text-muted-foreground">Techniques:</p>
                                                              <ul className="list-disc pl-5 font-medium">
                                                                  {techniques.map((tech) => (
                                                                      <li key={tech.technic_id} className="truncate text-sm cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); handleTechnicClick(tech.technic_id); }}>
                                                                          {tech.tecnica}
                                                                      </li>
                                                                  ))}
                                                              </ul>
                                                            </>
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

                                      <div className="w-full max-w-md flex flex-col gap-6">
                                        <div className="flex items-center justify-between text-sm rounded-lg p-4">
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
                                        <Separator/>

                                        <div className="space-y-2">
                                          <p 
                                            className="font-medium text-base cursor-pointer hover:underline"
                                            onClick={() => handlePosizioneClick(currentStep.stand_id)}
                                          >
                                            {currentStep.posizione} {currentStep.hips && `(${currentStep.hips})`}
                                          </p>
                                        </div>
                                        <Separator/>
                                        
                                        <div className="space-y-2"></div>
                                        <Separator/>
                                        
                                        <div className="space-y-4">
                                          {currentStep.remarks && currentStep.remarks.length > 0 && (
                                              currentStep.remarks.map((remark, index) => (
                                                  <Card key={index}>
                                                      <CardContent className="p-4 space-y-3">
                                                          <div className="flex items-center gap-2 font-medium capitalize">
                                                              <span className="text-sm text-muted-foreground">Part:</span>
                                                              {formatBodyPart(remark.arto)}
                                                          </div>
                                                          {remark.description && (
                                                              <div>
                                                                  <span className="text-sm text-muted-foreground">Description:</span>
                                                                  <p className="text-sm">{remark.description}</p>
                                                              </div>
                                                          )}
                                                          {remark.explanation && (
                                                              <div>
                                                                  <span className="text-sm text-muted-foreground">Explanation:</span>
                                                                  <p className="text-sm">{remark.explanation}</p>
                                                              </div>
                                                          )}
                                                          {remark.note && (
                                                              <div>
                                                                  <span className="text-sm text-muted-foreground">Note:</span>
                                                                  <p className="text-sm">{remark.note}</p>
                                                              </div>
                                                          )}
                                                      </CardContent>
                                                  </Card>
                                              ))
                                          )}
                                        </div>
                                        <Separator/>

                                        <div className="space-y-2">
                                          {currentStep.resources && (
                                            <div className="space-y-4">
                                              {(Array.isArray(currentStep.resources) ? currentStep.resources : [currentStep.resources]).map((resource, index) => (
                                                <Card key={index}>
                                                  <CardContent className="p-4 space-y-2">
                                                    {Object.entries(resource).map(([key, value]) => (
                                                      <div key={key}>
                                                        <span className="text-sm text-muted-foreground">{key}:</span>
                                                        <p className="text-sm">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                                                      </div>
                                                    ))}
                                                  </CardContent>
                                                </Card>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        <Separator/>
                                        
                                        <div className="space-y-2 flex flex-col items-center">
                                          <KataPlayer 
                                            steps={sortedKataSteps} 
                                            currentStepIndex={selectedStepIndex}
                                            onStepChange={setSelectedStepIndex}
                                          />
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
