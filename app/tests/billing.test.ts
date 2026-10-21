import { acceptBilling, canPurchase, INITIAL_BILLING } from '../src/domain/billing';
import { canAddPoint, canCreateProject } from '../src/domain/access';
import { newProject } from '../src/domain/model';
import { commitMeasurement } from '../src/domain/geometry';
import { sketchExport } from '../src/domain/sketchExport';

test('buy requires initialized billing, store price and no pending operation or existing entitlement', () => {
  const available = { ...INITIAL_BILLING, ready: true, configured: true, price: '29,99 zł', status: 'idle' };
  expect(canPurchase(available)).toBe(true);
  for (const patch of [{ ready: false }, { configured: false }, { price: null }, { processing: true }, { status: 'pending' }, { plan: 'plus' as const }]) {
    expect(canPurchase({ ...available, ...patch })).toBe(false);
  }
});
test('a delayed initialization response cannot overwrite a purchase event', () => {
  const purchased = { ...INITIAL_BILLING, ready: true, revision: 4, plan: 'plus' as const };
  expect(acceptBilling(purchased, { ...INITIAL_BILLING, revision: 0 })).toBe(purchased);
});
test('purchasing at P8 unlocks the same sketch, fourth project, DXF and unwatermarked PNG', () => {
  let project = newProject('Billing regression', 'manual');
  for (let i = 0; i < 7; i++) project = commitMeasurement(project, { source: 'manual', value: 2, unit: 'm' }, i, 'manual', 's', null);
  const before = JSON.stringify(project);
  expect(canAddPoint(project, 'free')).toBe(false);
  expect(canAddPoint(project, 'plus')).toBe(true);
  expect(canCreateProject(3, 'plus')).toBe(true);
  expect(sketchExport(project, 'plus').watermark).toBeNull();
  expect(JSON.stringify(project)).toBe(before);
  expect(sketchExport(project, 'free').watermark).not.toBeNull();
});
