export interface SignData {
  title: string;
  role: string;
  dates: string;
  description: string;
  worldX: number;
}

export interface DecorationData {
  type: 'building' | 'tree' | 'lamp' | 'flag' | 'arch-building' | 'tower' | 'palm-tree' | 'church';
  worldX: number;
  width: number;
  height: number;
  color: number;
}

export interface CloudData {
  worldX: number;
  worldY: number;
  width: number;
  height: number;
}

export interface ZoneData {
  name: string;
  label: string;
  startX: number;
  endX: number;
  groundColor: number;
  groundTopColor: number;
  sign: SignData;
  decorations: DecorationData[];
}

const ZONES: ZoneData[] = [
  {
    name: 'stanford',
    label: 'STANFORD',
    startX: 0,
    endX: 280,
    groundColor: 0x5B8C3E,
    groundTopColor: 0x4A7A2E,
    sign: {
      title: 'STANFORD',
      role: 'B.S. Computer Science',
      dates: '2015 - 2019',
      description: 'Studied CS with focus on\nAI and systems.',
      worldX: 180,
    },
    decorations: [
      { type: 'flag', worldX: 8, width: 6, height: 28, color: 0x8B0000 },
      { type: 'palm-tree', worldX: 30, width: 8, height: 30, color: 0x228B22 },
      { type: 'church', worldX: 55, width: 50, height: 44, color: 0xD2B48C },
      { type: 'tower', worldX: 120, width: 10, height: 56, color: 0xC4A070 },
      { type: 'palm-tree', worldX: 145, width: 8, height: 32, color: 0x228B22 },
      { type: 'palm-tree', worldX: 220, width: 8, height: 28, color: 0x228B22 },
      { type: 'palm-tree', worldX: 255, width: 8, height: 30, color: 0x228B22 },
    ],
  },
  {
    name: 'youtube',
    label: 'YOUTUBE',
    startX: 280,
    endX: 560,
    groundColor: 0x696969,
    groundTopColor: 0x505050,
    sign: {
      title: 'YOUTUBE',
      role: 'Senior Software Engineer',
      dates: '2021 - 2023',
      description: 'Led video processing\npipeline team.',
      worldX: 460,
    },
    decorations: [
      { type: 'building', worldX: 340, width: 44, height: 44, color: 0xFF4444 },
      { type: 'lamp', worldX: 410, width: 4, height: 20, color: 0xCCCCCC },
      { type: 'tree', worldX: 520, width: 10, height: 20, color: 0x228B22 },
    ],
  },
  {
    name: 'mantebio',
    label: 'MANTEBIO',
    startX: 560,
    endX: 840,
    groundColor: 0x8FBC8F,
    groundTopColor: 0x6B8E6B,
    sign: {
      title: 'MANTEBIO',
      role: 'Co-Founder & CTO',
      dates: '2023 - 2024',
      description: 'Built biotech data\nplatform from scratch.',
      worldX: 740,
    },
    decorations: [
      { type: 'building', worldX: 620, width: 36, height: 36, color: 0x2E8B57 },
      { type: 'tree', worldX: 680, width: 12, height: 24, color: 0x006400 },
      { type: 'lamp', worldX: 800, width: 4, height: 20, color: 0xAAAAAA },
    ],
  },
  {
    name: 'shepherd',
    label: 'SHEPHERD',
    startX: 840,
    endX: 1120,
    groundColor: 0xC0C0C0,
    groundTopColor: 0x909090,
    sign: {
      title: 'SHEPHERD',
      role: 'Co-Founder & CEO',
      dates: '2024 - Present',
      description: 'Building AI-powered\ntools for the future.',
      worldX: 1020,
    },
    decorations: [
      { type: 'building', worldX: 900, width: 44, height: 42, color: 0x7B68EE },
      { type: 'tree', worldX: 970, width: 10, height: 20, color: 0x228B22 },
      { type: 'flag', worldX: 1090, width: 6, height: 28, color: 0x6A0DAD },
    ],
  },
];

const CLOUDS: CloudData[] = [
  { worldX: 40, worldY: 15, width: 24, height: 8 },
  { worldX: 180, worldY: 25, width: 16, height: 6 },
  { worldX: 350, worldY: 10, width: 20, height: 7 },
  { worldX: 500, worldY: 30, width: 28, height: 9 },
  { worldX: 620, worldY: 18, width: 18, height: 6 },
  { worldX: 760, worldY: 8, width: 22, height: 8 },
  { worldX: 900, worldY: 22, width: 16, height: 6 },
  { worldX: 1050, worldY: 12, width: 24, height: 8 },
];

export { ZONES, CLOUDS };
