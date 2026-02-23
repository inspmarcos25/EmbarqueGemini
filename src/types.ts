export type RotationType = '14x14' | '14x21' | '21x21' | '28x28';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'pre-boarding' | 'on-board' | 'time-off';
  completed: boolean;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  employeeId: string;
  phone: string;
  rotationType: RotationType;
  nextBoarding: string;
}

export interface Certification {
  id: string;
  name: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired';
}
