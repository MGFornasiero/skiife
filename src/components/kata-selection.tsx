
"use client";

import { useState, useEffect } from "react";
import { type KataInventory, type KataSteps, type Transactions, type TransactionsMapping, type KataStep, type Posizione } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface KataData {
  steps: KataSteps;
  transactions: Transactions;
  transactions_mapping_from: TransactionsMapping;
  transactions_mapping_to: TransactionsMapping;
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
  'sx': '↺',      // Anticlockwise Open Circle Arrow
  'dx': '↻',      // Clockwise Open Circle Arrow
  'frontal': '⇓', // Downwards Double Arrow
};

const getFacingArrow = (facing: string) => {
  return facingArrowMap[facing] || facing;
};

const getDirectionSymbol = (direction: string | null | undefined) => {
  if (!direction) return '⇓'; // Default for None or ""
  return directionSymbolMap[direction] || '⇓'; // Default for any other case
}

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
                    className="absolute flex items-center justify-center text-muted-foreground text-2xl"
                    style={{
                        width: cellSize,
                        height: cellSize,
                        left: centerOffset * cellSize,
                        top: centerOffset * cellSize,
                    }}
                >
                    ▢
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
  const [loadingStandInfo, setLoadingStandInfo] = useState(false);
  const [kataSteps, setKataSteps] = useState<KataSteps | null>(null);
  const [tx, setTx] = useState<Transactions | null>(null);
  const [transactionsMappingFrom, setTransactionsMappingFrom] = useState<TransactionsMapping | null>(null);
  const [transactionsMappingTo, setTransactionsMappingTo] = useState<TransactionsMapping | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [isStandInfoOpen, setIsStandInfoOpen] = useState(false);
  const [selectedStandInfo, setSelectedStandInfo] = useState<Posizione | null>(null);


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
      setSelectedStepIndex(0);
      return;
    }

    setLoading(true);
    setKataSteps(null);
    setTx(null);
    setTransactionsMappingFrom(null);
    setTransactionsMappingTo(null);
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
      })
      .catch(error => {
        console.error("Error fetching kata data:", error);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [kataId]);
  
  const handleStandInfoClick = async (standId: number) => {
    if (!standId) return;
    setLoadingStandInfo(true);
    setSelectedStandInfo(null);
    setIsStandInfoOpen(true);
    try {
      const res = await fetch(`/api/info_stand/${standId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch stand info');
      }
      const data = await res.json();
      if(data && data.stand_info){
         setSelectedStandInfo(data.stand_info);
      } else {
        setSelectedStandInfo(null);
      }
    } catch (error) {
      console.error("Error fetching stand data:", error);
      setSelectedStandInfo(null);
    } finally {
      setLoadingStandInfo(false);
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
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>{selectedKataName ? `Kata: ${selectedKataName}` : "Kata Selection"}</CardTitle>
            {!selectedKataName && <CardDescription>Select a kata to see its details.</CardDescription>}
          </div>
          {kataInventory ? (
            <div className="w-full sm:w-[280px]">
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
            </div>
          ) : (
              <div className="flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
          )}
        </CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground pt-4">Loading kata details...</p>}

          {kataSteps && tx && transactionsMappingFrom && (
            <Tabs defaultValue="generale" className="w-full">
              <TabsList>
                <TabsTrigger value="generale">Generale</TabsTrigger>
                <TabsTrigger value="dettagli">Dettagli</TabsTrigger>
              </TabsList>
              <TabsContent value="generale">
                <TooltipProvider>
                  <div className="mt-6 flex flex-col items-center gap-2">
                    {sortedKataSteps.map((step, index) => {
                      const transactionId = transactionsMappingFrom[step.id_sequence];
                      const transaction = transactionId ? tx[transactionId] : null;

                      return (
                        <React.Fragment key={step.id_sequence}>
                          <Card className={cn("w-full max-w-md flex flex-col", step.kiai && "bg-accent/20 border-accent")}>
                            <CardContent className="p-4 flex flex-col gap-2">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                      <p className="font-medium">{step.posizione}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <span>{step.guardia}</span>
                                      <span className="text-2xl font-bold" title={step.facing}>{getFacingArrow(step.facing)}</span>
                                    </div>
                                  </div>
                              
                                  <Tooltip>
                                  <TooltipTrigger asChild>
                                      <div className="p-2 -mx-2 rounded-md hover:bg-accent/50 cursor-pointer">
                                          <p className="text-sm text-muted-foreground">Techniques:</p>
                                          <ul className="list-disc pl-5 font-medium">
                                              {step.tecniche.map((tech) => (
                                                  <li key={tech.technic_id} className="truncate text-sm">{tech.Tecnica}</li>
                                              ))}
                                          </ul>
                                      </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" align="start">
                                      {step.tecniche.map((tech) => (
                                          <div key={tech.technic_id} className="mb-2 last:mb-0">
                                              <p><strong>Arto:</strong> {tech.arto}</p>
                                              <p><strong>Tecnica:</strong> {tech.Tecnica}</p>
                                              <p><strong>Obiettivo:</strong> {tech.Obiettivo || 'N/A'}</p>
                                          </div>
                                      ))}
                                  </TooltipContent>
                                  </Tooltip>
                            </CardContent>
                          </Card>
                          {index < sortedKataSteps.length - 1 && (
                            <div className="flex items-center justify-center my-2 text-muted-foreground">
                              {transaction && (
                                <div className="flex items-center gap-2">
                                  <p className="text-xs">{transaction.tempo}</p>
                                  <p className="text-2xl font-bold" title={transaction.direction}>{getDirectionSymbol(transaction.direction)}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </div>
                </TooltipProvider>
              </TabsContent>
              <TabsContent value="dettagli">
                {sortedKataSteps.length > 0 && currentStep ? (
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-center gap-4">
                          <Button variant="outline" size="icon" onClick={() => handleStepChange('prev')}>
                              <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="w-48 text-center font-medium">
                              Step {currentStep.seq_num} of {sortedKataSteps.length}
                          </div>
                          <Button variant="outline" size="icon" onClick={() => handleStepChange('next')}>
                              <ChevronRight className="h-4 w-4" />
                          </Button>
                      </div>

                      <Card className="w-full max-w-lg mx-auto">
                          <CardHeader>
                              <CardTitle className="flex justify-between items-center">
                                <button onClick={() => handleStandInfoClick(currentStep.stand_id)} className="underline-offset-4 hover:underline disabled:no-underline" disabled={loadingStandInfo}>
                                  <span>{currentStep.posizione}</span>
                                  {loadingStandInfo && <Loader2 className="ml-2 h-4 w-4 animate-spin inline-block" />}
                                </button>
                                <span className="text-4xl font-bold" title={currentStep.facing}>
                                    {getFacingArrow(currentStep.facing)}
                                </span>
                              </CardTitle>
                              <CardDescription>
                                  Guardia: {currentStep.guardia}
                                  {currentStep.kiai && <span className="ml-2 font-bold text-destructive">KIAI!</span>}
                              </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-col gap-6">
                                  <div>
                                      <h4 className="font-semibold mb-2">Techniques:</h4>
                                      <ul className="space-y-2">
                                          {currentStep.tecniche.map(tech => (
                                              <li key={tech.technic_id} className="border-l-4 pl-4 py-1 border-primary/50 bg-secondary/50 rounded-r-md">
                                                  <p><strong>Technique:</strong> {tech.Tecnica}</p>
                                                  <p><strong>Limb:</strong> {tech.arto}</p>
                                                  <p><strong>Target:</strong> {tech.Obiettivo || 'N/A'}</p>
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
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
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      <AlertDialog open={isStandInfoOpen} onOpenChange={setIsStandInfoOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{loadingStandInfo ? 'Loading...' : selectedStandInfo?.name || "Info"}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              {loadingStandInfo ? (
                 <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : selectedStandInfo ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 pt-4">
                   <div className="space-y-1">
                      <h4 className="font-semibold">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedStandInfo.description || "No description available."}</p>
                   </div>
                   <div className="space-y-1">
                      <h4 className="font-semibold">Notes</h4>
                      <p className="text-sm text-muted-foreground">{selectedStandInfo.notes || "No notes available."}</p>
                   </div>
                </div>
              ) : (
                 <p>No information found for this stand.</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
