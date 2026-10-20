export async function prepareStepSession(original: string, requestPermission: () => Promise<boolean>,
  currentSession: () => string | null, recover?: () => Promise<string>) {
  const granted = await requestPermission();
  let sessionId = original, recovered = false;
  if (currentSession() !== original) {
    if (!recover) throw new Error('Sesja zmieniła się. Przechwyć kierunek ponownie.');
    sessionId = await recover(); recovered = true;
  }
  if (!granted) throw new Error('Brak zgody na krokomierz. Możesz wpisać długość lub liczbę kroków ręcznie. Zgodę możesz włączyć w ustawieniach aplikacji w telefonie.');
  return { sessionId, recovered };
}
