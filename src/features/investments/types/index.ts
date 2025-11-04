export type InvestmentType = 'fixed_deposit' | 'bonds' | 'mutual_funds' | 'stocks' | 'real_estate';
export type RiskLevel = 'low' | 'medium' | 'high';
export type InvestmentStatus = 'active' | 'matured' | 'liquidated' | 'cancelled';

export interface InvestmentProduct {
  id: string;
  name: string;
  type: InvestmentType;
  description: string;
  min_amount: number;
  max_amount: number | null;
  min_duration_days: number;
  max_duration_days: number;
  interest_rate: number;
  risk_level: RiskLevel;
  currency_code: string;
  features: string[];
  terms_and_conditions: string;
  is_active: boolean;
}

export interface Investment {
  id: string;
  user_id: string;
  product: InvestmentProduct;
  wallet_id: string;
  amount: number;
  duration_days: number;
  interest_rate: number;
  expected_returns: number;
  actual_returns: number | null;
  status: InvestmentStatus;
  start_date: string;
  maturity_date: string;
  liquidation_date: string | null;
  auto_renew: boolean;
  penalty_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvestmentRequest {
  product_id: string;
  wallet_id: string;
  amount: number;
  duration_days: number;
  auto_renew?: boolean;
}

export interface CalculateReturnsRequest {
  product_id: string;
  amount: number;
  duration_days: number;
}

export interface CalculateReturnsResponse {
  principal: number;
  interest_earned: number;
  total_returns: number;
  interest_rate: number;
  duration_days: number;
  maturity_date: string;
}

export interface LiquidateInvestmentRequest {
  investment_id: string;
  wallet_id: string;
  pin: string;
}

export interface LiquidationResponse {
  investment_id: string;
  amount_returned: number;
  penalty_amount: number;
  net_amount: number;
  status: string;
}

export interface RenewInvestmentRequest {
  investment_id: string;
  duration_days?: number;
}

export interface InvestmentPortfolio {
  total_invested: number;
  current_value: number;
  total_returns: number;
  return_on_investment: number;
  active_investments: number;
  investments_by_type: Record<InvestmentType, number>;
  investments_by_risk: Record<RiskLevel, number>;
}

export interface PortfolioDetails extends InvestmentPortfolio {
  investments: Investment[];
  performance_metrics: {
    best_performer: Investment | null;
    worst_performer: Investment | null;
    average_return: number;
  };
}
