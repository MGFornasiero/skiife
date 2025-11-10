

"use client";

import { useState, useEffect } from "react";
import { type KataInventory, type KataResponse, type KataSequenceStep, type StandInfo, type TechnicInfo, type BunkaiSummary, type KataTechnique, BodyPart, DetailedNotes, Limbs, Sides, BunkaiDetailsResponse, KataTransaction } from "@/lib/data";
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
import { ChevronLeft, ChevronRight, Loader2, Rabbit, Wind, Hourglass, PersonStanding, Turtle, Volume2, MapPin, Notebook, Eye, Crosshair, Lightbulb, ArrowLeft, ArrowRight } from "lucide-react";
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
import { AbsoluteDirections, EmbusenPoints, Tempo } from "@/lib/type_admin_fe";
import { KataPlayer } from "./kata-player";
import { Separator } from "./ui/separator";
import { Gauge, GaugeCircle, Infinity as InfinityIcon } from "lucide-react";
import { DirectionIndicator } from "./direction-indicator";


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
    'Breath': Wind,
    'Slow': Turtle,
    'Normal': PersonStanding,
    'Fast': Rabbit,
    'Legato': InfinityIcon,
};

const tempoColorMap: { [key in Tempo]: string } = {
    'Legato': "text-purple-500",
    'Fast': "text-red-500",
    'Normal': "text-green-500",
    'Slow': "text-blue-400",
    'Breath': "text-sky-400",
};


const formatBodyPartDisplay = (arto: BodyPart | null) => {
    if (!arto) return null;
    const sideSymbol = guardiaSymbolMap[arto.side] || '';
    return <span>{arto.limb} {sideSymbol}</span>;
};

const getDirectionSymbol = (direction: Sides | null) => {
  if (!direction) return '⇓'; // Default for None or ""
  return directionSymbolMap[direction] || '⇓'; // Default for any other case
}

const getGuardiaSymbol = (guardia: Sides | null) => {
  if (!guardia) return '';
  return guardiaSymbolMap[guardia] || guardia;
}

const TempoIndicator: React.FC<{ tempo: Tempo | null }> = ({ tempo }) => {
    if (!tempo) return null;
    const Icon = tempoIconMap[tempo] || Hourglass;
    const color = tempoColorMap[tempo] || "";
    return (
      <Popover>
        <PopoverTrigger>
          <div className="flex items-center gap-2 cursor-pointer">
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
            <p className="capitalize">{tempo}</p>
        </PopoverContent>
      </Popover>
    );
};

const getStepTempoIcon = (tempo: Tempo | null) => {
    if (!tempo) return null;
    const Icon = tempoIconMap[tempo];
    if (!Icon) return null;
    const color = tempoColorMap[tempo] || "";
    return <Icon className={`h-5 w-5 ${color}`} />;
};

const formatBodyPart = (arto: BodyPart) => {
    const sideSymbol = guardiaSymbolMap[arto.side] || '';
    return `${arto.limb} ${sideSymbol}`;
};


