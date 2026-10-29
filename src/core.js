'use strict';
/* =====================================================================
   Alstr core — DOM-free. In production every api.* function is a server
   endpoint; the role / ownership / rate-limit checks below are the ones
   that would run server-side.
   ===================================================================== */
const DAY = 864e5, HOUR = 36e5, MIN = 6e4;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sum = a => a.reduce((s, x) => s + x, 0);
const mean = a => (a.length ? sum(a) / a.length : 0);
const round1 = v => Math.round(v * 10) / 10;
const uniq = a => [...new Set(a)];
const lc = s => String(s == null ? '' : s).toLowerCase();
const fmtPct = x => Math.round(x * 100) + '%';
const firstName = u => (u && u.name ? u.name.split(' ')[0] : 'Someone');
let _idc = 0;
const uid = p => p + Date.now().toString(36).slice(-5) + (++_idc).toString(36) + Math.random().toString(36).slice(2, 5);

class AppError extends Error { constructor(msg, field) { super(msg); this.field = field || null; this.isApp = true; } }
const fail = (msg, field) => { throw new AppError(msg, field); };

function rng(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}
const hashHue = s => Math.floor(rng('hue' + s)() * 360);

/* ---------------- constants ---------------- */
const ROLES = ['Frontend', 'Backend', 'ML/AI', 'Mobile', 'UI/UX Design', 'DevOps', 'Pitch/PM'];
const ROLE_KEY = { 'Frontend': 'fe', 'Backend': 'be', 'ML/AI': 'ml', 'Mobile': 'mob', 'UI/UX Design': 'ux', 'DevOps': 'ops', 'Pitch/PM': 'pm' };
const ROLE_PERSON = { 'Frontend': 'Frontend dev', 'Backend': 'Backend dev', 'ML/AI': 'ML engineer', 'Mobile': 'Mobile dev', 'UI/UX Design': 'Designer', 'DevOps': 'DevOps engineer', 'Pitch/PM': 'Pitch lead' };
const SKILLS = ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Tailwind CSS', 'HTML/CSS', 'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Go', 'Rust', 'Java', 'Kotlin', 'Swift', 'Dart', 'Flutter', 'React Native', 'Android', 'iOS', 'Python', 'C++', 'C', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase', 'GraphQL', 'REST APIs', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform', 'Linux', 'CI/CD', 'PyTorch', 'TensorFlow', 'scikit-learn', 'Pandas', 'NLP', 'Computer Vision', 'LLMs', 'LangChain', 'Time series', 'Data analysis', 'SQL', 'Tableau', 'Statistics', 'R', 'Excel', 'Figma', 'Framer', 'Prototyping', 'User research', 'Illustration', 'Product strategy', 'Public speaking', 'Pitching', 'Solidity', 'Web3', 'Arduino', 'ESP32', 'Raspberry Pi', 'Embedded C', 'Unity', 'Blender', 'Three.js', 'Git'];
const THEMES = ['AI/ML', 'FinTech', 'HealthTech', 'Climate', 'Web3', 'Open Source', 'EdTech', 'Gaming', 'Social Good', 'IoT', 'Developer Tools', 'Data Science', 'Open Innovation'];
const SKILL_THEMES = { pytorch: ['AI/ML'], tensorflow: ['AI/ML'], llms: ['AI/ML'], langchain: ['AI/ML'], nlp: ['AI/ML'], 'computer vision': ['AI/ML', 'HealthTech'], 'scikit-learn': ['AI/ML', 'Data Science'], pandas: ['Data Science'], 'data analysis': ['Data Science'], statistics: ['Data Science'], r: ['Data Science'], tableau: ['Data Science'], 'time series': ['Climate', 'Data Science'], solidity: ['Web3', 'FinTech'], web3: ['Web3'], arduino: ['IoT'], esp32: ['IoT', 'Climate'], 'raspberry pi': ['IoT'], 'embedded c': ['IoT'], unity: ['Gaming'], blender: ['Gaming'], 'three.js': ['Gaming'], git: ['Open Source', 'Developer Tools'], linux: ['Open Source', 'Developer Tools'], rust: ['Developer Tools', 'Open Source'], go: ['Developer Tools'], docker: ['Developer Tools'], kubernetes: ['Developer Tools'], 'user research': ['Social Good', 'HealthTech'], postgresql: ['FinTech'], sql: ['FinTech', 'Data Science'], flutter: ['Social Good', 'HealthTech'], react: ['EdTech', 'Open Innovation'], 'product strategy': ['Open Innovation', 'FinTech'] };
const ROLE_THEMES = { 'ML/AI': ['AI/ML', 'Data Science'], 'DevOps': ['Developer Tools', 'Open Source'], 'Mobile': ['Social Good', 'HealthTech'], 'UI/UX Design': ['Social Good', 'EdTech'], 'Pitch/PM': ['Open Innovation', 'FinTech'], 'Backend': ['FinTech', 'Developer Tools'], 'Frontend': ['EdTech', 'Open Innovation'] };
const CF_RANKS = [
  { title: 'Newbie', min: 0, cls: 'gray' }, { title: 'Pupil', min: 1200, cls: 'green' }, { title: 'Specialist', min: 1400, cls: 'cyan' },
  { title: 'Expert', min: 1600, cls: 'blue' }, { title: 'Candidate Master', min: 1900, cls: 'violet' }, { title: 'Master', min: 2100, cls: 'orange' },
  { title: 'International Master', min: 2300, cls: 'orange' }, { title: 'Grandmaster', min: 2400, cls: 'red' },
  { title: 'International Grandmaster', min: 2600, cls: 'red' }, { title: 'Legendary Grandmaster', min: 3000, cls: 'red' }];
const cfRankFor = r => CF_RANKS.filter(x => r >= x.min).pop() || CF_RANKS[0];
const BRANCHES = ['Computer Science', 'Information Science', 'Information Technology', 'Electronics and Communication', 'Electrical and Electronics', 'Mechanical', 'Civil', 'Chemical', 'Data Science', 'AI and ML', 'Biotechnology', 'Design', 'Other'];
const CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Mangaluru', 'Manipal', 'Vellore', 'Pilani', 'Tiruchirappalli', 'Kochi', 'Indore', 'Bhubaneswar', 'Chandigarh', 'Noida', 'Gurugram'];
const TIMEZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Los_Angeles', 'UTC'];
const AVAIL = { looking: 'Looking for team', inteam: 'In a team', unavailable: 'Not available' };
const MODE_LABEL = { online: 'Online', offline: 'Offline', hybrid: 'Hybrid', any: 'Any mode' };
const NOTIF_TYPES = [
  { key: 'invite', label: 'Team invites and join requests', inapp: true, email: true },
  { key: 'response', label: 'Your invites and requests are accepted, declined or expire', inapp: true, email: true },
  { key: 'reply', label: 'Replies to your posts', inapp: true, email: false },
  { key: 'message', label: 'New messages', inapp: true, email: false },
  { key: 'hackathon', label: 'New hackathons matching your interests', inapp: true, email: true },
  { key: 'deadline', label: 'Registration deadline in 48 hours', inapp: true, email: true },
  { key: 'score', label: 'Builder Score changes', inapp: true, email: false },
  { key: 'team', label: 'Team updates and hackathon results', inapp: true, email: true }];
const RATE_NOUN = { post: 'posts', reply: 'replies', invite: 'invites', request: 'join requests', dm: 'new message requests', report: 'reports' };
const REPORT_REASONS = ['Spam or promotion', 'Harassment or hate', 'Inappropriate content', 'Inaccurate stats', 'Impersonation', 'Something else'];
const RESULT_PTS = { winner: 1, finalist: 0.6, participated: 0.2 };
const RESULT_LABEL = { winner: 'Winner', finalist: 'Finalist', participated: 'Participated' };
const HACK_COLORS = ['blue', 'teal', 'violet', 'orange', 'pink', 'slate', 'gold', 'green'];

/* ---------------- storage ---------------- */
const SCHEMA = 7;
const STORE_KEY = 'alstr.demo.db';
const SESSION_KEY = 'alstr.demo.session';
let DB = null;
let SESS = null;
const memStore = {};
let storageOK = true;
const hooks = {};
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { storageOK = false; return k in memStore ? memStore[k] : null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { storageOK = false; memStore[k] = v; } }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { delete memStore[k]; } }
function loadDB() {
  let d = null;
  const raw = lsGet(STORE_KEY);
  if (raw) { try { d = JSON.parse(raw); } catch (e) { d = null; } }
  if (!d || d.v !== SCHEMA) { DB = seed(); saveNow(); } else DB = d;
  try { SESS = JSON.parse(lsGet(SESSION_KEY) || 'null'); } catch (e) { SESS = null; }
  return DB;
}
let saveTimer = null;
function save() { if (saveTimer) return; saveTimer = setTimeout(() => { saveTimer = null; saveNow(); }, 40); }
function saveNow() { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; } lsSet(STORE_KEY, JSON.stringify(DB)); }
function resetDemo() { lsDel(STORE_KEY); lsDel(SESSION_KEY); SESS = null; DB = seed(); saveNow(); }
const now = () => Date.now() + (DB ? DB.clock || 0 : 0);
const nextSeq = () => (DB.seq = (DB.seq || 0) + 1);

const U = id => DB.users.find(u => u.id === id);
const H = id => DB.hackathons.find(h => h.id === id);
const T = id => DB.teams.find(t => t.id === id);
const P = id => DB.posts.find(p => p.id === id);
const C = id => DB.convs.find(c => c.id === id);
const isMember = (t, uid2) => !!t && t.members.some(m => m.userId === uid2);
const students = () => DB.users.filter(u => u.role === 'student' && u.status !== 'deleted');

/* ---------------- formatting ---------------- */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDate(ts, withYear) { const d = new Date(ts); const y = d.getFullYear() !== new Date(now()).getFullYear(); return d.getDate() + ' ' + MONTHS[d.getMonth()] + (withYear || y ? ' ' + d.getFullYear() : ''); }
function fmtTime(ts) { const d = new Date(ts); let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, '0'); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return h + ':' + m + ' ' + ap; }
const fmtDateTime = ts => fmtDate(ts) + ', ' + fmtTime(ts);
function fmtDur(ms) {
  ms = Math.max(0, ms); const d = Math.floor(ms / DAY), h = Math.floor((ms % DAY) / HOUR), m = Math.floor((ms % HOUR) / MIN);
  if (d >= 2) return d + ' days'; if (d === 1) return '1 day ' + h + 'h'; if (h >= 1) return h + 'h ' + m + 'm'; return Math.max(1, m) + ' min';
}
function fmtCountdown(ms) {
  ms = Math.max(0, ms); const d = Math.floor(ms / DAY), h = Math.floor((ms % DAY) / HOUR), m = Math.floor((ms % HOUR) / MIN), s = Math.floor((ms % MIN) / 1000);
  const p = n => String(n).padStart(2, '0');
  return d > 0 ? `${d}d ${p(h)}h ${p(m)}m` : `${p(h)}h ${p(m)}m ${p(s)}s`;
}
function fmtRel(ts) {
  const diff = now() - ts, a = Math.abs(diff); let s;
  if (a < MIN) return 'just now';
  if (a < HOUR) s = Math.round(a / MIN) + ' min'; else if (a < DAY) s = Math.round(a / HOUR) + 'h'; else if (a < 30 * DAY) s = Math.round(a / DAY) + 'd'; else return fmtDate(ts, true);
  return diff > 0 ? s + ' ago' : 'in ' + s;
}
const fmtDays = d => (d < 1 ? Math.max(1, Math.round(d * 24)) + ' hours' : Math.round(d) + (Math.round(d) === 1 ? ' day' : ' days'));
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const num = n => Number(n || 0).toLocaleString('en-IN');

/* ---------------- hackathon status ---------------- */
function hackStatus(h, t) {
  t = t == null ? now() : t;
  if (t > h.endAt) return { key: 'ended', label: 'Ended' };
  if (t >= h.startAt) return { key: 'ongoing', label: 'Ongoing' };
  if (t > h.regDeadline) return { key: 'upcoming', label: 'Upcoming', sub: 'Registration closed' };
  if (t >= (h.regOpensAt || h.createdAt)) return { key: 'open', label: 'Registration open' };
  return { key: 'upcoming', label: 'Upcoming', sub: 'Registration opens ' + fmtDate(h.regOpensAt) };
}

/* =====================================================================
   Builder Score engine
   ===================================================================== */
