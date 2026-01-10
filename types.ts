export enum WasteCategory {
  BIODEGRADABLE = 'Biodegradable',
  RECYCLABLE = 'Recyclable',
  NON_RECYCLABLE = 'Non-Recyclable',
  HAZARDOUS = 'Hazardous',
  E_WASTE = 'E-Waste',
  UNKNOWN = 'Unknown'
}

export interface WasteItem {
  itemName: string;
  material: string;
  category: WasteCategory;
  confidence: number;
  disposalInstruction: string;
  recyclingTips: string[];
  funFact?: string;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  items: WasteItem[];
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}