const TransactionDetails: React.FC<{ 
  transaction: KataTransaction | null,
  onNavigate?: () => void,
  navigationDirection?: 'prev' | 'next' 
}> = ({ transaction, onNavigate, navigationDirection }) => {
  if (!transaction) {
    return (
      <div className="p-4 text-sm text-muted-foreground h-full flex items-center justify-center">
        <p>No transaction data.</p>
      </div>
    );
  }
  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto flex flex-col">
        <div className="flex-grow space-y-4">
            {transaction.tempo && (
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">Tempo</h4>
                <TempoIndicator tempo={transaction.tempo} />
              </div>
            )}
            {transaction.direction && (
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">Direction</h4>
                <p className="text-xl font-bold" title={transaction.direction}>{getDirectionSymbol(transaction.direction)}</p>
              </div>
            )}
            {transaction.looking_direction && (
              <div>
                <h4 className="font-semibold mb-1 text-sm">Looking Direction</h4>
                <div className="flex justify-center mt-2">
                    <DirectionIndicator direction={transaction.looking_direction} size={60} centerIcon={Eye}/>
                </div>
              </div>
            )}
            {transaction.notes && (
              <div>
                <h4 className="font-semibold mb-1 text-sm">Notes</h4>
                <p className="text-sm text-muted-foreground break-words">{transaction.notes}</p>
              </div>
            )}
            {transaction.remarks && transaction.remarks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1 text-sm">Remarks</h4>
                <div className="space-y-2">
                  {transaction.remarks.map((remark, index) => (
                    <Card key={index} className="bg-secondary/50">
                      <CardContent className="p-3 text-sm">
                        {remark.arto && <p><span className="font-semibold text-foreground">Arto:</span> {formatBodyPart(remark.arto)}</p>}
                        {remark.description && <p><span className="font-semibold text-foreground">Description:</span> {remark.description}</p>}
                        {remark.explanation && <p><span className="font-semibold text-foreground">Explanation:</span> {remark.explanation}</p>}
                        {remark.note && <p><span className="font-semibold text-foreground">Note:</span> {remark.note}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {transaction.resources && (
                <div>
                    <h4 className="font-semibold text-foreground mt-2 mb-1 text-sm">Resources</h4>
                    {(Array.isArray(transaction.resources) ? transaction.resources : [transaction.resources]).map((res, i) => (
                        <Card key={i} className="mt-1 bg-secondary"><CardContent className="p-2 space-y-1 text-xs">
                            {Object.entries(res).map(([key, value]) => (
                                <div key={key} className="break-all">
                                    <span className="font-semibold capitalize text-foreground">{key}:</span>
                                    <span> {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                    ))}
                </div>
            )}
        </div>
        {onNavigate && navigationDirection && (
          <div className="pt-4 border-t">
              <Button onClick={onNavigate} className="w-full">
                  {navigationDirection === 'next' ? (
                      <>Next Step <ArrowRight className="ml-2 h-4 w-4" /></>
                  ) : (
                      <><ArrowLeft className="mr-2 h-4 w-4" /> Previous Step</>
                  )}
              </Button>
          </div>
        )}
      </div>
  );
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

  const [viewMode, setViewMode] = useState<"generale" | "dettagli" | "info" | "bunkai">("generale");

  const [bunkaiIds, setBunkaiIds] = useState<string[]>([]);
  const [selectedBunkaiIndex, setSelectedBunkaiIndex] = useState<number>(0);
  const [bunkaiDetails, setBunkaiDetails] = useState<BunkaiDetailsResponse | null>(null);
  const [loadingBunkai, setLoadingBunkai] = useState(false);
  
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

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
    const fetchKataData = async () => {
        if (kataId === null) {
            setKataDetails(null);
            setSelectedStepIndex(0);
            setBunkaiIds([]);
            setSelectedBunkaiIndex(0);
            setBunkaiDetails(null);
            return;
        }

        setLoading(true);
        setKataDetails(null);
        setSelectedStepIndex(0);
        setBunkaiIds([]);
        setSelectedBunkaiIndex(0);
        setBunkaiDetails(null);
        setLeftPanelOpen(false);
        setRightPanelOpen(false);

        try {
            const res = await fetch(`/api/kata/${kataId}`);
            if (!res.ok) {
                const errorPayload = await res.json();
                throw new Error(errorPayload.error || `HTTP error! status: ${res.status}`);
            }
            const data: KataResponse = await res.json();
            setKataDetails(data);
            if (data.bunkai_ids) {
                const sortedIds = Object.keys(data.bunkai_ids).sort((a, b) =>
                    data.bunkai_ids[a].version - data.bunkai_ids[b].version
                );
                setBunkaiIds(sortedIds);
                if (sortedIds.length > 0) {
                    setSelectedBunkaiIndex(0);
                }
            }

        } catch (error: any) {
            console.error("Error fetching kata data:", error);
            toast({
                variant: "destructive",
                title: "Error fetching kata data",
                description: <pre className="mt-2 w-full rounded-md bg-slate-950 p-4"><code className="text-white">{error.message}</code></pre>
            });
        } finally {
            setLoading(false);
        }
    };

    fetchKataData();
  }, [kataId, toast]);

  useEffect(() => {
    const fetchBunkaiDetails = async () => {
      const selectedBunkaiId = bunkaiIds[selectedBunkaiIndex];
      if (!selectedBunkaiId) {
        setBunkaiDetails(null);
        return;
      }
      setLoadingBunkai(true);
      try {
        const res = await fetch(`/api/bunkai_dtls/${selectedBunkaiId}`);
         if (!res.ok) {
            const errorPayload = await res.json();
            throw new Error(errorPayload.error || `HTTP error! status: ${res.status}`);
        }
        const data: BunkaiDetailsResponse = await res.json();
        setBunkaiDetails(data);
      } catch (error: any) {
         console.error("Error fetching bunkai details:", error);
         toast({
            variant: "destructive",
            title: "Error fetching bunkai details",
            description: error.message,
         });
      } finally {
        setLoadingBunkai(false);
      }
    };
    fetchBunkaiDetails();
  }, [bunkaiIds, selectedBunkaiIndex, toast]);

  const handleBunkaiVersionChange = (direction: 'next' | 'prev') => {
    if (!bunkaiIds.length) return;
    setSelectedBunkaiIndex(prevIndex => {
        if (direction === 'next') {
            return (prevIndex + 1) % bunkaiIds.length;
        } else {
            return (prevIndex - 1 + bunkaiIds.length) % bunkaiIds.length;
        }
    });
  };

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
      setIsPosizioneInfoDialogOpen(false);
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

  const selectedBunkaiId = bunkaiIds[selectedBunkaiIndex];
  const selectedBunkaiSummary = kataDetails && selectedBunkaiId ? kataDetails.bunkai_ids[selectedBunkaiId] : null;

  
  return (
    <div className="w-full space-y-4">
      <div className="w-full sm:w-[280px]">
        {kataInventory ? (
            <Select onValueChange={handleKataChange}>
              <SelectTrigger id="kata-select">
                <SelectValue placeholder="Selezionare il kata" />
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
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "generale" | "dettagli" | "info" | "bunkai")} className="w-full">
              <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                      <TabsList>
                          <TabsTrigger value="generale">Generale</TabsTrigger>
                          <TabsTrigger value="dettagli" disabled={!kataDetails}>Dettagli</TabsTrigger>
                          <TabsTrigger value="info" disabled={!kataDetails}>Info</TabsTrigger>
                          <TabsTrigger value="bunkai" disabled={!bunkaiIds.length}>Bunkai</TabsTrigger>
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
                                              <Card className={cn("w-full", step.kiai && "border-primary")}>
                                                  <CardContent className="p-4 grid grid-cols-[80px,1fr] gap-4 items-start">
                                                      <div className="w-full h-full flex items-center justify-center">
                                                        <DirectionIndicator
                                                            size={60}
                                                            direction={step.facing}
                                                            guardia={step.guardia}
                                                        />
                                                      </div>
                                                      <div className="flex flex-col gap-2">
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
                                                              </div>
                                                          </div>
                                                          <div>
                                                              {techniques && techniques.length > 0 && (
                                                                <>
                                                                  <p className="text-sm text-muted-foreground">Tecniche:</p>
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
                                                      </div>
                                                  </CardContent>
                                              </Card>
                                              {index < sortedKataSteps.length - 1 && (
                                                  <div className="flex items-center justify-center my-2 text-muted-foreground">
                                                      {transaction && (
                                                          <div className="flex items-center gap-2">
                                                              <TempoIndicator tempo={transaction.tempo} />
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
                           <TabsContent value="dettagli" className="relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    {/* Left Panel */}
                                    <div className={cn(
                                        "absolute top-0 left-0 h-full w-64 bg-background border-r transition-transform duration-300 ease-in-out z-10",
                                        leftPanelOpen ? "translate-x-0" : "-translate-x-full"
                                    )}>
                                        <TransactionDetails 
                                            transaction={transactionToCurrent} 
                                            onNavigate={() => handleStepChange('prev')}
                                            navigationDirection="prev"
                                        />
                                    </div>
                                    
                                    {/* Main Content */}
                                    <div className="flex-grow transition-all duration-300 ease-in-out w-full">
                                        <div className="w-full flex flex-col items-center">
                                            {currentStep ? (
                                                <div className="mt-4 flex flex-col items-center gap-4 w-full max-w-2xl mx-auto">
                                                    <div className="flex items-center w-full justify-between">
                                                        <div className="flex flex-col space-y-2">
                                                            <Button variant="outline" size="icon" onClick={() => setLeftPanelOpen(!leftPanelOpen)} disabled={!transactionToCurrent}>
                                                                <Lightbulb className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="outline" size="icon" onClick={() => handleStepChange('prev')}>
                                                                <ArrowLeft className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        <div className="flex-grow text-center">
                                                            <p className="text-sm font-medium tabular-nums">
                                                                Step {selectedStepIndex + 1} / {sortedKataSteps.length}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col space-y-2">
                                                            <Button variant="outline" size="icon" onClick={() => setRightPanelOpen(!rightPanelOpen)} disabled={!transactionToNext}>
                                                                <Lightbulb className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="outline" size="icon" onClick={() => handleStepChange('next')}>
                                                                <ArrowRight className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                    
                                                    <div className="flex items-center justify-center gap-3 text-sm">
                                                        {currentStep.kiai && (
                                                            <Popover>
                                                                <PopoverTrigger className="cursor-pointer"><Volume2 className="h-5 w-5 text-destructive" /></PopoverTrigger>
                                                                <PopoverContent className="w-auto p-2"><p>Kiai!</p></PopoverContent>
                                                            </Popover>
                                                        )}
                                                    </div>
                                    
                                                    <div className="w-full text-center space-y-2">
                                                        <p 
                                                        className="font-medium text-base cursor-pointer hover:underline"
                                                        onClick={() => handlePosizioneClick(currentStep.stand_id)}
                                                        >
                                                        {currentStep.posizione} {currentStep.hips && `(${currentStep.hips})`}
                                                        </p>
                                                    </div>

                                                    <div className="w-full space-y-4">
                                                      <div className="flex items-center gap-2">
                                                        <h3>Tecniche</h3>
                                                        {currentStep.speed && (
                                                            <Popover>
                                                                <PopoverTrigger className="cursor-pointer">{getStepTempoIcon(currentStep.speed)}</PopoverTrigger>
                                                                <PopoverContent className="w-auto p-2"><p>{currentStep.speed}</p></PopoverContent>
                                                            </Popover>
                                                        )}
                                                      </div>
                                                      {currentStep.Tecniche && currentStep.Tecniche.length > 0 ? (
                                                          <div className="space-y-2">
                                                              {currentStep.Tecniche.map((tech, index) => (
                                                                  <Card key={index}>
                                                                    <CardContent className="p-4 grid grid-cols-[1fr,auto] items-start gap-4">
                                                                      <div className="space-y-2">
                                                                          <p className="font-medium cursor-pointer hover:underline" onClick={() => handleTechnicClick(tech.technic_id)}>{tech.tecnica}</p>
                                                                          <div className="text-sm text-muted-foreground space-y-1">
                                                                              {tech.arto && <p><span className="font-semibold text-foreground">Arto:</span> {formatBodyPartDisplay(tech.arto)}</p>}
                                                                              {tech.strikingpart_name && <p><span className="font-semibold text-foreground">Striking Part:</span> {tech.strikingpart_name}</p>}
                                                                              {tech.obiettivo && <p><span className="font-semibold text-foreground">Obiettivo:</span> {tech.obiettivo}</p>}
                                                                              {tech.waza_note && <p><span className="font-semibold text-foreground">Waza Note:</span> {tech.waza_note}</p>}
                                                                              {tech.waza_resources && (
                                                                                  <div>
                                                                                      <h4 className="font-semibold text-foreground mt-2 mb-1">Waza Resources</h4>
                                                                                      {(Array.isArray(tech.waza_resources) ? tech.waza_resources : [tech.waza_resources]).map((res, i) => (
                                                                                          <Card key={i} className="mt-1">
                                                                                              <CardContent className="p-2 space-y-1 text-xs">
                                                                                                  {Object.entries(res).map(([key, value]) => (
                                                                                                      <div key={key}>
                                                                                                          <span className="font-semibold capitalize text-foreground">{key}:</span>
                                                                                                          <span> {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</span>
                                                                                                      </div>
                                                                                                  ))}
                                                                                              </CardContent>
                                                                                          </Card>
                                                                                      ))}
                                                                                  </div>
                                                                              )}
                                                                          </div>
                                                                      </div>
                                                                      {tech.target_direction && (
                                                                          <div className="flex items-center justify-center">
                                                                              <DirectionIndicator 
                                                                                  size={60} 
                                                                                  direction={tech.target_direction}
                                                                                  arrowColor="hsl(var(--destructive))"
                                                                              />
                                                                          </div>
                                                                      )}
                                                                    </CardContent>
                                                                  </Card>
                                                              ))}
                                                          </div>
                                                      ) : <p className="text-sm text-muted-foreground">No techniques for this step.</p>}
                                                    </div>
                                                    
                                                    {currentStep.remarks && currentStep.remarks.length > 0 && (
                                                      <div className="w-full space-y-4">
                                                          <h3>Osservazioni</h3>
                                                          <div className="space-y-2">
                                                              {currentStep.remarks.map((remark, index) => (
                                                                  <Card key={index}>
                                                                      <CardContent className="p-4 space-y-2 text-sm">
                                                                          {remark.arto && <p><span className="font-semibold">Arto:</span> {formatBodyPart(remark.arto)}</p>}
                                                                          {remark.description && <p><span className="font-semibold">Description:</span> {remark.description}</p>}
                                                                          {remark.explanation && <p><span className="font-semibold">Explanation:</span> {remark.explanation}</p>}
                                                                          {remark.note && <p><span className="font-semibold">Note:</span> {remark.note}</p>}
                                                                      </CardContent>
                                                                  </Card>
                                                              ))}
                                                          </div>
                                                      </div>
                                                    )}
                                                    
                                                    {currentStep.resources && (
                                                        <div className="w-full space-y-4">
                                                            <h3>Risorse</h3>
                                                            <div className="space-y-2">
                                                                {(Array.isArray(currentStep.resources) ? currentStep.resources : [currentStep.resources]).map((res, index) => (
                                                                    <Card key={index}>
                                                                        <CardContent className="p-4 space-y-1 text-sm">
                                                                            {Object.entries(res).map(([key, value]) => (
                                                                                <div key={key}>
                                                                                    <span className="font-semibold capitalize text-foreground">{key}:</span>
                                                                                    <span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                                                                </div>
                                                                            ))}
                                                                        </CardContent>
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {currentStep.notes && (
                                                      <div className="w-full space-y-2">
                                                        <Card>
                                                          <CardHeader>
                                                            <h3>Note</h3>
                                                          </CardHeader>
                                                          <CardContent>
                                                            <p className="text-sm text-muted-foreground">{currentStep.notes}</p>
                                                          </CardContent>
                                                        </Card>
                                                      </div>
                                                    )}
                                                    
                                                    <div className="w-full space-y-2 flex flex-col items-center">
                                                      <KataPlayer 
                                                        steps={sortedKataSteps} 
                                                        currentStepIndex={selectedStepIndex}
                                                        onStepChange={setSelectedStepIndex}
                                                      />
                                                    </div>
                                                </div>
                                            ) : (
                                              <p className="text-muted-foreground text-center">No step details available.</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Right Panel */}
                                    <div className={cn(
                                        "absolute top-0 right-0 h-full w-64 bg-background border-l transition-transform duration-300 ease-in-out z-10",
                                        rightPanelOpen ? "translate-x-0" : "translate-x-full"
                                    )}>
                                        <TransactionDetails 
                                          transaction={transactionToNext} 
                                          onNavigate={() => handleStepChange('next')}
                                          navigationDirection="next"
                                        />
                                    </div>
                                </div>
                          </TabsContent>
                          <TabsContent value="info">
                            <div className="mt-6 space-y-4">
                              {kataDetails.notes && (
                                <Card>
                                  <CardHeader>
                                    <h3>Notes</h3>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm">{kataDetails.notes}</p>
                                  </CardContent>
                                </Card>
                              )}
                              {kataDetails.resources ? (
                                (Array.isArray(kataDetails.resources) ? kataDetails.resources : [kataDetails.resources]).map((resource, index) => (
                                  <Card key={index}>
                                    <CardHeader>
                                      <h3>Resource</h3>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      {Object.entries(resource).map(([key, value]) => (
                                        <div key={key}>
                                          <span className="text-sm text-muted-foreground capitalize">{key}:</span>
                                          <p className="text-sm">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                                        </div>
                                      ))}
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                <p className="text-muted-foreground text-center">No general resources available for this kata.</p>
                              )}
                            </div>
                          </TabsContent>
                           <TabsContent value="bunkai">
                               <div className="mt-6 flex flex-col items-center gap-4">
                                {bunkaiIds.length > 0 && selectedBunkaiSummary && (
                                    <div className="w-full space-y-4">
                                        <div className="flex items-center gap-4 justify-center">
                                            <Button variant="outline" size="icon" onClick={() => handleBunkaiVersionChange('prev')} disabled={bunkaiIds.length < 2}>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <div className="w-48 h-10 flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-center">
                                                {selectedBunkaiSummary.name} (v{selectedBunkaiSummary.version})
                                            </div>
                                            <Button variant="outline" size="icon" onClick={() => handleBunkaiVersionChange('next')} disabled={bunkaiIds.length < 2}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Card>
                                            <CardContent className="p-6 space-y-4">
                                                {selectedBunkaiSummary.description && (
                                                    <div>
                                                        <h4 className="font-semibold mb-1">Description</h4>
                                                        <p className="text-sm text-muted-foreground">{selectedBunkaiSummary.description}</p>
                                                    </div>
                                                )}
                                                {selectedBunkaiSummary.notes && (
                                                    <div>
                                                        <h4 className="font-semibold mb-1">Notes</h4>
                                                        <p className="text-sm text-muted-foreground">{selectedBunkaiSummary.notes}</p>
                                                    </div>
                                                )}
                                                {selectedBunkaiSummary.resources && (
                                                    <div>
                                                        <h4 className="font-semibold text-foreground mt-2 mb-1">Resources</h4>
                                                        {(Array.isArray(selectedBunkaiSummary.resources) ? selectedBunkaiSummary.resources : [selectedBunkaiSummary.resources]).map((res, i) => (
                                                            <Card key={i} className="mt-1 bg-secondary"><CardContent className="p-2 space-y-1 text-xs">
                                                                {Object.entries(res).map(([key, value]) => (
                                                                    <div key={key}>
                                                                        <span className="font-semibold capitalize text-foreground">{key}:</span>
                                                                        <span> {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</span>
                                                                    </div>
                                                                ))}
                                                            </CardContent></Card>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                                {loadingBunkai && <Loader2 className="h-6 w-6 animate-spin" />}
                                {bunkaiDetails && bunkaiDetails.bunkai_steps ? (
                                    <div className="w-full space-y-4">
                                    {sortedKataSteps.map((step, index) => {
                                        const transactionId = kataDetails.transactions_mapping_from[step.id_sequence];
                                        const transaction = transactionId ? kataDetails.transactions[transactionId] : null;
                                        const bunkaiStep = Object.values(bunkaiDetails.bunkai_steps).find(bs => bs.kata_sequence_id === step.id_sequence);

                                        return (
                                        <React.Fragment key={step.id_sequence}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Card className={cn("flex flex-col", step.kiai && "border-primary")}>
                                                    <CardContent className="p-4 grid grid-cols-[80px,1fr] gap-4 items-start">
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <DirectionIndicator
                                                                size={60}
                                                                direction={step.facing}
                                                                guardia={step.guardia}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-grow">
                                                                    <p className="font-medium cursor-pointer hover:underline" onClick={() => handlePosizioneClick(step.stand_id)}>
                                                                        {step.posizione}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    {step.speed && <Popover><PopoverTrigger asChild><div className="cursor-pointer">{getStepTempoIcon(step.speed)}</div></PopoverTrigger><PopoverContent className="w-auto p-2"><p>{step.speed}</p></PopoverContent></Popover>}
                                                                    {step.kiai && <Popover><PopoverTrigger asChild><Volume2 className="h-5 w-5 text-destructive cursor-pointer" /></PopoverTrigger><PopoverContent className="w-auto p-2"><p>Kiai!</p></PopoverContent></Popover>}
                                                                    {step.notes && <Popover><PopoverTrigger><Notebook className="h-5 w-5 text-muted-foreground cursor-pointer" /></PopoverTrigger><PopoverContent><p>{typeof step.notes === 'string' ? step.notes : JSON.stringify(step.notes)}</p></PopoverContent></Popover>}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                {step.Tecniche && step.Tecniche.length > 0 && (
                                                                <>
                                                                    <p className="text-sm text-muted-foreground">Techniques:</p>
                                                                    <ul className="list-disc pl-5 font-medium">
                                                                    {step.Tecniche.map((tech) => (
                                                                        <li key={tech.technic_id} className="truncate text-sm cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); handleTechnicClick(tech.technic_id); }}>
                                                                        {tech.tecnica}
                                                                        </li>
                                                                    ))}
                                                                    </ul>
                                                                </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="p-4">
                                                    {bunkaiStep ? (
                                                        <div className="space-y-4">
                                                        {bunkaiStep.description && (<div><h4 className="font-semibold mb-1">Description</h4><p className="text-sm text-muted-foreground">{bunkaiStep.description}</p></div>)}
                                                        {bunkaiStep.notes && (<div><h4 className="font-semibold mb-1">Notes</h4><p className="text-sm text-muted-foreground">{bunkaiStep.notes}</p></div>)}
                                                        {bunkaiStep.remarks && bunkaiStep.remarks.length > 0 && (
                                                            <div>
                                                            <h4 className="font-semibold mb-1">Remarks</h4>
                                                            <div className="space-y-2">
                                                                {bunkaiStep.remarks.map((remark, index) => (
                                                                <Card key={index} className="bg-secondary"><CardContent className="p-3 text-sm">
                                                                    {remark.arto && <p><span className="font-semibold">Arto:</span> {formatBodyPart(remark.arto)}</p>}
                                                                    {remark.description && <p><span className="font-semibold">Description:</span> {remark.description}</p>}
                                                                    {remark.explanation && <p><span className="font-semibold">Explanation:</span> {remark.explanation}</p>}
                                                                    {remark.note && <p><span className="font-semibold">Note:</span> {remark.note}</p>}
                                                                </CardContent></Card>
                                                                ))}
                                                            </div>
                                                            </div>
                                                        )}
                                                         {bunkaiStep.resources && (
                                                            <div>
                                                                <h4 className="font-semibold text-foreground mt-2 mb-1">Resources</h4>
                                                                {(Array.isArray(bunkaiStep.resources) ? bunkaiStep.resources : [bunkaiStep.resources]).map((res, i) => (
                                                                    <Card key={i} className="mt-1 bg-secondary"><CardContent className="p-2 space-y-1 text-xs">
                                                                        {Object.entries(res).map(([key, value]) => (
                                                                            <div key={key}>
                                                                                <span className="font-semibold capitalize text-foreground">{key}:</span>
                                                                                <span> {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</span>
                                                                            </div>
                                                                        ))}
                                                                    </CardContent></Card>
                                                                ))}
                                                            </div>
                                                        )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">No bunkai details for this step.</p>
                                                    )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                            {index < sortedKataSteps.length - 1 && (
                                            <div className="flex items-center justify-center my-2 text-muted-foreground">
                                                {transaction && (
                                                <div className="flex items-center gap-2">
                                                    <TempoIndicator tempo={transaction.tempo} />
                                                    <p className="text-2xl font-bold" title={transaction.direction ?? undefined}>{getDirectionSymbol(transaction.direction)}</p>
                                                </div>
                                                )}
                                            </div>
                                            )}
                                        </React.Fragment>
                                        );
                                    })}
                                    </div>
                                ) : (
                                  !loadingBunkai && bunkaiIds.length > 0 && <p className="text-muted-foreground">Select a bunkai to see details.</p>
                                )}
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
    </div>
  );
}



    
