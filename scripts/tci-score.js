/* TCI Live Score — dashboard frontend (không phụ thuộc thư viện ngoài). */
const CFG = window.TCI_SCORE_CONFIG || {};
const params = new URLSearchParams(location.search);
const API = (params.get('api') || CFG.apiBase || '').replace(/\/$/, '');
const WS_URL = API.replace(/^http/, 'ws') + '/ws/scores';
const PAGE = CFG.pageSize || 100;
const GROUP_CODES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const LIVE_GROUPS = new Set(['E', 'F', 'G', 'H', 'I']);

const LABEL_COLOR = {
  'Rất cao': ['var(--tcs-s4)', true], 'Cao': ['var(--tcs-s3)', false], 'Khá': ['var(--tcs-s2)', false],
  'Trung bình': ['var(--tcs-s1)', false], 'Thấp': ['var(--tcs-s0)', true],
};
const FLAGS = {
  TRAN: ['Trần', 'info', 'Giá đang ở mức trần — sổ lệnh và spread được xử lý trung tính/giới hạn'],
  SAN: ['Sàn', 'warn', 'Giá đang ở mức sàn'],
  TRAN_LIEN_TIEP: ['Trần liên tiếp', 'warn', 'Tăng trần nhiều phiên liên tiếp — rủi ro đầu cơ'],
  DIEU_CHINH_GIA: ['Điều chỉnh giá', 'info', 'Có sự kiện quyền trong 60 phiên; giá lịch sử đã được điều chỉnh'],
  MOI_NIEM_YET: ['Lịch sử ngắn', 'info', 'Dưới 252 phiên giao dịch — độ tin cậy thấp hơn'],
  PHIEN_DINH_KY: ['ATO/ATC', 'info', 'Phiên khớp lệnh định kỳ — sổ lệnh & dòng khớp trung tính'],
  HET_ROOM: ['Hết room', 'info', 'Room ngoại gần hết — tiêu chí khối ngoại trung tính'],
  STALE: ['Trễ dữ liệu', 'warn', 'Luồng dữ liệu đang trễ — phần nhịp phiên tạm đóng băng'],
  THIEU_DU_LIEU: ['Thiếu dữ liệu', 'info', 'Một số tiêu chí trong phiên chưa đủ dữ liệu, nhận điểm trung tính'],
  KHONG_XEP_HANG: ['Không xếp hạng', 'warn', 'Chưa đủ điều kiện xếp hạng (thanh khoản < 5 tỷ/phiên hoặc lịch sử < 60 phiên)'],
  GIOI_HAN_NHAN: ['Giới hạn nhãn', 'warn', 'Nhãn bị giới hạn do giá trần/trần liên tiếp và thanh khoản thấp'],
};
const WARN_FLAGS = new Set(['TRAN_LIEN_TIEP', 'STALE', 'KHONG_XEP_HANG', 'GIOI_HAN_NHAN', 'SAN']);

const S = {
  meta: null, rows: new Map(), regime: {}, status: {}, prevScore: new Map(),
  filter: { q: '', board: '', sector: '', min: 0, conf: 0, eligible: true, hideFlags: false },
  sort: { key: 'sc', dir: -1 }, page: 1, dirty: true, ws: null, wsFails: 0, pollTimer: null,
  detail: null, detailTimer: null,
};

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n1 = (v) => (v == null ? '—' : Number(v).toFixed(1));
const pct = (v, d = 2, sign = true) => (v == null ? '—' : `${sign && v > 0 ? '+' : ''}${(v * 100).toFixed(d)}%`);
const vnd = (v) => (v == null ? '—' : v >= 1e9 ? `${(v / 1e9).toFixed(1)} tỷ` : `${Math.round(v / 1e6)} tr`);
const price = (v) => (v == null ? '—' : Number(v).toLocaleString('vi-VN'));

