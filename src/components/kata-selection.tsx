
"use client";

import { useState, useEffect } from "react";
import { type KataInventory, type KataSteps, type Transactions, type TransactionsMapping, type KataStep, type Posizione, type Tecnica, Transaction } from "@/lib/data";
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
import { ChevronLeft, ChevronRight, Loader2, Link as LinkIcon, Rabbit, Wind, Hourglass, PersonStanding, Turtle, Volume2, MapPin } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


interface KataData {
  steps: KataSteps;
  transactions: Transactions;
  transactions_mapping_from: TransactionsMapping;
  transactions_mapping_to: TransactionsMapping;
  notes: string | null;
  Gamba: string | null;
}

const facingArrowMap: { [key: string]: string } = {
  'N': '↑',  // Upwards Arrow
  'NE': '↗', // North East Arrow
  'E': '→',  // Rightwards Arrow
  'SE': '↘', // South East Arrow
  'S': '↓',  // Downwards Arrow
  'SO': '↙', // South West Arrow
  'O': '←',  // Leftwards Arrow
  'NO': '↖'  // North West Arrow
};

const directionSymbolMap: { [key: string]: string } = {
  'sx': '↶',
  'dx': '↷',
  'frontal': '=',
  null:'⤫'
};

const guardiaSymbolMap: { [key: string]: string } = {
  'sx': '◐', // U+25D0
  'dx': '◑', // U+25D1
  'frontal': '◒', // U+25D2
};

const gambaSymbolMap: { [key: string]: string } = {
  'sx': '◐',
  'dx': '◑',
  'frontal': '◒',
};

const tempoIconMap: { [key in Transaction['tempo']]: React.ElementType } = {
    'Legato': LinkIcon,
    'Fast': Rabbit,
    'Normal': PersonStanding,
    'Slow': Turtle,
    'Breath': Wind,
};


const getFacingArrow = (facing: string) => {
  return facingArrowMap[facing] || facing;
};

const getDirectionSymbol = (direction: string | null | undefined) => {
  if (!direction) return '⇓'; // Default for None or ""
  return directionSymbolMap[direction] || '⇓'; // Default for any other case
}

const getGuardiaSymbol = (guardia: string | null | undefined) => {
  if (!guardia) return '';
  return guardiaSymbolMap[guardia] || guardia;
}

const getTempoIcon = (tempo: Transaction['tempo']) => {
    const Icon = tempoIconMap[tempo] || Hourglass;
    return <Icon className="h-4 w-4" />;
};


const parseEmbusen = (embusen: string): { x: number; y: number } | null => {
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
    return null;
};

const EmbusenGrid = ({ embusen, facing }: { embusen: string; facing: string }) => {
    const coords = parseEmbusen(embusen);

    const gridSize = 11;
    const cellSize = 32;
    const centerOffset = Math.floor(gridSize / 2);

    if (!coords) {
        return <div className="text-muted-foreground">Invalid embusen format.</div>;
    }

    const gridX = coords.x + centerOffset;
    const gridY = -coords.y + centerOffset;
    const arrow = getFacingArrow(facing);

    return (
        <div className="flex flex-col items-center">
            <h4 className="font-semibold mb-2">Embusen</h4>
            <div
                className="relative border border-border"
                style={{
                    width: gridSize * cellSize,
                    height: gridSize * cellSize,
                    backgroundImage: `
                        linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                        linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                    `,
                    backgroundSize: `${cellSize}px ${cellSize}px`,
                    backgroundColor: 'hsl(var(--secondary) / 0.3)',
                }}
            >
                {/* Origin Marker */}
                <div
                    className="absolute flex items-center justify-center text-muted-foreground"
                    style={{
                        width: cellSize,
                        height: cellSize,
                        left: centerOffset * cellSize,
                        top: centerOffset * cellSize,
                    }}
                >
                    <MapPin className="h-6 w-6" />
                </div>
                {/* Position Marker */}
                <div
                    className="absolute flex items-center justify-center text-primary-foreground text-2xl font-bold bg-primary rounded-full"
                    style={{
                        width: cellSize,
                        height: cellSize,
                        left: gridX * cellSize,
                        top: gridY * cellSize,
                        transition: 'top 0.3s ease, left 0.3s ease',
                    }}
                    title={`Position: (${coords.x}, ${coords.y}), Facing: ${facing}`}
                >
                    {arrow}
                </div>
            </div>
        </div>
    );
};


