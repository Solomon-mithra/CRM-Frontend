export interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'negotiation' | 'closed' | 'lost';
  source: string;
  budget_min: number | null;
  budget_max: number | null;
  property_interest: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  activity_count: number;
}

export interface Activity {
  id: number;
  lead_id: number;
  user_id: number;
  activity_type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  notes: string | null;
  duration: number | null;
  activity_date: string;
  created_at: string;
  user_name: string;
}
