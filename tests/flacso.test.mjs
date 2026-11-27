import test from 'node:test';
import assert from 'node:assert/strict';
import { toolHandlers } from '../build/tools/flacso.js';

test('lists offers with authenticated v1 client', async () => {
  const client = { v1: { get: async (path) => {
    assert.equal(path, '/flacso/reporting/offers');
    return { data: { ok: true, offers: [] } };
  } } };
  const result = await toolHandlers.flacso_list_offers(client, {});
  assert.deepEqual(JSON.parse(result.content[0].text), { ok: true, offers: [] });
});
test('passes filters and rejects invalid inputs before HTTP', async () => {
  let calls = 0;
  const client = { v1: { get: async (path, options) => {
    calls++;
    assert.equal(path, '/flacso/reporting/emails');
    assert.deepEqual(options.params, { range: '7d', offer: 42 });
    return { data: { ok: true } };
  } } };
  await toolHandlers.flacso_get_email_summary(client, { range: '7d', offer: 42 });
  for (const args of [{ range: 'bad' }, { offer: -1 }, { offer: '42' }, { offer: 1.5 }]) {
    await assert.rejects(toolHandlers.flacso_get_email_summary(client, args));
  }
  assert.equal(calls, 1);
});
