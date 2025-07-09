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
