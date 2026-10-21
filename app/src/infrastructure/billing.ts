import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { NativeModule, requireOptionalNativeModule } from 'expo-modules-core';
import { acceptBilling, BillingState, INITIAL_BILLING } from '../domain/billing';

declare class BillingModule extends NativeModule<{ billingChanged: (state: BillingState) => void }> {
  initialize(): Promise<BillingState>;
  refresh(restore: boolean): Promise<void>;
  purchase(): Promise<void>;
}
const native = requireOptionalNativeModule<BillingModule>('OutlineGoBilling');
export const billing = () => native;

export function useBilling() {
  const [state, setState] = useState(INITIAL_BILLING);
  const alive = useRef(true);
  const failed = () => { if (alive.current) setState(previous => ({ ...previous, ready: true, processing: false, price: null, status: 'unavailable' })); };
  const refresh = async (restore = false) => { try { await native?.refresh(restore); } catch { failed(); } };
  const purchase = async () => { try { await native?.purchase(); } catch { failed(); } };
  useEffect(() => {
    alive.current = true;
    if (!native) {
      setState({ ...INITIAL_BILLING, ready: true, status: 'unavailable' });
      return () => { alive.current = false; };
    }
    const listener = native.addListener('billingChanged', next => {
      if (alive.current) setState(current => acceptBilling(current, next));
    });
    void native.initialize().then(next => {
      if (!alive.current) return;
      setState(current => acceptBilling(current, next));
      void refresh();
    }).catch(failed);
    const subscription = AppState.addEventListener('change', value => { if (value === 'active') void refresh(); });
    return () => { alive.current = false; listener.remove(); subscription.remove(); };
  }, []);
  return { state, refresh, purchase };
}