function uniFactor(user, cfg) {
  cfg = cfg || DB.config;
  const id = user.profile && user.profile.college;
  const u = cfg.universities.find(x => x.id === id) || cfg.universities.find(x => x.id === 'other');
  const name = id === 'other' && user.profile.collegeName ? user.profile.collegeName : (u ? u.name : 'College not set');
  return { name: id ? name : 'College not set', factor: u ? u.factor : 0.88, listed: !!u && u.id !== 'other' };
}
const toTen = (scale, v) => (scale === '4' ? +v * 2.5 : scale === 'pct' ? +v / 10 : +v);
function slopeOf(pts) {
  if (pts.length < 2) return 0;
  const mx = mean(pts.map(p => p[0])), my = mean(pts.map(p => p[1]));
  let n = 0, d = 0; for (const [x, y] of pts) { n += (x - mx) * (y - my); d += (x - mx) ** 2; }
  return d ? n / d : 0;
}
function academicsSummary(user) {
  const sems = ((user.academics && user.academics.semesters) || []).filter(s => s.value !== '' && s.value != null && !isNaN(+s.value)).slice().sort((a, b) => a.sem - b.sem);
  if (!sems.length) return null;
  const vals = sems.map(s => ({ sem: +s.sem, scale: s.scale, raw: +s.value, ten: clamp(toTen(s.scale, s.value), 0, 10) }));
  return { vals, cgpa: mean(vals.map(v => v.ten)), slope: slopeOf(vals.map(v => [v.sem, v.ten])) };
}
function compAcademics(user, cfg) {
  const out = { key: 'academics', label: 'Academics', status: 'self', inputs: [] };
  const s = academicsSummary(user);
  if (!s) return Object.assign(out, { status: 'missing', score: 0, missingHint: 'Semester marks not added' });
  const base = clamp((s.cgpa - 4) / 6, 0, 1);
  const trend = s.vals.length >= 2 ? clamp(s.slope * 0.1, -0.05, 0.05) : 0;
  const uf = uniFactor(user, cfg);
  out.score = clamp(base + trend, 0, 1) * uf.factor;
  out.inputs = [
    { label: 'CGPA, normalized to 10', value: s.cgpa.toFixed(2), note: `from ${s.vals.length} semester${s.vals.length > 1 ? 's' : ''}` },
    { label: 'CGPA score', value: fmtPct(base), note: '(CGPA − 4) ÷ 6' },
    { label: 'Semester trend', value: (s.slope >= 0 ? '+' : '−') + Math.abs(s.slope).toFixed(2) + ' per semester', note: (trend >= 0 ? '+' : '−') + (Math.abs(trend) * 100).toFixed(1) + ' points, capped at ±5' },
    { label: 'University factor', value: '×' + uf.factor.toFixed(2), note: uf.name }];
  return out;
}
function compDSA(user) {
  const out = { key: 'dsa', label: 'DSA', status: 'self', inputs: [] };
  const l = user.leetcode, c = user.codeforces;
  if (!l && !c) return Object.assign(out, { status: 'missing', score: 0, missingHint: 'LeetCode and Codeforces not added' });
  const E = l ? l.easy : 0, M = l ? l.medium : 0, Hd = l ? l.hard : 0, CS = c ? c.solved : 0;
  const W = E + 3 * M + 5 * Hd + 3 * CS;
  const solved = Math.min(1, Math.log(1 + W / 50) / Math.log(61));
  const lcR = l && l.contestRating ? clamp((l.contestRating - 1400) / 1000, 0, 1) : 0;
  const cfR = c && c.rating ? clamp((c.rating - 800) / 1300, 0, 1) : 0;
  const rating = Math.max(lcR, cfR);
  out.score = 0.6 * solved + 0.4 * rating;
  out.inputs = [
    { label: 'Difficulty-weighted solved', value: num(W), note: `${E} easy ×1 + ${M} medium ×3 + ${Hd} hard ×5` + (CS ? ` + ${CS} Codeforces ×3` : '') },
    { label: 'Solved score, log-scaled', value: fmtPct(solved), note: 'ln(1 + W ÷ 50) ÷ ln(61); 3,000 = 100%' },
    { label: 'Best contest rating', value: rating ? (lcR >= cfR ? `LeetCode ${l.contestRating}` : `Codeforces ${c.rating}`) : 'No contests yet', note: rating ? fmtPct(rating) + ' (LeetCode 1400–2400, Codeforces 800–2100)' : '' },
    { label: 'Mix', value: '60% solved + 40% rating' }];
  return out;
}
function repoPoints(r) {
  if (r.fork) return { pts: 0, why: 'Fork' };
  if ((r.commits || 0) < 5) return { pts: 0, why: 'Under 5 commits' };
  const act = Math.min(3, ((r.commits12m || 0) / 20) * 3), st = Math.min(4, Math.log2(1 + (r.stars || 0))), rd = r.hasReadme ? 1 : 0;
  return { pts: Math.min(10, 2 + act + st + rd), act, st, rd };
}
function compGitHub(user) {
  const out = { key: 'github', label: 'GitHub', status: 'verified', inputs: [] };
  const g = user.github;
  if (!g) return Object.assign(out, { status: 'missing', score: 0, missingHint: 'GitHub not connected' });
  const scored = g.repos.map(r => Object.assign({ r }, repoPoints(r)));
  const active = scored.filter(x => x.pts > 0);
  const counted = active.slice().sort((a, b) => b.pts - a.pts).slice(0, 6);
  const repoTotal = sum(counted.map(x => x.pts));
  const commitScore = Math.min(1, Math.log(1 + (g.commits12m || 0) / 20) / Math.log(31));
  const langs = uniq(active.map(x => x.r.language).filter(Boolean));
  const langScore = Math.min(1, langs.length / 5);
  out.score = 0.5 * (repoTotal / 60) + 0.3 * commitScore + 0.2 * langScore;
  out.repos = scored; out.counted = counted.map(x => x.r.name);
  out.inputs = [
    { label: 'Original repos with real activity', value: `${active.length} of ${g.repos.length}`, note: 'forks and repos under 5 commits score 0' },
    { label: 'Repo points, top 6', value: round1(repoTotal) + ' / 60', note: 'each repo capped at 10: base 2 + activity 3 + stars 4 + README 1' },
    { label: 'Commits in the last 12 months', value: num(g.commits12m || 0), note: fmtPct(commitScore) + ', log-scaled; 600 = 100%' },
    { label: 'Languages', value: langs.length ? langs.join(', ') : 'None', note: fmtPct(langScore) + '; 5 or more = 100%' },
    { label: 'Mix', value: '50% repos + 30% commits + 20% languages' }];
  return out;
}
function verifiedResults(userId) {
  return DB.teams.filter(t => t.result && t.result.verification === 'verified' && t.members.some(m => m.userId === userId))
    .map(t => ({ team: t, hack: H(t.hackathonId), status: t.result.status }));
}
function compResume(user) {
  const out = { key: 'resume', label: 'Resume', status: 'self', inputs: [] };
  const r = user.resume && user.resume.confirmed;
  const vr = verifiedResults(user.id);
  if (!r && !vr.length) return Object.assign(out, { status: 'missing', score: 0, missingHint: user.resume ? 'Parsed resume waiting for your review' : 'Resume not uploaded' });
  const n = k => (r ? (r[k] || []).length : 0);
  const I = n('internships'), Pj = n('projects'), Ce = n('certifications'), Wn = n('hackathonWins');
  const vp = sum(vr.map(v => RESULT_PTS[v.status] || 0));
  const hp = Math.min(2, Wn * 0.5 + vp);
  out.score = 0.35 * Math.min(1, I / 2) + 0.25 * Math.min(1, Pj / 4) + 0.25 * (hp / 2) + 0.15 * Math.min(1, Ce / 3);
  if (vr.length) out.status = 'mixed';
  out.inputs = [
    { label: 'Internships', value: String(I), note: '2 or more = full 35%' },
    { label: 'Projects', value: String(Pj), note: '4 or more = full 25%' },
    { label: 'Hackathon results', value: round1(hp) + ' / 2', note: `${Wn} on resume (0.5 each) + ${vr.length} verified on Alstr (winner 1, finalist 0.6, participated 0.2)` },
    { label: 'Certifications', value: String(Ce), note: '3 or more = full 15%' }];
  return out;
}
function computeScore(user, cfg) {
  cfg = cfg || DB.config;
  const w = cfg.weights;
  const comps = [compAcademics(user, cfg), compDSA(user), compGitHub(user), compResume(user)];
  let total = 0;
  for (const c of comps) { c.weight = w[c.key]; c.max = w[c.key] * 10; c.points = Math.round(c.score * c.max); total += c.points; }
  return { total, comps };
}
function refreshScore(user, reason, silent) {
  if (!user || user.role !== 'student' || user.status === 'deleted') return;
  const s = computeScore(user);
  const prev = user.score ? user.score.total : null;
  user.score = { total: s.total, at: now() };
  if (prev === null || prev !== s.total) {
    user.scoreHistory = user.scoreHistory || [];
    user.scoreHistory.push({ at: now(), score: s.total, reason: reason || 'Updated' });
    if (user.scoreHistory.length > 60) user.scoreHistory.shift();
    if (prev !== null && !silent) {
      const d = s.total - prev;
      notify(user.id, 'score', { title: `Your Builder Score ${d > 0 ? 'went up' : 'went down'} ${Math.abs(d)} point${Math.abs(d) === 1 ? '' : 's'}`, body: `Now ${s.total}. ${reason || ''}`.trim(), link: 'me' });
    }
  }
  save();
}
const scoreOf = u => (u && u.score ? u.score.total : 0);
function percentile(user) {
  const xs = students().filter(u => u.onboarded).map(scoreOf);
  if (xs.length < 5) return null;
  const mine = scoreOf(user);
  return Math.max(1, Math.round((xs.filter(x => x >= mine).length / xs.length) * 100));
}
const totalSolved = u => (u.leetcode ? u.leetcode.total : 0) + (u.codeforces ? u.codeforces.solved : 0);
function peerAggregate(userId) {
  const rs = DB.teams.flatMap(t => (t.ratings || []).filter(r => r.to === userId));
  if (rs.length < 3) return { count: rs.length, shown: false };
  const avg = k => round1(mean(rs.map(r => r[k])));
  const a = { count: rs.length, shown: true, reliability: avg('reliability'), communication: avg('communication'), skill: avg('skill') };
  a.overall = round1((a.reliability + a.communication + a.skill) / 3);
  return a;
}
const COMPLETE = [
  { key: 'basics', label: 'Add your college, branch, year and city', w: 15, done: u => !!(u.name && u.profile.college && u.profile.branch && u.profile.gradYear && u.profile.semester && u.profile.city), act: 'profile-edit' },
  { key: 'roles', label: 'Pick roles and at least 3 skills', w: 10, done: u => u.profile.roles.length > 0 && u.profile.skills.length >= 3, act: 'profile-edit' },
  { key: 'bio', label: 'Write a short bio', w: 5, done: u => (u.profile.bio || '').trim().length >= 20, act: 'profile-edit' },
  { key: 'github', label: 'Connect GitHub', w: 20, done: u => !!u.github, act: 'github-connect' },
  { key: 'coding', label: 'Add LeetCode or Codeforces stats', w: 15, done: u => !!(u.leetcode || u.codeforces), act: 'coding-edit' },
  { key: 'academics', label: 'Add your semester marks', w: 10, done: u => !!academicsSummary(u), act: 'academics-edit' },
  { key: 'resume', label: 'Upload and confirm your resume', w: 20, done: u => !!(u.resume && u.resume.confirmed), act: 'resume-open' },
  { key: 'availability', label: 'Set your availability', w: 5, done: u => !!u.profile.availability, act: 'profile-edit' }];
function completeness(u) { const done = COMPLETE.filter(c => c.done(u)); return { pct: sum(done.map(c => c.w)), missing: COMPLETE.filter(c => !c.done(u)) }; }
const BADGES = [
  { key: 'first', label: 'First hackathon', desc: 'Has a verified hackathon result', test: u => verifiedResults(u.id).length >= 1 },
  { key: 'finalist', label: 'Finalist', desc: 'Reached a hackathon final (verified)', test: u => verifiedResults(u.id).some(v => v.status === 'finalist') },
  { key: 'winner', label: 'Winner', desc: 'Won a hackathon (verified)', test: u => verifiedResults(u.id).some(v => v.status === 'winner') },
  { key: 'solved', label: '500+ problems solved', desc: 'LeetCode and Codeforces combined', test: u => totalSolved(u) >= 500 },
  { key: 'contest', label: 'Contest regular', desc: 'LeetCode 1800+ or Codeforces 1600+', test: u => ((u.leetcode && u.leetcode.contestRating) || 0) >= 1800 || ((u.codeforces && u.codeforces.rating) || 0) >= 1600 },
  { key: 'stars', label: '50+ GitHub stars', desc: 'Across original repos', test: u => !!u.github && sum(u.github.repos.filter(r => !r.fork).map(r => r.stars)) >= 50 },
  { key: 'mate', label: 'Great teammate', desc: 'Peer rating 4.5+ from 3 or more teammates', test: u => { const a = peerAggregate(u.id); return !!a.shown && a.overall >= 4.5; } },
  { key: 'complete', label: 'Complete profile', desc: 'Every profile section filled in', test: u => completeness(u).pct === 100 }];
const badgesOf = u => BADGES.filter(b => b.test(u));

/* =====================================================================
   Notifications, sessions, permissions, rate limits
   ===================================================================== */
