export interface SignData {
  title: string;
  role: string;
  dates: string;
  description: string;
  worldX: number;
}

export interface DecorationData {
  type: 'building' | 'tree' | 'lamp' | 'flag' | 'arch-building' | 'tower' | 'palm-tree' | 'church' | 'yt-headquarters' | 'google-bike' | 'android-statue' | 'food-cart' | 'bench' | 'lab-building' | 'microscope' | 'dna-helix' | 'yc-logo' | 'molecule-logo' | 'planter-box' | 'crane' | 'safety-cone' | 'scaffold' | 'material-pile' | 'mini-excavator' | 'barrier' | 'hard-hat-flag' | 'building-wip' | 'yt-screen' | 'play-button-trophy' | 'camera-ring-light';
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
    groundColor: 0x808080,
    groundTopColor: 0x6E6E6E,
    sign: {
      title: 'YOUTUBE',
      role: 'Senior Software Engineer',
      dates: '2021 - 2023',
      description: 'Led video processing\npipeline team.',
      worldX: 460,
    },
    decorations: [
      { type: 'google-bike', worldX: 295, width: 16, height: 11, color: 0x4285F4 },
      { type: 'google-bike', worldX: 313, width: 16, height: 11, color: 0x34A853 },
      { type: 'yt-headquarters', worldX: 340, width: 60, height: 40, color: 0xE8E8E8 },
      { type: 'bench', worldX: 405, width: 12, height: 8, color: 0x8B6914 },
      { type: 'yt-screen', worldX: 420, width: 24, height: 22, color: 0x222222 },
      { type: 'play-button-trophy', worldX: 485, width: 14, height: 20, color: 0xC0C0C0 },
      { type: 'camera-ring-light', worldX: 515, width: 18, height: 24, color: 0x444444 },
    ],
  },
  {
    name: 'mantebio',
    label: 'MANTEBIO',
    startX: 560,
    endX: 840,
    groundColor: 0x2E3640,
    groundTopColor: 0x242C32,
    sign: {
      title: 'MANTEBIO',
      role: 'Co-Founder & CTO',
      dates: '2023 - 2024',
      description: 'Built biotech data\nplatform from scratch.',
      worldX: 740,
    },
    decorations: [
      { type: 'molecule-logo', worldX: 572, width: 22, height: 24, color: 0xA2ABFB },
      { type: 'lab-building',  worldX: 620, width: 50, height: 40, color: 0xA2ABFB },
      { type: 'dna-helix',     worldX: 690, width: 12, height: 36, color: 0xA2ABFB },
      { type: 'yc-logo',     worldX: 790, width: 14, height: 18, color: 0xFF6600 },
    ],
  },
  {
    name: 'shepherd',
    label: 'SHEPHERD',
    startX: 840,
    endX: 1120,
    groundColor: 0xC2A66B,
    groundTopColor: 0xA68B4B,
    sign: {
      title: 'SHEPHERD',
      role: 'Design Engineer',
      dates: '2024 - Present',
      description: 'AI-powered insurance\nfor construction.',
      worldX: 1020,
    },
    decorations: [
      { type: 'barrier',        worldX: 855,  width: 14, height: 10, color: 0xF2C94C },
      { type: 'safety-cone',    worldX: 878,  width: 6,  height: 10, color: 0xFF6B35 },
      { type: 'material-pile',  worldX: 896,  width: 16, height: 12, color: 0xF2C94C },
      { type: 'crane',          worldX: 920,  width: 24, height: 56, color: 0xF2C94C },
      { type: 'building-wip',   worldX: 948,  width: 36, height: 40, color: 0xF2C94C },
      { type: 'scaffold',       worldX: 990,  width: 20, height: 32, color: 0x888888 },
      { type: 'mini-excavator', worldX: 1050, width: 20, height: 14, color: 0xF2C94C },
      { type: 'hard-hat-flag',  worldX: 1100, width: 6,  height: 28, color: 0xF2C94C },
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
