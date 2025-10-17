export type BodyPart = 'sx' | 'dx' | 'both';
export type Sides = 'sx' | 'dx' | 'frontal';
export type Hips = 'hanmi' | 'gyaku-hanmi' | 'shomen';

export type TargetHgt = 'gedan' | 'chudan' | 'jodan' | 'any';
export type Tempo = 'Legato' | 'Fast' | 'Normal' | 'Slow' | 'Breath';
export type WazaType = 'uke' | 'tsuki' | 'uchi' | 'keri' | 'other';
export type AbsoluteDirections = 'N' | 'NE' | 'E' | 'SE' franchising | 'S' | 'SO' | 'O' | 'NO';
export type Movements = 'Fwd' | 'Bkw' | 'Still';

export type DetailedNotes = {
    arto: BodyPart,
    description: string | null,
    explanation: string | null,
    note: string | null
};

export type EmbusenPoints = {
    x: number,
    y: number
};

export type KataSeries = 'heian' | 'tekki' | 'other';
