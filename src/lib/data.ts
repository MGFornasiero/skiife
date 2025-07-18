export type KataTechnic = {
  sequence_id: number;
  arto: string;
  technic_id: number;
  Tecnica: string;
  technic_target_id: number | null;
  Obiettivo: string | null;
  waza_note:string | null;
};

export type KataStep = {
  id_sequence: number;
  kata_id: number;
  seq_num: number;
  stand_id: number;
  posizione: string;
  guardia: string | null;
  facing: string | null;
  tecniche: KataTechnic[];
  embusen: string | null; // From example, it looks like a string representation of a tuple
  kiai: boolean | null;
  notes:string | null;
};

export type KataSteps = {
  [key: number]: KataStep;
};

// Kept for compatibility if used elsewhere, can be removed if not needed.
export type Passaggio = {
  movement: string;
  tecnica: string;
  Stand: string;
  Target: string;
  notes?: string;
};

export type Passaggi = {
  [key: number]: Passaggio;
};

export type Sequenze = {
  [key: number]: Passaggi;
};

export type KataInventory = {
  [key: string]: number;
};

export type Transaction = {
  tempo: string;
  direction: string;
};

export type Transactions = {
  [key: number]: Transaction;
};

export type TransactionsMapping = {
    [key: number]: number;
};

export type Tecnica = {
  id_technic: number;
  waza: string;
  name: string;
  description: string;
  notes: string | null;
  resource_url: string | null;
};

export type Tecniche = {
  [key: string]: Tecnica;
};

export type Posizione = {
    id_stand: number;
    name: string;
    description: string;
    illustration_url: string | null;
    notes: string | null;
};

export type Posizioni = {
    [key: string]: Posizione;
};

export type Parte = {
  id_part: number;
  name: string;
  translation: string | null;
  description: string;
  notes: string | null;
  resource_url: string | null;
};

export type Parti = {
  [key:string]: Parte;
};

export type Obiettivo = {
  id_target: number;
  name: string;
  original_name: string;
  description: string;
  notes: string | null;
  resource_url: string | null;
};

export type Obiettivi = {
  [key: number]: Obiettivo;
};

export type Rilevanza = {
  abs_relecance: number;
  relative_relevance: number;
};

export type Rilevanze = {
  [key: number]: Rilevanza;
};
