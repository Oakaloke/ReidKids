const test = require('node:test');
const assert = require('node:assert/strict');
const { seasonForDate, TIME_ZONE, CALENDAR } = require('../thanksgiving.js');
test('Eastern dates and inclusive annual boundaries (2026–2036)', () => {
  assert.equal(TIME_ZONE, 'America/New_York');
  for (let year = 2026; year <= 2036; year++) {
    for (const [instant, expected] of [
      [`${year}-01-01T04:59:59.999Z`, 'christmas'],
      [`${year}-01-01T05:00:00.000Z`, 'new-year'],
      [`${year}-01-08T04:59:59.999Z`, 'new-year'],
      [`${year}-01-08T05:00:00.000Z`, 'default'],
      [`${year}-11-20T17:00:00.000Z`, 'thanksgiving'],
      [`${year}-12-01T04:59:59.999Z`, 'thanksgiving'],
      [`${year}-12-01T05:00:00.000Z`, 'christmas'],
      [`${year}-07-01T12:00:00.000Z`, 'default']
    ]) assert.equal(seasonForDate(new Date(instant)), expected, instant);
    // Construct each boundary using the actual Eastern DST offset for that year.
    const fmt = new Intl.DateTimeFormat('en-US', {timeZone: TIME_ZONE, timeZoneName: 'longOffset'});
    for (const { id, start, end } of CALENDAR) {
      for (const [day, isStart] of [[start,true],[end,false]]) {
        const midday = new Date(`${year}-${day}T12:00:00Z`);
        const offset = fmt.formatToParts(midday).find(x => x.type === 'timeZoneName').value.slice(3);
        const startOffset = fmt.formatToParts(new Date(`${year}-${day}T00:00:00Z`)).find(x => x.type === 'timeZoneName').value.slice(3);
        const midnight = new Date(`${year}-${day}T00:00:00${startOffset}`);
        if (isStart) {
          assert.equal(seasonForDate(midnight), id);
          assert.notEqual(seasonForDate(new Date(+midnight-1)), id);
        } else {
          assert.equal(seasonForDate(new Date(`${year}-${day}T23:59:59.999${offset}`)), id);
          assert.notEqual(seasonForDate(new Date(`${year}-${day}T23:59:59.999${offset}`)-0+1), id);
        }
      }
    }
  }
});
test('invalid timestamps fail explicitly instead of choosing a wrong season',()=> {
  assert.throws(()=>seasonForDate(new Date('invalid')), RangeError);
});
