import { Farmer, MilkEntry } from '@/types/milk';

const FARMERS_KEY = 'milk_center_farmers';
const ENTRIES_KEY = 'milk_center_entries';

export const getFarmers = (): Farmer[] => {
  const data = localStorage.getItem(FARMERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveFarmer = (farmer: Farmer): void => {
  const farmers = getFarmers();
  farmers.push(farmer);
  localStorage.setItem(FARMERS_KEY, JSON.stringify(farmers));
};

export const updateFarmer = (farmer: Farmer): void => {
  const farmers = getFarmers();
  const index = farmers.findIndex(f => f.id === farmer.id);
  if (index !== -1) {
    farmers[index] = farmer;
    localStorage.setItem(FARMERS_KEY, JSON.stringify(farmers));
  }
};

export const deleteFarmer = (id: string): void => {
  const farmers = getFarmers().filter(f => f.id !== id);
  localStorage.setItem(FARMERS_KEY, JSON.stringify(farmers));
};

export const getEntries = (): MilkEntry[] => {
  const data = localStorage.getItem(ENTRIES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEntry = (entry: MilkEntry): void => {
  const entries = getEntries();
  entries.push(entry);
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
};

export const getEntriesByDate = (date: string): MilkEntry[] => {
  return getEntries().filter(e => e.date === date);
};

export const getEntriesByFarmer = (farmerId: string): MilkEntry[] => {
  return getEntries().filter(e => e.farmerId === farmerId);
};

export const getEntriesByMonth = (month: number, year: number): MilkEntry[] => {
  return getEntries().filter(e => {
    const entryDate = new Date(e.date);
    return entryDate.getMonth() === month && entryDate.getFullYear() === year;
  });
};

export const calculateRate = (fatPercentage: number): number => {
  // Base rate calculation based on fat percentage
  // Base rate: ₹30 for 3.5% fat, +₹5 for each 0.5% increase
  const baseFat = 3.5;
  const baseRate = 30;
  const rateIncrease = 5;
  const fatDiff = (fatPercentage - baseFat) / 0.5;
  return Math.round((baseRate + (fatDiff * rateIncrease)) * 100) / 100;
};
