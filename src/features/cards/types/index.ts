import { CardStatus, Currency } from '@/types/common';

export interface Card {
  id: string;
  user_id: string;
  wallet_id: string;
  card_type: 'virtual' | 'physical';
  card_brand: 'visa' | 'mastercard' | 'verve';
  masked_card_number: string;
  card_name: string;
  nickname: string | null;
  expiry_date: string;
  cvv: string;
  balance: number;
  currency: Currency;
  status: CardStatus;
  daily_limit: number;
  monthly_limit: number;
  billing_address: BillingAddress | null;
  controls: CardControls;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface BillingAddress {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface CardControls {
  online_payments: boolean;
  atm_withdrawals: boolean;
  international_transactions: boolean;
  contactless_payments: boolean;
}

export interface CreateCardRequest {
  wallet_id: string;
  card_type: 'virtual' | 'physical';
  card_brand: 'visa' | 'mastercard' | 'verve';
  nickname?: string;
  daily_limit?: number;
  monthly_limit?: number;
  billing_address?: BillingAddress;
}

export interface UpdateCardRequest {
  nickname?: string;
  daily_limit?: number;
  monthly_limit?: number;
  billing_address?: BillingAddress;
}

export interface FundCardRequest {
  amount: number;
  pin: string;
}

export interface UpdateCardControlsRequest {
  online_payments?: boolean;
  atm_withdrawals?: boolean;
  international_transactions?: boolean;
  contactless_payments?: boolean;
}

export interface CardTransaction {
  id: string;
  card_id: string;
  amount: number;
  currency: Currency;
  merchant_name: string;
  merchant_category: string;
  transaction_type: 'purchase' | 'withdrawal' | 'refund';
  status: 'pending' | 'completed' | 'declined' | 'reversed';
  description: string;
  created_at: string;
}
