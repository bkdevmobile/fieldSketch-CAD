import { ErrorReportingPrompt, type ErrorReportRequest } from '../src/infrastructure/errorReportingPrompt';
import { AccessLimitError } from '../src/domain/access';

function harness(overrides = {}) {
  const state = { available: true, ready: true, enabled: false, asked: false, ...overrides };
  const publish = jest.fn<void, [ErrorReportRequest | null]>();
  const send = jest.fn();
  const save = jest.fn(async (decision: { errorReporting: boolean; errorReportingAsked: true }) => {
    state.enabled = decision.errorReporting; state.asked = decision.errorReportingAsked;
  });
  const dependencies = { state: () => state, publish, send, save };
  return { state, publish, send, save, dependencies, flow: new ErrorReportingPrompt(dependencies) };
}

test('first error asks once without sending, including concurrent errors', () => {
  const h = harness(), first = new TypeError('private details');
  h.flow.handle(first); h.flow.handle(new Error('another error'));
  expect(h.publish).toHaveBeenCalledTimes(1);
  expect(h.publish).toHaveBeenCalledWith({ id: 1, error: first });
  expect(h.send).not.toHaveBeenCalled(); expect(h.save).not.toHaveBeenCalled();
});

test('approval sends the original error only after consent is saved, once', async () => {
  const h = harness(), error = new Error('failed export');
  let finishSave!: () => void;
  h.save.mockImplementationOnce(() => new Promise<void>(resolve => { finishSave = resolve; }));
  h.flow.handle(error);
  const pending = h.flow.answer(1, true);
  expect(h.save).toHaveBeenCalledWith({ errorReporting: true, errorReportingAsked: true });
  expect(h.send).not.toHaveBeenCalled();
  await h.flow.answer(1, true); expect(h.save).toHaveBeenCalledTimes(1);
  finishSave(); await pending;
  expect(h.send).toHaveBeenCalledTimes(1); expect(h.send).toHaveBeenCalledWith(error);
});

test('declining persists without sending and prevents questions after restart', async () => {
  const h = harness(); h.flow.handle(new Error('failure'));
  await h.flow.answer(1, false);
  expect(h.save).toHaveBeenCalledWith({ errorReporting: false, errorReportingAsked: true });
  expect(h.send).not.toHaveBeenCalled();
  h.publish.mockClear();
  new ErrorReportingPrompt(h.dependencies).handle(new Error('after restart'));
  expect(h.publish).not.toHaveBeenCalled();
});

test('existing consent sends normally, and withdrawal does not trigger a new question', () => {
  const h = harness({ enabled: true, asked: true }), error = new Error('failure');
  h.flow.handle(error); expect(h.send).toHaveBeenCalledWith(error); expect(h.publish).not.toHaveBeenCalled();
  h.state.enabled = false; h.send.mockClear(); h.flow.handle(new Error('after withdrawal'));
  expect(h.send).not.toHaveBeenCalled(); expect(h.publish).not.toHaveBeenCalled();
});

test('failed consent persistence cannot send, and a stale answer cannot grant consent', async () => {
  const h = harness(); h.flow.handle(new Error('failure'));
  await h.flow.answer(99, true); expect(h.save).not.toHaveBeenCalled();
  h.save.mockRejectedValueOnce(new Error('database full'));
  await expect(h.flow.answer(1, true)).rejects.toThrow('database full');
  expect(h.send).not.toHaveBeenCalled();
  h.flow.handle(new Error('repeat')); expect(h.publish).toHaveBeenCalledTimes(2); // question, then dismissal
});

test('no prompt when reporting is unavailable, storage is not ready or the free limit is reached', () => {
  for (const state of [{ available: false }, { ready: false }]) {
    const h = harness(state); h.flow.handle(new Error('failure'));
    expect(h.publish).not.toHaveBeenCalled(); expect(h.send).not.toHaveBeenCalled();
  }
  const h = harness(); h.flow.handle(new AccessLimitError('projects')); h.flow.handle('not an exception');
  expect(h.publish).not.toHaveBeenCalled(); expect(h.send).not.toHaveBeenCalled();
});
