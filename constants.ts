
import { MealType, InsulinType } from "./types";

export const GLUCOSE_THRESHOLDS = {
  HYPO: 70,
  HYPER: 180,
  TARGET_MIN: 80,
  TARGET_MAX: 130
};

export const INITIAL_LOGS = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    sensorLevel: 110,
    carbs: 45,
    insulinUnits: 5,
    insulinType: InsulinType.RAPID,
    mealType: MealType.BREAKFAST,
    notes: 'Lettura mattutina regolare'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    sensorLevel: 165,
    stickLevel: 170,
    carbs: 60,
    insulinUnits: 7,
    insulinType: InsulinType.RAPID,
    mealType: MealType.LUNCH,
    notes: 'Controllo incrociato con pungidito'
  }
];
