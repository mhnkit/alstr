/* ===================== render loop ===================== */
const app = document.getElementById('app'), modalRoot = document.getElementById('modal-root'), toastRoot = document.getElementById('toast-root');
const caps = { downloads: null, sample: null };
let confirmFn = null, lastFocus = null, renderQ = false, tickN = 0;
function scheduleRender() { if (renderQ) return; renderQ = true; requestAnimationFrame(() => { renderQ = false; render(); }); }
function domPath(el) { const p = []; while (el && el.parentElement) { if (el.id === 'app' || el.id === 'modal-root') { p.unshift(el.id); return p; } p.unshift([...el.parentElement.children].indexOf(el)); el = el.parentElement; } return null; }
function fromPath(p) { if (!p) return null; let el = document.getElementById(p[0]); for (let i = 1; i < p.length && el; i++) el = el.children[p[i]]; return el; }
function beforeRender() {
  const u = me();
  if (u && u.role === 'student' && ui.route.name === 'inbox' && ui.route.id) {
    const c = C(ui.route.id);
    if (c && convParticipants(c).includes(u.id) && (unreadIn(u.id, c) || DB.notifications.some(n => n.userId === u.id && n.convId === c.id && !n.read))) api.markRead(c.id);
  }
}
function sizeInbox() {
  const ib = app.querySelector('.inbox'); if (!ib) return;
  const tb = app.querySelector('.tabbar'), off = (tb && getComputedStyle(tb).display !== 'none' ? tb.offsetHeight : 0) + 18;
  ib.style.height = Math.max(420, Math.round(innerHeight - (ib.getBoundingClientRect().top + scrollY) - off)) + 'px';
}
window.addEventListener('resize', sizeInbox);
function render() {
  if (!DB) return;
  beforeRender();
  const a = document.activeElement; let fid = null, fpath = null, selr = null, ftag = '';
  if (a && a !== document.body) { fid = a.id || null; ftag = a.tagName; if (!fid) fpath = domPath(a); try { if (typeof a.selectionStart === 'number') selr = [a.selectionStart, a.selectionEnd]; } catch (e) { /* not selectable */ } }
  const keep = {};
  document.querySelectorAll('[data-keep]').forEach(el => { keep[el.dataset.keep] = { top: el.scrollTop, bottom: el.scrollHeight - el.scrollTop - el.clientHeight < 60, n: el.children.length }; });
  const mb = document.querySelector('.m-body'), mTop = mb ? mb.scrollTop : 0, hadModal = !!modalRoot.firstElementChild;
  app.innerHTML = String(layout());
  document.body.classList.toggle('has-tabbar', !!app.querySelector('.tabbar'));
  sizeInbox();
  modalRoot.innerHTML = ui.modal ? String(renderModal()) : '';
  document.querySelectorAll('[data-keep]').forEach(el => { const k = keep[el.dataset.keep]; el.scrollTop = !k || k.bottom || el.children.length !== k.n ? el.scrollHeight : k.top; });
  if (ui.modal && hadModal && mTop) { const nb = document.querySelector('.m-body'); if (nb) nb.scrollTop = mTop; }
  if (ui.modal && !hadModal) focusModal();
  else {
    let t = fid ? document.getElementById(fid) : fromPath(fpath);
    if (t && ftag && t.tagName !== ftag) t = null;
    if (t) { t.focus({ preventScroll: true }); if (selr && typeof t.setSelectionRange === 'function') { try { t.setSelectionRange(selr[0], selr[1]); } catch (e) { /* ignore */ } } }
  }
  const titles = { home: 'Find hackathon teammates', hackathons: 'Hackathons', h: (H(ui.route.id) || {}).name, me: 'Your profile', u: (U(ui.route.id) || {}).name, onboarding: 'Welcome', teams: 'Teams', team: (T(ui.route.id) || {}).name, inbox: 'Inbox', notifications: 'Notifications', account: 'Settings and privacy', admin: ui.route.id === 'login' ? 'Admin login' : 'Admin' };
  document.title = (titles[ui.route.name] || 'Alstr') + ' – Alstr';
}
function focusModal() { const m = modalRoot.querySelector('.modal'); if (!m) return; const f = m.querySelector('.m-body input:not([type=hidden]):not([readonly]):not(.sr), .m-body select, .m-body textarea:not([readonly])') || m.querySelector('.m-body button, .m-body a[href]') || m.querySelector('button'); if (f) f.focus(); }
function openModal(m) { const a = document.activeElement; if (!ui.modal) lastFocus = a && a !== document.body ? (a.id ? { id: a.id } : { path: domPath(a) }) : null; ui.errors = {}; ui.menu = null; ui.modal = m; render(); }
function closeModal() { ui.modal = null; ui.errors = {}; confirmFn = null; ui.busy = false; render(); if (lastFocus) { const el = lastFocus.id ? document.getElementById(lastFocus.id) : fromPath(lastFocus.path); if (el) el.focus(); lastFocus = null; } }
function confirmModal(o, fn) { openModal(Object.assign({ type: 'confirm' }, o)); confirmFn = fn; }
function toast(title, o) {
  o = o || {}; const id = uid('t');
  ui.toasts.push({ id, title, body: o.body || '', tone: o.tone || '', link: o.link || '' }); if (ui.toasts.length > 4) ui.toasts.shift();
  renderToasts(); setTimeout(() => { ui.toasts = ui.toasts.filter(t => t.id !== id); renderToasts(); }, o.tone === 'err' ? 7000 : 4800);
}
function renderToasts() { toastRoot.innerHTML = String(html`${ui.toasts.map(t => html`<div class="toast ${t.tone}" role="${t.tone === 'err' ? 'alert' : 'status'}"><div><b>${t.title}</b>${t.body ? html`<p>${t.body}</p>` : ''}${t.link ? html`<a href="#${t.link}">Open</a>` : ''}</div><button data-act="toast-x" data-id="${t.id}" aria-label="Dismiss">${ic('x')}</button></div>`)}`); }
function handleErr(e) {
  if (e && e.isApp) {
    if (e.field) {
      ui.errors = { [e.field]: e.message }; render();
      const el = document.querySelector(`[name="${e.field}"]`) || document.getElementById('f-' + e.field);
      if (el) el.focus(); else toast(e.message, { tone: 'err' });
    } else toast(e.message, { tone: 'err' });
  } else { console.error(e); toast('Something went wrong', { tone: 'err', body: String((e && e.message) || e) }); }
}
function requireLogin() { if (me()) return true; openModal({ type: 'google' }); return false; }
function doSignIn(email, name) {
  const r = api.googleSignIn({ email, name });
  ui.modal = null; ui.onbStep = 1; ui.drafts = {}; ui.publicPreview = false; ui.scoreOpen = false; ui.errors = {};
  toast(r.isNew ? 'Account created' : 'Welcome back, ' + firstName(r.user), { body: r.isNew ? 'Let’s set up your profile. It takes about two minutes.' : '' });
  sweep();
  go(r.isNew || !r.user.onboarded ? 'onboarding' : ui.route.name === 'h' ? 'h-' + ui.route.id : 'hackathons');
}
function demoAs(who) {
  if (me()) api.logout();
  ui.modal = null; ui.drafts = {}; ui.adminLogin = { step: 1 }; ui.publicPreview = false;
  if (who === 'arjun') doSignIn('arjun.menon@gmail.com', 'Arjun Menon');
  else if (who === 'riya') doSignIn('riya.kapoor@gmail.com', 'Riya Kapoor');
  else if (who === 'admin') { api.adminVerify('admin@alstr.dev', totp()); toast('Signed in as admin', { body: 'The demo filled in the authenticator code for you.' }); go('admin'); }
  else { toast('Signed out', { body: 'You’re browsing as a visitor.' }); go('home'); }
}
function setTheme(v) { ui.theme = v; try { localStorage.setItem('alstr.theme', v); } catch (e) { /* ignore */ } applyTheme(); render(); }
function applyTheme() { const r = document.documentElement; if (ui.theme === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', ui.theme); }
function setPath(obj, path, v) { const k = path.split('.'); let o = obj; for (let i = 0; i < k.length - 1; i++) o = o[k[i]] = o[k[i]] || {}; o[k[k.length - 1]] = v; }
function addTag(dk, field, val, max, inputId) {
  val = String(val || '').trim().replace(/,+$/, '').trim(); if (!val) return;
  const d = ui.drafts[dk] = ui.drafts[dk] || {}, a = d[field] = d[field] || [];
  const canon = SKILLS.find(s => lc(s) === lc(val)) || val;
  ui.tagQ[inputId] = '';
  if (canon.length > 40) { toast('Keep each skill under 40 characters.', { tone: 'err' }); return render(); }
  if (!a.some(x => lc(x) === lc(canon))) { if (a.length >= max) { toast(`You can add up to ${max}.`, { tone: 'err' }); return render(); } a.push(canon); }
  delete ui.errors[field]; render();
  const el = document.getElementById(inputId); if (el) el.focus();
}
async function copyText(id) {
  const el = document.getElementById(id); if (!el) return;
  try { await navigator.clipboard.writeText(el.value || el.textContent); toast('Copied'); }
  catch (e) { el.focus(); el.select(); try { document.execCommand('copy'); toast('Copied'); } catch (e2) { toast('Select the text and copy it yourself', { tone: 'err' }); } }
}
async function doExport() {
  const json = api.exportData();
  if (caps.downloads) {
    try { await caps.downloads.save({ filename: 'alstr-data-' + new Date(now()).toISOString().slice(0, 10) + '.json', data: json }); toast('Export saved'); return; }
    catch (e) { if (e && e.code === 'declined') return; }
  }
  openModal({ type: 'export', json });
}

/* ===================== actions ===================== */
const ACT = {
  'skip': () => { const m = document.getElementById('main'); if (m) m.focus(); },
  'ann-hide': () => { ui.annHidden = true; render(); },
  'toast-x': d => { ui.toasts = ui.toasts.filter(t => t.id !== d.id); renderToasts(); },
  'menu': d => { ui.menu = ui.menu === d.id ? null : d.id; render(); },
  'modal-close': () => closeModal(),
  'demo': () => openModal({ type: 'demo' }),
  'search-open': () => { ui.searchQ = ''; openModal({ type: 'search' }); },
  'google': () => openModal({ type: 'google' }),
  'google-pick': d => doSignIn(d.email, d.name),
  'logout': () => { api.logout(); ui.modal = null; ui.drafts = {}; toast('Logged out'); go('home'); },
  'theme': d => setTheme(d.v),
  'bookmark': d => { if (!requireLogin()) return; const on = api.toggleBookmark(d.id); toast(on ? 'Saved' : 'Removed from saved', { body: on ? 'You’ll get a reminder 48 hours before registration closes.' : '' }); render(); },
  'hf-toggle': d => { ui.filters.hack[d.k] = !ui.filters.hack[d.k]; render(); },
  'hf-clear': () => { Object.assign(ui.filters.hack, { q: '', mode: '', theme: '', when: '', prize: '', soon: false, saved: false, ended: false }); render(); },
  'pf-type': d => { ui.filters.posts[d.id].type = d.v; render(); },
  'pf-closed': d => { ui.filters.posts[d.id].closed = !ui.filters.posts[d.id].closed; render(); },
  'cal-open': d => openModal({ type: 'calendar', hackId: d.id }),
  'copy': d => copyText(d.target),
  'post-new': d => { if (!requireLogin()) return; delete ui.drafts.post; openModal({ type: 'post', hackId: d.id, kind: d.kind || null }); },
  'post-edit': d => { const p = P(d.id); delete ui.drafts.post; openModal({ type: 'post', hackId: p.hackathonId, postId: p.id }); },
  'post-status': d => { api.setPostStatus(d.id, d.s); toast({ filled: 'Marked as filled', closed: 'Post closed', active: 'Post reopened' }[d.s]); render(); },
  'react': d => { if (!requireLogin()) return; api.react(d.id, d.k); render(); },
  'toggle-replies': d => { ui.openReplies[d.id] = !ui.openReplies[d.id]; render(); if (ui.openReplies[d.id]) { const i = document.getElementById('rp-' + d.id); if (i) i.focus(); } },
  'request': d => { if (!requireLogin()) return; delete ui.drafts.req; openModal({ type: 'request', teamId: d.team, postId: d.post || null }); },
  'invite': d => { if (!requireLogin()) return; if (!me() || me().role !== 'student') return toast('Only students can invite people.', { tone: 'err' }); delete ui.drafts.inv; openModal({ type: 'invite', userId: d.user, hackId: d.hack || null, postId: d.post || null }); },
  'invite-pick': d => { ui.pickQ = ''; openModal({ type: 'pick', teamId: d.id }); },
  'dm': d => {
    if (!requireLogin()) return; const u = me();
    if (u.role !== 'student') return toast('Admins can’t send direct messages.', { tone: 'err' });
    const c = findDM(u.id, d.user);
    if (c && DB.messages.some(m => m.convId === c.id)) { ui.modal = null; go('inbox-' + c.id); } else { delete ui.drafts.dm; openModal({ type: 'dm', userId: d.user }); }
  },
  'report': d => { if (!requireLogin()) return; delete ui.drafts.rep; openModal({ type: 'report', targetType: d.type, targetId: d.id }); },
  'block': d => confirmModal({ title: 'Block ' + U(d.user).name + '?', body: 'They won’t be able to message, invite or reply to you, and pending invites between you are cancelled. You can unblock them in settings.', yes: 'Block', danger: true }, () => { api.block(d.user); toast('Blocked ' + U(d.user).name); if (ui.route.name === 'inbox') go('inbox'); else render(); }),
  'unblock': d => { api.unblock(d.user); toast('Unblocked ' + U(d.user).name); render(); },
  'team-create': d => { if (!requireLogin()) return; delete ui.drafts.tc; ui.afterTeam = d.then ? { invite: d.then } : null; ui.modal = null; openModal({ type: 'team', hackId: d.id }); },
  'team-leave': d => confirmModal({ title: 'Leave ' + T(d.id).name + '?', body: 'You’ll lose access to the team chat and links.', yes: 'Leave team', danger: true }, () => { const t = T(d.id); api.leaveTeam(d.id); toast('You left ' + t.name); go('h-' + t.hackathonId); }),
  'team-remove': d => confirmModal({ title: 'Remove ' + U(d.user).name + '?', body: 'They’ll be notified and lose access to the team chat and links.', yes: 'Remove', danger: true }, () => { api.removeMember(d.id, d.user); toast('Removed ' + U(d.user).name); render(); }),
  'team-lead': d => confirmModal({ title: 'Make ' + U(d.user).name + ' the leader?', body: 'They’ll manage invites, join requests and the team post. You stay on the team as a member.', yes: 'Transfer leadership' }, () => { api.transferLeadership(d.id, d.user); toast(U(d.user).name + ' is now the leader'); render(); }),
  'needed-edit': d => { delete ui.drafts.need; openModal({ type: 'needed', teamId: d.id }); },
  'needed-save': () => { api.setNeededRoles(ui.modal.teamId, ui.drafts.need.roles); closeModal(); toast('Needed roles updated'); },
  'link-remove': d => { api.removeLink(d.id, d.link); render(); },
  'inv-accept': d => {
    const inv = DB.invites.find(i => i.id === d.id); api.respondInvite(d.id, true);
    const t = T(inv.teamId), full = t.members.length >= H(inv.hackathonId).maxTeam;
    toast(inv.kind === 'invite' ? 'You joined ' + t.name : U(inv.fromId).name + ' joined ' + t.name, { body: full ? 'The team is full now, so its post was closed and other pending requests expired.' : '' });
    if (inv.kind === 'invite') go('team-' + t.id); else render();
  },
  'inv-decline': d => { api.respondInvite(d.id, false); toast('Declined'); render(); },
  'inv-withdraw': d => { api.withdrawInvite(d.id); toast('Withdrawn'); render(); },
  'inbox-tab': d => { ui.inboxTab = d.v; render(); },
  'msg-accept': d => { api.acceptMsgRequest(d.id); ui.inboxTab = 'chats'; toast('Request accepted', { body: 'You can reply now.' }); render(); },
  'msg-decline': d => { api.declineMsgRequest(d.id); toast('Request declined', { body: 'They can’t message you again.' }); go('inbox'); },
  'github-connect': () => { if (!requireLogin()) return; delete ui.drafts.gh; openModal({ type: 'github' }); },
  'github-refresh': () => { const r = api.githubRefresh(); toast(r.ok ? 'GitHub data refreshed' : 'Couldn’t reach GitHub', { tone: r.ok ? '' : 'err', body: r.ok ? '' : 'Your last synced data is still shown. Try again later.' }); render(); },
  'github-disconnect': () => confirmModal({ title: 'Disconnect GitHub?', body: 'Your GitHub data is removed and the GitHub part of your score drops to 0. You can reconnect anytime.', yes: 'Disconnect', danger: true }, () => { api.githubDisconnect(); toast('GitHub disconnected'); render(); }),
  'coding-edit': d => { if (!requireLogin()) return; const u = me(); delete ui.drafts.lc; delete ui.drafts.cf; openModal({ type: 'coding', tab: d.v || (u.leetcode || !u.codeforces ? 'leetcode' : 'codeforces') }); },
  'coding-tab': d => { ui.modal.tab = d.v; ui.errors = {}; render(); },
  'coding-remove': d => confirmModal({ title: 'Remove your ' + (d.v === 'leetcode' ? 'LeetCode' : 'Codeforces') + ' stats?', body: 'They stop counting toward the DSA part of your score. Your edit history is kept.', yes: 'Remove', danger: true }, () => { api.removeCoding(d.v); toast('Removed'); render(); }),
  'statlog-open': () => openModal({ type: 'statlog' }),
  'academics-edit': () => { if (!requireLogin()) return; delete ui.drafts.acad; openModal({ type: 'acad' }); },
  'acad-add': () => { const rows = ui.drafts.acad.rows, last = rows[rows.length - 1]; rows.push({ sem: String(Math.min(10, (last ? +last.sem : 0) + 1)), scale: last ? last.scale : '10', value: '' }); render(); const el = document.getElementById('acv-' + (rows.length - 1)); if (el) el.focus(); },
  'acad-del': d => { ui.drafts.acad.rows.splice(+d.i, 1); ui.errors = {}; render(); },
  'resume-open': () => { if (!requireLogin()) return; const u = me(); delete ui.drafts.rrev; openModal({ type: 'resume', stage: u.resume && u.resume.status === 'review' ? 'review' : 'upload' }); },
  'resume-cancel': () => { ui.resumeJob = (ui.resumeJob || 0) + 1; ui.modal.stage = 'upload'; render(); },
  'resume-manual': () => finishParse({ skills: [], internships: [], projects: [], certifications: [], hackathonWins: [] }, 'manual'),
  'rr-add': d => { ui.drafts.rrev[d.k].push({ internships: { title: '', org: '', duration: '' }, projects: { title: '', summary: '' }, certifications: { title: '', issuer: '' }, hackathonWins: { title: '', result: '' } }[d.k]); render(); },
  'rr-del': d => { ui.drafts.rrev[d.k].splice(+d.i, 1); render(); },
  'resume-confirm': () => { const r = api.confirmResume(ui.drafts.rrev); delete ui.drafts.rrev; closeModal(); toast('Resume confirmed', { body: r.added.length ? 'Added ' + r.added.join(', ') + ' to your skills.' : 'It now counts toward your Builder Score.' }); },
  'resume-view': d => openResumeView(d.user),
  'resume-share': () => { ui.shareQ = ''; openModal({ type: 'share' }); },
  'resume-delete': () => confirmModal({ title: 'Delete your resume?', body: 'The PDF and its parsed details are removed. The resume part of your score then counts only verified hackathon results.', yes: 'Delete resume', danger: true }, () => { fileDel(api.deleteResume()); toast('Resume deleted'); render(); }),
  'profile-edit': () => { delete ui.drafts.prof; openModal({ type: 'profile' }); },
  'score-toggle': () => { ui.scoreOpen = !ui.scoreOpen; render(); },
  'public-preview': () => { ui.publicPreview = !ui.publicPreview; render(); window.scrollTo(0, 0); },
  'onb-back': () => { ui.onbStep = Math.max(1, ui.onbStep - 1); render(); window.scrollTo(0, 0); },
  'onb-finish': () => { api.finishOnboarding(); toast('Welcome to Alstr!', { body: 'Your profile is live. Next, pick a hackathon.' }); go('me'); },
  'notif-open': d => { const n = DB.notifications.find(x => x.id === d.id); api.markNotif(d.id); if (n && n.link) go(n.link); else render(); },
  'notif-all': () => { api.markAllNotifs(); render(); },
  'logout-all': () => confirmModal({ title: 'Log out of all devices?', body: 'Every session ends, including this one. You’ll need to sign in with Google again.', yes: 'Log out everywhere', danger: true }, () => { api.logoutAll(); toast('Logged out of all devices'); go('home'); }),
  'export': () => doExport(),
  'delete-open': () => { delete ui.drafts.del; openModal({ type: 'delete' }); },
  'admin-tab': d => { ui.adminTab = d.v; ui.errors = {}; render(); },
  'admin-restart': () => { ui.adminLogin = { step: 1 }; render(); },
  'hack-new': () => { delete ui.drafts.hk; openModal({ type: 'hack' }); },
  'hack-edit': d => { delete ui.drafts.hk; openModal({ type: 'hack', id: d.id }); },
  'hack-pin': d => { const h = H(d.id); api.pinHackathon(d.id, !h.pinned); toast(h.pinned ? 'Pinned to the top of the list' : 'Unpinned'); render(); },
  'hack-archive': d => { const h = H(d.id); if (h.archived) { api.archiveHackathon(d.id, false); toast('Restored'); render(); } else confirmModal({ title: 'Archive ' + h.name + '?', body: 'It disappears from the public list. Its posts and teams are kept.', yes: 'Archive', danger: true }, () => { api.archiveHackathon(d.id, true); toast('Archived'); render(); }); },
  'verify': d => { if (d.ok === '1') { api.verifyResult(d.id, true); toast('Result verified', { body: 'Members were notified and their scores updated.' }); render(); } else { delete ui.drafts.rej; openModal({ type: 'reject', teamId: d.id }); } },
  'review': d => { api.reviewStat(d.user, d.id, d.v); toast({ approve: 'Marked as reviewed', ask: 'Asked them for a profile link', revert: 'Change reverted and the student notified' }[d.v]); render(); },
  'moderate': d => {
    const run = () => { api.moderate(d.id, d.v, { days: 7 }); toast({ hide: 'Content hidden', warn: 'Warning sent', suspend: 'Suspended for 7 days', ban: 'Account banned', dismiss: 'Report dismissed' }[d.v]); render(); };
    if (d.v === 'ban' || d.v === 'suspend') confirmModal({ title: d.v === 'ban' ? 'Ban this account?' : 'Suspend for 7 days?', body: d.v === 'ban' ? 'They’re signed out everywhere, can’t sign in again, and their active posts are hidden.' : 'They can still browse, but can’t post, message or send requests for 7 days.', yes: d.v === 'ban' ? 'Ban account' : 'Suspend', danger: true }, run);
    else run();
  },
  'uni-add': () => { const rows = ui.drafts.unis.rows; rows.splice(rows.length - 1, 0, { id: '', name: '', factor: 0.9 }); render(); const el = document.getElementById('un-' + (rows.length - 2)); if (el) el.focus(); },
  'uni-remove': d => { ui.drafts.unis.rows.splice(+d.i, 1); ui.errors = {}; render(); },
  'tag-add': d => addTag(d.dk, d.field, d.val, +d.max, d.input),
  'tag-remove': d => { ui.drafts[d.dk][d.field].splice(+d.i, 1); render(); },
  'draft-toggle': d => { const a = ui.drafts[d.dk][d.field], i = a.indexOf(d.val); if (i >= 0) a.splice(i, 1); else a.push(d.val); delete ui.errors[d.field]; render(); },
  'draft-set': d => { ui.drafts[d.dk][d.field] = d.val; delete ui.errors[d.field]; render(); },
  'rate-open': d => { delete ui.drafts.rate; openModal({ type: 'rate', teamId: d.id, userId: d.user }); },
  'rate-save': () => { api.ratePeer(ui.modal.teamId, ui.modal.userId, ui.drafts.rate); closeModal(); toast('Rating saved', { body: 'It stays private.' }); },
  'confirm-yes': () => { const f = confirmFn; confirmFn = null; ui.modal = null; render(); if (f) f(); },
  'demo-as': d => demoAs(d.v),
  'demo-time': d => { const v = +d.v; DB.clock = v ? (DB.clock || 0) + v : 0; sweep(); save(); toast(v ? 'Clock moved ahead ' + fmtDur(v) : 'Clock reset to now'); render(); },
  'demo-sim': d => { const b = simulate(d.v); closeModal(); toast(d.v === 'dm' ? b.name + ' is about to message you' : b.name + ' is about to send you a request or invite'); },
  'demo-fail': () => { DB.demo.failNextSync = !DB.demo.failNextSync; save(); render(); },
  'demo-reset': () => confirmModal({ title: 'Reset all demo data?', body: 'Everything goes back to the sample data and you’re signed out.', yes: 'Reset', danger: true }, () => { resetDemo(); ui.drafts = {}; ui.filters.posts = {}; ui.adminTab = 'overview'; fileClear(); toast('Demo data reset'); go('home'); })
};

/* ===================== forms ===================== */
const FORMS = {
  'google-other': d => doSignIn(d.email, d.name),
  'admin-email': d => { const r = api.adminStart(d.email); ui.adminLogin = { step: 2, email: r.email }; render(); const c = document.getElementById('f-code'); if (c) c.focus(); },
  'admin-code': d => { api.adminVerify(ui.adminLogin.email, d.code); ui.adminLogin = { step: 1 }; delete ui.drafts.adm; toast('Signed in as admin'); go('admin'); },
  'onb1': d => { api.saveOnboardingStep(1, d); ui.onbStep = 2; render(); window.scrollTo(0, 0); },
  'onb2': d => { api.saveOnboardingStep(2, d); ui.onbStep = 3; render(); window.scrollTo(0, 0); },
  'profile': d => { api.updateProfile(d); closeModal(); toast('Profile saved'); },
  'github': async d => {
    ui.busy = true; render(); await sleep(900);
    try { const g = api.githubConnect(d.gh); ui.busy = false; closeModal(); toast('GitHub connected', { body: `Found ${g.repos.length} repositories. Your score was updated.` }); }
    catch (e) { ui.busy = false; throw e; }
  },
  'leetcode': d => { const r = api.saveLeetCode(d); closeModal(); toast('LeetCode stats saved', { body: r.flagged ? 'That’s a big jump, so a moderator will take a look. It still counts for now.' : '' }); },
  'codeforces': d => { const r = api.saveCodeforces(d); closeModal(); toast('Codeforces stats saved', { body: [r.warning, r.flagged ? 'That’s a big jump, so a moderator will take a look.' : ''].filter(Boolean).join(' ') }); },
  'academics': () => { api.saveAcademics(ui.drafts.acad.rows); closeModal(); toast('Marks saved', { body: 'Your CGPA and score were recalculated.' }); },
  'resume-paste': d => { const text = String(d.text || '').trim(); if (text.length < 40) throw new AppError('Paste at least a few lines from your resume.', 'text'); return parseResumeText(text, ui.modal.meta || { name: 'pasted-resume.pdf', size: text.length, key: null }); },
  'post': d => { const m = ui.modal, p = api.savePost(m.hackId, Object.assign({}, ui.drafts.post, d), m.postId); delete ui.drafts.post; closeModal(); toast(m.postId ? 'Post updated' : 'Post published', { body: m.postId ? '' : p.type === 'team' ? 'People can now ask to join your team.' : 'Team leaders can now invite you.' }); },
  'team-create': d => {
    const hid = ui.modal.hackId, t = api.createTeam(hid, Object.assign({}, ui.drafts.tc, d)); delete ui.drafts.tc; ui.modal = null;
    toast('Team created', { body: 'You lead ' + t.name + '.' });
    if (ui.afterTeam && ui.afterTeam.invite) { const target = ui.afterTeam.invite; ui.afterTeam = null; delete ui.drafts.inv; openModal({ type: 'invite', userId: target, hackId: hid }); } else go('team-' + t.id);
  },
  'request': d => { api.sendRequest(ui.modal.teamId, d.message, ui.modal.postId); delete ui.drafts.req; closeModal(); toast('Request sent', { body: 'You’ll be notified when the leader answers.' }); },
  'invite': d => { const n = U(ui.modal.userId).name; api.sendInvite(d.teamId, ui.modal.userId, d.message, ui.modal.postId); delete ui.drafts.inv; closeModal(); toast('Invite sent to ' + n, { body: 'It expires after 7 days or when registration closes.' }); },
  'reply': (d, ds) => { api.reply(ds.id, d.text); delete ui.drafts['reply-' + ds.id]; render(); const i = document.getElementById('rp-' + ds.id); if (i) i.focus(); },
  'msg': (d, ds) => { api.sendMessage(ds.id, d.text); delete ui.drafts['msg-' + ds.id]; render(); const t = document.getElementById('cmp-' + ds.id); if (t) t.focus(); },
  'dm': d => { const c = api.sendDM(ui.modal.userId, d.text); delete ui.drafts.dm; ui.modal = null; go('inbox-' + c.id); },
  'report': d => { const m = ui.modal; api.report(m.targetType, m.targetId, d.reason, d.details); closeModal(); toast('Report sent', { body: 'Moderators will review it.' }); },
  'link': (d, ds) => { api.addLink(ds.id, { label: d.linkLabel, url: d.linkUrl }); delete ui.drafts['link-' + ds.id]; render(); },
  'result': (d, ds) => { api.submitResult(ds.id, d); delete ui.drafts['res-' + ds.id]; toast('Result submitted', { body: 'An admin will verify it.' }); render(); },
  'hack': d => { const m = ui.modal; api.saveHackathon(Object.assign({}, ui.drafts.hk, d), m.id); delete ui.drafts.hk; closeModal(); toast(m.id ? 'Hackathon updated' : 'Hackathon created', { body: m.id ? '' : 'Students with matching interests were notified.' }); },
  'weights': d => { api.saveWeights(d); delete ui.drafts.weights; toast('Weights saved', { body: 'Every score was recalculated.' }); render(); },
  'unis': () => { api.saveUniversities(ui.drafts.unis.rows); delete ui.drafts.unis; toast('University factors saved', { body: 'Every score was recalculated.' }); render(); },
  'announce': d => { api.saveAnnouncement({ enabled: !!ui.drafts.ann.enabled, text: d.text, tone: d.tone }); ui.annHidden = false; delete ui.drafts.ann; toast('Announcement saved'); render(); },
  'delete': d => { fileDel(api.deleteAccount(d.confirm)); ui.modal = null; ui.drafts = {}; toast('Your account was deleted'); go('home'); },
  'reject': d => { api.verifyResult(ui.modal.teamId, false, d.note); closeModal(); toast('Result rejected', { body: 'The team was notified.' }); }
};
const CHG = {
  'avail': el => { api.setAvailability(el.value); toast('Availability updated'); render(); },
  'privacy-marks': el => { api.setPrivacy('showMarks', el.checked); toast(el.checked ? 'Your marks are visible on your profile' : 'Your marks are private'); render(); },
  'pref': el => { api.setNotifPref(el.dataset.type, el.dataset.ch, el.checked); },
  'my-role': el => { api.setMyRole(el.dataset.id, el.value); toast('Role updated'); render(); },
  'share': el => { api.shareResume(el.dataset.user, el.checked); toast(el.checked ? 'Shared your resume' : 'Access removed'); render(); },
  'resume-file': el => { const f = el.files && el.files[0]; if (f) return handleResumeFile(f); },
  'banner-file': el => { const f = el.files && el.files[0]; if (f) handleBanner(f); }
};
const LIVE = {
  search: el => { ui.searchQ = el.value; scheduleRender(); },
  pickq: el => { ui.pickQ = el.value; scheduleRender(); },
  shareq: el => { ui.shareQ = el.value; scheduleRender(); },
  weights: () => { const w = ui.drafts.weights, tot = ['academics', 'dsa', 'github', 'resume'].reduce((s, k) => s + (+w[k] || 0), 0), el = document.getElementById('w-total'); if (el) { el.textContent = 'Total: ' + tot + '%'; el.classList.toggle('err', tot !== 100); } }
};

/* ===================== events ===================== */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!t) { if (ui.menu && !e.target.closest('.menu')) { ui.menu = null; render(); } return; }
  if (t.disabled || t.getAttribute('aria-disabled') === 'true') { if (t.dataset.act === 'github-refresh') toast('You can refresh once an hour. GitHub data also syncs daily.'); return; }
  const fn = ACT[t.dataset.act]; if (!fn) return;
  const href = t.getAttribute('href');
  if (!(t.tagName === 'A' && href && href.startsWith('#'))) e.preventDefault();
  if (t.dataset.act !== 'menu') ui.menu = null;
  try { const r = fn(t.dataset, t, e); if (r && r.then) r.catch(handleErr); } catch (err) { handleErr(err); }
});
function onInput(e) {
  const el = e.target, form = el.closest && el.closest('[data-draft]');
  if (form && el.name) {
    const d = (ui.drafts[form.dataset.draft] = ui.drafts[form.dataset.draft] || {});
    d[el.name] = el.type === 'checkbox' ? el.checked : el.value;
    if (ui.errors[el.name]) { delete ui.errors[el.name]; const f = el.closest('.fld'); if (f) { f.classList.remove('has-err'); const er = f.querySelector('.err'); if (er) er.remove(); } el.removeAttribute('aria-invalid'); }
  }
  if (el.dataset.filter) { setPath(ui.filters, el.dataset.filter, el.value); scheduleRender(); }
  if (el.dataset.tag != null && e.type === 'input') { ui.tagQ[el.id] = el.value; if (el.value.endsWith(',')) { const [dk, field, max] = el.dataset.tag.split('|'); addTag(dk, field, el.value, +max, el.id); } else scheduleRender(); }
  if (el.dataset.acad != null) { const r = ui.drafts.acad.rows[+el.dataset.acad]; r[el.dataset.k] = el.value; const p = document.getElementById('cgpa-prev'); if (p) p.textContent = cgpaPreview(); }
  if (el.dataset.rr) ui.drafts.rrev[el.dataset.rr][+el.dataset.i][el.dataset.k] = el.value;
  if (el.dataset.uni != null) ui.drafts.unis.rows[+el.dataset.uni][el.dataset.k] = el.value;
  if (el.dataset.live && LIVE[el.dataset.live]) LIVE[el.dataset.live](el);
}
document.addEventListener('input', onInput);
document.addEventListener('change', e => {
  const el = e.target;
  if (el.tagName === 'SELECT' || el.type === 'checkbox') { onInput(e); if (el.dataset.rerender != null || (el.dataset.acad != null && el.dataset.k === 'scale')) render(); }
  if (el.dataset.change && CHG[el.dataset.change]) { try { const r = CHG[el.dataset.change](el); if (r && r.then) r.catch(handleErr); } catch (err) { handleErr(err); } }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault();
  const fn = FORMS[f.dataset.form]; if (!fn) return;
  const fd = {}; new FormData(f).forEach((v, k) => { fd[k] = v; });
  const d = Object.assign({}, ui.drafts[f.dataset.draft] || {}, fd);
  ui.errors = {};
  try { const r = fn(d, f.dataset, f); if (r && r.then) r.catch(handleErr); } catch (err) { handleErr(err); }
});
function trapFocus(e) {
  const m = modalRoot.querySelector('.modal'); if (!m) return;
  const f = [...m.querySelectorAll('a[href],button:not([disabled]),input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])')];
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  else if (!m.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
}
document.addEventListener('keydown', e => {
  const el = e.target;
  if (e.key === 'Escape') { if (ui.menu) { ui.menu = null; render(); return; } if (ui.modal) { closeModal(); return; } }
  if (el.dataset && el.dataset.tag != null) {
    if (e.key === 'Enter') { e.preventDefault(); const [dk, field, max] = el.dataset.tag.split('|'); addTag(dk, field, el.value, +max, el.id); return; }
    if (e.key === 'Backspace' && !el.value) { const [dk, field] = el.dataset.tag.split('|'); const a = (ui.drafts[dk] || {})[field]; if (a && a.length) { a.pop(); render(); } return; }
  }
  if (el.hasAttribute && el.hasAttribute('data-enter-send') && e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (el.form.requestSubmit) el.form.requestSubmit(); else el.form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); return; }
  if (ui.modal && e.key === 'Tab') { trapFocus(e); return; }
  const typing = /INPUT|TEXTAREA|SELECT/.test(el.tagName) || el.isContentEditable;
  if (!typing && !ui.modal && DB && (e.key === '/' || ((e.metaKey || e.ctrlKey) && lc(e.key) === 'k'))) { e.preventDefault(); ACT['search-open'](); }
});
document.addEventListener('dragover', e => { const z = e.target.closest && e.target.closest('.drop'); if (z) { e.preventDefault(); z.classList.add('over'); } });
document.addEventListener('dragleave', e => { const z = e.target.closest && e.target.closest('.drop'); if (z) z.classList.remove('over'); });
document.addEventListener('drop', e => { const z = e.target.closest && e.target.closest('.drop'); if (z) { e.preventDefault(); z.classList.remove('over'); const f = e.dataTransfer.files[0]; if (f) handleResumeFile(f).catch(handleErr); } });
window.addEventListener('hashchange', () => {
  const prev = ui.route; resolveRoute(); ui.menu = null; ui.errors = {};
  const changed = prev.name !== ui.route.name || prev.id !== ui.route.id;
  if (changed) { ui.modal = null; ui.publicPreview = ui.publicPreview && ui.route.name === 'me'; if (ui.route.name !== 'me' && ui.route.name !== 'u') ui.scoreOpen = false; window.scrollTo(0, 0); }
  render();
  if (changed) { const h1 = document.querySelector('#main h1'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); } }
});

