export const formatNumber = (value, digits = 2) => new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits
}).format(value);

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

/** Preserve the effective August chart geometry and every source balance. */
export function buildTradeChart(report, gradientId = 'tciTradeAreaAug04') {
  const values = report.balances.length ? report.balances : [report.initial, report.final];
  const width = 760, height = 270, padX = 18, padY = 22;
  const min = Math.min(...values), max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = padX + index * ((width - padX * 2) / Math.max(values.length - 1, 1));
    const y = height - padY - ((value - min) / range) * (height - padY * 2);
    return [x.toFixed(2), y.toFixed(2)];
  });
  const line = points.map((point) => point.join(',')).join(' ');
  const area = `${points[0][0]},${height - padY} ${line} ${points.at(-1)[0]},${height - padY}`;
  const grid = [0.25, 0.5, 0.75].map((ratio) => `<line class="grid" x1="${padX}" x2="${width - padX}" y1="${(padY + ratio * (height - padY * 2)).toFixed(1)}" y2="${(padY + ratio * (height - padY * 2)).toFixed(1)}"/>`).join('');
  const id = escapeHtml(gradientId);
  return `<div class="tci-trade-chart-wrap"><svg class="tci-trade-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(report.chartLabel)}"><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#079b76" stop-opacity=".34"/><stop offset="1" stop-color="#079b76" stop-opacity="0"/></linearGradient></defs>${grid}<path class="area" style="fill:url(#${id})" d="M${area.replaceAll(',', ' ')} Z"/><polyline class="line" points="${line}"/><circle class="start" cx="${points[0][0]}" cy="${points[0][1]}" r="4"/><circle class="end" cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" r="5"/></svg><div class="tci-trade-caption"><span>${formatNumber(report.initial, 0)} USD · đầu kỳ</span><span>${formatNumber(report.final)} USD · cuối kỳ</span></div></div>`;
}
