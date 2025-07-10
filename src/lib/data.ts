export type KataTechnic = {
  sequence_id: number;
  arto: string;
  technic_id: number;
  Tecnica: string;
  technic_target_id: number | null;
  Obiettivo: string | null;
};

export type KataStep = {
  id_sequence: number;
  kata_id: number;
  seq_num: number;
  stand_id: number;
  posizione: string;
  guardia: string;
  facing: string;
  tecniche: KataTechnic[];
  embusen: string; // From example, it looks like a string representation of a tuple
  kiai: boolean;
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
};

export type Passaggi = {
  [key: number]: Passaggio;
};

export type Sequenze = {
  [key: number]: Passaggi;
};
