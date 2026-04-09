export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  phone: string;
  created_at?: string;
}

export interface SimParam {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  def: number;
  step: number;
  desc: string;
}

export interface ParamGroup {
  id: string;
  label: string;
  color: string;
  icon: string;
  params: SimParam[];
}

export type SimValues = Record<string, number>;

export interface Distribution {
  mean: number;
  p10: number;
  p50: number;
  p90: number;
  hist: { counts: number[]; labels: number[] };
}

export interface SimResults {
  avail: Distribution;
  grm: Distribution;
  delay: { mean: number; p90: number };
  stockout: { mean: number; p90: number };
  trials: number;
  ranAt: string;
}
