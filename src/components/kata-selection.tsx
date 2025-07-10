"use client";

import { useState, useEffect } from "react";
import { type KataInventory, type KataSteps, type Transactions, type TransactionsMapping } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface KataData {
  steps: KataSteps;
  transactions: Transactions;
  transactions_mapping_from: TransactionsMapping;
  transactions_mapping_to: TransactionsMapping;
}

const facingArrowMap: { [key: string]: string } = {
  'N': '\u2191',  // Upwards Arrow
  'NE': '\u2197', // North East Arrow
  'E': '\u2192',  // Rightwards Arrow
  'SE': '\u2198', // South East Arrow
  'S': '\u2193',  // Downwards Arrow
  'SO': '\u2199', // South West Arrow
  'O': '\u2190',  // Leftwards Arrow
  'NO': '\u2196'  // North West Arrow
};

const getFacingArrow = (facing: string) => {
  return facingArrowMap[facing] || facing;
};

export default function KataSelection() {
  const [kataInventory, setKataInventory] = useState<KataInventory | null>(null);
  const [kataId, setKataId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [kataSteps, setKataSteps] = useState<KataSteps | null>(null);
  const [tx, setTx] = useState<Transactions | null>(null);
  const [transactionsMappingFrom, setTransactionsMappingFrom] = useState<TransactionsMapping | null>(null);
  const [transactionsMappingTo, setTransactionsMappingTo] = useState<TransactionsMapping | null>(null);


  useEffect(() => {
    // Fetch kata inventory on component mount
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
      return;
    }

    setLoading(true);
    setKataSteps(null);
    setTx(null);
    setTransactionsMappingFrom(null);
    setTransactionsMappingTo(null);

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

  const handleKataChange = (value: string) => {
      if (kataInventory) {
          const selectedKataId = kataInventory[value];
          setKataId(selectedKataId);
      }
  };
  
  const sortedKataSteps = kataSteps 
    ? Object.values(kataSteps).sort((a, b) => a.seq_num - b.seq_num) 
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kata Selection</CardTitle>
        <CardDescription>Select a kata to see its details.</CardDescription>
      </CardHeader>
      <CardContent>
        {kataInventory ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kata-select">Kata</Label>
              <Select onValueChange={handleKataChange}>
                <SelectTrigger id="kata-select" className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Select a kata..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(kataInventory).map((kataName) => (
                    <SelectItem key={kataName} value={kataName}>
                      {kataName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
            <div className="flex items-center justify-center h-24">
                <p className="text-muted-foreground">Loading kata inventory...</p>
            </div>
        )}
        
        {loading && <p className="text-muted-foreground pt-4">Loading kata details...</p>}

        {kataSteps && (
          <TooltipProvider>
            <div className="mt-6 flex flex-col gap-4">
              {sortedKataSteps.map((step) => (
                <Card key={step.id_sequence} className={cn("flex flex-col", step.kiai && "bg-accent/20 border-accent")}>
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
              ))}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
