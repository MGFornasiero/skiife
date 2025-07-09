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

export const sequenze: Sequenze = {
  1: {
    1: {
      movement: "Fwd",
      tecnica: "Teisho Uchi",
      Stand: "Zenkutsu dachi",
      Target: "Chudan",
    },
    2: {
      movement: "Bkw",
      tecnica: "(Gyaku) Age uke",
      Stand: "Zenkutsu dachi",
      Target: "Chudan",
    },
    3: {
      movement: "Still",
      tecnica: "Haito Uchi",
      Stand: "Zenkutsu dachi",
      Target: "Chudan",
    },
    4: {
      movement: "Still",
      tecnica: "Mae Enpi Uchi",
      Stand: "Zenkutsu dachi",
      Target: "Chudan",
    },
  },
  2: {
    1: {
      movement: "Fwd",
      tecnica: "Keito uke",
      Stand: "Zenkutsu dachi",
      Target: "Chudan",
    },
    2: {
      movement: "Still",
      tecnica: "Otoshi Enpi Uchi",
      Stand: "Sochin dachi",
      Target: "Chudan",
    },
    3: {
      movement: "Fwd",
      tecnica: "Soto Ude uke",
      Stand: "Zenkutsu dachi",
      Target: "Chudan",
    },
    4: {
      movement: "Still",
      tecnica: "(Gyaku) Uraken Uchi",
      Stand: "Zenkutsu dachi",
      Target: "Jodan",
    },
  },
};
