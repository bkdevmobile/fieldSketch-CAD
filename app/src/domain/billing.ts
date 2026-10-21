import type { Plan } from './access';

export interface BillingState {
  plan: Plan; ready: boolean; configured: boolean; price: string | null;
  status: string; processing: boolean; revision: number;
}
export const INITIAL_BILLING: BillingState = {
  plan: 'free', ready: false, configured: false, price: null, status: 'loading', processing: false, revision: -1,
};
// Ignore a late initialization result or stale native callbacks.
export function acceptBilling(current: BillingState, next: BillingState): BillingState {
  return next.revision >= current.revision ? next : current;
}
export const canPurchase = (state: BillingState) => state.ready && state.configured &&
  state.plan !== 'plus' && !!state.price && !state.processing && state.status !== 'pending';