function fmtValue(v, fmt) {
  if (v == null) return '—';
  switch (fmt) {
    case 'pct': return pct(v, 2);
    case 'ratio': return Number(v).toFixed(2);
    case 'pctile': return `P${Math.round(v)}`;
    case 'bps': return `${Math.round(v)} bps`;
    default: return Number.isInteger(v) ? String(v) : Number(v).toFixed(1);
  }
}
function chip(label) {
  const [c, dark] = LABEL_COLOR[label] || ['var(--tcs-s1)', false];
  return `<span class="tcs-chip" style="--c:${c}"${dark ? ' data-dark' : ''}>${esc(label)}</span>`;
}
function labelColor(label) { return (LABEL_COLOR[label] || ['var(--tcs-s1)'])[0]; }
function flagHtml(code) {
  const f = FLAGS[code];
  if (!f) return '';
  return `<span class="tcs-flag" data-sev="${f[1]}" title="${esc(f[2])}">${esc(f[0])}</span>`;
}

/* ------------------------------------------------------------------ data */
async function getJSON(path) {
  const r = await fetch(API + path, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

function applyRows(rows, replace = false) {
  if (replace) S.rows.clear();
  for (const r of rows) {
    const prev = S.rows.get(r.s);
    if (prev) S.prevScore.set(r.s, prev.sc);
    S.rows.set(r.s, r);
  }
  S.dirty = true;
}

function connectWS() {
  if (!API) return;
  let ws;
  try { ws = new WebSocket(WS_URL); } catch { return startPolling(); }
  S.ws = ws;
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.status) S.status = msg.status;
    if (msg.regime) S.regime = msg.regime;
    if (msg.type === 'snapshot') applyRows(msg.rows, true);
    else if (msg.type === 'update') applyRows(msg.rows);
    S.wsFails = 0;
    stopPolling();
    S.dirty = true;
  };
  ws.onclose = () => {
    S.ws = null;
    S.wsFails += 1;
    S.status = { ...S.status, ws: 'closed' };
    S.dirty = true;
    if (S.wsFails >= 3) startPolling();
    setTimeout(connectWS, Math.min(30000, 1500 * 2 ** S.wsFails));
  };
}
function startPolling() {
  if (S.pollTimer) return;
  const tick = async () => {
    try {
      const d = await getJSON('/api/scores');
      S.status = d.status; S.regime = d.regime; applyRows(d.rows, true);
    } catch { S.status = { ...S.status, ws: 'closed', ready: false }; S.dirty = true; }
  };
  tick();
  S.pollTimer = setInterval(tick, 10000);
}
function stopPolling() { if (S.pollTimer) { clearInterval(S.pollTimer); S.pollTimer = null; } }

/* ------------------------------------------------------------------ render */
function renderStatus() {
  const el = $('#tcs-status');
  const st = S.status || {};
  let state = 'down', text = 'Mất kết nối máy chủ';
  if (st.ready === false && st.progress) { state = 'closed'; text = `Đang khởi tạo: ${st.progress.stage}`; }
  else if (st.ready) {
    if (st.stale) { state = 'stale'; text = 'Dữ liệu đang trễ'; }
    else if (st.demo) { state = 'demo'; text = 'Chế độ mô phỏng'; }
    else if (['CONT', 'ATO', 'ATC'].includes(st.phase)) { state = 'live'; text = st.mode === 'polling' ? 'Đang cập nhật (dự phòng)' : 'Trực tiếp'; }
    else { state = 'closed'; text = st.phase === 'BREAK' ? 'Nghỉ trưa' : 'Ngoài giờ giao dịch'; }
  }
  if (st.ws === 'closed' && !S.pollTimer) { state = 'down'; text = 'Đang kết nối lại…'; }
  el.dataset.state = state;
  $('.tcs-status-text', el).textContent = text;
  $('#tcs-status-meta').textContent = st.clock ? `${st.clock} · v${st.version || ''}` : '';
  $('#tcs-demo').hidden = !st.demo;
}