/* ===================== resume parsing and file storage ===================== */
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', PDFJS_W = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error('Couldn’t load the PDF reader')); document.head.appendChild(s); }); }
let pdfjsP = null;
function getPdfjs() {
  if (!pdfjsP) pdfjsP = Promise.all([loadScript(PDFJS_W), loadScript(PDFJS)]).then(() => { if (!window.pdfjsLib) throw new Error('PDF reader unavailable'); window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_W; return window.pdfjsLib; }).catch(e => { pdfjsP = null; throw e; });
  return pdfjsP;
}
async function pdfDoc(buf) { const lib = await getPdfjs(); return lib.getDocument({ data: new Uint8Array(buf.slice(0)) }).promise; }
async function pdfText(buf) {
  const doc = await pdfDoc(buf); let out = '';
  for (let i = 1; i <= Math.min(doc.numPages, 6); i++) { const pg = await doc.getPage(i), tc = await pg.getTextContent(); out += tc.items.map(it => it.str + (it.hasEOL ? '\n' : ' ')).join('') + '\n'; }
  return out.replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}
async function pdfImages(buf) {
  const doc = await pdfDoc(buf), imgs = [];
  for (let i = 1; i <= Math.min(doc.numPages, 4); i++) { const pg = await doc.getPage(i), vp = pg.getViewport({ scale: 1.4 }), cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height; await pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise; imgs.push(cv.toDataURL('image/jpeg', 0.85)); }
  return imgs;
}
let idbP = null;
const memFiles = {};
function idb() { if (!idbP) idbP = new Promise((res, rej) => { try { const r = indexedDB.open('alstr-files', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); return idbP; }
async function filePut(key, buf) { memFiles[key] = buf; try { const db = await idb(); await new Promise((res, rej) => { const tx = db.transaction('f', 'readwrite'); tx.objectStore('f').put(buf, key); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); } catch (e) { /* memory only */ } }
async function fileGet(key) { if (!key) return null; if (memFiles[key]) return memFiles[key]; try { const db = await idb(); return await new Promise((res, rej) => { const r = db.transaction('f').objectStore('f').get(key); r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error); }); } catch (e) { return null; } }
async function fileDel(key) { if (!key) return; delete memFiles[key]; try { const db = await idb(); db.transaction('f', 'readwrite').objectStore('f').delete(key); } catch (e) { /* ignore */ } }
async function fileClear() { Object.keys(memFiles).forEach(k => delete memFiles[k]); try { const db = await idb(); db.transaction('f', 'readwrite').objectStore('f').clear(); } catch (e) { /* ignore */ } }
async function handleResumeFile(f) {
  const m = ui.modal; if (!m || m.type !== 'resume') return;
  if (!/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') { m.error = 'That isn’t a PDF. Export your resume as a PDF and try again.'; return render(); }
  if (f.size > 5 * 1024 * 1024) { m.error = `That file is ${(f.size / 1048576).toFixed(1)} MB. The limit is 5 MB.`; return render(); }
  const job = (ui.resumeJob = (ui.resumeJob || 0) + 1);
  m.error = ''; m.stage = 'parsing'; m.msg = 'Reading the PDF…'; render();
  const buf = await f.arrayBuffer(), key = uid('file'); await filePut(key, buf.slice(0));
  m.meta = { name: /\.pdf$/i.test(f.name) ? f.name : f.name + '.pdf', size: f.size, key };
  let text = '';
  try { text = await pdfText(buf); } catch (e) { if (job !== ui.resumeJob) return; m.stage = 'paste'; m.reason = 'the PDF reader couldn’t open it'; return render(); }
  if (job !== ui.resumeJob) return;
  if (text.replace(/\s/g, '').length < 60) { m.stage = 'paste'; m.reason = 'no selectable text was found'; return render(); }
  return parseResumeText(text, m.meta, job);
}
async function parseResumeText(text, meta, job) {
  const m = ui.modal; job = job || (ui.resumeJob = (ui.resumeJob || 0) + 1);
  m.stage = 'parsing'; m.msg = caps.sample ? 'Claude is reading your resume…' : 'Finding skills, projects and experience…'; render();
  let parsed = null, parser = 'heuristic';
  if (caps.sample) { try { parsed = await claudeParse(text); parser = 'claude'; } catch (e) { parsed = null; } }
  if (job !== ui.resumeJob || !ui.modal || ui.modal.type !== 'resume') return;
  finishParse(parsed || heuristicParse(text), parsed ? parser : 'heuristic', meta);
}
function finishParse(parsed, parser, meta) {
  const m = ui.modal; meta = meta || (m && m.meta) || { name: 'resume.pdf', size: 0, key: null };
  api.setResumeParsed(meta, parsed, parser);
  delete ui.drafts.rrev; if (m) m.stage = 'review'; render();
}
async function claudeParse(text) {
  const prompt = `You extract structured data from a college student's resume for a hackathon team-finding website.
Reply with only a JSON object with exactly these keys:
{"skills": [string], "internships": [{"title": string, "org": string, "duration": string}], "projects": [{"title": string, "summary": string}], "certifications": [{"title": string, "issuer": string}], "hackathonWins": [{"title": string, "result": string}]}
Rules: include only items that appear in the resume. "internships" means internships and jobs. "hackathonWins" means hackathon placements such as winner, runner-up, finalist or top N; skip plain participation. Skills are short technical skill names, at most 25. Keep each summary under 15 words. Use "" for unknown fields.

Resume text:
"""
${text.slice(0, 12000)}
"""`;
  const r = await caps.sample.json(prompt, { modelTier: 'quick' });
  if (!r || typeof r !== 'object' || Array.isArray(r)) throw new Error('Unexpected reply');
  return r;
}
function heuristicParse(text) {
  const BUL = /^[•●▪◦·*–-]\s*/;
  const items = text.split(/\n+/).map(s => s.trim()).filter(Boolean).map(s => ({ t: s.replace(BUL, '').trim(), bullet: BUL.test(s) })).filter(i => i.t);
  const lines = items.map(i => i.t), low = ' ' + lc(text) + ' ';
  const skills = SKILLS.filter(s => new RegExp('(^|[^a-z0-9+#])' + lc(s).replace(/[.+*?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9+#]|$)').test(low));
  const HEAD = { exp: /^((work|professional) )?experience|^internships?\b|^employment/i, proj: /^((academic|personal|key) )?projects?\b/i, cert: /^certifications?|^certificates?|^licen[cs]es/i, ach: /^achievements|^awards|^honou?rs|^hackathons?\b|^accomplishments/i, other: /^education|^skills|^technical skills|^summary|^objective|^contact|^languages|^interests|^extra|^positions? of responsibility|^publications|^coursework/i };
  const isHead = l => l.length < 40 && Object.values(HEAD).some(r => r.test(l));
  let sec = null; const b = { exp: [], proj: [], cert: [], ach: [] };
  for (const it of items) { let hit = null; if (it.t.length < 40) for (const k in HEAD) if (HEAD[k].test(it.t)) { hit = k; break; } if (hit) { sec = hit === 'other' ? null : hit; continue; } if (sec) b[sec].push(it); }
  const fits = it => it.t.length > 3 && it.t.length < 90;
  const titles = arr => { const heads = arr.filter(i => !i.bullet && fits(i)); return heads.length ? heads : arr.filter(fits); };
  const splitRole = l => { const dur = (l.match(/\(([^)]*\d{2,4}[^)]*)\)\s*$/) || [])[1] || ''; const core = dur ? l.replace(/\s*\([^)]*\)\s*$/, '') : l; const parts = core.split(/\s*(?:,|\||\bat\b|–|—)\s*/).filter(Boolean); return { title: parts[0] || core, org: parts.slice(1).join(', '), duration: dur }; };
  const resultRe = /winner|won|1st|first|2nd|second|3rd|third|runner[- ]?up|finalist|top \d+/i;
  return {
    skills,
    internships: titles(b.exp).filter(i => /intern|engineer|developer|analyst|assistant|trainee/i.test(i.t)).slice(0, 6).map(i => splitRole(i.t)),
    projects: titles(b.proj).filter(i => !/^(built|developed|implemented|designed|used|created|achieved|led|worked|integrated|deployed)\b/i.test(i.t)).slice(0, 8).map(i => ({ title: i.t.split(/\s[|–—]\s|:\s/)[0].trim(), summary: '' })),
    certifications: uniq(titles(b.cert).map(i => i.t).concat(lines.filter(l => /certif/i.test(l) && l.length < 90 && !isHead(l)))).slice(0, 8).map(l => ({ title: l, issuer: '' })),
    hackathonWins: lines.filter(l => /hack|jam|sprint|challenge/i.test(l) && resultRe.test(l) && l.length < 140).slice(0, 6).map(l => ({ title: l, result: (l.match(resultRe) || [''])[0] }))
  };
}
async function openResumeView(userId) {
  const s = api.resumeSignedUrl(userId);
  openModal({ type: 'rview', userId, token: s.token, expiresAt: s.expiresAt, pdf: s.fileKey ? 'loading' : 'none', images: null });
  if (!s.fileKey) return;
  const buf = await fileGet(s.fileKey), m = ui.modal;
  if (!m || m.type !== 'rview') return;
  if (!buf) { m.pdf = 'none'; m.note = 'The PDF file isn’t stored in this browser, so this preview is built from the confirmed resume details.'; return render(); }
  try { m.images = await pdfImages(buf); m.pdf = 'ok'; } catch (e) { m.pdf = 'none'; m.note = 'The PDF couldn’t be displayed here, so this preview is built from the confirmed resume details.'; }
  render();
}
function handleBanner(f) {
  if (!/^image\//.test(f.type)) return toast('Choose an image file.', { tone: 'err' });
  if (f.size > 8 * 1024 * 1024) return toast('Images must be under 8 MB.', { tone: 'err' });
  const rd = new FileReader();
  rd.onload = () => {
    const img = new Image();
    img.onload = () => { const w = Math.min(1200, img.width), h = Math.round((img.height * w) / img.width), c = document.createElement('canvas'); c.width = w; c.height = Math.min(h, 480); c.getContext('2d').drawImage(img, 0, (c.height - h) / 2, w, h); ui.drafts.hk.banner = c.toDataURL('image/jpeg', 0.78); render(); };
    img.onerror = () => toast('That image couldn’t be read.', { tone: 'err' });
    img.src = rd.result;
  };
  rd.readAsDataURL(f);
}

/* ===================== hooks, timers, init ===================== */
hooks.onNotify = (userId, n) => {
  const u = me(); if (!u || u.id !== userId) return;
  if (n.type === 'message') { const r = ui.route; if ((r.name === 'inbox' && r.id === n.convId) || (r.name === 'team' && T(r.id) && T(r.id).convId === n.convId)) return; }
  toast(n.title, { body: n.body, link: n.link });
};
hooks.onMessage = (m, c) => botsReact('message', { m, c });
hooks.onInviteCreated = inv => botsReact('invite', inv);
hooks.onBanned = () => toast('This account was banned', { tone: 'err' });
setInterval(() => {
  if (!DB) return;
  let changed = false;
  const prev = JSON.stringify(ui.typing); ui.typing = {};
  (DB.botQueue || []).forEach(b => { if (b.type === 'reply' && b.at - Date.now() < 2500) ui.typing[b.convId] = { userId: b.botId, until: b.at }; });
  if (JSON.stringify(ui.typing) !== prev) changed = true;
  try { if (runBots()) changed = true; } catch (e) { console.error(e); }
  if (++tickN % 15 === 0 && sweep()) changed = true;
  document.querySelectorAll('[data-cd]').forEach(el => { el.textContent = fmtCountdown(+el.dataset.cd - now()); });
  const tp = document.getElementById('totp'); if (tp) { const c = totp(); tp.textContent = c.slice(0, 3) + ' ' + c.slice(3); const s = document.getElementById('totp-s'); if (s) s.textContent = 30 - (Math.floor(Date.now() / 1000) % 30); }
  if (changed) render();
}, 1000);
function init() {
  try { ui.theme = localStorage.getItem('alstr.theme') || 'system'; } catch (e) { /* ignore */ }
  applyTheme(); loadDB(); sweep(); resolveRoute(); render();
  setTimeout(() => { ui.loadingHacks = false; render(); }, 450);
  if (window.claude && typeof window.claude.use === 'function') {
    window.claude.use('downloads').then(d => { caps.downloads = d; }).catch(() => {});
    window.claude.use('sample').then(s => { caps.sample = s; if (ui.modal && ui.modal.type === 'resume') render(); }).catch(() => {});
  }
}
init();