const defaultPrefs = () => Object.fromEntries(NOTIF_TYPES.map(t => [t.key, { inapp: t.inapp, email: t.email }]));
function notify(userId, type, o) {
  const u = U(userId); if (!u || u.status === 'deleted') return;
  const pref = (u.notifPrefs || {})[type];
  const inapp = type === 'system' || !pref || pref.inapp !== false;
  const email = type === 'system' || (pref ? !!pref.email : false);
  if (inapp) {
    const ex = type === 'message' && o.convId ? DB.notifications.find(n => n.userId === userId && !n.read && n.type === 'message' && n.convId === o.convId) : null;
    if (ex) { Object.assign(ex, { title: o.title, body: o.body || '', at: now() }); }
    else DB.notifications.unshift({ id: uid('n'), userId, type, title: o.title, body: o.body || '', link: o.link || '', convId: o.convId || null, at: now(), read: false });
    if (DB.notifications.length > 400) DB.notifications.length = 400;
  }
  if (email) { DB.emails.unshift({ id: uid('e'), userId, to: u.email, type, subject: o.title, at: now() }); if (DB.emails.length > 200) DB.emails.length = 200; }
  if (inapp && hooks.onNotify) hooks.onNotify(userId, Object.assign({ type }, o));
  save();
}
function deviceLabel() {
  try {
    const ua = navigator.userAgent;
    const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'this device';
    const br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    return br + ' on ' + os;
  } catch (e) { return 'This device'; }
}
function setSession(s) { SESS = s; if (s) lsSet(SESSION_KEY, JSON.stringify(s)); else lsDel(SESSION_KEY); }
function me() {
  if (!SESS || !DB) return null;
  const u = U(SESS.userId);
  if (!u || u.status === 'deleted' || !(u.sessions || []).some(x => x.id === SESS.sid)) { setSession(null); return null; }
  if (u.status === 'banned') { u.sessions = []; setSession(null); save(); if (hooks.onBanned) hooks.onBanned(); return null; }
  return u;
}
function startSession(u) {
  const sid = uid('s');
  u.sessions = (u.sessions || []).concat({ id: sid, device: deviceLabel(), createdAt: now(), lastSeen: now() });
  u.lastActiveAt = now();
  setSession({ userId: u.id, sid }); save();
}
function requireUser() { const u = me(); if (!u) fail('Sign in to continue.'); u.lastActiveAt = now(); return u; }
function requireActive(u) { if (u.suspendedUntil && u.suspendedUntil > now()) fail(`Your account is suspended until ${fmtDateTime(u.suspendedUntil)}. You can browse, but you can’t post, message or send requests.`); }
function requireStudent() { const u = requireUser(); if (u.role !== 'student') fail('Only student accounts can do this.'); requireActive(u); return u; }
function requireAdmin() { const u = requireUser(); if (u.role !== 'admin') fail('Admin access only (403).'); return u; }
function rateCheck(u, action) {
  const lim = DB.config.rateLimits[action]; if (!lim) return;
  const r = (DB.rate[u.id] = DB.rate[u.id] || {});
  const list = (r[action] || []).filter(t => t > now() - DAY);
  if (list.length >= lim) fail(`Daily limit reached: you can send ${lim} ${RATE_NOUN[action]} a day. Try again in ${fmtDur(list[0] + DAY - now())}.`);
  list.push(now()); r[action] = list;
}
function rateLeft(u, action) { const lim = DB.config.rateLimits[action]; const list = ((DB.rate[u.id] || {})[action] || []).filter(t => t > now() - DAY); return Math.max(0, lim - list.length); }
function isBlockedEither(a, b) { const ua = U(a), ub = U(b); return !!((ua && (ua.blocked || []).includes(b)) || (ub && (ub.blocked || []).includes(a))); }
function req(v, min, max, label, field) { v = String(v == null ? '' : v).trim(); if (v.length < min) fail(min <= 1 ? `${label} is required.` : `${label} needs at least ${min} characters.`, field); if (v.length > max) fail(`${label} can be up to ${max} characters.`, field); return v; }
function intField(v, label, min, max, field, optional) {
  if (v === '' || v == null) { if (optional) return null; fail(`Enter the ${label}.`, field); }
  const s = String(v).trim().replace(/,/g, '');
  if (!/^\d+$/.test(s)) fail(`The ${label} must be a whole number.`, field);
  const n = +s; if (n < min || n > max) fail(`The ${label} should be between ${num(min)} and ${num(max)}.`, field);
  return n;
}
const httpsOk = v => /^https:\/\/[^\s/$.?#][^\s]*\.[^\s]+$/i.test(v);

/* =====================================================================
   GitHub data (simulated OAuth fetch; deterministic per username)
   ===================================================================== */
const GH_A = ['campus', 'pulse', 'ledger', 'vision', 'metro', 'krishi', 'swasth', 'paisa', 'quiz', 'notes', 'smart', 'green', 'rain', 'hostel', 'canteen', 'shuttle', 'attend', 'study', 'event', 'civic'];
const GH_B = ['api', 'app', 'bot', 'tracker', 'kit', 'hub', 'lens', 'flow', 'sense', 'map', 'dash', 'ml', 'cli', 'web', 'sync'];
const SKILL_LANG = { python: 'Python', pytorch: 'Python', django: 'Python', fastapi: 'Python', flask: 'Python', pandas: 'Jupyter Notebook', go: 'Go', rust: 'Rust', java: 'Java', 'spring boot': 'Java', kotlin: 'Kotlin', dart: 'Dart', flutter: 'Dart', react: 'TypeScript', typescript: 'TypeScript', 'next.js': 'TypeScript', javascript: 'JavaScript', 'node.js': 'JavaScript', 'react native': 'TypeScript', svelte: 'Svelte', 'c++': 'C++', 'embedded c': 'C', arduino: 'C++', solidity: 'Solidity', swift: 'Swift', 'html/css': 'HTML', r: 'R', terraform: 'HCL', 'three.js': 'JavaScript' };
function genGitHub(username, skills) {
  const r = rng('gh:' + lc(username));
  const pref = uniq((skills || []).map(s => SKILL_LANG[lc(s)]).filter(Boolean));
  const pool = pref.length ? pref.concat(['JavaScript', 'Python', 'Shell']) : ['JavaScript', 'Python', 'TypeScript', 'Java', 'Go', 'C++', 'Shell'];
  const n = 6 + Math.floor(r() * 11), repos = [], used = new Set();
  let c12 = 0;
  for (let i = 0; i < n; i++) {
    let name; do { name = GH_A[Math.floor(r() * GH_A.length)] + '-' + GH_B[Math.floor(r() * GH_B.length)]; } while (used.has(name)); used.add(name);
    const fork = r() < 0.18, empty = !fork && r() < 0.15;
    const commits = fork ? 0 : empty ? Math.floor(r() * 4) : 5 + Math.floor(r() ** 1.6 * 260);
    const commits12m = Math.min(commits, Math.floor(commits * r() * 0.9));
    const stars = fork || empty ? 0 : Math.floor(r() ** 3 * 60);
    repos.push({ name, fork, language: pool[Math.floor(r() * pool.length)], stars, commits, commits12m, hasReadme: !empty && r() < 0.72, description: '', updatedAt: now() - Math.floor(r() * 200) * DAY });
    c12 += commits12m;
  }
  return { repos, commits12m: c12 + Math.floor(r() * 120) };
}

/* =====================================================================
   API — auth
   ===================================================================== */
const api = {};
const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
function blankProfile() { return { college: '', collegeName: '', branch: '', gradYear: '', semester: '', city: '', timezone: 'Asia/Kolkata', roles: [], skills: [], bio: '', availability: 'looking' }; }
function newStudent(email, name) {
  return { id: uid('u'), role: 'student', email, name, hue: hashHue(email), createdAt: now(), lastActiveAt: now(), status: 'active', onboarded: false,
    profile: blankProfile(), github: null, leetcode: null, codeforces: null, statLog: [], academics: { semesters: [] }, resume: null,
    privacy: { showMarks: false }, notifPrefs: defaultPrefs(), scoreHistory: [], score: null, bookmarks: [], blocked: [], sessions: [], warnings: [], suspendedUntil: null };
}
api.googleSignIn = ({ email, name }) => {
  email = lc(email).trim();
  if (!validEmail(email)) fail('Enter a valid Google account email.', 'email');
  let u = DB.users.find(x => x.email === email && x.status !== 'deleted');
  if (u && u.role === 'admin') fail('Admin accounts sign in through the admin login.', 'email');
  if (u && u.status === 'banned') fail('This account has been banned for breaking the community guidelines.', 'email');
  let isNew = false;
  if (!u) { u = newStudent(email, String(name || '').trim() || email.split('@')[0]); DB.users.push(u); isNew = true; }
  startSession(u);
  return { user: u, isNew };
};
function totp(t) { const step = Math.floor((t == null ? Date.now() : t) / 30000); return String(Math.floor(rng('alstr-2fa-' + step)() * 1e6)).padStart(6, '0'); }
api.adminStart = email => { email = lc(email).trim(); if (!DB.config.adminAllowList.includes(email)) fail('This Google account isn’t on the admin allow-list.', 'email'); return { email }; };
api.adminVerify = (email, code) => {
  if (!DB.config.adminAllowList.includes(lc(email))) fail('This Google account isn’t on the admin allow-list.');
  code = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(code)) fail('Enter the 6-digit code from your authenticator app.', 'code');
  const t = Date.now();
  if (code !== totp(t) && code !== totp(t - 30000)) fail('That code didn’t match. Codes change every 30 seconds.', 'code');
  let u = DB.users.find(x => x.email === lc(email) && x.role === 'admin');
  if (!u) { u = { id: uid('a'), role: 'admin', email: lc(email), name: 'Alstr Ops', hue: 230, createdAt: now(), status: 'active', sessions: [], blocked: [], notifPrefs: defaultPrefs() }; DB.users.push(u); }
  startSession(u); return u;
};
api.logout = () => { const u = me(); if (u) u.sessions = (u.sessions || []).filter(s => s.id !== SESS.sid); setSession(null); save(); };
api.logoutAll = () => { const u = requireUser(); u.sessions = []; setSession(null); save(); };

/* ---------------- profile ---------------- */
function cleanBasics(d) {
  const name = req(d.name, 2, 60, 'Full name', 'name');
  if (!DB.config.universities.some(x => x.id === d.college)) fail('Choose your college from the list.', 'college');
  const collegeName = d.college === 'other' ? req(d.collegeName, 3, 80, 'College name', 'collegeName') : '';
  if (!BRANCHES.includes(d.branch)) fail('Choose your branch.', 'branch');
  const yr = new Date(now()).getFullYear(), gy = +d.gradYear;
  if (!(gy >= yr - 1 && gy <= yr + 6)) fail(`Choose a graduation year between ${yr - 1} and ${yr + 6}.`, 'gradYear');
  const sem = +d.semester; if (!(sem >= 1 && sem <= 10)) fail('Choose your current semester.', 'semester');
  const city = req(d.city, 2, 40, 'City', 'city');
  const timezone = TIMEZONES.includes(d.timezone) ? d.timezone : 'Asia/Kolkata';
  return { name, college: d.college, collegeName, branch: d.branch, gradYear: String(gy), semester: String(sem), city, timezone };
}
function cleanRolesSkills(d) {
  const roles = (d.roles || []).filter(r => ROLES.includes(r));
  if (!roles.length) fail('Pick at least one role you like to play.', 'roles');
  const skills = uniq((d.skills || []).map(s => String(s).trim()).filter(Boolean)).slice(0, 25);
  if (skills.length < 3) fail('Add at least 3 skills.', 'skills');
  const bio = String(d.bio || '').trim(); if (bio.length > 280) fail('Keep your bio under 280 characters.', 'bio');
  const availability = AVAIL[d.availability] ? d.availability : 'looking';
  return { roles, skills, bio, availability };
}
api.saveOnboardingStep = (step, d) => {
  const u = requireUser();
  if (step === 1) { const b = cleanBasics(d); u.name = b.name; delete b.name; Object.assign(u.profile, b); }
  if (step === 2) Object.assign(u.profile, cleanRolesSkills(d));
  save();
};
api.finishOnboarding = () => {
  const u = requireUser();
  if (!u.profile.college || !u.profile.roles.length) fail('Finish the first two steps before continuing.');
  u.onboarded = true; refreshScore(u, 'Profile created', true); save();
};
api.updateProfile = d => {
  const u = requireStudent();
  const b = cleanBasics(d), rs = cleanRolesSkills(d);
  const collegeChanged = b.college !== u.profile.college;
  u.name = b.name; delete b.name; Object.assign(u.profile, b, rs);
  refreshScore(u, collegeChanged ? 'College changed' : 'Profile updated');
};
api.setAvailability = a => { const u = requireStudent(); if (!AVAIL[a]) fail('Unknown status.'); u.profile.availability = a; save(); };
api.setPrivacy = (k, v) => { const u = requireStudent(); if (!['showMarks'].includes(k)) fail('Unknown setting.'); u.privacy[k] = !!v; save(); };
api.setNotifPref = (type, ch, v) => { const u = requireUser(); if (!NOTIF_TYPES.some(t => t.key === type) || !['inapp', 'email'].includes(ch)) fail('Unknown setting.'); u.notifPrefs[type] = Object.assign({}, u.notifPrefs[type], { [ch]: !!v }); save(); };