function renderRegime() {
  const g = S.regime || {};
  const set = (k, v, tone) => { const n = document.querySelector(`[data-k="${k}"]`); if (n) { n.textContent = v; if (tone !== undefined) n.closest('.tcs-tile').dataset.tone = tone; } };
  set('label', g.label || '—', g.label === 'Thuận lợi' ? 'good' : g.label === 'Rủi ro cao' ? 'bad' : '');
  set('label-sub', g.phase ? `Phiên: ${phaseName(g.phase)}` : ' ');
  set('trend', g.trend || '—', g.trend === 'Tăng' ? 'good' : g.trend === 'Giảm' ? 'bad' : '');
  const raw = S.meta?.public_raw;
  set('trend-sub', raw && g.value ? `${g.value.toFixed(2)} (${pct(g.change)})` : (g.change != null ? `Trong phiên ${pct(g.change)}` : ' '));
  set('breadth', g.breadth == null ? '—' : `${Math.round(g.breadth * 100)}%`, g.breadth >= 0.6 ? 'good' : g.breadth <= 0.4 ? 'bad' : '');
  set('breadth-sub', g.advances != null ? `mã tăng · ${g.advances} tăng / ${g.declines} giảm` : ' ');
  set('rvol', g.rvol == null ? '—' : `${g.rvol.toFixed(2)}×`);
  set('limits', g.ceilings == null ? '—' : `${g.ceilings} / ${g.floors}`);
}
const phaseName = (p) => ({ PRE: 'trước giờ', ATO: 'ATO', CONT: 'khớp lệnh liên tục', BREAK: 'nghỉ trưa', ATC: 'ATC', PT: 'sau giờ', CLOSED: 'đóng cửa' }[p] || p);

function filtered() {
  const f = S.filter;
  const q = f.q.trim().toUpperCase();
  let out = [...S.rows.values()].filter((r) => (
    (!q || r.s.includes(q)) && (!f.board || r.b === f.board) && (!f.sector || r.i === f.sector)
    && r.sc >= f.min && r.cf >= f.conf && (!f.eligible || r.el)
    && (!f.hideFlags || !r.fl.some((x) => WARN_FLAGS.has(x)))
  ));
  const { key, dir } = S.sort;
  out.sort((a, b) => {
    const av = a[key] ?? -Infinity, bv = b[key] ?? -Infinity;
    if (typeof av === 'string') return dir * av.localeCompare(bv);
    return dir * (av - bv) || a.s.localeCompare(b.s);
  });
  return out;
}

