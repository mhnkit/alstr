/* ===================== UI: helpers and components ===================== */
class Safe { constructor(s) { this.s = s; } toString() { return this.s; } }
const raw = s => new Safe(String(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function hv(v) { if (v == null || v === false || v === true) return ''; if (v instanceof Safe) return v.s; if (Array.isArray(v)) return v.map(hv).join(''); return esc(v); }
function html(s, ...v) { let o = s[0]; for (let i = 0; i < v.length; i++) o += hv(v[i]) + s[i + 1]; return new Safe(o); }
const pressed = b => raw(`aria-pressed="${b ? 'true' : 'false'}"`);
const expanded = b => raw(`aria-expanded="${b ? 'true' : 'false'}"`);
const sel = b => raw(b ? 'selected' : '');
const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : '');
const isAdmin = u => !!u && u.role === 'admin';
const hostOf = x => { try { return new URL(x).hostname; } catch (e) { return ''; } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  bookmark: '<path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>', bookmarkFill: '<path fill="currentColor" d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>', users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  pin: '<path d="M12 17v5M9 10.8a2 2 0 0 1-1.1 1.8l-1.8.9A2 2 0 0 0 5 15.2v.8h14v-.8a2 2 0 0 0-1.1-1.8l-1.8-.9A2 2 0 0 1 15 10.8V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z"/>',
  ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>', flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>', pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', map: '<path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>', trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>', refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36L21 8"/><path d="M21 3v5h-5"/>',
  more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>', upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>', eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>', logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  github: '<path fill="currentColor" stroke="none" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>', back: '<path d="m15 18-6-6 6-6"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>', alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  sparkle: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/>'
};
const ic = (n, cls) => raw(`<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[n] || ''}</svg>`);
const gmark = () => raw('<svg class="gmark" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>');

const ui = {
  route: { name: 'home', id: null }, drafts: {}, errors: {}, modal: null, menu: null, toasts: [], tagQ: {},
  filters: { hack: { q: '', mode: '', theme: '', when: '', prize: '', soon: false, saved: false, ended: false, sort: 'deadline' }, posts: {} },
  openReplies: {}, adminTab: 'overview', inboxTab: 'chats', scoreOpen: false, publicPreview: false, annHidden: false,
  loadingHacks: true, typing: {}, onbStep: 1, theme: 'system', adminLogin: { step: 1 }, busy: false
};
function ensureDraft(k, def) { if (!ui.drafts[k]) ui.drafts[k] = def; return ui.drafts[k]; }
const dv = (dk, name, def) => { const d = ui.drafts[dk]; return d && name in d && d[name] != null ? d[name] : def; };

const roleChip = r => html`<span class="role r-${ROLE_KEY[r] || 'x'}">${r}</span>`;
const tagChip = s => html`<span class="tag">${s}</span>`;
function avatar(u, s) {
  s = s || 36; const n = (u && u.name) || '?';
  const ini = n.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return html`<span class="av" style="--s:${s}px;--h:${u && u.hue != null ? u.hue : 230}" aria-hidden="true">${ini}</span>`;
}
function vlabel(st) {
  if (st === 'verified') return html`<span class="vl ok">${ic('shield')}Verified via GitHub</span>`;
  if (st === 'mixed') return html`<span class="vl mixed">${ic('pen')}Self-reported, results verified</span>`;
  if (st === 'missing') return html`<span class="vl miss">Missing</span>`;
  return html`<span class="vl self">${ic('pen')}Self-reported</span>`;
}
const statusPill = st => html`<span class="status ${st.key}">${st.label}</span>`;
const teamRange = h => (h.minTeam === h.maxTeam ? String(h.maxTeam) : h.minTeam + '–' + h.maxTeam);
function dateRange(a, b) {
  const x = new Date(a), y = new Date(b);
  if (x.toDateString() === y.toDateString()) return fmtDate(a);
  if (x.getMonth() === y.getMonth() && x.getFullYear() === y.getFullYear()) return x.getDate() + '–' + fmtDate(b);
  return fmtDate(a) + ' – ' + fmtDate(b);
}
function deadlineInfo(h) {
  const st = hackStatus(h), t = now();
  if (st.key === 'open') return html`<span class="dl ${h.regDeadline - t < 2 * DAY ? 'hot' : ''}">Registration closes in <b data-cd="${h.regDeadline}">${fmtCountdown(h.regDeadline - t)}</b></span>`;
  if (st.key === 'upcoming' && h.regOpensAt && t < h.regOpensAt) return html`<span class="dl">Registration opens ${fmtDate(h.regOpensAt)}</span>`;
  if (st.key === 'upcoming') return html`<span class="dl">Registration closed. Starts in <b data-cd="${h.startAt}">${fmtCountdown(h.startAt - t)}</b></span>`;
  if (st.key === 'ongoing') return html`<span class="dl">Happening now. Ends in <b data-cd="${h.endAt}">${fmtCountdown(h.endAt - t)}</b></span>`;
  return html`<span class="dl">Ended ${fmtDate(h.endAt, true)}</span>`;
}
function deadlineText(h) {
  const st = hackStatus(h), t = now();
  if (st.key === 'open') return 'Registration closes in ' + fmtDur(h.regDeadline - t);
  if (st.key === 'upcoming' && h.regOpensAt && t < h.regOpensAt) return 'Registration opens ' + fmtDate(h.regOpensAt);
  return 'Starts ' + fmtDate(h.startAt);
}
const empty = (title, body, action) => html`<div class="empty"><h3>${title}</h3>${body ? html`<p>${body}</p>` : ''}${action || ''}</div>`;
const section = (id, title, body, extra) => html`<section class="section" aria-labelledby="s-${id}"><div class="sec-head"><h2 id="s-${id}">${title}</h2>${extra || ''}</div>${body}</section>`;

/* fields */
function F(o) {
  const e = ui.errors[o.name], id = o.id || 'f-' + o.name;
  const desc = e ? id + '-e' : o.hint ? id + '-h' : '';
  const common = raw(`id="${esc(id)}" name="${esc(o.name)}"${desc ? ` aria-describedby="${desc}"` : ''}${e ? ' aria-invalid="true"' : ''}${o.req ? ' aria-required="true"' : ''}${o.attrs ? ' ' + o.attrs : ''}`);
  let ctl;
  if (o.opts) ctl = html`<select ${common}>${o.opts.map(([v, l]) => html`<option value="${v}" ${sel(String(v) === String(o.value == null ? '' : o.value))}>${l}</option>`)}</select>`;
  else if (o.type === 'textarea') ctl = html`<textarea ${common} rows="${o.rows || 4}" placeholder="${o.ph || ''}">${o.value == null ? '' : o.value}</textarea>`;
  else ctl = html`<input ${common} type="${o.type || 'text'}" value="${o.value == null ? '' : o.value}" placeholder="${o.ph || ''}">`;
  return html`<div class="fld ${e ? 'has-err' : ''}"><label for="${id}">${o.label}${o.req ? html`<span class="req" aria-hidden="true">*</span>` : ''}</label>${ctl}${e ? html`<p class="err" id="${id}-e">${e}</p>` : o.hint ? html`<p class="hint" id="${id}-h">${o.hint}</p>` : ''}</div>`;
}
function roleToggles(dk, field, selected, label) {
  return html`<fieldset class="fld"><legend class="lbl">${label}</legend><div class="row" style="gap:6px">${ROLES.map(r => html`<button type="button" class="chip-toggle rt r-${ROLE_KEY[r]}" data-act="draft-toggle" data-dk="${dk}" data-field="${field}" data-val="${r}" ${pressed(selected.includes(r))}>${r}</button>`)}</div>${ui.errors[field] ? html`<p class="err">${ui.errors[field]}</p>` : ''}</fieldset>`;
}
function tagInput(o) {
  const d = ui.drafts[o.dk] || {}, tags = d[o.field] || [], q = ui.tagQ[o.id] || '';
  const sugg = q ? o.sugg.filter(s => lc(s).includes(lc(q)) && !tags.some(t => lc(t) === lc(s))).slice(0, 8) : [];
  return html`<div class="fld ${ui.errors[o.field] ? 'has-err' : ''}"><label for="${o.id}">${o.label}</label>
  <div class="tags-box">${tags.map((t, i) => html`<span class="tag rm">${t}<button type="button" data-act="tag-remove" data-dk="${o.dk}" data-field="${o.field}" data-i="${i}" aria-label="Remove ${t}">${ic('x')}</button></span>`)}
  <input id="${o.id}" data-tag="${o.dk}|${o.field}|${o.max || 20}" value="${q}" placeholder="${tags.length ? 'Add more' : 'Type a skill and press Enter'}" autocomplete="off" aria-describedby="${o.id}-h"></div>
  ${sugg.length ? html`<ul class="sugg" aria-label="Suggestions">${sugg.map(s => html`<li><button type="button" data-act="tag-add" data-dk="${o.dk}" data-field="${o.field}" data-max="${o.max || 20}" data-val="${s}" data-input="${o.id}">${s}</button></li>`)}</ul>` : ''}
  ${ui.errors[o.field] ? html`<p class="err">${ui.errors[o.field]}</p>` : html`<p class="hint" id="${o.id}-h">${o.hint || 'Press Enter or comma after each skill.'}</p>`}</div>`;
}

/* lanyard badge: the student’s identity everywhere it matters */
function lanyard(u, o) {
  o = o || {};
  const sc = computeScore(u), pct = percentile(u), roles = u.profile.roles.length ? u.profile.roles : [];
  return html`<figure class="lanyard ${o.swing ? 'swing' : ''}" style="margin:0 auto" aria-label="${u.name}, Builder Score ${sc.total} out of 1000">
    <div class="strap" aria-hidden="true"></div><div class="clip" aria-hidden="true"></div>
    <div class="badge-card"><div class="slot" aria-hidden="true"></div>
      <div class="badge-top"><span class="wordmark">alstr</span><span>${AVAIL[u.profile.availability] || ''}</span></div>
      <div class="badge-id">${avatar(u, 52)}<div style="min-width:0"><div class="badge-name">${u.name}</div><div class="badge-meta">${uniFactor(u).name}${u.profile.gradYear ? ', class of ' + u.profile.gradYear : ''}</div></div></div>
      <div class="badge-score"><b>${sc.total}</b><span>Builder Score<br>out of 1000</span></div>
      ${pct ? html`<div class="badge-pct">Top ${pct}% on Alstr</div>` : ''}
      <div class="badge-bars">${sc.comps.map(c => html`<div class="bb" title="${c.label}: ${c.points} of ${c.max}"><span>${c.label}</span><i class="${c.status === 'missing' ? 'miss' : ''}" style="--w:${c.max ? Math.round((c.points / c.max) * 100) : 0}%"></i></div>`)}</div>
      <div class="stripe">${roles.length ? roles.slice(0, 3).map(r => html`<span class="r-${ROLE_KEY[r]}">${r}</span>`) : html`<span>No roles yet</span>`}</div>
    </div></figure>`;
}
const MISSING_ACT = { academics: ['academics-edit', 'Add marks'], dsa: ['coding-edit', 'Add stats'], github: ['github-connect', 'Connect GitHub'], resume: ['resume-open', 'Upload resume'] };
function scoreBreakdown(u, sc, own) {
  return html`<div class="sb">${sc.comps.map(c => html`<div><div class="sb-head"><span class="sb-label">${c.label}</span>${vlabel(c.status)}<span class="sb-pts"><b>${c.points}</b> / ${c.max}</span></div>
    <div class="meter ${c.status}" role="img" aria-label="${c.label}: ${c.points} of ${c.max} points"><i style="width:${c.max ? ((c.points / c.max) * 100).toFixed(1) : 0}%"></i></div>
    ${c.status === 'missing' ? html`<p class="sb-miss">${c.missingHint}, so this part counts as 0.${own ? html` <button class="link" data-act="${MISSING_ACT[c.key][0]}">${MISSING_ACT[c.key][1]}</button>` : ''}</p>` : ''}</div>`)}</div>`;
}
function repoTable(c) {
  return html`<div class="tbl-wrap"><table class="repo-tbl"><caption class="sr">Points per repository</caption><thead><tr><th scope="col">Repo</th><th scope="col">Commits, 12 months</th><th scope="col">Stars</th><th scope="col">README</th><th scope="col">Points</th></tr></thead><tbody>
  ${c.repos.slice().sort((a, b) => b.pts - a.pts).map(x => html`<tr><td>${x.r.name}${x.pts && !c.counted.includes(x.r.name) ? html` <span class="muted">(not in top 6)</span>` : ''}</td><td class="num">${x.r.commits12m}</td><td class="num">${x.r.stars}</td><td>${x.r.hasReadme ? 'Yes' : 'No'}</td><td class="num">${x.pts ? round1(x.pts) : html`<span class="muted">0, ${lc(x.why)}</span>`}</td></tr>`)}</tbody></table></div>`;
}
function scoreExplain(u, sc) {
  const w = DB.config.weights;
  return html`<div class="explain"><p class="small muted">Each part is scored from 0 to 100%, then scaled by its weight. Alstr admins set the weights: academics ${w.academics}%, DSA ${w.dsa}%, GitHub ${w.github}%, resume ${w.resume}%.</p>
  ${sc.comps.map(c => html`<div><h3 class="row">${c.label}<span class="small muted" style="font-weight:600">${c.weight}% weight</span>${vlabel(c.status)}</h3>
    ${c.status === 'missing' ? html`<p class="small muted" style="margin-top:6px">${c.missingHint}, so it counts as 0.</p>` : html`<dl class="kv">${c.inputs.map(i => html`<div><dt>${i.label}</dt><dd>${i.value}${i.note ? html` <span>${i.note}</span>` : ''}</dd></div>`)}</dl>${c.key === 'github' ? repoTable(c) : ''}<p class="small">${fmtPct(c.score)} of ${c.max} points = <b>${c.points}</b></p>`}</div>`)}
  <p><b>Total: ${sc.comps.map(c => c.points).join(' + ')} = ${sc.total} out of 1000</b></p></div>`;
}
function lineChart(pts) {
  if (!pts || pts.length < 2) return html`<p class="small muted">Your score history appears after your next change.</p>`;
  const W = 600, Hh = 170, xs = pts.map(p => p.at), ys = pts.map(p => p.score);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.max(0, Math.floor((Math.min(...ys) - 40) / 50) * 50), y1 = Math.min(1000, Math.ceil((Math.max(...ys) + 40) / 50) * 50);
  const px = t => 40 + ((t - x0) / (x1 - x0 || 1)) * (W - 56), py = v => 12 + (1 - (v - y0) / (y1 - y0 || 1)) * (Hh - 40);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + px(p.at).toFixed(1) + ' ' + py(p.score).toFixed(1)).join(' ');
  const grid = [y0, Math.round((y0 + y1) / 2), y1];
  return raw(`<svg class="chart" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Builder Score history, from ${ys[0]} to ${ys[ys.length - 1]}">
  ${grid.map(g => `<line class="gl" x1="40" x2="${W - 16}" y1="${py(g)}" y2="${py(g)}"/><text class="ax" x="34" y="${py(g) + 4}" text-anchor="end">${g}</text>`).join('')}
  <path class="ar" d="${d} L${px(x1)} ${py(y0)} L${px(x0)} ${py(y0)} Z"/><path class="ln" d="${d}"/>
  ${pts.map(p => `<circle class="pt" cx="${px(p.at).toFixed(1)}" cy="${py(p.score).toFixed(1)}" r="4"><title>${esc(fmtDate(p.at, true))}: ${p.score} (${esc(p.reason || '')})</title></circle>`).join('')}
  <text class="ax" x="40" y="${Hh - 6}">${esc(fmtDate(x0, true))}</text><text class="ax" x="${W - 16}" y="${Hh - 6}" text-anchor="end">${esc(fmtDate(x1, true))}</text></svg>`);
}
const skeletonRows = n => html`<div class="hack-list" aria-busy="true" aria-label="Loading hackathons">${Array.from({ length: n }, () => html`<div class="hrow"><div class="sk" style="width:64px;height:64px;border-radius:12px"></div><div class="stack" style="gap:8px"><div class="sk" style="height:18px;width:55%"></div><div class="sk" style="height:14px;width:80%"></div><div class="sk" style="height:22px;width:40%"></div></div></div>`)}</div>`;

