import fs from 'node:fs';
import assert from 'node:assert/strict';
import { buildTradeChart } from '../scripts/charts.js';
import { initOfferTimer, OFFER_KEY, OFFER_DURATION } from '../scripts/offer-timer.js';

const data = JSON.parse(fs.readFileSync(new URL('../content/proof-data.json', import.meta.url), 'utf8'));
const source = fs.readFileSync(new URL('../index-aug04.js', import.meta.url), 'utf8');
const balanceDeclaration = source.match(/const tradeBalances = (\[[^;]+\]);/)[0];
const statDeclaration = source.match(/const reportStats = (\{[\s\S]*?\});/)[0];
const balances = JSON.parse(source.match(/const tradeBalances = (\[[^;]+\]);/)[1]);
assert.deepEqual(data.mt5.balances, balances);
const stats = Function(statDeclaration + 'return reportStats;')();
for (const [key, value] of Object.entries(stats)) assert.equal(data.mt5[key], value);
const formatDeclaration = source.match(/const formatNumber = [\s\S]*?\}\)\.format\(value\);/)[0];
const chartDeclaration = source.match(/const buildTradeChart = [\s\S]*?\n  \};/)[0];
const original = Function(balanceDeclaration + statDeclaration + formatDeclaration + chartDeclaration + 'return buildTradeChart();')();
const generated = buildTradeChart(data.mt5);
for (const pattern of [/points="([^"]+)"/, /d="(M[^"]+)"/]) assert.equal(generated.match(pattern)[1], original.match(pattern)[1]);
assert.equal(data.ssi.customers, 225);
assert.equal(data.ssi.aum, '80 tỷ');
assert.equal(data.crypto.roi, '+353,39%');
assert.equal(data.crypto.cutoff, '23.02.2026');
console.log(`Proof parity passed: ${balances.length} balances, all original stats, polyline/area geometry.`);

const makeDocument = () => {
  const output = { textContent: '' };
  const clock = { dataset: {}, querySelector() { return output; } };
  const prices = [{ textContent: '' }, { textContent: '' }];
  let intervals = 0;
  return {
    output, clock, prices,
    querySelectorAll(selector) { return selector === '.private-offer-clock' ? [clock] : prices; },
    defaultView: { setInterval() { intervals++; return intervals; }, clearInterval() { intervals--; } },
    intervalCount() { return intervals; }
  };
};
let now = 1900000000000;
const values = new Map();
const storage = { getItem(key) { return values.get(key) || null; }, setItem(key, value) { values.set(key, value); } };
const fresh = makeDocument();
const timer = initOfferTimer({ root: fresh, storage, now: () => now });
assert.equal(values.get(OFFER_KEY), String(now));
assert.equal(timer.getPricing().vnd, 11250000);
assert.equal(timer.getPricing().usdt, 420);
assert.equal(fresh.output.textContent, 'Còn 72:00:00');
assert.equal(initOfferTimer({ root: fresh, storage, now: () => now }), timer);
assert.equal(fresh.intervalCount(), 1);
now += OFFER_DURATION - 1000;
timer.update();
assert.equal(fresh.output.textContent, 'Còn 00:00:01');
now += 1000;
timer.update();
assert.deepEqual(timer.getPricing(), { active: false, remaining: 0, vnd: 15000000, usdt: 555 });
assert.equal(fresh.output.textContent, 'Ưu đãi đã kết thúc');
assert.equal(fresh.prices[0].textContent, '15.000.000đ');
const refresh = initOfferTimer({ root: makeDocument(), storage, now: () => now });
assert.equal(refresh.getPricing().active, false);
const blocked = initOfferTimer({ root: makeDocument(), now: () => now, storage: { getItem() { throw Error('blocked'); } } });
assert.equal(blocked.getPricing().remaining, OFFER_DURATION);
assert.equal(blocked.getPricing().vnd, 11250000);
const writeBlocked = initOfferTimer({ root: makeDocument(), now: () => now, storage: { getItem() { return null; }, setItem() { throw Error('blocked'); } } });
assert.equal(writeBlocked.getPricing().usdt, 420);
timer.destroy();
assert.equal(fresh.intervalCount(), 0);
console.log('Offer contract passed: fresh visit, refresh, exact expiry, storage get/set failures, one timer per document.');
