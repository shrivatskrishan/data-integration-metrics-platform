export function parseDateRange(from, to) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    throw new Error('Invalid date range: from and to must be valid ISO dates');
  }
  if (fromDate > toDate) throw new Error('Invalid date range: from must be <= to');
  return { fromDate, toDate, from: fromDate.toISOString(), to: toDate.toISOString() };
}

export function isWithinRange(isoDate, fromDate, toDate) {
  const d = new Date(isoDate);
  return d >= fromDate && d <= toDate;
}

export function bucketKey(isoDate, granularity) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return null;
  if (granularity === 'week') {
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
    return monday.toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}

export function roundMoney(n) { return Math.round(Number(n) * 100) / 100; }