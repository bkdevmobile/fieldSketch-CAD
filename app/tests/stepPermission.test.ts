import { prepareStepSession } from '../src/domain/stepPermission';

test('pierwsza zgoda odzyskuje sesję zakończoną przez okno Androida', async () => {
  let session: string | null = 'capture-session';
  const request = async () => { session = null; return true; };
  const result = await prepareStepSession('capture-session', request, () => session, async () => { session = 'step-session'; return session; });
  expect(result).toEqual({ sessionId: 'step-session', recovered: true });
});
test('odmowa zgody przywraca sesję do ręcznej długości, ale nie rozpoczyna kroków', async () => {
  let recovered = false;
  await expect(prepareStepSession('capture', async () => false, () => null, async () => { recovered = true; return 'manual-length'; }))
    .rejects.toThrow('Brak zgody');
  expect(recovered).toBe(true);
});
test('wcześniej udzielona zgoda zachowuje sesję bez ponownej kalibracji', async () => {
  const recover = jest.fn();
  expect(await prepareStepSession('capture', async () => true, () => 'capture', recover)).toEqual({ sessionId: 'capture', recovered: false });
  expect(recover).not.toHaveBeenCalled();
});
test('zwykła utrata sesji bez procedury wznowienia nie jest ignorowana', async () => {
  await expect(prepareStepSession('capture', async () => true, () => null)).rejects.toThrow('Sesja zmieniła się');
});