/* ---------------- GitHub ---------------- */
api.githubConnect = username => {
  const u = requireStudent();
  username = String(username || '').trim().replace(/^@/, '');
  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username)) fail('Enter a valid GitHub username (letters, numbers and single hyphens).', 'gh');
  const data = DB.ghFixtures && DB.ghFixtures[lc(username)] ? JSON.parse(JSON.stringify(DB.ghFixtures[lc(username)])) : genGitHub(username, u.profile.skills);
  u.github = Object.assign({ username, connectedAt: now(), lastSyncedAt: now(), lastAttemptAt: now(), lastManualRefreshAt: 0, status: 'ok', error: '' }, data);
  refreshScore(u, 'GitHub connected');
  return u.github;
};
function githubSync(u, manual) {
  const g = u.github; if (!g) fail('Connect GitHub first.');
  if (manual) {
    const wait = (g.lastManualRefreshAt || 0) + HOUR - now();
    if (wait > 0) fail(`You can refresh again in ${fmtDur(wait)}. GitHub data also syncs automatically once a day.`);
    g.lastManualRefreshAt = now();
  }
  g.lastAttemptAt = now();
  if (DB.demo.failNextSync) { DB.demo.failNextSync = false; g.status = 'failed'; g.error = 'GitHub returned 503 Service Unavailable'; save(); return { ok: false }; }
  const r = rng(g.username + ':' + Math.floor(now() / HOUR));
  for (const repo of g.repos) {
    if (!repo.fork && repo.commits >= 5 && r() < 0.35) { const add = 1 + Math.floor(r() * 6); repo.commits += add; repo.commits12m += add; g.commits12m += add; if (r() < 0.2) repo.stars += 1; }
  }
  g.status = 'ok'; g.error = ''; g.lastSyncedAt = now();
  refreshScore(u, manual ? 'GitHub refreshed' : 'Daily GitHub sync');
  return { ok: true };
}
api.githubRefresh = () => githubSync(requireStudent(), true);
api.githubDisconnect = () => { const u = requireStudent(); u.github = null; refreshScore(u, 'GitHub disconnected'); };

/* ---------------- coding profiles (self-reported) ---------------- */
function logStat(u, source, before, after) {
  const reasons = [];
  if (before) {
    const days = Math.max(0.01, (now() - (before.updatedAt || 0)) / DAY);
    const sB = source === 'leetcode' ? before.total : before.solved, sA = source === 'leetcode' ? after.total : after.solved;
    const dS = sA - sB;
    if (days < 14 && dS > 150 && dS > 0.5 * Math.max(1, sB)) reasons.push(`Solved count jumped by ${num(dS)} in ${fmtDays(days)}`);
    if (dS < -50) reasons.push(`Solved count dropped by ${num(-dS)}`);
    const rB = source === 'leetcode' ? before.contestRating : before.rating, rA = source === 'leetcode' ? after.contestRating : after.rating;
    if (rB != null && rA != null && days < 14 && rA - rB > 300) reasons.push(`Rating jumped by ${rA - rB} in ${fmtDays(days)}`);
  }
  const strip = o => { const c = Object.assign({}, o); delete c.updatedAt; return c; };
  u.statLog = u.statLog || [];
  u.statLog.unshift({ id: uid('l'), at: now(), source, before: before ? strip(before) : null, after: strip(after), flagged: reasons.length > 0, reasons, review: reasons.length ? 'open' : null });
  if (u.statLog.length > 50) u.statLog.length = 50;
  return reasons;
}
api.saveLeetCode = d => {
  const u = requireStudent();
  const username = String(d.lc_username || '').trim();
  if (!/^[A-Za-z0-9_-]{3,30}$/.test(username)) fail('Enter your LeetCode username (3–30 letters, numbers, - or _).', 'lc_username');
  const url = String(d.lc_url || '').trim();
  if (url && !/^https:\/\/(www\.)?leetcode\.(com|cn)\/(u\/)?[A-Za-z0-9_-]+\/?$/.test(url)) fail('Use your public profile link, like https://leetcode.com/u/your-username', 'lc_url');
  const easy = intField(d.lc_easy, 'easy count', 0, 1500, 'lc_easy'), medium = intField(d.lc_medium, 'medium count', 0, 2500, 'lc_medium'), hard = intField(d.lc_hard, 'hard count', 0, 1200, 'lc_hard');
  const total = intField(d.lc_total, 'total solved', 0, 5000, 'lc_total');
  if (easy + medium + hard !== total) fail(`Easy + Medium + Hard is ${num(easy + medium + hard)}, but total solved says ${num(total)}. They need to match.`, 'lc_total');
  const contestRating = intField(d.lc_rating, 'contest rating', 0, 4000, 'lc_rating', true);
  const globalRank = intField(d.lc_rank, 'global ranking', 1, 10000000, 'lc_rank', true);
  const next = { username, url, easy, medium, hard, total, contestRating, globalRank, updatedAt: now() };
  const flags = logStat(u, 'leetcode', u.leetcode, next);
  u.leetcode = next; refreshScore(u, 'LeetCode stats updated');
  return { flagged: flags.length > 0 };
};
api.saveCodeforces = d => {
  const u = requireStudent();
  const handle = String(d.cf_handle || '').trim();
  if (!/^[A-Za-z0-9_.-]{3,24}$/.test(handle)) fail('Enter your Codeforces handle (3–24 characters).', 'cf_handle');
  const url = String(d.cf_url || '').trim();
  if (url && !/^https:\/\/(www\.)?codeforces\.com\/profile\/[A-Za-z0-9_.-]+\/?$/.test(url)) fail('Use your profile link, like https://codeforces.com/profile/your-handle', 'cf_url');
  const rating = intField(d.cf_rating, 'current rating', 0, 4000, 'cf_rating'), maxRating = intField(d.cf_max, 'max rating', 0, 4000, 'cf_max');
  if (maxRating < rating) fail('Max rating can’t be lower than your current rating.', 'cf_max');
  const rank = String(d.cf_rank || '');
  if (!CF_RANKS.some(r => r.title === rank)) fail('Choose your rank title.', 'cf_rank');
  const solved = intField(d.cf_solved, 'problems solved', 0, 10000, 'cf_solved');
  const next = { handle, url, rating, maxRating, rank, solved, updatedAt: now() };
  const flags = logStat(u, 'codeforces', u.codeforces, next);
  u.codeforces = next; refreshScore(u, 'Codeforces stats updated');
  const expected = cfRankFor(rating).title;
  return { flagged: flags.length > 0, warning: expected !== rank ? `A rating of ${rating} is usually “${expected}”, not “${rank}”. Double-check your rank title.` : '' };
};
api.removeCoding = src => { const u = requireStudent(); if (!['leetcode', 'codeforces'].includes(src)) fail('Unknown source.'); u[src] = null; refreshScore(u, (src === 'leetcode' ? 'LeetCode' : 'Codeforces') + ' removed'); };

/* ---------------- academics (self-reported) ---------------- */
api.saveAcademics = rows => {
  const u = requireStudent();
  const cur = +u.profile.semester || 10, seen = new Set();
  const out = (rows || []).filter(s => !(s.value === '' || s.value == null)).map((s, i) => {
    const sem = +s.sem;
    if (!(sem >= 1 && sem <= 10)) fail('Semester numbers go from 1 to 10.', 'sem_' + i);
    if (seen.has(sem)) fail(`Semester ${sem} is listed twice.`, 'sem_' + i); seen.add(sem);
    if (sem > cur) fail(`You’re in semester ${cur}, so semester ${sem} can’t have marks yet.`, 'sem_' + i);
    if (!['10', '4', 'pct'].includes(s.scale)) fail('Choose a grading scale.', 'scale_' + i);
    const max = s.scale === '10' ? 10 : s.scale === '4' ? 4 : 100, v = String(s.value).trim();
    if (!/^\d+(\.\d{1,2})?$/.test(v)) fail(`Semester ${sem}: enter a number like ${s.scale === 'pct' ? '78.5' : s.scale === '4' ? '3.6' : '8.4'}.`, 'val_' + i);
    if (+v > max) fail(`Semester ${sem}: ${s.scale === 'pct' ? 'percentage' : 'grade'} must be between 0 and ${max}.`, 'val_' + i);
    return { sem, scale: s.scale, value: +v };
  }).sort((a, b) => a.sem - b.sem);
  u.academics = { semesters: out, updatedAt: now() };
  refreshScore(u, 'Semester marks updated');
};

/* ---------------- resume (self-reported) ---------------- */
function sanitizeResume(d) {
  d = d || {};
  const rows = (a, keys, max) => (Array.isArray(a) ? a : []).map(x => { const o = {}; for (const k of keys) o[k] = String((x && x[k]) || '').trim().slice(0, 140); return o; }).filter(o => o[keys[0]]).slice(0, max);
  return { skills: uniq((Array.isArray(d.skills) ? d.skills : []).map(s => String(s).trim().slice(0, 40)).filter(Boolean)).slice(0, 30),
    internships: rows(d.internships, ['title', 'org', 'duration'], 10), projects: rows(d.projects, ['title', 'summary'], 15),
    certifications: rows(d.certifications, ['title', 'issuer'], 15), hackathonWins: rows(d.hackathonWins, ['title', 'result'], 10) };
}
api.setResumeParsed = (meta, parsed, parser) => {
  const u = requireStudent();
  if (!/\.pdf$/i.test(meta.name || '')) fail('Upload a PDF file.');
  if (meta.size > 5 * 1024 * 1024) fail('Resume must be 5 MB or smaller.');
  const prev = u.resume || {};
  u.resume = { fileName: meta.name, size: meta.size, fileKey: meta.key, uploadedAt: now(), parser, parsed: sanitizeResume(parsed), status: 'review', confirmed: prev.confirmed || null, confirmedAt: prev.confirmedAt || null, sharedWith: prev.sharedWith || [] };
  save();
};
api.confirmResume = data => {
  const u = requireStudent(); if (!u.resume) fail('Upload a resume first.');
  const clean = sanitizeResume(data);
  u.resume.confirmed = clean; u.resume.status = 'confirmed'; u.resume.confirmedAt = now();
  const have = new Set(u.profile.skills.map(lc));
  const added = clean.skills.filter(s => !have.has(lc(s))).slice(0, Math.max(0, 25 - u.profile.skills.length));
  u.profile.skills = u.profile.skills.concat(added);
  refreshScore(u, 'Resume confirmed');
  return { added };
};
api.deleteResume = () => { const u = requireStudent(); const key = u.resume && u.resume.fileKey; u.resume = null; refreshScore(u, 'Resume removed'); return key; };
api.shareResume = (toId, on) => {
  const u = requireStudent(); if (!u.resume) fail('Upload a resume first.');
  const t = U(toId); if (!t || t.role !== 'student' || t.id === u.id) fail('Choose a student to share with.');
  const s = new Set(u.resume.sharedWith || []); if (on) s.add(toId); else s.delete(toId); u.resume.sharedWith = [...s]; save();
};
api.resumeSignedUrl = ownerId => {
  const v = requireUser(), o = U(ownerId);
  if (!o || !o.resume) fail('No resume uploaded.');
  if (!(v.id === o.id || v.role === 'admin' || (o.resume.sharedWith || []).includes(v.id))) fail('This resume is private.');
  return { token: 'sig_' + Math.random().toString(36).slice(2, 12), expiresAt: now() + 10 * MIN, fileKey: o.resume.fileKey, fileName: o.resume.fileName };
};
const canSeeResume = (viewer, owner) => !!(viewer && owner && owner.resume && (viewer.id === owner.id || viewer.role === 'admin' || (owner.resume.sharedWith || []).includes(viewer.id)));

/* =====================================================================
   Hackathons (admin-managed)
   ===================================================================== */
