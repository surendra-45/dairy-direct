export interface Farmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  createdAt: Date;
}

export interface MilkEntry {
  id: string;
  farmerId: string;
  farmerName: string;
  date: string;
  session: 'morning' | 'evening';
  fatPercentage: number;
  quantity: number;
  ratePerLiter: number;
  totalAmount: number;
  createdAt: Date;
}

export interface DailyStats {
  totalQuantity: number;
  totalAmount: number;
  morningQuantity: number;
  eveningQuantity: number;
  farmersCount: number;
}

export interface MonthlyStatement {
  farmerId: string;
  farmerName: string;
  phone: string;
  month: string;
  year: number;
  entries: MilkEntry[];
  totalQuantity: number;
  totalAmount: number;
  averageFat: number;
}
