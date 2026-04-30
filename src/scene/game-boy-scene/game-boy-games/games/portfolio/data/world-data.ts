export interface SignData {
  title: string;
  role: string;
  dates: string;
  description: string;
  worldX: number;
}

export interface DecorationData {
  type: 'building' | 'tree' | 'lamp' | 'flag' | 'arch-building' | 'tower' | 'palm-tree' | 'church' | 'yt-headquarters' | 'google-bike' | 'android-statue' | 'food-cart' | 'sofa' | 'lab-building' | 'microscope' | 'dna-helix' | 'yc-logo' | 'planter-box' | 'crane' | 'safety-cone' | 'scaffold' | 'material-pile' | 'mini-excavator' | 'barrier' | 'hard-hat-flag' | 'building-wip' | 'yt-screen' | 'camera-ring-light' | 'yt-backdrop' | 'camera-preview' | 'lab-table' | 'stanford-billboard' | 'shepherd-billboard' | 'mantle-billboard' | 'youtube-billboard';
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
    endX: 250,
    groundColor: 0x5B8C3E,
    groundTopColor: 0x4A7A2E,
    sign: {
      title: 'STANFORD',
      role: 'B.A. Architecture\nM.S. Computer Science',
      dates: '2017 - 2021',
      description: '',
      worldX: 168,
    },
    decorations: [
      { type: 'flag', worldX: 8, width: 6, height: 28, color: 0x8B0000 },
      { type: 'palm-tree', worldX: 28, width: 8, height: 30, color: 0x228B22 },
      { type: 'church', worldX: 50, width: 50, height: 44, color: 0xD2B48C },
      { type: 'tower', worldX: 113, width: 10, height: 56, color: 0xC4A070 },
      { type: 'palm-tree', worldX: 136, width: 8, height: 32, color: 0x228B22 },
      { type: 'stanford-billboard', worldX: 158, width: 50, height: 64, color: 0x8C1515 },
      { type: 'palm-tree', worldX: 208, width: 8, height: 28, color: 0x228B22 },
      { type: 'palm-tree', worldX: 235, width: 8, height: 30, color: 0x228B22 },
    ],
  },
  {
    name: 'youtube',
    label: 'YOUTUBE',
    startX: 250,
    endX: 530,
    groundColor: 0x808080,
    groundTopColor: 0x6E6E6E,
    sign: {
      title: 'YOUTUBE',
      role: 'Full Stack SWE',
      dates: 'Sep 2021 - May 2023',
      description: '',
      worldX: 430,
    },
    decorations: [
      { type: 'youtube-billboard', worldX: 255, width: 50, height: 64, color: 0xFFFFFF },
      { type: 'google-bike', worldX: 310, width: 16, height: 11, color: 0x4285F4 },
      { type: 'yt-headquarters', worldX: 332, width: 60, height: 40, color: 0xE8E8E8 },
      { type: 'sofa', worldX: 400, width: 14, height: 9, color: 0x8B6914 },
      { type: 'yt-screen', worldX: 420, width: 24, height: 22, color: 0x222222 },
      { type: 'yt-backdrop', worldX: 455, width: 40, height: 38, color: 0x00CC44 },
      { type: 'camera-ring-light', worldX: 500, width: 18, height: 24, color: 0x444444 },
      { type: 'camera-preview', worldX: 510, width: 22, height: 18, color: 0x333333 },
    ],
  },
  {
    name: 'mantebio',
    label: 'MANTLE',
    startX: 530,
    endX: 720,
    groundColor: 0x2E3640,
    groundTopColor: 0x242C32,
    sign: {
      title: 'MANTLE',
      role: 'Founding FE Eng\n+ UX Designer',
      dates: 'Oct 2023 - Jun 2024',
      description: '',
      worldX: 560,
    },
    decorations: [
      { type: 'mantle-billboard', worldX: 535, width: 50, height: 64, color: 0x2E3640 },
      { type: 'lab-table', worldX: 589, width: 36, height: 22, color: 0xA2ABFB },
      { type: 'lab-building',  worldX: 629, width: 50, height: 40, color: 0xA2ABFB },
      { type: 'dna-helix',     worldX: 683, width: 12, height: 36, color: 0xA2ABFB },
      { type: 'yc-logo',     worldX: 699, width: 14, height: 18, color: 0xFF6600 },
    ],
  },
  {
    name: 'shepherd',
    label: 'SHEPHERD',
    startX: 720,
    endX: 950,
    groundColor: 0xC2A66B,
    groundTopColor: 0xA68B4B,
    sign: {
      title: 'SHEPHERD',
      role: 'Founding Design Eng.',
      dates: 'Jun 2024 - Present',
      description: '',
      worldX: 840,
    },
    decorations: [
      { type: 'shepherd-billboard', worldX: 725, width: 50, height: 64, color: 0xF2C94C },
      { type: 'barrier',        worldX: 780,  width: 14, height: 10, color: 0xF2C94C },
      { type: 'safety-cone',    worldX: 798,  width: 6,  height: 10, color: 0xFF6B35 },
      { type: 'crane',          worldX: 800,  width: 24, height: 56, color: 0xF2C94C },
      { type: 'building-wip',   worldX: 832,  width: 52, height: 40, color: 0xF2C94C },
      { type: 'mini-excavator', worldX: 899, width: 20, height: 14, color: 0xF2C94C },
      { type: 'hard-hat-flag',  worldX: 934, width: 6,  height: 28, color: 0xF2C94C },
    ],
  },
];

const CLOUDS: CloudData[] = [
  { worldX: 40, worldY: 15, width: 24, height: 8 },
  { worldX: 170, worldY: 25, width: 16, height: 6 },
  { worldX: 320, worldY: 10, width: 20, height: 7 },
  { worldX: 470, worldY: 30, width: 28, height: 9 },
  { worldX: 580, worldY: 18, width: 18, height: 6 },
  { worldX: 650, worldY: 8, width: 22, height: 8 },
  { worldX: 750, worldY: 22, width: 16, height: 6 },
  { worldX: 900, worldY: 12, width: 24, height: 8 },
];

export { ZONES, CLOUDS };