function interestsOf(u) {
  const t = new Set();
  (u.profile.skills || []).forEach(s => (SKILL_THEMES[lc(s)] || []).forEach(x => t.add(x)));
  (u.profile.roles || []).forEach(r => (ROLE_THEMES[r] || []).forEach(x => t.add(x)));
  DB.teams.filter(tm => isMember(tm, u.id)).forEach(tm => { const h = H(tm.hackathonId); if (h) h.themes.forEach(x => t.add(x)); });
  return t;
}
api.saveHackathon = (d, id) => {
  requireAdmin();
  const name = req(d.name, 3, 80, 'Name', 'name'), organizer = req(d.organizer, 2, 80, 'Organizer', 'organizer');
  if (!['online', 'offline', 'hybrid'].includes(d.mode)) fail('Choose a mode.', 'mode');
  const location = String(d.location || '').trim().slice(0, 80);
  if (d.mode !== 'online' && location.length < 2) fail('Add a location for offline and hybrid hackathons.', 'location');
  const dt = (v, label, field, opt) => { if (!v) { if (opt) return null; fail(`Set the ${label}.`, field); } const t = new Date(v).getTime(); if (isNaN(t)) fail(`The ${label} isn’t a valid date.`, field); return t; };
  const startAt = dt(d.startAt, 'start date', 'startAt'), endAt = dt(d.endAt, 'end date', 'endAt'), regDeadline = dt(d.regDeadline, 'registration deadline', 'regDeadline'), regOpensAt = dt(d.regOpensAt, 'registration opening date', 'regOpensAt', true);
  if (endAt <= startAt) fail('The end must be after the start.', 'endAt');
  if (regDeadline > startAt) fail('The registration deadline must be on or before the start.', 'regDeadline');
  if (regOpensAt && regOpensAt >= regDeadline) fail('Registration has to open before the deadline.', 'regOpensAt');
  const minTeam = intField(d.minTeam, 'minimum team size', 1, 10, 'minTeam'), maxTeam = intField(d.maxTeam, 'maximum team size', 1, 10, 'maxTeam');
  if (maxTeam < minTeam) fail('Maximum team size can’t be smaller than the minimum.', 'maxTeam');
  const themes = (d.themes || []).filter(t => THEMES.includes(t)); if (!themes.length) fail('Pick at least one theme or track.', 'themes');
  const regLink = String(d.regLink || '').trim(); if (!httpsOk(regLink)) fail('The registration link must be a full https:// address.', 'regLink');
  const prizePool = intField(d.prizePool, 'prize pool', 0, 100000000, 'prizePool', true) || 0;
  const description = req(d.description, 20, 3000, 'Description', 'description');
  const rec = { name, organizer, mode: d.mode, location: d.mode === 'online' ? (location || 'Online') : location, startAt, endAt, regDeadline, regOpensAt,
    minTeam, maxTeam, eligibility: String(d.eligibility || '').trim().slice(0, 200) || 'Open to all college students', themes, prizePool,
    prizes: String(d.prizes || '').trim().slice(0, 300), regLink, description, color: HACK_COLORS.includes(d.color) ? d.color : 'blue', banner: d.banner || null };
  let h;
  if (id) {
    h = H(id); if (!h) fail('Hackathon not found.');
    Object.assign(h, rec, { updatedAt: now() });
    DB.invites.filter(i => i.hackathonId === id && i.status === 'pending').forEach(i => { i.expiresAt = Math.min(i.createdAt + 7 * DAY, regDeadline); });
    sweep();
  } else {
    h = Object.assign({ id: uid('h'), pinned: false, archived: false, createdAt: now() }, rec);
    DB.hackathons.push(h);
    students().filter(u => u.onboarded && u.status === 'active').forEach(u => {
      const hit = h.themes.filter(t => interestsOf(u).has(t));
      if (hit.length) notify(u.id, 'hackathon', { title: `New hackathon for you: ${h.name}`, body: `Matches your interest in ${hit.slice(0, 2).join(' and ')}. Registration closes ${fmtDate(h.regDeadline)}.`, link: 'h-' + h.id });
    });
  }
  save(); return h;
};
api.pinHackathon = (id, v) => { requireAdmin(); const h = H(id); if (!h) fail('Not found.'); h.pinned = !!v; save(); };
api.archiveHackathon = (id, v) => { requireAdmin(); const h = H(id); if (!h) fail('Not found.'); h.archived = !!v; if (v) h.pinned = false; save(); };
api.toggleBookmark = hid => { const u = requireStudent(); const s = new Set(u.bookmarks || []); const on = !s.has(hid); if (on) s.add(hid); else s.delete(hid); u.bookmarks = [...s]; save(); return on; };

/* =====================================================================
   Team-finding posts
   ===================================================================== */
const activePostOf = (userId, hid) => DB.posts.find(p => p.authorId === userId && p.hackathonId === hid && p.status === 'active' && !p.removed);
const teamOf = (userId, hid) => DB.teams.find(t => t.hackathonId === hid && !t.disbanded && isMember(t, userId));
function assertOpenForPosts(h) { if (!h || h.archived) fail('This hackathon isn’t available.'); if (hackStatus(h).key === 'ended') fail('This hackathon has ended, so it’s read-only now.'); }
function assertOpenForTeams(h) { assertOpenForPosts(h); if (now() > h.regDeadline) fail('Registration has closed for this hackathon, so new invites and requests can’t be sent.'); }
function validateTeamName(hid, name) {
  name = String(name || '').trim();
  if (name.length < 2 || name.length > 40) fail('Team name should be 2–40 characters.', 'teamName');
  if (DB.teams.some(t => t.hackathonId === hid && !t.disbanded && lc(t.name) === lc(name))) fail('Another team in this hackathon already uses that name.', 'teamName');
  return name;
}
function sysMsg(convId, text) { const c = C(convId); if (!c) return; DB.messages.push({ id: uid('m'), convId, senderId: null, system: true, text, at: now(), seq: nextSeq() }); c.lastAt = now(); }
function createTeamInternal(u, h, name, role, needed) {
  const t = { id: uid('t'), hackathonId: h.id, name, leaderId: u.id, members: [{ userId: u.id, role: ROLES.includes(role) ? role : (u.profile.roles[0] || 'Backend'), joinedAt: now() }],
    neededRoles: (needed || []).filter(r => ROLES.includes(r)), links: [], createdAt: now(), result: null, ratings: [] };
  DB.teams.push(t);
  const c = { id: uid('c'), type: 'team', teamId: t.id, createdAt: now(), lastAt: now() }; DB.convs.push(c); t.convId = c.id;
  sysMsg(c.id, `${u.name} created the team`);
  const ip = activePostOf(u.id, h.id); if (ip && ip.type === 'individual') { ip.status = 'closed'; ip.updatedAt = now(); }
  DB.invites.filter(i => i.hackathonId === h.id && i.status === 'pending' && i.kind === 'request' && i.fromId === u.id).forEach(i => resolveInvite(i, 'withdrawn', `${u.name} started their own team`));
  DB.invites.filter(i => i.hackathonId === h.id && i.status === 'pending' && i.kind === 'invite' && i.toId === u.id).forEach(i => resolveInvite(i, 'expired', `${u.name} started their own team`));
  return t;
}
api.createTeam = (hid, d) => {
  const u = requireStudent(), h = H(hid); assertOpenForPosts(h);
  if (teamOf(u.id, hid)) fail('You’re already in a team for this hackathon.');
  const name = validateTeamName(hid, d.teamName);
  if (!ROLES.includes(d.myRole)) fail('Choose your role in the team.', 'myRole');
  const t = createTeamInternal(u, h, name, d.myRole, d.neededRoles); save(); return t;
};
api.savePost = (hid, d, postId) => {
  const u = requireStudent(), h = H(hid);
  const p = postId ? P(postId) : null;
  if (postId && (!p || p.authorId !== u.id)) fail('You can only edit your own posts.');
  if (!p) assertOpenForPosts(h);
  if (!p && activePostOf(u.id, hid)) fail('You already have an active post for this hackathon. Edit or close it first.');
  const type = p ? p.type : d.type === 'team' ? 'team' : 'individual';
  const description = req(d.description, 20, 1000, 'Description', 'description');
  const roles = (d.roles || []).filter(r => ROLES.includes(r));
  if (!roles.length) fail(type === 'team' ? 'Pick at least one role your team needs.' : 'Pick at least one role you can play.', 'roles');
  const skills = uniq((d.skills || []).map(s => String(s).trim()).filter(Boolean)).slice(0, 12);
  let team = teamOf(u.id, hid), teamName = null;
  if (type === 'team') {
    if (!team) { if (p) fail('Your team no longer exists.'); teamName = validateTeamName(hid, d.teamName); if (!ROLES.includes(d.myRole)) fail('Choose your own role in the team.', 'myRole'); }
    else if (team.leaderId !== u.id) fail('Only the team leader can post for the team.');
  } else if (!p && team) fail('You’re already in a team for this hackathon, so post as your team instead.');
  const current = type === 'team' ? (team ? team.members.length : 1) : 1;
  if (type === 'team' && current >= h.maxTeam) fail(`Your team already has the maximum of ${h.maxTeam} members.`);
  const targetSize = intField(d.targetSize, 'target team size', Math.max(h.minTeam, type === 'team' ? current + 1 : 1), h.maxTeam, 'targetSize');
  const rec = { description, roles, skills, targetSize, idea: String(d.idea || '').trim().slice(0, 200), mode: MODE_LABEL[d.mode] ? d.mode : 'any', location: String(d.location || '').trim().slice(0, 60), updatedAt: now() };
  if (p) { Object.assign(p, rec); if (type === 'team' && team) team.neededRoles = roles; save(); return p; }
  rateCheck(u, 'post');
  if (type === 'team' && !team) team = createTeamInternal(u, h, teamName, d.myRole, roles);
  if (team && type === 'team') team.neededRoles = roles;
  const np = Object.assign({ id: uid('p'), hackathonId: hid, authorId: u.id, type, teamId: type === 'team' ? team.id : null, status: 'active', createdAt: now(), reactions: { interested: [], fire: [] }, hidden: false }, rec);
  DB.posts.push(np); save(); return np;
};
api.setPostStatus = (postId, status) => {
  const u = requireStudent(), p = P(postId);
  if (!p || p.authorId !== u.id) fail('You can only change your own posts.');
  if (!['active', 'closed', 'filled'].includes(status)) fail('Unknown status.');
  if (status === 'active') {
    assertOpenForPosts(H(p.hackathonId));
    const other = activePostOf(u.id, p.hackathonId); if (other && other.id !== p.id) fail('You already have another active post for this hackathon.');
    if (p.type === 'individual' && teamOf(u.id, p.hackathonId)) fail('You’re in a team for this hackathon now.');
    if (p.type === 'team') { const t = T(p.teamId); if (!t || t.disbanded) fail('That team no longer exists.'); if (t.members.length >= H(p.hackathonId).maxTeam) fail('Your team is full.'); }
  }
  p.status = status; p.updatedAt = now(); save();
};
api.react = (postId, kind) => {
  const u = requireStudent(), p = P(postId);
  if (!p || p.hidden) fail('Post not found.');
  if (hackStatus(H(p.hackathonId)).key === 'ended') fail('This hackathon has ended, so it’s read-only now.');
  if (!['interested', 'fire'].includes(kind)) fail('Unknown reaction.');
  const arr = p.reactions[kind], i = arr.indexOf(u.id);
  if (i >= 0) arr.splice(i, 1); else arr.push(u.id);
  save(); return i < 0;
};
function doReply(u, postId, text) {
  const p = P(postId); if (!p || p.hidden) fail('Post not found.');
  if (hackStatus(H(p.hackathonId)).key === 'ended') fail('This hackathon has ended, so replies are closed.');
  text = String(text || '').trim();
  if (!text) fail('Write a reply first.', 'reply'); if (text.length > 500) fail('Replies can be up to 500 characters.', 'reply');
  if (isBlockedEither(u.id, p.authorId)) fail('You can’t reply to this post.');
  rateCheck(u, 'reply');
  const r = { id: uid('r'), postId, authorId: u.id, text, at: now(), hidden: false }; DB.replies.push(r);
  if (p.authorId !== u.id) notify(p.authorId, 'reply', { title: `${u.name} replied to your post`, body: text.slice(0, 140), link: 'h-' + p.hackathonId });
  save(); return r;
}
api.reply = (postId, text) => doReply(requireStudent(), postId, text);

/* =====================================================================
   Teams, invites and join requests
   ===================================================================== */
