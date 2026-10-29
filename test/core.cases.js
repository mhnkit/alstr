let pass = 0, failN = 0;
function ok(c, msg) { if (c) pass++; else { failN++; console.log('FAIL:', msg); } }
function throws(fn, re, msg) { try { fn(); failN++; console.log('FAIL (no throw):', msg); } catch (e) { if (!e.isApp) { failN++; console.log('FAIL (non-app error):', msg, e); } else if (re && !re.test(e.message)) { failN++; console.log('FAIL (wrong msg):', msg, '->', e.message); } else pass++; } }
loadDB();
console.log('Seed users', DB.users.length, 'hackathons', DB.hackathons.length);
for (const u of students()) console.log(u.id.padEnd(4), u.name.padEnd(17), String(scoreOf(u)).padStart(4), computeScore(u).comps.map(c => c.key + ':' + c.points + '/' + c.max + (c.status === 'missing' ? '(M)' : '')).join(' '));
const a = U('u1'); const sc = computeScore(a);
console.log('Arjun', sc.total, 'pct top', percentile(a), 'badges', badgesOf(a).map(b => b.label).join(', '), 'complete', completeness(a).pct);
ok(sc.total > 400 && sc.total < 900, 'arjun score plausible');
ok(hackStatus(H('h1')).key === 'open', 'h1 open'); ok(hackStatus(H('h4')).key === 'ongoing', 'h4 ongoing'); ok(hackStatus(H('h7')).key === 'ended', 'h7 ended'); ok(hackStatus(H('h6')).key === 'upcoming', 'h6 upcoming');
// sweep creates deadline notification for bookmarked h1? only when logged in? sweep runs for all
sweep();
ok(DB.notifications.some(n => n.userId === 'u1' && n.type === 'deadline'), 'deadline notif for u1');
// visitor cannot act
throws(() => api.toggleBookmark('h1'), /Sign in/, 'visitor bookmark');
// sign in as Arjun
let r = api.googleSignIn({ email: 'arjun.menon@gmail.com' }); ok(!r.isNew && me().id === 'u1', 'arjun login');
throws(() => api.saveHackathon({}, null), /Admin access/, 'student cannot admin');
// one active post per hackathon
throws(() => api.savePost('h1', { type: 'individual', description: 'x'.repeat(30), roles: ['Backend'], targetSize: 3 }), /already/, 'one active post');
// leetcode validation
throws(() => api.saveLeetCode({ lc_username: 'arjun-menon', lc_easy: 10, lc_medium: 10, lc_hard: 10, lc_total: 31 }), /must|match/, 'sum mismatch');
throws(() => api.saveLeetCode({ lc_username: 'arjun-menon', lc_easy: 'abc', lc_medium: 10, lc_hard: 10, lc_total: 30 }), /whole number/, 'nan');
throws(() => api.saveLeetCode({ lc_username: 'arjun-menon', lc_easy: 10, lc_medium: 10, lc_hard: 10, lc_total: 30, lc_rating: 5000 }), /between/, 'rating range');
const before = scoreOf(a);
let res = api.saveLeetCode({ lc_username: 'arjun-menon', lc_easy: 400, lc_medium: 600, lc_hard: 200, lc_total: 1200, lc_rating: 2300 });
ok(res.flagged, 'big jump flagged'); ok(a.statLog[0].flagged && a.statLog[0].review === 'open', 'log flagged open');
console.log('score after jump', before, '->', scoreOf(a));
// codeforces validation
throws(() => api.saveCodeforces({ cf_handle: 'arjun_m', cf_rating: 1600, cf_max: 1500, cf_rank: 'Expert', cf_solved: 10 }), /Max rating/, 'max<cur');
res = api.saveCodeforces({ cf_handle: 'arjun_m', cf_rating: 1650, cf_max: 1700, cf_rank: 'Pupil', cf_solved: 200 });
ok(/usually/.test(res.warning), 'rank warning');
// academics
throws(() => api.saveAcademics([{ sem: 7, scale: '10', value: 8 }]), /semester 6/, 'future semester');
throws(() => api.saveAcademics([{ sem: 1, scale: '4', value: 4.5 }]), /between 0 and 4/, '4pt range');
api.saveAcademics([{ sem: 1, scale: '10', value: '8.4' }, { sem: 2, scale: 'pct', value: '91' }, { sem: 3, scale: '4', value: '3.7' }]);
const as = academicsSummary(a); console.log('cgpa', as.cgpa.toFixed(3), 'slope', as.slope.toFixed(3)); ok(Math.abs(as.cgpa - (8.4 + 9.1 + 9.25) / 3) < 1e-9, 'normalize cgpa');
// invites: accept Ananya's invite (t3 LedgerLoop, max 3) -> full -> Vikram's request expires
res = api.respondInvite('i2', true); ok(res === 'accepted', 'accepted'); const t3 = T('t3');
ok(t3.members.length === 3, 't3 full'); ok(P('p8').status === 'filled', 'team post filled'); ok(DB.invites.find(i => i.id === 'i3').status === 'expired', 'pending request expired on full');
ok(DB.notifications.some(n => n.userId === 'u7' && /expired/.test(n.title)), 'vikram notified');
// one team per hackathon
throws(() => api.createTeam('h2', { teamName: 'Another', myRole: 'Backend' }), /already in a team/, 'one team per hackathon');
// accept Rohan's request to t1 (max 4) -> 3 members, then invite Kabir pending -> accept as bot later
res = api.respondInvite('i1', true); ok(T('t1').members.length === 3, 't1 has 3');
// request when already in team
throws(() => api.sendRequest('t2', 'please let me join'), /already in a team/, 'already in team for h1');
// rate limits: replies
for (let i = 0; i < 30; i++) api.reply('p2', 'Reply number ' + i);
throws(() => api.reply('p2', 'one more'), /Daily limit/, 'reply rate limit');
// DM request flow: Arjun -> Meera (no interaction) should be a request
let c = api.sendDM('u8', 'Hi Meera, want to design with us?'); ok(c.request && c.request.state === 'pending', 'dm is request');
api.sendMessage(c.id, 'second'); api.sendMessage(c.id, 'third');
throws(() => api.sendMessage(c.id, 'fourth'), /up to 3/, 'max 3 before accept');
// DM to teammate is not a request
c = api.sendDM('u5', 'Welcome to the team!'); ok(!c.request, 'teammate dm direct');
// bots: queue and run
botsReact('message', { m: DB.messages[DB.messages.length - 1], c }); DB.botQueue.forEach(b => b.at = 0); runBots();
ok(DB.messages.filter(m => m.convId === c.id).length === 2, 'bot replied');
// invite Kabir already pending i4 -> respond as bot accept
DB.botQueue.push({ at: 0, type: 'respond', invId: 'i4', botId: 'u3' }); runBots();
ok(T('t1').members.length === 4, 't1 full after Kabir'); ok(P('p1').status === 'filled', 'p1 filled'); ok(P('p2').status === 'filled', 'kabir individual post filled');
// leave team as leader with members
throws(() => api.leaveTeam('t1'), /leader/, 'leader must transfer');
api.transferLeadership('t1', 'u2'); ok(T('t1').leaderId === 'u2', 'transferred');
api.leaveTeam('t1'); ok(!isMember(T('t1'), 'u1'), 'left');
// time travel: request expiry after 7 days or deadline
const t = api.createTeam('h5', { teamName: 'A11y Squad', myRole: 'Backend', neededRoles: ['Frontend'] });
const iv = api.sendInvite(t.id, 'u15', 'Join us for OpenSource Odyssey!');
DB.clock += 8 * DAY; sweep(); ok(iv.status === 'expired', 'invite expired after 7 days');
// hackathon h1 deadline passed -> new requests blocked
throws(() => api.sendRequest('t2', 'hello there team'), /closed|already|ended/, 'after deadline');
DB.clock = 0;
// post on ended hackathon blocked
throws(() => api.savePost('h7', { type: 'individual', description: 'x'.repeat(30), roles: ['Backend'], targetSize: 3 }), /ended/, 'ended readonly');
// results & ratings
api.ratePeer('t4', 'u3', { reliability: 5, communication: 4, skill: 5 });
ok(peerAggregate('u3').shown === false && peerAggregate('u3').count === 2, 'kabir 2 ratings hidden');
ok(peerAggregate('u8').shown, 'meera aggregate shown');
// github
throws(() => api.githubConnect('bad name!'), /valid/, 'gh username');
api.githubDisconnect(); ok(computeScore(a).comps.find(x => x.key === 'github').status === 'missing', 'gh missing');
api.githubConnect('arjun-menon'); ok(a.github.repos.length === 9, 'fixture');
throws(() => { api.githubRefresh(); api.githubRefresh(); }, /refresh again/, 'refresh limit');
DB.demo.failNextSync = true; DB.clock += 2 * HOUR; r = api.githubRefresh(); ok(!r.ok && a.github.status === 'failed' && a.github.repos.length === 9, 'sync failed keeps data'); DB.clock = 0;
// resume
api.setResumeParsed({ name: 'cv.pdf', size: 1000, key: 'f1' }, { skills: ['Go', 'gRPC', 'NewSkill'], internships: [{ title: 'Intern', org: 'X' }], projects: [{ title: 'P1' }], certifications: [], hackathonWins: [] }, 'heuristic');
ok(a.resume.status === 'review' && a.resume.confirmed, 'old confirmed still counts');
res = api.confirmResume(a.resume.parsed); ok(res.added.includes('NewSkill'), 'skills merged');
// logout all
api.logoutAll(); ok(!me(), 'logged out all');
// admin flow
throws(() => api.adminStart('arjun.menon@gmail.com'), /allow-list/, 'not allowlisted');
api.adminStart('admin@alstr.dev');
throws(() => api.adminVerify('admin@alstr.dev', '000000'), /match|6-digit/, 'bad code');
api.adminVerify('admin@alstr.dev', totp()); ok(me().role === 'admin', 'admin in');
throws(() => api.saveWeights({ academics: 20, dsa: 25, github: 30, resume: 20 }), /add up to 100/, 'weights sum');
api.saveWeights({ academics: 10, dsa: 30, github: 35, resume: 25 });
throws(() => api.saveUniversities(DB.config.universities.map(x => x.id === 'rvce' ? Object.assign({}, x, { factor: 0.5 }) : x)), /0.85/, 'factor band');
api.verifyResult('t5', true); ok(T('t5').result.verification === 'verified', 'verified'); ok(badgesOf(U('u6')).some(b => b.key === 'winner'), 'winner badge');
api.reviewStat('u12', 'lnik2', 'revert'); ok(U('u12').leetcode.total === 120, 'reverted');
api.moderate('rp1', 'hide'); ok(P('p10').hidden, 'post hidden');
api.moderate('rp3', 'ban'); ok(U('u17').status === 'banned', 'banned');
const nh = api.saveHackathon({ name: 'Test Hack', organizer: 'Org', mode: 'online', startAt: new Date(now() + 20 * DAY).toISOString(), endAt: new Date(now() + 21 * DAY).toISOString(), regDeadline: new Date(now() + 10 * DAY).toISOString(), minTeam: 1, maxTeam: 4, themes: ['AI/ML'], regLink: 'https://x.example/reg', description: 'A long enough description for the test.' });
ok(DB.notifications.some(n => n.type === 'hackathon' && n.link === 'h-' + nh.id), 'matching notif sent');
throws(() => api.saveHackathon({ name: 'Bad', organizer: 'Org', mode: 'offline', startAt: '2030-01-02', endAt: '2030-01-01', regDeadline: '2029-12-01', minTeam: 1, maxTeam: 4, themes: ['AI/ML'], regLink: 'https://x.example', description: 'xxxxxxxxxxxxxxxxxxxxxxxxx' }), /location/, 'offline needs location');
api.logout();
// banned user cannot sign in
throws(() => api.googleSignIn({ email: 'rahul.projects@gmail.com' }), /banned/, 'banned login');
// new user onboarding
r = api.googleSignIn({ email: 'riya.kapoor@gmail.com', name: 'Riya Kapoor' }); ok(r.isNew && !me().onboarded, 'new user');
throws(() => api.saveOnboardingStep(1, { name: 'Riya Kapoor', college: 'zzz' }), /college/, 'onboard college');
api.saveOnboardingStep(1, { name: 'Riya Kapoor', college: 'pes', branch: 'Computer Science', gradYear: '2028', semester: '4', city: 'Bengaluru', timezone: 'Asia/Kolkata' });
throws(() => api.saveOnboardingStep(2, { roles: [], skills: [] }), /role/, 'roles');
api.saveOnboardingStep(2, { roles: ['Frontend'], skills: ['React', 'CSS', 'Figma'], bio: 'Hi', availability: 'looking' });
api.finishOnboarding(); ok(me().onboarded && scoreOf(me()) >= 0, 'onboarded');
console.log('riya score', scoreOf(me()), computeScore(me()).comps.map(c => c.status).join(','));
const sug = suggestTeammates(me(), 'h1'); console.log('suggest h1 for riya:', sug.map(s => s.user.name + ' ' + Math.round(s.s) + ' [' + s.why.join('; ') + ']').join(' | '));
console.log('suggest hacks:', suggestHackathons(me()).map(s => s.h.name + ' (' + s.why + ')').join(' | '));
// delete account
throws(() => api.deleteAccount('delete'), /DELETE/, 'delete confirm');
api.deleteAccount('DELETE'); ok(!me(), 'deleted');
JSON.stringify(DB).length > 0 && console.log('DB size KB', Math.round(JSON.stringify(DB).length / 1024));
console.log(`\n${pass} passed, ${failN} failed`);
