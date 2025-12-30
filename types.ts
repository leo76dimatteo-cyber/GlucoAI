
export enum MealType {
  BREAKFAST = 'Breakfast',
  SNACK = 'Snack',
  LUNCH = 'Lunch',
  CONTROL = 'Control',
  DINNER = 'Dinner',
  CORRECTION = 'Correction'
}

export enum InsulinType {
  RAPID = 'Rapid-acting',
  LONG = 'Long-acting',
  NONE = 'None'
}

export interface UserProfile {
  id: string; // This will be the Codice Fiscale (tax code)
  name: string;
  password?: string;
  age?: number;
  height?: number; // in cm
  weight?: number; // in kg
  createdAt: string;
}

export interface MealItem {
  name: string;
  portion: string;
  carbs: number;
}

export interface GlucoseLog {
  id: string;
  profileId: string;
  timestamp: string;
  sensorLevel?: number; // mg/dL from Sensor
  stickLevel?: number;  // mg/dL from Fingerstick
  carbs: number; // grams
  insulinUnits: number;
  insulinType: InsulinType;
  mealType: MealType;
  notes: string;
  source?: 'manual' | 'sensor' | 'ai_scan';
}

export interface AIInsight {
  summary: string;
  patterns: string[];
  suggestions: string[];
  warning?: string;
}

export interface DashboardStats {
  averageLevel: number;
  timeInRange: number; // percentage
  hypoCount: number;
  hyperCount: number;
}