const pendingBetween = (teamId, userId) => DB.invites.find(i => i.teamId === teamId && i.status === 'pending' && ((i.kind === 'request' && i.fromId === userId) || (i.kind === 'invite' && i.toId === userId)));
function msgField(m) { m = String(m || '').trim(); if (m.length < 5) fail('Add a short message (at least 5 characters).', 'message'); if (m.length > 300) fail('Keep the message under 300 characters.', 'message'); return m; }
function doSendRequest(u, teamId, message, postId) {
  const t = T(teamId); if (!t || t.disbanded) fail('This team no longer exists.');
  const h = H(t.hackathonId); assertOpenForTeams(h);
  if (isMember(t, u.id)) fail('You’re already in this team.');
  if (teamOf(u.id, h.id)) fail('You’re already in a team for this hackathon. You can be in one team per hackathon.');
  if (t.members.length >= h.maxTeam) fail('This team is already full.');
  if (pendingBetween(t.id, u.id)) fail('You already have a pending request or invite with this team.');
  if (isBlockedEither(u.id, t.leaderId)) fail('You can’t send a request to this team.');
  message = msgField(message);
  rateCheck(u, 'request');
  const inv = { id: uid('i'), kind: 'request', teamId: t.id, hackathonId: h.id, fromId: u.id, toId: t.leaderId, postId: postId || null, message, status: 'pending', createdAt: now(), expiresAt: Math.min(now() + 7 * DAY, h.regDeadline) };
  DB.invites.push(inv);
  notify(t.leaderId, 'invite', { title: `${u.name} asked to join ${t.name}`, body: message, link: 'team-' + t.id });
  save(); if (hooks.onInviteCreated) hooks.onInviteCreated(inv); return inv;
}
api.sendRequest = (teamId, message, postId) => doSendRequest(requireStudent(), teamId, message, postId);
function doSendInvite(u, teamId, toId, message, postId) {
  const t = T(teamId); if (!t || t.disbanded) fail('This team no longer exists.');
  const h = H(t.hackathonId); assertOpenForTeams(h);
  if (t.leaderId !== u.id) fail('Only the team leader can send invites.');
  const target = U(toId);
  if (!target || target.role !== 'student' || target.status !== 'active') fail('That student can’t be invited right now.');
  if (target.id === u.id) fail('You can’t invite yourself.');
  if (teamOf(target.id, h.id)) fail(`${firstName(target)} is already in a team for this hackathon.`);
  if (t.members.length >= h.maxTeam) fail('Your team is already full.');
  if (pendingBetween(t.id, target.id)) fail(`You already have a pending invite or request with ${firstName(target)}.`);
  if (isBlockedEither(u.id, target.id)) fail('You can’t invite this person.');
  message = msgField(message);
  rateCheck(u, 'invite');
  const inv = { id: uid('i'), kind: 'invite', teamId: t.id, hackathonId: h.id, fromId: u.id, toId: target.id, postId: postId || null, message, status: 'pending', createdAt: now(), expiresAt: Math.min(now() + 7 * DAY, h.regDeadline) };
  DB.invites.push(inv);
  notify(target.id, 'invite', { title: `${u.name} invited you to join ${t.name}`, body: `${h.name}: ${message}`, link: 'teams' });
  save(); if (hooks.onInviteCreated) hooks.onInviteCreated(inv); return inv;
}
api.sendInvite = (teamId, toId, message, postId) => doSendInvite(requireStudent(), teamId, toId, message, postId);
function resolveInvite(inv, status, reason) {
  inv.status = status; inv.resolvedAt = now(); inv.reason = reason || '';
  const t = T(inv.teamId), to = U(inv.toId), from = U(inv.fromId);
  const tn = t ? t.name : 'the team';
  if (status === 'accepted') notify(inv.fromId, 'response', { title: inv.kind === 'request' ? `You’re in! ${tn} accepted your join request` : `${to.name} accepted your invite to ${tn}`, link: 'team-' + inv.teamId });
  else if (status === 'declined') notify(inv.fromId, 'response', { title: inv.kind === 'request' ? `${tn} declined your join request` : `${to.name} declined your invite to ${tn}`, link: inv.kind === 'request' ? 'h-' + inv.hackathonId : 'team-' + inv.teamId });
  else if (status === 'expired') notify(inv.fromId, 'response', { title: inv.kind === 'request' ? `Your request to join ${tn} expired` : `Your invite to ${to.name} expired`, body: reason || '', link: inv.kind === 'request' ? 'h-' + inv.hackathonId : 'team-' + inv.teamId });
  else if (status === 'withdrawn' && from) notify(inv.toId, inv.kind === 'request' ? 'invite' : 'response', { title: `${from.name} withdrew their ${inv.kind === 'request' ? 'join request' : 'invite'}`, body: reason || '', link: 'teams' });
}
function pickRole(user, t) {
  const covered = new Set(t.members.map(m => m.userId === user.id ? null : m.role));
  const roles = user.profile.roles.length ? user.profile.roles : ['Backend'];
  return roles.find(r => t.neededRoles.includes(r) && !covered.has(r)) || roles.find(r => !covered.has(r)) || roles[0];
}
function joinTeam(t, joinerId, inv) {
  const h = H(t.hackathonId), joiner = U(joinerId);
  if (t.disbanded) fail('This team no longer exists.');
  if (t.members.length >= h.maxTeam) fail(`${t.name} is already full (${h.maxTeam} members max).`);
  if (teamOf(joinerId, h.id)) fail(`${joiner.name} is already in a team for this hackathon.`);
  if (now() > h.regDeadline) fail('Registration has closed for this hackathon.');
  t.members.push({ userId: joinerId, role: pickRole(joiner, t), joinedAt: now() });
  resolveInvite(inv, 'accepted');
  sysMsg(t.convId, `${joiner.name} joined the team`);
  t.members.filter(m => m.userId !== joinerId && m.userId !== inv.fromId && m.userId !== inv.toId).forEach(m => notify(m.userId, 'team', { title: `${joiner.name} joined ${t.name}`, link: 'team-' + t.id }));
  const ip = activePostOf(joinerId, h.id); if (ip && ip.type === 'individual') { ip.status = 'filled'; ip.filledTeam = t.name; ip.updatedAt = now(); }
  DB.invites.filter(i => i.id !== inv.id && i.hackathonId === h.id && i.status === 'pending' && ((i.kind === 'request' && i.fromId === joinerId) || (i.kind === 'invite' && i.toId === joinerId)))
    .forEach(i => resolveInvite(i, i.kind === 'request' ? 'withdrawn' : 'expired', `${joiner.name} joined another team`));
  if (t.members.length >= h.maxTeam) {
    DB.posts.filter(p => p.teamId === t.id && p.status === 'active').forEach(p => { p.status = 'filled'; p.updatedAt = now(); });
    DB.invites.filter(i => i.teamId === t.id && i.status === 'pending').forEach(i => resolveInvite(i, 'expired', `${t.name} is now full`));
    t.members.forEach(m => notify(m.userId, 'team', { title: `${t.name} is full`, body: 'Your team post was closed and any pending requests expired.', link: 'team-' + t.id }));
  }
  save();
}
function doRespondInvite(u, invId, accept) {
  sweep();
  const inv = DB.invites.find(i => i.id === invId); if (!inv) fail('Invite not found.');
  if (inv.status !== 'pending') fail(`This ${inv.kind === 'request' ? 'request' : 'invite'} is no longer pending (${inv.status}).`);
  const t = T(inv.teamId);
  const responder = inv.kind === 'request' ? t.leaderId : inv.toId;
  if (responder !== u.id) fail(inv.kind === 'request' ? 'Only the team leader can answer join requests.' : 'This invite isn’t addressed to you.');
  if (!accept) { resolveInvite(inv, 'declined'); save(); return 'declined'; }
  joinTeam(t, inv.kind === 'request' ? inv.fromId : inv.toId, inv);
  return 'accepted';
}
api.respondInvite = (invId, accept) => doRespondInvite(requireStudent(), invId, accept);
api.withdrawInvite = invId => {
  const u = requireStudent(), inv = DB.invites.find(i => i.id === invId);
  if (!inv || inv.fromId !== u.id) fail('You can only withdraw your own invites and requests.');
  if (inv.status !== 'pending') fail('It’s no longer pending.');
  resolveInvite(inv, 'withdrawn'); save();
};
function disbandTeam(t, reason) {
  t.disbanded = true;
  DB.posts.filter(p => p.teamId === t.id && p.status === 'active').forEach(p => { p.status = 'closed'; });
  DB.invites.filter(i => i.teamId === t.id && i.status === 'pending').forEach(i => resolveInvite(i, 'expired', reason || 'The team was disbanded'));
}
function teamEditable(t) { if (!t || t.disbanded) fail('This team no longer exists.'); if (hackStatus(H(t.hackathonId)).key === 'ended') fail('The hackathon has ended, so team membership is locked.'); }
api.leaveTeam = tid => {
  const u = requireStudent(), t = T(tid); if (!isMember(t, u.id)) fail('You’re not in this team.'); teamEditable(t);
  if (t.leaderId === u.id && t.members.length > 1) fail('Make someone else the leader before you leave.');
  t.members = t.members.filter(m => m.userId !== u.id);
  if (!t.members.length) disbandTeam(t);
  else { sysMsg(t.convId, `${u.name} left the team`); t.members.forEach(m => notify(m.userId, 'team', { title: `${u.name} left ${t.name}`, link: 'team-' + t.id })); }
  save();
};
api.removeMember = (tid, userId) => {
  const u = requireStudent(), t = T(tid); teamEditable(t);
  if (t.leaderId !== u.id) fail('Only the team leader can remove members.');
  if (userId === u.id) fail('Use “Leave team” to remove yourself.');
  if (!isMember(t, userId)) fail('They’re not in this team.');
  t.members = t.members.filter(m => m.userId !== userId);
  sysMsg(t.convId, `${U(userId).name} was removed from the team`);
  notify(userId, 'team', { title: `You were removed from ${t.name}`, link: 'h-' + t.hackathonId });
  save();
};
api.transferLeadership = (tid, userId) => {
  const u = requireStudent(), t = T(tid); teamEditable(t);
  if (t.leaderId !== u.id) fail('Only the current leader can transfer leadership.');
  if (!isMember(t, userId) || userId === u.id) fail('Choose another team member.');
  t.leaderId = userId;
  DB.invites.filter(i => i.teamId === t.id && i.status === 'pending' && i.kind === 'request').forEach(i => { i.toId = userId; });
  DB.posts.filter(p => p.teamId === t.id && p.status === 'active').forEach(p => { p.authorId = userId; });
  sysMsg(t.convId, `${U(userId).name} is now the team leader`);
  notify(userId, 'team', { title: `You’re now the leader of ${t.name}`, link: 'team-' + t.id });
  save();
};
api.setMyRole = (tid, role) => { const u = requireStudent(), t = T(tid); if (!isMember(t, u.id)) fail('You’re not in this team.'); if (!ROLES.includes(role)) fail('Unknown role.'); t.members.find(m => m.userId === u.id).role = role; save(); };
api.setNeededRoles = (tid, roles) => { const u = requireStudent(), t = T(tid); if (!t || t.leaderId !== u.id) fail('Only the leader can change this.'); t.neededRoles = (roles || []).filter(r => ROLES.includes(r)); save(); };
api.addLink = (tid, d) => {
  const u = requireStudent(), t = T(tid); if (!isMember(t, u.id)) fail('Only team members can add links.');
  const label = req(d.label, 1, 30, 'Label', 'linkLabel'), url = String(d.url || '').trim();
  if (!httpsOk(url)) fail('Links must be full https:// addresses.', 'linkUrl');
  if (t.links.length >= 12) fail('A team can keep up to 12 links.');
  t.links.push({ id: uid('k'), label, url, by: u.id, at: now() }); save();
};
api.removeLink = (tid, lid) => { const u = requireStudent(), t = T(tid); if (!isMember(t, u.id)) fail('Only team members can remove links.'); t.links = t.links.filter(l => l.id !== lid); save(); };
const coverage = t => { const covered = new Set(t.members.map(m => m.role)); return { covered, missing: (t.neededRoles || []).filter(r => !covered.has(r)) }; };

/* ---------------- results and peer ratings ---------------- */
api.submitResult = (tid, d) => {
  const u = requireStudent(), t = T(tid); if (!isMember(t, u.id)) fail('Only team members can record a result.');
  const h = H(t.hackathonId); if (hackStatus(h).key !== 'ended') fail('You can record a result once the hackathon has ended.');
  if (t.result && t.result.verification === 'verified') fail('This result is already verified.');
  if (t.result && t.result.verification === 'pending') fail('A result is already waiting for verification.');
  if (!RESULT_LABEL[d.status]) fail('Choose a result.', 'status');
  const proofUrl = String(d.proofUrl || '').trim();
  if (!httpsOk(proofUrl)) fail('Add a proof link that starts with https:// (results page, certificate or post).', 'proofUrl');
  t.result = { status: d.status, proofUrl, submittedBy: u.id, submittedAt: now(), verification: 'pending' };
  t.members.filter(m => m.userId !== u.id).forEach(m => notify(m.userId, 'team', { title: `${u.name} submitted your result at ${h.name} for verification`, body: RESULT_LABEL[d.status], link: 'team-' + t.id }));
  save();
};
api.verifyResult = (tid, approve, note) => {
  requireAdmin(); const t = T(tid);
  if (!t || !t.result || t.result.verification !== 'pending') fail('Nothing to verify.');
  Object.assign(t.result, { verification: approve ? 'verified' : 'rejected', reviewedAt: now(), note: String(note || '').trim().slice(0, 200) });
  const h = H(t.hackathonId);
  t.members.forEach(m => {
    notify(m.userId, 'team', { title: approve ? `Verified: ${RESULT_LABEL[t.result.status]} at ${h.name}` : `Your result at ${h.name} wasn’t verified`, body: approve ? 'It’s on your profile now and counts toward your Builder Score.' : (t.result.note || 'The proof link didn’t confirm the result. You can submit it again.'), link: 'team-' + t.id });
    if (approve) refreshScore(U(m.userId), 'Hackathon result verified');
  });
  save();
};
api.ratePeer = (tid, toId, d) => {
  const u = requireStudent(), t = T(tid);
  if (!isMember(t, u.id) || !isMember(t, toId)) fail('You can only rate people you were in a team with.');
  if (toId === u.id) fail('You can’t rate yourself.');
  if (hackStatus(H(t.hackathonId)).key !== 'ended') fail('Ratings open after the hackathon ends.');
  const vals = {};
  for (const k of ['reliability', 'communication', 'skill']) { const v = +d[k]; if (!(Number.isInteger(v) && v >= 1 && v <= 5)) fail('Rate each area from 1 to 5.', k); vals[k] = v; }
  t.ratings = (t.ratings || []).filter(r => !(r.from === u.id && r.to === toId));
  t.ratings.push(Object.assign({ from: u.id, to: toId, at: now() }, vals)); save();
};

/* =====================================================================
   Messaging
   ===================================================================== */