function rowHtml(r, idx) {
  const names = S.meta?.names || {};
  const gm = S.meta?.groupsMax || {};
  const prev = S.prevScore.get(r.s);
  const flash = prev != null && Math.abs(prev - r.sc) >= 0.5 ? (r.sc > prev ? 'flash-up' : 'flash-down') : '';
  const bars = r.g.map((v, i) => {
    const code = GROUP_CODES[i];
    const h = Math.max(2, Math.round((v / (gm[code] || 1)) * 22));
    return `<i class="${LIVE_GROUPS.has(code) ? 'is-live' : ''}" style="height:${h}px" title="${code}: ${v.toFixed(1)}/${gm[code] || ''}"></i>`;
  }).join('');
  const d5 = r.d5 == null ? '—' : `<span class="${r.d5 > 0 ? 'tcs-delta-up' : r.d5 < 0 ? 'tcs-delta-down' : ''}">${r.d5 > 0 ? '+' : ''}${r.d5.toFixed(1)}</span>`;
  const px = r.px ? `${price(r.px.l)} <span class="${r.px.c > 0 ? 'tcs-delta-up' : r.px.c < 0 ? 'tcs-delta-down' : ''}">${pct(r.px.c)}</span>` : '—';
  return `<tr tabindex="0" data-s="${esc(r.s)}" class="${flash}">
    <td class="c-rank">${idx + 1}</td>
    <td class="c-sym"><b>${esc(r.s)}</b><small>${esc(names[r.s] || '')}</small></td>
    <td class="c-board">${esc(r.b)}</td>
    <td class="c-ind" title="${esc(r.i)}">${esc(r.i || '—')}</td>
    <td class="c-score"><div class="tcs-score"><b>${n1(r.sc)}</b><span class="tcs-bar"><i style="width:${r.sc}%;--c:${labelColor(r.lb)}"></i></span>${chip(r.lb)}</div></td>
    <td class="c-num">${d5}</td>
    <td class="c-num"><span class="tcs-conf" title="Độ tin cậy dữ liệu"><i style="--p:${r.cf}%"></i>${r.cf}</span></td>
    <td class="c-blocks"><div class="tcs-blocks"><span>${Math.round(r.ne)}<span class="tcs-bar"><i style="width:${r.ne}%"></i></span></span><span>${Math.round(r.nh)}<span class="tcs-bar"><i style="width:${r.nh}%;--c:#e8c977"></i></span></span></div></td>
    <td class="c-groups"><span class="tcs-groups" aria-label="Điểm 9 nhóm">${bars}</span></td>
    <td class="c-num">${r.rv == null ? '—' : r.rv.toFixed(2) + '×'}</td>
    <td class="c-num c-px" data-raw>${px}</td>
    <td class="c-flags">${r.fl.map(flagHtml).join('')}</td>
    <td class="c-mobile-meta">${esc(r.b)} · Nền ${Math.round(r.ne)} · Nhịp ${Math.round(r.nh)} · Tin cậy ${r.cf}${r.d5 != null ? ` · Δ5' ${r.d5 > 0 ? '+' : ''}${r.d5.toFixed(1)}` : ''}</td>
  </tr>`;
}

function renderTable() {
  const list = filtered();
  const shown = list.slice(0, S.page * PAGE);
  $('#tcs-tbody').innerHTML = shown.map(rowHtml).join('');
  $('#tcs-empty').hidden = list.length > 0 || S.rows.size === 0;
  $('#tcs-more').hidden = shown.length >= list.length;
  const total = S.rows.size;
  $('#tcs-count').textContent = total ? `${list.length} / ${total} mã` : (S.status?.ready === false ? 'Máy chủ đang khởi tạo dữ liệu…' : 'Đang tải…');
  S.prevScore.clear();
}

function renderSectors() {
  const sel = $('#f-sector');
  const have = new Set([...sel.options].map((o) => o.value));
  const sectors = [...new Set([...S.rows.values()].map((r) => r.i).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
  for (const s of sectors) {
    if (!have.has(s)) sel.insertAdjacentHTML('beforeend', `<option value="${esc(s)}">${esc(s)}</option>`);
  }
}

function frame() {
  if (S.dirty) {
    S.dirty = false;
    renderStatus();
    renderRegime();
    renderSectors();
    renderTable();
  }
}

/* ------------------------------------------------------------------ meta */
async function loadMeta() {
  try {
    const m = await getJSON('/api/meta');
    m.groupsMax = Object.fromEntries(m.groups.map((g) => [g.code, g.max]));
    S.meta = m;
    document.body.classList.toggle('tcs-raw', !!m.public_raw);
    $('#tcs-version').textContent = m.version;
    $('#tcs-disclaimer').textContent = m.disclaimer;
    $('#tcs-weights tbody').innerHTML = m.groups.map((g) => `<tr><td><b>${g.code}</b> · ${esc(g.name)}</td><td>${g.block === 'nen' ? 'Nền' : 'Nhịp phiên'}</td><td>${g.max}</td></tr>`).join('');
    $('#tcs-label-list').innerHTML = m.labels.map((l) => `${chip(l.name)}<span class="tcs-legend-txt"> ≥ ${l.min}</span>`).join(' ');
    $('#tcs-legend').innerHTML = m.labels.map((l) => `<span><i style="background:${labelColor(l.name)}"></i>${esc(l.name)}</span>`).join('');
    S.dirty = true;
  } catch {
    setTimeout(loadMeta, 5000);
  }
}

/* ------------------------------------------------------------------ detail drawer */
const drawer = $('#tcs-drawer');
let lastFocus = null;

async function openDetail(sym) {
  lastFocus = document.activeElement;
  S.detail = sym;
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('#tcs-d-title').textContent = sym;
  $('#tcs-d-sub').textContent = 'Đang tải…';
  $('#tcs-d-body').innerHTML = '';
  drawer.focus();
  await refreshDetail(true);
  clearInterval(S.detailTimer);
  S.detailTimer = setInterval(() => refreshDetail(false), 5000);
}
function closeDetail() {
  S.detail = null;
  clearInterval(S.detailTimer);
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lastFocus?.focus?.();
}

async function refreshDetail(withHistory) {
  const sym = S.detail;
  if (!sym) return;
  try {
    const [d, h] = await Promise.all([getJSON(`/api/scores/${encodeURIComponent(sym)}`),
      withHistory || !S._hist ? getJSON(`/api/scores/${encodeURIComponent(sym)}/history?range=1d`) : Promise.resolve(S._hist)]);
    if (S.detail !== sym) return;
    S._hist = h;
    renderDetail(d, h);
  } catch {
    $('#tcs-d-sub').textContent = 'Không tải được dữ liệu mã này.';
  }
}

function renderDetail(d, hist) {
  const m = S.meta || { groups: [], groupsMax: {} };
  $('#tcs-d-sub').textContent = `${d.n || ''} · ${d.b} · ${d.i || 'Chưa phân ngành'}`;
  const groupRows = m.groups.map((g, i) => {
    const v = d.g[i];
    return `<div class="tcs-gbar ${g.block === 'nhip' ? 'is-live' : ''}"><span>${g.code} · ${esc(g.name)}</span><span class="tcs-bar"><i style="width:${(v / g.max) * 100}%"></i></span><b>${v.toFixed(1)}/${g.max}</b></div>`;
  }).join('');
  const groupName = Object.fromEntries(m.groups.map((g) => [g.code, g.name]));
  let lastG = '';
  const why = d.comps.map((c) => {
    let head = '';
    if (c.group !== lastG) { lastG = c.group; head = `<tr class="grp"><td colspan="3">${c.group} · ${esc(groupName[c.group] || '')}</td></tr>`; }
    const note = [c.note, c.scaled ? 'đã chuẩn hóa theo sàn' : ''].filter(Boolean).join(' · ');
    return `${head}<tr><td>${esc(c.name)}${note ? `<span class="note">${esc(note)}</span>` : ''}</td><td class="num ${c.missing ? 'miss' : ''}">${fmtValue(c.value, c.fmt)}</td><td class="num"><b>${c.points.toFixed(2)}</b> / ${c.max}</td></tr>`;
  }).join('');
  const flags = d.fl.length ? `<ul class="tcs-flag-list">${d.fl.map((f) => `<li>${flagHtml(f)} ${esc((FLAGS[f] || [])[2] || '')}</li>`).join('')}</ul>` : '<p class="tcs-flag-list">Không có cờ cảnh báo.</p>';
  const adj = d.adjustments?.length ? `<p class="tcs-flag-list">Sự kiện điều chỉnh giá gần nhất: ${d.adjustments.map((a) => `${a.d} (×${a.factor})`).join(', ')}</p>` : '';
  const pxRow = d.px ? `<div><span>Giá · %</span><b>${price(d.px.l)} <small class="${d.px.c > 0 ? 'tcs-delta-up' : 'tcs-delta-down'}">${pct(d.px.c)}</small></b></div><div><span>GTGD</span><b>${vnd(d.px.v)}</b></div>` : '';
  $('#tcs-d-body').innerHTML = `
    <div class="tcs-d-hero">
      <div class="tcs-d-score" style="color:${labelColor(d.lb)}">${n1(d.sc)}<small>/100</small><div>${chip(d.lb)}</div></div>
      <div class="tcs-d-kv">
        <div><span>Nền (60)</span><b>${d.nen_pts.toFixed(1)}</b></div>
        <div><span>Nhịp phiên (40)</span><b>${d.nhip_pts.toFixed(1)}</b></div>
        <div><span>Tin cậy</span><b>${d.cf}/100</b></div>
        <div><span>Hạng percentile</span><b>${d.rk == null ? '—' : 'P' + d.rk}</b></div>
        <div><span>Δ 5 phút</span><b>${d.d5 == null ? '—' : (d.d5 > 0 ? '+' : '') + d.d5.toFixed(1)}</b></div>
        <div><span>RVOL</span><b>${d.rv == null ? '—' : d.rv.toFixed(2) + '×'}</b></div>
        ${pxRow}
      </div>
    </div>
    <div class="tcs-d-section"><h3>Diễn biến điểm hôm nay</h3><div class="tcs-chart" id="tcs-chart"></div></div>
    <div class="tcs-d-section"><h3>Điểm theo 9 nhóm</h3>${groupRows}</div>
    <div class="tcs-d-section"><h3>Cờ cảnh báo</h3>${flags}${adj}</div>
    <div class="tcs-d-section"><h3>Vì sao được ${n1(d.sc)} điểm</h3>
      <table class="tcs-why"><thead><tr><th>Tiêu chí</th><th class="num">Giá trị</th><th class="num">Điểm</th></tr></thead><tbody>${why}</tbody></table>
      <p class="tcs-flag-list" style="margin-top:10px">Điểm hiển thị được làm mượt theo thời gian (≈30 giây) nên có thể lệch nhẹ so với tổng điểm tiêu chí tức thời. Lịch sử: ${d.history_days} phiên.</p>
    </div>`;
  drawChart($('#tcs-chart'), hist?.points || []);
}

/* Biểu đồ đường 1 chuỗi (SVG), có crosshair + tooltip */
function drawChart(host, points) {
  if (!host) return;
  if (points.length < 2) { host.innerHTML = '<div class="empty">Chưa đủ dữ liệu trong phiên (lưu mỗi phút).</div>'; return; }
  const W = host.clientWidth || 560, H = host.clientHeight || 180, P = { l: 34, r: 12, t: 12, b: 22 };
  const xs = points.map((p) => p.t), ys = points.map((p) => p.score);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const lo = Math.max(0, Math.floor((Math.min(...ys) - 5) / 10) * 10), hi = Math.min(100, Math.ceil((Math.max(...ys) + 5) / 10) * 10);
  const X = (t) => P.l + ((t - x0) / Math.max(1, x1 - x0)) * (W - P.l - P.r);
  const Y = (v) => P.t + (1 - (v - lo) / Math.max(1, hi - lo)) * (H - P.t - P.b);
  const grid = [];
  for (let v = lo; v <= hi; v += (hi - lo) > 40 ? 20 : 10) grid.push(`<line x1="${P.l}" x2="${W - P.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(255,255,255,.07)"/><text x="${P.l - 6}" y="${Y(v) + 3}" fill="#7f8895" font-size="10" text-anchor="end">${v}</text>`);
  const tf = (t) => new Date(t * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${X(p.t).toFixed(1)},${Y(p.score).toFixed(1)}`).join('');
  const last = points[points.length - 1];
  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Diễn biến điểm trong phiên">
    ${grid.join('')}
    <text x="${P.l}" y="${H - 6}" fill="#7f8895" font-size="10">${tf(x0)}</text>
    <text x="${W - P.r}" y="${H - 6}" fill="#7f8895" font-size="10" text-anchor="end">${tf(x1)}</text>
    <path d="${path}" fill="none" stroke="#d5a53c" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${X(last.t)}" cy="${Y(last.score)}" r="4" fill="#d5a53c" stroke="#15191f" stroke-width="2"/>
    <line class="xh" y1="${P.t}" y2="${H - P.b}" stroke="rgba(255,255,255,.25)" visibility="hidden"/>
    <circle class="xd" r="4" fill="#d5a53c" stroke="#15191f" stroke-width="2" visibility="hidden"/>
    <rect x="${P.l}" y="0" width="${W - P.l - P.r}" height="${H}" fill="transparent"/>
  </svg><div class="tip" hidden></div>`;
  const svg = $('svg', host), tip = $('.tip', host), xh = $('.xh', host), xd = $('.xd', host);
  svg.addEventListener('pointermove', (e) => {
    const rect = svg.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    let best = points[0];
    for (const p of points) if (Math.abs(X(p.t) - mx) < Math.abs(X(best.t) - mx)) best = p;
    const cx = X(best.t), cy = Y(best.score);
    xh.setAttribute('x1', cx); xh.setAttribute('x2', cx); xh.setAttribute('visibility', 'visible');
    xd.setAttribute('cx', cx); xd.setAttribute('cy', cy); xd.setAttribute('visibility', 'visible');
    tip.hidden = false;
    tip.textContent = `${tf(best.t)} · ${best.score.toFixed(1)} điểm · tin cậy ${best.conf}`;
    const left = (cx / W) * rect.width;
    tip.style.left = `${Math.min(rect.width - tip.offsetWidth - 6, Math.max(6, left - tip.offsetWidth / 2))}px`;
  });
  svg.addEventListener('pointerleave', () => { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); xd.setAttribute('visibility', 'hidden'); });
}

/* ------------------------------------------------------------------ events */
function bind() {
  $('#f-search').addEventListener('input', (e) => { S.filter.q = e.target.value; S.page = 1; S.dirty = true; });
  $('#f-board').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    S.filter.board = b.dataset.v; S.page = 1; S.dirty = true;
    $('#f-board').querySelectorAll('button').forEach((x) => x.classList.toggle('is-active', x === b));
  });
  $('#f-sector').addEventListener('change', (e) => { S.filter.sector = e.target.value; S.page = 1; S.dirty = true; });
  $('#f-min').addEventListener('change', (e) => { S.filter.min = Number(e.target.value); S.page = 1; S.dirty = true; });
  $('#f-conf').addEventListener('change', (e) => { S.filter.conf = Number(e.target.value); S.page = 1; S.dirty = true; });
  $('#f-eligible').addEventListener('change', (e) => { S.filter.eligible = e.target.checked; S.page = 1; S.dirty = true; });
  $('#f-hideflags').addEventListener('change', (e) => { S.filter.hideFlags = e.target.checked; S.page = 1; S.dirty = true; });
  $('#tcs-more').addEventListener('click', () => { S.page += 1; S.dirty = true; });
  document.querySelector('.tcs-table thead').addEventListener('click', (e) => {
    const th = e.target.closest('th[data-sort]'); if (!th) return;
    const key = th.dataset.sort;
    S.sort = { key, dir: S.sort.key === key ? -S.sort.dir : (['s', 'b', 'i'].includes(key) ? 1 : -1) };
    document.querySelectorAll('.tcs-table th[data-sort]').forEach((x) => { x.classList.toggle('is-sorted', x === th); x.removeAttribute('aria-sort'); });
    th.setAttribute('aria-sort', S.sort.dir > 0 ? 'ascending' : 'descending');
    S.dirty = true;
  });
  const open = (e) => { const tr = e.target.closest('tr[data-s]'); if (tr) openDetail(tr.dataset.s); };
  $('#tcs-tbody').addEventListener('click', open);
  $('#tcs-tbody').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(e); } });
  drawer.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeDetail(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.detail) closeDetail(); });
}

/* ------------------------------------------------------------------ boot */
function boot() {
  bind();
  if (!API) {
    S.status = { ready: false, progress: { stage: 'chưa cấu hình địa chỉ máy chủ (tci-score-config.js)' } };
    S.dirty = true;
  } else {
    loadMeta();
    connectWS();
  }
  frame();
  setInterval(frame, CFG.renderIntervalMs || 1000);
}
boot();