export default function KataSelection() {
  const [kataInventory, setKataInventory] = useState<KataInventory | null>(null);
  const [selectedKataName, setSelectedKataName] = useState<string | null>(null);
  const [kataId, setKataId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [kataSteps, setKataSteps] = useState<KataSteps | null>(null);
  const [kataNotes, setKataNotes] = useState<string | null>(null);
  const [kataGamba, setKataGamba] = useState<string | null>(null);
  const [tx, setTx] = useState<Transactions | null>(null);
  const [transactionsMappingFrom, setTransactionsMappingFrom] = useState<TransactionsMapping | null>(null);
  const [transactionsMappingTo, setTransactionsMappingTo] = useState<TransactionsMapping | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  const [isPosizioneInfoDialogOpen, setIsPosizioneInfoDialogOpen] = useState(false);
  const [selectedPosizioneInfo, setSelectedPosizioneInfo] = useState<Posizione | null>(null);
  const [isPosizioneInfoLoading, setIsPosizioneInfoLoading] = useState(false);

  const [isTechnicInfoDialogOpen, setIsTechnicInfoDialogOpen] = useState(false);
  const [selectedTechnicInfo, setSelectedTechnicInfo] = useState<Tecnica | null>(null);
  const [isTechnicInfoLoading, setIsTechnicInfoLoading] = useState(false);

  const [viewMode, setViewMode] = useState<"generale" | "dettagli">("generale");

  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/kata_inventory')
      .then(res => res.json())
      .then(data => {
        if (data && data.kata) {
            setKataInventory(data.kata);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (kataId === null) {
      setKataSteps(null);
      setTx(null);
      setTransactionsMappingFrom(null);
      setTransactionsMappingTo(null);
      setKataNotes(null);
      setKataGamba(null);
      setSelectedStepIndex(0);
      return;
    }

    setLoading(true);
    setKataSteps(null);
    setTx(null);
    setTransactionsMappingFrom(null);
    setTransactionsMappingTo(null);
    setKataNotes(null);
    setKataGamba(null);
    setSelectedStepIndex(0);

    fetch(`/api/kata/${kataId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch kata data');
        }
        return res.json();
      })
      .then((data: KataData) => {
        setKataSteps(data.steps);
        setTx(data.transactions);
        setTransactionsMappingFrom(data.transactions_mapping_from);
        setTransactionsMappingTo(data.transactions_mapping_to);
        setKataNotes(data.notes);
        setKataGamba(data.Gamba);
      })
      .catch(error => {
        console.error("Error fetching kata data:", error);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [kataId]);
  
  const handlePosizioneClick = async (standId: number) => {
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
      setIsPosizioneInfoDialogOpen(false); // Close dialog on error
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
          const selectedKataId = kataInventory[value];
          setKataId(selectedKataId);
      }
  };
  
  const sortedKataNames = kataInventory
    ? Object.keys(kataInventory).sort((a, b) => kataInventory[a] - kataInventory[b])
    : [];

  const sortedKataSteps = kataSteps 
    ? Object.values(kataSteps).sort((a, b) => a.seq_num - b.seq_num) 
    : [];
    
  const currentStep: KataStep | undefined = sortedKataSteps[selectedStepIndex];
  
  const transactionToNextId = currentStep && transactionsMappingFrom ? transactionsMappingFrom[currentStep.id_sequence] : null;
  const transactionToNext = transactionToNextId && tx ? tx[transactionToNextId] : null;

  const transactionToCurrentId = currentStep && transactionsMappingTo ? transactionsMappingTo[currentStep.id_sequence] : null;
  const transactionToCurrent = transactionToCurrentId && tx ? tx[transactionToCurrentId] : null;

  const gambaSymbol = kataGamba ? gambaSymbolMap[kataGamba] : null;

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
        <CardHeader>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                    <Label htmlFor="view-mode-switch" className={cn("text-sm text-muted-foreground", viewMode === 'generale' && 'text-foreground')}>Generale</Label>
                    <Switch
                        id="view-mode-switch"
                        checked={viewMode === 'dettagli'}
                        onCheckedChange={(checked) => setViewMode(checked ? 'dettagli' : 'generale')}
                    />
                    <Label htmlFor="view-mode-switch" className={cn("text-sm text-muted-foreground", viewMode === 'dettagli' && 'text-foreground')}>Dettagli</Label>
                </div>
                <div className="flex-grow">
                      <CardTitle className="flex items-center justify-end gap-2">
                        {gambaSymbol && (
                           <Popover>
                              <PopoverTrigger asChild>
                                  <span className="text-2xl cursor-pointer">{gambaSymbol}</span>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2">
                                  <p>Chiusura: {kataGamba}</p>
                              </PopoverContent>
                          </Popover>
                        )}
                        {selectedKataName ? `Kata: ${selectedKataName}` : "Kata Selection"}
                      </CardTitle>
                </div>
            </div>
            {kataNotes && <CardDescription className="mt-2 text-left">{kataNotes}</CardDescription>}
            {!selectedKataName && !kataNotes && <CardDescription className="mt-2 text-right">Select a kata to see its details.</CardDescription>}
        </CardHeader>
        <CardContent>
          
          {loading && <p className="text-muted-foreground pt-4">Loading kata details...</p>}

          {kataSteps && tx && transactionsMappingFrom && transactionsMappingTo && (
            <div className="w-full">
              
              {viewMode === 'generale' ? (
                  <div className="mt-6 flex flex-col items-center gap-2">
                    {sortedKataSteps.map((step, index) => {
                      const transactionId = transactionsMappingFrom[step.id_sequence];
                      const transaction = transactionId ? tx[transactionId] : null;

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
                                      <span className="text-2xl font-bold" title={step.facing}>{getFacingArrow(step.facing)}</span>
                                    </div>
                                  </div>
                              
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <div className="p-2 -mx-2 rounded-md hover:bg-accent/50 cursor-pointer">
                                          <p className="text-sm text-muted-foreground">Techniques:</p>
                                          <ul className="list-disc pl-5 font-medium">
                                              {step.tecniche.map((tech) => (
                                                  <li key={tech.technic_id} className="truncate text-sm cursor-pointer hover:underline" onClick={(e) => {e.stopPropagation(); handleTechnicClick(tech.technic_id)}}>
                                                      {tech.Tecnica}
                                                  </li>
                                              ))}
                                          </ul>
                                      </div>
                                    </PopoverTrigger>
                                    <PopoverContent side="top" align="start">
                                      <div className="space-y-2">
                                        {step.tecniche.map((tech) => (
                                            <div key={tech.technic_id} className="mb-2 last:mb-0 text-sm">
                                                <p><strong>Arto:</strong> {tech.arto}</p>
                                                <p><strong>Tecnica:</strong> {tech.Tecnica}</p>
                                                <p><strong>Obiettivo:</strong> {tech.Obiettivo || 'N/A'}</p>
                                            </div>
                                        ))}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
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
                                  <p className="text-2xl font-bold" title={transaction.direction}>{getDirectionSymbol(transaction.direction)}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </div>
              ) : (
                <>
                {sortedKataSteps.length > 0 && currentStep ? (
                    <div className="space-y-4 pt-4">
                          <div className="flex items-center justify-center gap-4">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="icon" onClick={() => handleStepChange('prev')}>
                                      <ChevronLeft className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                {transactionToCurrent && (
                                  <PopoverContent>
                                     <div className="flex items-center gap-2">
                                        {getTempoIcon(transactionToCurrent.tempo)}
                                        <span>{transactionToCurrent.tempo}</span>
                                      </div>
                                    <p>Direction: {transactionToCurrent.direction}</p>
                                  </PopoverContent>
                                )}
                              </Popover>
                              <div className="w-48 text-center font-medium">
                                  Step {currentStep.seq_num} of {sortedKataSteps.length}
                              </div>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="icon" onClick={() => handleStepChange('next')}>
                                      <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                {transactionToNext && (
                                  <PopoverContent>
                                    <div className="flex items-center gap-2">
                                      {getTempoIcon(transactionToNext.tempo)}
                                      <span>{transactionToNext.tempo}</span>
                                    </div>
                                    <p>Direction: {transactionToNext.direction}</p>
                                  </PopoverContent>
                                )}
                              </Popover>
                          </div>

                      <Card className="w-full max-w-lg mx-auto">
                          <CardHeader>
                              <CardTitle className="flex justify-between items-center">
                                <span
                                    className="cursor-pointer hover:underline"
                                    onClick={() => handlePosizioneClick(currentStep.stand_id)}
                                >
                                    {currentStep.posizione}
                                </span>
                                <div className="flex items-center gap-2 text-2xl font-bold">
                                    {currentStep.kiai && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Volume2 className="h-6 w-6 text-destructive cursor-pointer" />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-2">
                                                <p>Kiai!</p>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <span className="font-normal cursor-pointer">{getGuardiaSymbol(currentStep.guardia)}</span>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-2">
                                            <p>{currentStep.guardia}</p>
                                        </PopoverContent>
                                    </Popover>
                                    <span title={currentStep.facing}>
                                        {getFacingArrow(currentStep.facing)}
                                    </span>
                                </div>
                              </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-col gap-6">
                                  <div>
                                      <h4 className="font-semibold mb-2">Techniques:</h4>
                                      <ul className="space-y-2">
                                          {currentStep.tecniche.map(tech => (
                                              <li key={tech.technic_id} className="border-l-4 pl-4 py-1 border-primary/50 bg-secondary/50 rounded-r-md">
                                                  <p><strong className="cursor-pointer hover:underline" onClick={() => handleTechnicClick(tech.technic_id)}>Tecnica:</strong> {tech.Tecnica}</p>
                                                  <p><strong>Arto:</strong> {tech.arto}</p>
                                                  <p><strong>Obiettivo:</strong> {tech.Obiettivo || 'N/A'}</p>
                                                  <p><strong>Note:</strong> {tech.waza_note || 'N/A'}</p>
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                                  {currentStep.notes && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Notes:</h4>
                                      <p className="text-sm text-muted-foreground">{currentStep.notes}</p>
                                    </div>
                                  )}
                                  <div className="mt-4 flex justify-center">
                                      <EmbusenGrid embusen={currentStep.embusen} facing={currentStep.facing} />
                                  </div>
                            </div>
                          </CardContent>
                      </Card>
                    </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg mt-4">
                    <p className="text-muted-foreground">
                      Select a kata to see step-by-step details.
                    </p>
                  </div>
                )}
                </>
              )}
            </div>
          )}
        </CardContent>
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