function convParticipants(c) { if (c.type === 'team') { const t = T(c.teamId); return t ? t.members.map(m => m.userId) : []; } return c.members; }
const findDM = (a, b) => DB.convs.find(c => c.type === 'dm' && c.members.includes(a) && c.members.includes(b));
function hasInteracted(a, b) {
  if (DB.teams.some(t => !t.disbanded && isMember(t, a) && isMember(t, b))) return true;
  if (DB.invites.some(i => (i.fromId === a && i.toId === b) || (i.fromId === b && i.toId === a))) return true;
  if (DB.replies.some(r => (r.authorId === a && (P(r.postId) || {}).authorId === b) || (r.authorId === b && (P(r.postId) || {}).authorId === a))) return true;
  return false;
}
function msgText(t) { t = String(t || '').trim(); if (!t) fail('Write a message first.', 'msg'); if (t.length > 2000) fail('Messages can be up to 2,000 characters.', 'msg'); return t; }
function markRead(userId, convId) { DB.reads[userId] = DB.reads[userId] || {}; DB.reads[userId][convId] = DB.seq || 0; }
function doSendMessage(u, convId, text) {
  const c = C(convId); if (!c) fail('Conversation not found.');
  const parts = convParticipants(c); if (!parts.includes(u.id)) fail('You’re not part of this conversation.');
  text = msgText(text);
  let isRequest = false;
  if (c.type === 'dm') {
    const other = c.members.find(x => x !== u.id);
    if (isBlockedEither(u.id, other)) fail('You can’t message this person.');
    if (c.request) {
      if (c.request.state === 'declined' && c.request.by === u.id) fail('This person isn’t accepting messages from you.');
      if (c.request.state === 'pending') {
        if (c.request.by === u.id) { if (DB.messages.filter(m => m.convId === c.id && m.senderId === u.id).length >= 3) fail(`You can send up to 3 messages until ${firstName(U(other))} accepts your request.`); isRequest = true; }
        else c.request.state = 'accepted';
      }
    }
  }
  const m = { id: uid('m'), convId: c.id, senderId: u.id, text, at: now(), seq: nextSeq() };
  DB.messages.push(m); c.lastAt = m.at; markRead(u.id, c.id);
  const tn = c.type === 'team' ? (T(c.teamId) || {}).name : '';
  parts.filter(p => p !== u.id).forEach(p => notify(p, 'message', { title: isRequest ? `Message request from ${u.name}` : c.type === 'team' ? `${u.name} in ${tn}` : `New message from ${u.name}`, body: text.slice(0, 120), link: 'inbox-' + c.id, convId: c.id }));
  save(); if (hooks.onMessage) hooks.onMessage(m, c, u); return m;
}
function doSendDM(u, toId, text) {
  const other = U(toId);
  if (!other || other.status !== 'active' || other.role !== 'student') fail('This person isn’t available.');
  if (other.id === u.id) fail('You can’t message yourself.');
  if (isBlockedEither(u.id, other.id)) fail('You can’t message this person.');
  let c = findDM(u.id, other.id);
  if (!c) {
    text = msgText(text);
    const pending = !hasInteracted(u.id, other.id);
    if (pending) rateCheck(u, 'dm');
    c = { id: uid('c'), type: 'dm', members: [u.id, other.id], request: pending ? { by: u.id, state: 'pending' } : null, createdAt: now(), lastAt: now() };
    DB.convs.push(c);
  }
  doSendMessage(u, c.id, text); return c;
}
api.sendMessage = (convId, text) => doSendMessage(requireStudent(), convId, text);
api.sendDM = (toId, text) => doSendDM(requireStudent(), toId, text);
function doAcceptMsgRequest(u, convId) { const c = C(convId); if (!c || c.type !== 'dm' || !c.request || c.request.by === u.id || !c.members.includes(u.id)) fail('There’s no request to accept.'); c.request.state = 'accepted'; markRead(u.id, c.id); save(); }
api.acceptMsgRequest = convId => doAcceptMsgRequest(requireStudent(), convId);
api.declineMsgRequest = convId => { const u = requireStudent(), c = C(convId); if (!c || !c.request || c.request.by === u.id || !c.members.includes(u.id)) fail('There’s no request to decline.'); c.request.state = 'declined'; markRead(u.id, c.id); save(); };
api.markRead = convId => { const u = requireUser(); const c = C(convId); if (c && convParticipants(c).includes(u.id)) { markRead(u.id, convId); DB.notifications.filter(n => n.userId === u.id && n.convId === convId).forEach(n => { n.read = true; }); save(); } };
const unreadIn = (userId, c) => { const lr = (DB.reads[userId] || {})[c.id] || 0; return DB.messages.filter(m => m.convId === c.id && m.senderId && m.senderId !== userId && (m.seq || 0) > lr && !m.hidden).length; };
const isRequestFor = (userId, c) => c.type === 'dm' && !!c.request && c.request.state === 'pending' && c.request.by !== userId;
function visibleConvs(userId) {
  const me2 = U(userId);
  return DB.convs.filter(c => {
    if (!convParticipants(c).includes(userId)) return false;
    if (c.type === 'team') { const t = T(c.teamId); return !!t && !t.disbanded; }
    const other = U(c.members.find(x => x !== userId));
    if (!other || (me2.blocked || []).includes(other.id)) return false;
    if (c.request && c.request.state === 'declined' && c.request.by !== userId) return false;
    return DB.messages.some(m => m.convId === c.id);
  }).sort((a, b) => b.lastAt - a.lastAt);
}
const unreadTotal = userId => sum(visibleConvs(userId).filter(c => !isRequestFor(userId, c)).map(c => unreadIn(userId, c)));
const requestCount = userId => visibleConvs(userId).filter(c => isRequestFor(userId, c)).length;

/* ---------------- block, report, moderation ---------------- */
api.block = id => {
  const u = requireUser(); if (id === u.id) fail('You can’t block yourself.');
  u.blocked = uniq((u.blocked || []).concat(id));
  DB.invites.filter(i => i.status === 'pending' && ((i.fromId === u.id && i.toId === id) || (i.fromId === id && i.toId === u.id))).forEach(i => { i.status = 'withdrawn'; i.resolvedAt = now(); i.reason = 'Blocked'; });
  save();
};
api.unblock = id => { const u = requireUser(); u.blocked = (u.blocked || []).filter(x => x !== id); save(); };
api.report = (targetType, targetId, reason, details) => {
  const u = requireUser();
  if (!['profile', 'post', 'reply', 'message'].includes(targetType)) fail('Unknown item.');
  if (!REPORT_REASONS.includes(reason)) fail('Choose a reason.', 'reason');
  if (reason === 'Inaccurate stats' && targetType !== 'profile') fail('“Inaccurate stats” applies to profiles. Choose another reason.', 'reason');
  if (DB.reports.some(r => r.reporterId === u.id && r.targetType === targetType && r.targetId === targetId && r.status === 'open')) fail('You’ve already reported this. Moderators will review it.');
  rateCheck(u, 'report');
  DB.reports.unshift({ id: uid('rp'), reporterId: u.id, targetType, targetId, reason, details: String(details || '').trim().slice(0, 500), at: now(), status: 'open' });
  save();
};
function reportTarget(r) {
  if (r.targetType === 'profile') return { user: U(r.targetId), content: null, text: '' };
  const map = { post: DB.posts, reply: DB.replies, message: DB.messages };
  const c = map[r.targetType].find(x => x.id === r.targetId);
  if (!c) return { user: null, content: null, text: '' };
  return { user: U(c.authorId || c.senderId), content: c, text: c.description || c.text || '' };
}
api.moderate = (reportId, action, opts) => {
  const admin = requireAdmin(); opts = opts || {};
  const r = DB.reports.find(x => x.id === reportId); if (!r || r.status !== 'open') fail('This report is already resolved.');
  const tg = reportTarget(r), subject = tg.user;
  if (action !== 'dismiss' && !subject) fail('The reported content no longer exists. Dismiss the report instead.');
  if (action === 'hide') { if (!tg.content) fail('Only posts, replies and messages can be hidden.'); tg.content.hidden = true; }
  else if (action === 'warn') { subject.warnings = (subject.warnings || []).concat({ at: now(), reason: r.reason }); notify(subject.id, 'system', { title: 'A warning from Alstr moderators', body: `We reviewed a report about your ${r.targetType} (${lc(r.reason)}). Repeated problems can lead to a suspension.` }); }
  else if (action === 'suspend') { const days = opts.days || 7; subject.suspendedUntil = now() + days * DAY; notify(subject.id, 'system', { title: `Your account is suspended for ${days} days`, body: `Reason: ${lc(r.reason)}. You can still browse until ${fmtDate(subject.suspendedUntil)}.` }); }
  else if (action === 'ban') { subject.status = 'banned'; subject.sessions = []; DB.posts.filter(p => p.authorId === subject.id && p.status === 'active').forEach(p => { p.status = 'closed'; p.hidden = true; }); }
  else if (action !== 'dismiss') fail('Unknown action.');
  r.status = action === 'dismiss' ? 'dismissed' : 'actioned'; r.action = action; r.resolvedAt = now(); r.resolvedBy = admin.id;
  save();
};
api.reviewStat = (userId, logId, action) => {
  requireAdmin(); const u = U(userId), e = u && (u.statLog || []).find(x => x.id === logId);
  if (!e || e.review !== 'open') fail('This item was already reviewed.');
  const name = e.source === 'leetcode' ? 'LeetCode' : 'Codeforces';
  if (action === 'approve') e.review = 'approved';
  else if (action === 'revert') {
    e.review = 'reverted';
    u[e.source] = e.before ? Object.assign({}, e.before, { updatedAt: now() }) : null;
    u.statLog.unshift({ id: uid('l'), at: now(), source: e.source, before: e.after, after: e.before, flagged: false, reasons: ['Reverted by a moderator'], review: null });
    notify(u.id, 'system', { title: `A moderator reverted your ${name} update`, body: 'The jump couldn’t be verified. Add your public profile link, then update again.', link: 'me' });
    refreshScore(u, `${name} stats reverted after review`);
  } else if (action === 'ask') { e.review = 'proof requested'; notify(u.id, 'system', { title: `Please add proof for your ${name} stats`, body: 'Add your public profile link so moderators and teammates can check the numbers.', link: 'me' }); }
  else fail('Unknown action.');
  save();
};
api.saveWeights = w => {
  requireAdmin(); const out = {};
  for (const k of ['academics', 'dsa', 'github', 'resume']) { const v = Number(w[k]); if (!Number.isInteger(v) || v < 0 || v > 100) fail('Weights must be whole numbers from 0 to 100.', k); out[k] = v; }
  const total = sum(Object.values(out)); if (total !== 100) fail(`Weights must add up to 100%. They add up to ${total}% now.`);
  DB.config.weights = out; recomputeAll('Scoring weights were updated');
};
api.saveUniversities = list => {
  requireAdmin();
  const out = list.map((x, i) => {
    const name = req(x.name, 2, 80, 'University name', 'uname_' + i), f = Number(x.factor);
    if (!(f >= 0.85 && f <= 1.0)) fail(`${name}: the factor must be between 0.85 and 1.00.`, 'ufactor_' + i);
    return { id: x.id || uid('uni'), name, factor: Math.round(f * 100) / 100 };
  });
  if (!out.some(x => x.id === 'other')) fail('Keep the “Other / not listed” row.');
  DB.config.universities = out; recomputeAll('University factors were updated');
};
function recomputeAll(reason) { students().filter(u => u.onboarded).forEach(u => refreshScore(u, reason)); save(); }
api.saveAnnouncement = d => {
  requireAdmin();
  const text = String(d.text || '').trim().slice(0, 160);
  if (d.enabled && !text) fail('Write the announcement text first.', 'text');
  DB.config.announcement = { enabled: !!d.enabled, text, tone: d.tone === 'warning' ? 'warning' : 'info', updatedAt: now() };
  save();
};

/* ---------------- notifications, export, deletion ---------------- */
api.markNotif = id => { const u = requireUser(); const n = DB.notifications.find(x => x.id === id && x.userId === u.id); if (n) n.read = true; save(); };
api.markAllNotifs = () => { const u = requireUser(); DB.notifications.filter(n => n.userId === u.id).forEach(n => { n.read = true; }); save(); };
api.exportData = () => {
  const u = requireUser();
  const mine = DB.convs.filter(c => convParticipants(c).includes(u.id)).map(c => c.id);
  return JSON.stringify({
    exportedAt: new Date(now()).toISOString(), account: { id: u.id, email: u.email, name: u.name, createdAt: new Date(u.createdAt).toISOString() },
    profile: u.profile, github: u.github, leetcode: u.leetcode, codeforces: u.codeforces, statEditLog: u.statLog, academics: u.academics,
    resume: u.resume ? { fileName: u.resume.fileName, uploadedAt: u.resume.uploadedAt, confirmed: u.resume.confirmed, sharedWith: u.resume.sharedWith } : null,
    builderScore: u.score, scoreHistory: u.scoreHistory, privacy: u.privacy, notificationSettings: u.notifPrefs, bookmarks: u.bookmarks,
    posts: DB.posts.filter(p => p.authorId === u.id), replies: DB.replies.filter(r => r.authorId === u.id),
    teams: DB.teams.filter(t => isMember(t, u.id)).map(t => ({ id: t.id, name: t.name, hackathon: (H(t.hackathonId) || {}).name, role: t.members.find(m => m.userId === u.id).role, result: t.result })),
    invitesAndRequests: DB.invites.filter(i => i.fromId === u.id || i.toId === u.id),
    messagesSent: DB.messages.filter(m => m.senderId === u.id && mine.includes(m.convId)).map(m => ({ conversation: m.convId, text: m.text, at: new Date(m.at).toISOString() })),
    notifications: DB.notifications.filter(n => n.userId === u.id)
  }, null, 2);
};
api.deleteAccount = confirm => {
  const u = requireUser(); if (u.role !== 'student') fail('Admin accounts are removed by another admin.');
  if (confirm !== 'DELETE') fail('Type DELETE in capital letters to confirm.', 'confirm');
  const fileKey = u.resume && u.resume.fileKey;
  DB.teams.filter(t => isMember(t, u.id) && !t.disbanded).forEach(t => {
    t.members = t.members.filter(m => m.userId !== u.id);
    if (!t.members.length) disbandTeam(t, 'The team was disbanded');
    else { if (t.leaderId === u.id) t.leaderId = t.members[0].userId; sysMsg(t.convId, 'A member deleted their account'); }
  });
  DB.invites.filter(i => i.status === 'pending' && (i.fromId === u.id || i.toId === u.id)).forEach(i => { i.status = 'withdrawn'; i.resolvedAt = now(); i.reason = 'Account deleted'; });
  DB.posts = DB.posts.filter(p => p.authorId !== u.id);
  DB.replies = DB.replies.filter(r => r.authorId !== u.id);
  DB.messages.filter(m => m.senderId === u.id).forEach(m => { m.text = 'Message deleted'; m.deleted = true; });
  DB.notifications = DB.notifications.filter(n => n.userId !== u.id);
  DB.emails = DB.emails.filter(e => e.userId !== u.id);
  DB.posts.forEach(p => ['interested', 'fire'].forEach(k => { p.reactions[k] = p.reactions[k].filter(x => x !== u.id); }));
  delete DB.reads[u.id]; delete DB.rate[u.id];
  Object.assign(u, { status: 'deleted', name: 'Deleted user', email: 'deleted+' + u.id, profile: blankProfile(), github: null, leetcode: null, codeforces: null, statLog: [], academics: { semesters: [] }, resume: null, scoreHistory: [], score: null, bookmarks: [], sessions: [], blocked: [] });
  setSession(null); save();
  return fileKey;
};