/* ===================== layout and routing ===================== */
function parseHash() {
  const h = decodeURIComponent((location.hash || '').slice(1));
  if (!h) return { name: '', id: null };
  const i = h.indexOf('-');
  return i < 0 ? { name: h, id: null } : { name: h.slice(0, i), id: h.slice(i + 1) };
}
function resolveRoute() {
  let r = parseHash(); const u = me();
  if (!r.name) r = { name: u ? (u.role === 'admin' ? 'admin' : 'hackathons') : 'home', id: null };
  if (u && u.role === 'student' && !u.onboarded && !['onboarding', 'home'].includes(r.name)) r = { name: 'onboarding', id: null };
  if (u && u.onboarded && r.name === 'onboarding') r = { name: 'me', id: null };
  if (u && u.role === 'admin' && ['me', 'onboarding', 'teams', 'inbox'].includes(r.name)) r = { name: 'admin', id: null };
  if (r.name === 'u' && u && r.id === u.id) r = { name: 'me', id: null };
  if (r.name === 'admin' && r.id === 'login' && isAdmin(u)) r = { name: 'admin', id: null };
  const tgt = '#' + r.name + (r.id ? '-' + r.id : '');
  if (location.hash !== tgt) { try { history.replaceState(null, '', tgt); } catch (e) { /* ignore */ } }
  ui.route = r;
}
function go(h) { if (location.hash === '#' + h) { resolveRoute(); render(); } else location.hash = h; }
function layout() {
  const u = me(), ann = DB.config.announcement;
  return html`<button class="skip" data-act="skip">Skip to content</button>
  ${ann.enabled && ann.text && !ui.annHidden ? html`<div class="announce ${ann.tone}" role="region" aria-label="Announcement"><div class="wrap ann-in"><p>${ann.text}</p><button class="icon-btn sm" data-act="ann-hide" aria-label="Dismiss announcement">${ic('x')}</button></div></div>` : ''}
  ${topbar(u)}
  <main id="main" tabindex="-1" class="wrap page page-${ui.route.name}">${view(u)}</main>
  ${u && u.role === 'student' && u.onboarded ? tabbar(u) : ''}
  <button class="demo-fab" data-act="demo" aria-label="Demo controls">${ic('sliders')}<span>Demo controls</span></button>`;
}
function topbar(u) {
  const notifN = u ? DB.notifications.filter(n => n.userId === u.id && !n.read).length : 0;
  const stu = u && u.role === 'student';
  const msgN = stu ? unreadTotal(u.id) + requestCount(u.id) : 0;
  const teamN = stu ? DB.invites.filter(i => i.status === 'pending' && ((i.kind === 'invite' && i.toId === u.id) || (i.kind === 'request' && T(i.teamId) && T(i.teamId).leaderId === u.id))).length : 0;
  const r = ui.route.name, onb = stu && !u.onboarded;
  const nl = (href, label, n, names) => html`<a href="#${href}" ${raw((names || [href]).includes(r) ? 'aria-current="page"' : '')}>${label}${n ? html`<span class="count"><span class="sr">, </span>${n > 9 ? '9+' : n}<span class="sr"> new</span></span>` : ''}</a>`;
  return html`<header class="topbar"><div class="wrap tb-in"><a class="wordmark" href="#${u ? (isAdmin(u) ? 'admin' : 'hackathons') : 'home'}" aria-label="Alstr home">alstr</a>
    ${onb ? '' : html`<nav class="tb-nav" aria-label="Main">${nl('hackathons', 'Hackathons', 0, ['hackathons', 'h'])}${stu ? html`${nl('teams', 'Teams', teamN, ['teams', 'team'])}${nl('inbox', 'Inbox', msgN)}` : ''}${isAdmin(u) ? nl('admin', 'Admin') : ''}</nav>`}
    <span class="grow"></span>
    ${onb ? '' : html`<button class="search-btn" data-act="search-open" aria-label="Search students and hackathons">${ic('search')}<span>Search</span><kbd aria-hidden="true">/</kbd></button>`}
    ${u ? html`${onb ? '' : html`<a class="icon-btn tb-bell" href="#notifications" aria-label="Notifications${notifN ? ', ' + notifN + ' unread' : ''}">${ic('bell')}${notifN ? html`<span class="count" aria-hidden="true">${notifN > 9 ? '9+' : notifN}</span>` : ''}</a>`}
      <div class="menu-wrap"><button class="acct-btn" data-act="menu" data-id="acct" ${expanded(ui.menu === 'acct')} aria-haspopup="true" aria-label="Account menu">${avatar(u, 34)}</button>
      ${ui.menu === 'acct' ? html`<div class="menu"><div class="menu-head"><b>${u.name}</b><span class="tiny muted">${u.email}</span></div><hr>${stu && u.onboarded ? html`<a href="#me">${ic('user')}Your profile</a>` : ''}<a href="#account">${ic('sliders')}Settings and privacy</a>${isAdmin(u) ? html`<a href="#admin">${ic('shield')}Admin dashboard</a>` : ''}<hr><button data-act="logout">${ic('logout')}Log out</button></div>` : ''}</div>`
      : html`<button class="btn primary sm" data-act="google">Sign in</button>`}</div></header>`;
}
function tabbar(u) {
  const r = ui.route.name, nN = DB.notifications.filter(n => n.userId === u.id && !n.read).length, mN = unreadTotal(u.id) + requestCount(u.id);
  const t = (href, label, icon, names, n) => html`<a href="#${href}" ${raw(names.includes(r) ? 'aria-current="page"' : '')}>${ic(icon)}<span>${label}</span>${n ? html`<span class="count"><span class="sr">, </span>${n > 9 ? '9+' : n}<span class="sr"> new</span></span>` : ''}</a>`;
  return html`<nav class="tabbar" aria-label="Main">${t('hackathons', 'Hackathons', 'cal', ['hackathons', 'h'])}${t('teams', 'Teams', 'users', ['teams', 'team'])}${t('inbox', 'Inbox', 'msg', ['inbox'], mN)}${t('notifications', 'Alerts', 'bell', ['notifications'], nN)}${t('me', 'Profile', 'user', ['me'])}</nav>`;
}
const notFound = msg => html`<div class="narrow empty" style="margin-top:40px"><h1>Not found</h1><p>${msg}</p><a class="btn secondary" href="#hackathons">Go to hackathons</a></div>`;
const needLogin = what => html`<div class="narrow empty" style="margin-top:40px"><h1>Sign in to continue</h1><p>${what || 'Profiles, posts, teams and messages'} are only visible to signed-in students.</p><button class="btn gbtn lg" data-act="google">${gmark()}Continue with Google</button><a href="#hackathons" class="small">Browse hackathons without signing in</a></div>`;
const view403 = () => html`<div class="narrow empty" style="margin-top:40px"><h1>Admins only</h1><p>This page needs an allow-listed admin account with two-factor authentication. Every admin action is also checked on the server, not just hidden here.</p><a class="btn secondary" href="#admin-login">Admin login</a></div>`;
function view(u) {
  const r = ui.route;
  switch (r.name) {
    case 'home': return viewHome(u);
    case 'hackathons': return viewHackathons(u);
    case 'h': return viewHackathon(u, r.id);
    case 'admin': if (r.id === 'login') return viewAdminLogin(u); if (!u) return needLogin('The admin dashboard'); if (!isAdmin(u)) return view403(); return viewAdmin(u);
  }
  if (!u) return needLogin(r.name === 'u' ? 'Student profiles' : null);
  switch (r.name) {
    case 'onboarding': return viewOnboarding(u);
    case 'me': return viewProfile(u, u, true);
    case 'u': return viewProfile(u, U(r.id), false);
    case 'teams': return viewTeams(u);
    case 'team': return viewTeam(u, T(r.id));
    case 'inbox': return viewInbox(u, r.id);
    case 'notifications': return viewNotifications(u);
    case 'account': return viewAccount(u);
  }
  return notFound('This page doesn’t exist.');
}