/* =====================================================================
   Recommendations
   ===================================================================== */
function cityMatch(a, b) { a = lc(a); b = lc(b); if (!a || !b) return false; return b.includes(a) || a.includes(b.split(/[ ,(]/)[0]); }
function suggestTeammates(viewer, hid, limit) {
  const h = H(hid); if (!h || !viewer) return [];
  const team = teamOf(viewer.id, hid);
  const crew = team ? team.members.map(m => U(m.userId)) : [viewer];
  const covered = new Set(team ? team.members.map(m => m.role) : viewer.profile.roles);
  const needed = team && team.neededRoles.length ? team.neededRoles.filter(r => !covered.has(r)) : ROLES.filter(r => !covered.has(r));
  const crewSkills = new Set(crew.flatMap(u => u.profile.skills.map(lc)));
  const crewScore = mean(crew.map(scoreOf));
  const out = [];
  for (const c of students()) {
    if (!c.onboarded || c.status !== 'active' || crew.some(x => x.id === c.id) || isBlockedEither(viewer.id, c.id)) continue;
    if (teamOf(c.id, hid)) continue;
    const post = activePostOf(c.id, hid);
    if (!post && c.profile.availability !== 'looking') continue;
    let s = 0; const why = [];
    const roleHits = c.profile.roles.filter(r => needed.includes(r));
    if (roleHits.length) { s += 30 + 5 * (roleHits.length - 1); why.push('Covers ' + roleHits.join(' and ')); }
    const newSkills = c.profile.skills.filter(k => !crewSkills.has(lc(k)));
    s += Math.min(20, newSkills.length * 4); if (newSkills.length && why.length < 2) why.push('Adds ' + newSkills.slice(0, 2).join(', '));
    if (post) { s += 10; why.push('Posted here'); }
    if (c.profile.availability === 'looking') s += 10;
    if (h.mode !== 'online' && cityMatch(c.profile.city, h.location)) { s += 12; why.push('Near the venue'); } else if (h.mode === 'online') s += 4;
    const diff = Math.abs(scoreOf(c) - crewScore); s += 15 * Math.max(0, 1 - diff / 400); if (diff <= 100) why.push('Similar score');
    out.push({ user: c, s, why: why.slice(0, 3), post });
  }
  return out.sort((a, b) => b.s - a.s).slice(0, limit || 5);
}
function suggestHackathons(u, limit) {
  const ints = interestsOf(u), out = [];
  for (const h of DB.hackathons) {
    if (h.archived) continue; const st = hackStatus(h).key; if (st === 'ended' || st === 'ongoing') continue;
    if (teamOf(u.id, h.id)) continue;
    const hits = h.themes.filter(t => ints.has(t));
    let s = hits.length * 10 + (st === 'open' ? 5 : 0) + (h.regDeadline - now() < 14 * DAY && h.regDeadline > now() ? 3 : 0);
    const near = h.mode !== 'online' && cityMatch(u.profile.city, h.location); if (near) s += 4;
    if (!hits.length && !near) continue;
    out.push({ h, s, why: (hits.length ? 'Matches ' + hits.slice(0, 2).join(' and ') : '') + (near ? (hits.length ? ', near you' : 'Near you') : '') });
  }
  return out.sort((a, b) => b.s - a.s).slice(0, limit || 3);
}

/* =====================================================================
   Sweep: expiry, reminders, suspensions, daily GitHub sync
   ===================================================================== */
function sweep() {
  if (!DB) return false;
  const t = now(); let changed = false;
  for (const inv of DB.invites) {
    if (inv.status === 'pending' && inv.expiresAt <= t) {
      const h = H(inv.hackathonId);
      resolveInvite(inv, 'expired', h && inv.expiresAt >= h.regDeadline ? 'The registration deadline passed' : 'No response within 7 days'); changed = true;
    }
  }
  for (const u of students()) {
    if (u.status !== 'active' || !u.onboarded) continue;
    for (const h of DB.hackathons) {
      if (h.archived) continue;
      const left = h.regDeadline - t; if (left <= 0 || left > 2 * DAY) continue;
      const key = u.id + ':' + h.id; if (DB.flags.deadline[key]) continue;
      const team = teamOf(u.id, h.id);
      if (!((u.bookmarks || []).includes(h.id) || activePostOf(u.id, h.id) || team)) continue;
      DB.flags.deadline[key] = t;
      notify(u.id, 'deadline', { title: `Registration for ${h.name} closes in ${fmtDur(left)}`, body: team ? 'Make sure your team is registered on the official site.' : 'Find a team, or register on the official site before the deadline.', link: 'h-' + h.id });
      changed = true;
    }
  }
  for (const u of DB.users) if (u.suspendedUntil && u.suspendedUntil <= t) { u.suspendedUntil = null; changed = true; }
  const cu = me();
  if (cu && cu.role === 'student' && cu.github && t - cu.github.lastSyncedAt >= DAY && t - (cu.github.lastAttemptAt || 0) >= HOUR) { githubSync(cu, false); changed = true; }
  if (changed) save();
  return changed;
}

/* =====================================================================
   Simulated classmates (so invites, requests and chats get answers)
   ===================================================================== */
const BOT_LINES = {
  hello: ['Hey! Thanks for reaching out 🙂', 'Hi! Good to hear from you.'],
  team: ['Sounds good. What idea are you leaning towards?', 'I’m in if the problem is interesting. What stack are you thinking?', 'Happy to team up. Quick call tonight around 9?'],
  skills: ['I’ve mostly worked with {skills}. Happy to pick up whatever the project needs.', 'My strongest stack is {skills}.'],
  time: ['I’m free most evenings after 7, and weekends work too.', 'Tomorrow evening works for me.'],
  thanks: ['Anytime! See you on the team chat.', 'Glad to help 🙌'],
  generic: ['Makes sense!', 'Got it. Let me think and get back to you today.', 'Nice, let’s do it.', 'Cool. My GitHub is on my profile if you want to see what I’ve built.']
};
function botLine(bot, text, seed) {
  const r = rng(seed), t = lc(text);
  const pick = a => a[Math.floor(r() * a.length)];
  let line;
  if (/\b(hi|hey|hello|namaste)\b/.test(t) && t.length < 40) line = pick(BOT_LINES.hello);
  else if (/team|join|hackathon|build|idea/.test(t)) line = pick(BOT_LINES.team);
  else if (/skill|stack|experience|work(ed)? on|know/.test(t)) line = pick(BOT_LINES.skills);
  else if (/when|time|call|meet|tonight|tomorrow|free/.test(t)) line = pick(BOT_LINES.time);
  else if (/thank|thanks|great|awesome/.test(t)) line = pick(BOT_LINES.thanks);
  else line = pick(BOT_LINES.generic);
  return line.replace('{skills}', bot.profile.skills.slice(0, 3).join(', '));
}
function queueBot(item) { DB.botQueue = DB.botQueue || []; DB.botQueue.push(item); save(); }
function botsReact(kind, payload) {
  const cu = me(); if (!cu || cu.role !== 'student') return;
  if (kind === 'invite') {
    const inv = payload; if (inv.fromId !== cu.id) return;
    const responder = U(inv.kind === 'request' ? T(inv.teamId).leaderId : inv.toId);
    if (!responder || !responder.bot) return;
    queueBot({ at: Date.now() + 6000 + Math.random() * 3000, type: 'respond', invId: inv.id, botId: responder.id });
  }
  if (kind === 'message') {
    const { m, c } = payload; if (m.senderId !== cu.id) return;
    const others = convParticipants(c).filter(x => x !== cu.id).map(U).filter(x => x && x.bot && x.status === 'active');
    if (!others.length) return;
    if (c.type === 'team' && Math.random() > 0.55) return;
    const bot = others[Math.floor(Math.random() * others.length)];
    if (c.type === 'dm' && c.request && c.request.state === 'pending' && bot.profile.availability === 'unavailable') return;
    queueBot({ at: Date.now() + 2500 + Math.random() * 2500, type: 'reply', convId: c.id, botId: bot.id, text: botLine(bot, m.text, m.id) });
  }
}
function runBots() {
  if (!DB || !DB.botQueue || !DB.botQueue.length) return false;
  const due = DB.botQueue.filter(b => b.at <= Date.now());
  if (!due.length) return false;
  DB.botQueue = DB.botQueue.filter(b => b.at > Date.now());
  for (const b of due) {
    const bot = U(b.botId); if (!bot || bot.status !== 'active') continue;
    try {
      if (b.type === 'respond') {
        const inv = DB.invites.find(i => i.id === b.invId); if (!inv || inv.status !== 'pending') continue;
        const t = T(inv.teamId), joiner = U(inv.kind === 'request' ? inv.fromId : inv.toId);
        let accept;
        if (inv.kind === 'request') accept = joiner.profile.roles.some(r => (t.neededRoles || []).includes(r)) || scoreOf(joiner) >= 450;
        else accept = bot.profile.availability !== 'unavailable';
        doRespondInvite(bot, inv.id, accept);
      } else if (b.type === 'reply') {
        const c = C(b.convId); if (!c) continue;
        if (c.type === 'dm' && c.request && c.request.state === 'pending' && c.request.by !== bot.id) doAcceptMsgRequest(bot, c.id);
        doSendMessage(bot, c.id, b.text);
      } else if (b.type === 'dm') doSendDM(bot, b.toId, b.text);
      else if (b.type === 'request') doSendRequest(bot, b.teamId, b.text);
      else if (b.type === 'invite') doSendInvite(bot, b.teamId, b.toId, b.text);
    } catch (e) { if (!e.isApp) throw e; }
  }
  save(); return true;
}
function simulate(kind) {
  const cu = me(); if (!cu || cu.role !== 'student') fail('Sign in as a student to simulate activity.');
  const bots = students().filter(u => u.bot && u.status === 'active' && u.onboarded && !isBlockedEither(u.id, cu.id));
  if (kind === 'dm') {
    const fresh = bots.filter(b => !findDM(b.id, cu.id));
    const bot = fresh[Math.floor(Math.random() * fresh.length)] || bots[0];
    queueBot({ at: Date.now() + 800, type: 'dm', botId: bot.id, toId: cu.id, text: `Hi ${firstName(cu)}! I saw your profile. Your ${cu.profile.skills[0] || 'projects'} work looks solid. Are you free to team up for a hackathon this month?` });
    return bot;
  }
  if (kind === 'request') {
    const lead = DB.teams.find(t => !t.disbanded && t.leaderId === cu.id && hackStatus(H(t.hackathonId)).key !== 'ended' && now() <= H(t.hackathonId).regDeadline && t.members.length < H(t.hackathonId).maxTeam);
    if (lead) {
      const bot = bots.find(b => !teamOf(b.id, lead.hackathonId) && !pendingBetween(lead.id, b.id));
      if (!bot) fail('No one is available to send a request right now.');
      queueBot({ at: Date.now() + 800, type: 'request', botId: bot.id, teamId: lead.id, text: `I’d love to join ${lead.name}. I can own the ${bot.profile.roles[0]} work end to end.` });
      return bot;
    }
    const t = DB.teams.find(t2 => !t2.disbanded && U(t2.leaderId).bot && hackStatus(H(t2.hackathonId)).key !== 'ended' && now() <= H(t2.hackathonId).regDeadline && !teamOf(cu.id, t2.hackathonId) && !pendingBetween(t2.id, cu.id) && t2.members.length < H(t2.hackathonId).maxTeam);
    if (!t) fail('Create a team, or leave one, to receive requests or invites.');
    queueBot({ at: Date.now() + 800, type: 'invite', botId: t.leaderId, teamId: t.id, toId: cu.id, text: `We need someone with your skills on ${t.name}. Want to join us?` });
    return U(t.leaderId);
  }
  fail('Unknown simulation.');
}

if (typeof module !== 'undefined') module.exports = { get DB() { return DB; }, set DB(v) { DB = v; }, get SESS() { return SESS; } };
