/* ===================== landing ===================== */
function viewHome(u) {
  const sample = U('u1') && U('u1').status === 'active' ? U('u1') : students().find(s => s.onboarded && s.status === 'active');
  const open = DB.hackathons.filter(h => !h.archived && hackStatus(h).key === 'open').sort((a, b) => a.regDeadline - b.regDeadline).slice(0, 3);
  const sc = sample ? computeScore(sample) : null;
  return html`<section class="hero"><div>
    <h1>Find hackathon teammates by what they’ve actually built.</h1>
    <p class="lede">Alstr reads your GitHub, coding profiles, grades and resume, and turns them into one Builder Score with every point explained. Post under any hackathon and the right people find you.</p>
    <div class="cta">${u ? html`<a class="btn primary lg" href="#hackathons">Go to hackathons</a><a class="btn secondary lg" href="#${isAdmin(u) ? 'admin' : 'me'}">${isAdmin(u) ? 'Admin dashboard' : 'Your profile'}</a>` : html`<button class="btn gbtn lg" data-act="google">${gmark()}Continue with Google</button><a class="btn primary lg" href="#hackathons">Browse hackathons</a>`}</div>
    <p class="fine">Free for students. Your marks stay private unless you choose to show them.</p></div>
    <div>${sample ? lanyard(sample, { swing: true }) : ''}</div></section>
  <section class="band" aria-labelledby="h-open"><div class="sec-head"><h2 id="h-open">Open for registration</h2><span class="grow"></span><a href="#hackathons">See all hackathons</a></div>
    ${open.length ? html`<ul class="hack-list">${open.map(h => hackRow(h, u))}</ul>` : html`<p class="muted">No hackathons are open right now.</p>`}</section>
  <section class="band" aria-labelledby="h-how"><h2 id="h-how">How Alstr works</h2><ol class="steps">
    <li><b>Sign in with Google</b><p class="muted">Tell us your college, the roles you like to play and the skills you bring.</p></li>
    <li><b>Show your work</b><p class="muted">Connect GitHub, add LeetCode or Codeforces stats, your semester marks and your resume.</p></li>
    <li><b>Find your team</b><p class="muted">Post under a hackathon, or invite people whose skills fill your gaps. Chat, then register together.</p></li></ol></section>
  <section class="band split" aria-labelledby="h-score"><div><h2 id="h-score">A score you can read line by line</h2>
    <p class="lede" style="font-size:16px">Every Builder Score shows its inputs and how many points each part earned. GitHub data comes straight from GitHub. Everything else is labeled self-reported, with links teammates can check.</p>
    <ul class="points"><li>${ic('lock')}<span><b>Marks stay private.</b> People see only the academics part of your score unless you choose to show your CGPA.</span></li>
    <li>${ic('file')}<span><b>Your resume is yours.</b> Only you, admins and people you share it with can open it, through links that expire.</span></li>
    <li>${ic('flag')}<span><b>Report and block anywhere.</b> Moderators review flagged stats, posts and messages.</span></li></ul></div>
    ${sample ? html`<div class="panel"><div class="row" style="margin-bottom:16px">${avatar(sample, 40)}<div><b>${sample.name}</b><div class="small muted">Builder Score ${sc.total} out of 1000</div></div></div>${scoreBreakdown(sample, sc, false)}</div>` : ''}</section>
  <footer class="foot"><span>Alstr helps college students find hackathon teammates.</span><span class="row"><a href="#hackathons">Hackathons</a><a href="#admin-login">Admin login</a></span></footer>`;
}

/* ===================== hackathon list ===================== */
function filteredHacks(u) {
  const f = ui.filters.hack, t = now(), q = lc(f.q).trim();
  let L = DB.hackathons.filter(h => !h.archived);
  if (!f.ended) L = L.filter(h => hackStatus(h).key !== 'ended');
  if (q) L = L.filter(h => lc(h.name + ' ' + h.organizer + ' ' + h.themes.join(' ') + ' ' + h.location).includes(q));
  if (f.mode) L = L.filter(h => h.mode === f.mode);
  if (f.theme) L = L.filter(h => h.themes.includes(f.theme));
  if (f.when) { const lim = { week: 7, month: 30, quarter: 90 }[f.when] * DAY; L = L.filter(h => h.startAt >= t && h.startAt - t <= lim); }
  if (f.prize) L = L.filter(h => h.prizePool >= +f.prize);
  if (f.soon) L = L.filter(h => h.regDeadline > t && h.regDeadline - t <= 7 * DAY);
  if (f.saved && u) L = L.filter(h => (u.bookmarks || []).includes(h.id));
  const key = h => { const st = hackStatus(h).key; if (f.sort === 'prize') return -h.prizePool; if (f.sort === 'start') return st === 'ended' ? 2e15 - h.endAt : h.startAt; return st === 'ended' ? 2e15 - h.endAt : h.regDeadline > t ? h.regDeadline : 1e15 + h.startAt; };
  return L.sort((a, b) => (b.pinned - a.pinned) || key(a) - key(b));
}
function hackRow(h, u) {
  const st = hackStatus(h), d0 = new Date(h.startAt), saved = u && (u.bookmarks || []).includes(h.id);
  return html`<li class="hrow ${h.pinned ? 'pinned' : ''}">
    <div class="hdate c-${h.color}" aria-hidden="true"><b>${d0.getDate()}</b><span>${MONTHS[d0.getMonth()]}</span></div>
    <div class="hmain"><div class="htitle"><a href="#h-${h.id}">${h.name}</a>${statusPill(st)}${h.pinned ? html`<span class="pill">${ic('pin')}Pinned</span>` : ''}</div>
      <div class="hmeta"><span>${h.organizer}</span><span>${ic(h.mode === 'online' ? 'globe' : 'map')}${h.mode === 'online' ? 'Online' : MODE_LABEL[h.mode] + ', ' + h.location}</span><span>${ic('cal')}${dateRange(h.startAt, h.endAt)}</span><span>${ic('users')}Teams of ${teamRange(h)}</span></div>
      <div class="htags">${h.themes.map(tagChip)}</div></div>
    <div class="hside">${h.prizePool ? html`<div class="prize">${inr(h.prizePool)}<small>in prizes</small></div>` : ''}${deadlineInfo(h)}
      ${u && u.role === 'student' ? html`<button class="icon-btn" data-act="bookmark" data-id="${h.id}" ${pressed(saved)} aria-label="Save ${h.name}">${ic(saved ? 'bookmarkFill' : 'bookmark')}</button>` : ''}</div></li>`;
}
function viewHackathons(u) {
  const f = ui.filters.hack, L = filteredHacks(u), any = f.q || f.mode || f.theme || f.when || f.prize || f.soon || f.saved || f.ended;
  const sl = (id, k, label, opts) => html`<label class="sr" for="${id}">${label}</label><select id="${id}" data-filter="hack.${k}">${opts.map(([v, l]) => html`<option value="${v}" ${sel(f[k] === v)}>${l}</option>`)}</select>`;
  const sug = u && u.role === 'student' ? suggestHackathons(u, 3) : [];
  return html`<div class="page-head"><div><h1>Hackathons</h1><p class="muted">${L.length} ${L.length === 1 ? 'hackathon' : 'hackathons'}. Pick one, then find your team under it.</p></div>${isAdmin(u) ? html`<button class="btn primary" data-act="hack-new">${ic('plus')}New hackathon</button>` : ''}</div>
  ${sug.length ? html`<section class="suggest" aria-labelledby="h-sug"><h2 class="h-sm" id="h-sug">Suggested for you</h2><div class="sug-row">${sug.map(x => html`<a class="sug c-${x.h.color}" href="#h-${x.h.id}"><span class="sug-c" aria-hidden="true"></span><b>${x.h.name}</b><span class="small muted">${x.why}</span><span class="small">${deadlineText(x.h)}</span></a>`)}</div></section>` : ''}
  <div class="filters" role="search" aria-label="Filter hackathons">
    <div class="search-field">${ic('search')}<label class="sr" for="hf-q">Search hackathons</label><input id="hf-q" type="search" placeholder="Search by name, organizer, theme or city" value="${f.q}" data-filter="hack.q" autocomplete="off"></div>
    ${sl('hf-mode', 'mode', 'Mode', [['', 'Any mode'], ['online', 'Online'], ['offline', 'Offline'], ['hybrid', 'Hybrid']])}
    ${sl('hf-theme', 'theme', 'Theme', [['', 'Any theme']].concat(THEMES.map(t => [t, t])))}
    ${sl('hf-when', 'when', 'Start date', [['', 'Any dates'], ['week', 'Starts within 7 days'], ['month', 'Starts within 30 days'], ['quarter', 'Starts within 90 days']])}
    ${sl('hf-prize', 'prize', 'Prize pool', [['', 'Any prize'], ['50000', '₹50,000 or more'], ['100000', '₹1,00,000 or more'], ['200000', '₹2,00,000 or more']])}
    <button class="chip-toggle" data-act="hf-toggle" data-k="soon" ${pressed(f.soon)}>Deadline within 7 days</button>
    ${u && u.role === 'student' ? html`<button class="chip-toggle" data-act="hf-toggle" data-k="saved" ${pressed(f.saved)}>${ic('bookmark')}Saved</button>` : ''}
    <button class="chip-toggle" data-act="hf-toggle" data-k="ended" ${pressed(f.ended)}>Show ended</button>
    ${sl('hf-sort', 'sort', 'Sort by', [['deadline', 'Sort: deadline soonest'], ['start', 'Sort: start date'], ['prize', 'Sort: prize pool']])}
    ${any ? html`<button class="link" data-act="hf-clear">Clear filters</button>` : ''}</div>
  ${ui.loadingHacks ? skeletonRows(4) : L.length ? html`<ul class="hack-list">${L.map(h => hackRow(h, u))}</ul>` : empty('No hackathons match these filters', 'Try another theme or date range, or clear the filters.', html`<button class="btn secondary" data-act="hf-clear">Clear filters</button>`)}`;
}

/* ===================== hackathon detail and posts ===================== */
function viewHackathon(u, id) {
  const h = H(id);
  if (!h || (h.archived && !isAdmin(u))) return notFound('This hackathon doesn’t exist or was archived.');
  const st = hackStatus(h), ended = st.key === 'ended', stu = u && u.role === 'student';
  const saved = stu && (u.bookmarks || []).includes(h.id), myTeam = stu ? teamOf(u.id, h.id) : null, myPost = stu ? activePostOf(u.id, h.id) : null;
  return html`<p class="crumbs"><a href="#hackathons">${ic('back')}All hackathons</a></p>
  <div class="banner c-${h.color}">${h.banner ? html`<img src="${h.banner}" alt="">` : ''}<div class="bn-date">${dateRange(h.startAt, h.endAt)}<small>${MODE_LABEL[h.mode]}${h.mode !== 'online' ? ', ' + h.location : ''}</small></div></div>
  <div class="page-head" style="margin-top:20px"><div><div class="row">${statusPill(st)}${st.sub ? html`<span class="small muted">${st.sub}</span>` : ''}${h.archived ? html`<span class="pill">Archived</span>` : ''}</div><h1 style="margin-top:8px">${h.name}</h1><p class="muted">By ${h.organizer}</p></div>
    <div class="row">${isAdmin(u) ? html`<button class="btn secondary" data-act="hack-edit" data-id="${h.id}">${ic('pen')}Edit</button>` : ''}
      ${stu ? html`<button class="btn secondary" data-act="bookmark" data-id="${h.id}" ${pressed(saved)}>${ic(saved ? 'bookmarkFill' : 'bookmark')}${saved ? 'Saved' : 'Save'}</button>` : ''}
      <button class="btn secondary" data-act="cal-open" data-id="${h.id}">${ic('cal')}Add to calendar</button>
      <a class="btn primary" href="${h.regLink}" target="_blank" rel="noopener noreferrer">Register on the official site${ic('ext')}</a></div></div>
  <div class="cols"><div>
    <dl class="facts"><div><dt>Registration</dt><dd>${deadlineInfo(h)}</dd></div><div><dt>Dates</dt><dd>${fmtDateTime(h.startAt)} to ${fmtDateTime(h.endAt)}</dd></div>
      <div><dt>Registration deadline</dt><dd>${fmtDateTime(h.regDeadline)}</dd></div><div><dt>Team size</dt><dd>${teamRange(h)} people</dd></div>
      <div><dt>Prizes</dt><dd>${h.prizePool ? inr(h.prizePool) + ' total' : 'Not announced'}${h.prizes ? html`<span class="small muted" style="display:block;font-weight:400">${h.prizes}</span>` : ''}</dd></div><div><dt>Eligibility</dt><dd>${h.eligibility}</dd></div></dl>
    <p class="prose">${h.description}</p><div class="htags" style="margin:14px 0 4px">${h.themes.map(tagChip)}</div>
    ${postsSection(u, h, ended, myTeam, myPost)}</div>
  <aside class="stack">${stu ? myTeamPanel(u, h, myTeam, myPost, ended) : ''}${stu && !ended ? suggestPanel(u, h, myTeam) : ''}
    ${!u ? html`<div class="panel"><h2 class="h-sm">Find a team for ${h.name}</h2><p class="muted small" style="margin-top:6px">Sign in to see who’s looking, post your own request and message people.</p><button class="btn gbtn" style="margin-top:12px" data-act="google">${gmark()}Continue with Google</button></div>` : ''}</aside></div>`;
}
function postsSection(u, h, ended, myTeam, myPost) {
  const all = DB.posts.filter(p => p.hackathonId === h.id && !p.removed && (!p.hidden || isAdmin(u) || (u && p.authorId === u.id)));
  const activeN = all.filter(p => p.status === 'active' && !p.hidden).length;
  const head = html`<div class="sec-head" style="margin-top:30px"><h2>Team-finding posts</h2><span class="pill">${activeN} active</span><span class="grow"></span>
    ${u && u.role === 'student' && !ended ? (myPost ? html`<button class="btn secondary sm" data-act="post-edit" data-id="${myPost.id}">${ic('pen')}Edit your post</button>` : html`<button class="btn primary sm" data-act="post-new" data-id="${h.id}">${ic('plus')}New post</button>`) : ''}</div>`;
  if (!u) return html`${head}${empty('Sign in to see who’s looking for a team', `${activeN} ${activeN === 1 ? 'student or team has' : 'students and teams have'} posted for ${h.name}.`, html`<button class="btn gbtn" data-act="google">${gmark()}Continue with Google</button>`)}`;
  const f = (ui.filters.posts[h.id] = ui.filters.posts[h.id] || { type: 'all', role: '', skill: '', min: '', max: '', college: '', avail: '', closed: false });
  let L = all.filter(p => f.closed || p.status === 'active');
  if (f.type !== 'all') L = L.filter(p => p.type === f.type);
  if (f.role) L = L.filter(p => p.roles.includes(f.role));
  if (f.skill) L = L.filter(p => p.skills.some(s => lc(s) === lc(f.skill)) || U(p.authorId).profile.skills.some(s => lc(s) === lc(f.skill)));
  if (f.min !== '' && !isNaN(+f.min)) L = L.filter(p => scoreOf(U(p.authorId)) >= +f.min);
  if (f.max !== '' && !isNaN(+f.max)) L = L.filter(p => scoreOf(U(p.authorId)) <= +f.max);
  if (f.college) L = L.filter(p => U(p.authorId).profile.college === f.college);
  if (f.avail) L = L.filter(p => U(p.authorId).profile.availability === f.avail);
  L.sort((a, b) => (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1) || b.createdAt - a.createdAt);
  const skills = uniq(all.flatMap(p => p.skills)).sort(), colleges = uniq(all.map(p => U(p.authorId).profile.college)).filter(Boolean);
  const k = 'posts.' + h.id + '.';
  const sl = (id, key, label, opts) => html`<label class="sr" for="${id}">${label}</label><select id="${id}" data-filter="${k + key}">${opts.map(([v, l]) => html`<option value="${v}" ${sel(String(f[key]) === String(v))}>${l}</option>`)}</select>`;
  return html`${head}${ended ? html`<p class="infobox">${ic('lock')}<span>This hackathon has ended, so its posts are read-only.</span></p>` : ''}
  <div class="seg" role="group" aria-label="Post type">${[['all', 'All posts'], ['individual', 'Looking for a team'], ['team', 'Teams looking for members']].map(([v, l]) => html`<button class="chip-toggle" data-act="pf-type" data-id="${h.id}" data-v="${v}" ${pressed(f.type === v)}>${l}</button>`)}</div>
  <div class="filters">${sl('pf-role', 'role', 'Role', [['', 'Any role']].concat(ROLES.map(r => [r, r])))}${sl('pf-skill', 'skill', 'Skill', [['', 'Any skill']].concat(skills.map(s => [s, s])))}
    <label class="sr" for="pf-min">Minimum Builder Score</label><input id="pf-min" class="num-in" type="number" min="0" max="1000" placeholder="Score from" value="${f.min}" data-filter="${k}min">
    <label class="sr" for="pf-max">Maximum Builder Score</label><input id="pf-max" class="num-in" type="number" min="0" max="1000" placeholder="Score to" value="${f.max}" data-filter="${k}max">
    ${sl('pf-college', 'college', 'College', [['', 'Any college']].concat(colleges.map(c => [c, (DB.config.universities.find(x => x.id === c) || {}).name || c])))}
    ${sl('pf-avail', 'avail', 'Availability', [['', 'Any availability']].concat(Object.entries(AVAIL)))}
    <button class="chip-toggle" data-act="pf-closed" data-id="${h.id}" ${pressed(f.closed)}>Show filled and closed</button></div>
  ${L.length ? L.map(p => postCard(p, u, h, ended)) : empty(all.length ? 'No posts match these filters' : 'No posts yet', all.length ? 'Try another role or widen the score range.' : ended ? 'Nobody posted for this hackathon.' : 'Be the first. Say what you’re building or what you can bring.', !all.length && u.role === 'student' && !ended && !myPost ? html`<button class="btn primary" data-act="post-new" data-id="${h.id}">${ic('plus')}New post</button>` : '')}`;
}
function reactBtn(p, k, u, ended) {
  const arr = p.reactions[k], on = !!u && arr.includes(u.id), can = u && u.role === 'student' && !ended;
  const names = arr.map(x => (U(x) || {}).name).filter(Boolean).join(', ');
  return html`<button class="react" data-act="react" data-id="${p.id}" data-k="${k}" ${pressed(on)} ${raw(can ? '' : 'disabled')} title="${names}">${ic(k === 'interested' ? 'hand' : 'flame')}${k === 'interested' ? 'Interested' : 'Great idea'}${arr.length ? html` <span>${arr.length}</span>` : ''}</button>`;
}
function postMenu(p, u, mine, ended) {
  const id = 'pm-' + p.id, open = ui.menu === id, items = [];
  if (mine && !ended) {
    items.push(html`<button data-act="post-edit" data-id="${p.id}">${ic('pen')}Edit post</button>`);
    if (p.status === 'active') items.push(html`<button data-act="post-status" data-id="${p.id}" data-s="filled">${ic('check')}Mark as filled</button><button data-act="post-status" data-id="${p.id}" data-s="closed">${ic('lock')}Close post</button>`);
    else items.push(html`<button data-act="post-status" data-id="${p.id}" data-s="active">${ic('refresh')}Reopen post</button>`);
  }
  if (!mine) items.push(html`<button class="danger" data-act="report" data-type="post" data-id="${p.id}">${ic('flag')}Report post</button>`);
  if (!items.length) return '';
  return html`<div class="menu-wrap"><button class="icon-btn" data-act="menu" data-id="${id}" ${expanded(open)} aria-haspopup="true" aria-label="More actions for this post">${ic('more')}</button>${open ? html`<div class="menu">${items}</div>` : ''}</div>`;
}
function postCard(p, u, h, ended) {
  const a = U(p.authorId), t = p.teamId ? T(p.teamId) : null, mine = !!u && p.authorId === u.id, stu = u && u.role === 'student';
  const reps = DB.replies.filter(r => r.postId === p.id && (!r.hidden || isAdmin(u) || (u && r.authorId === u.id))).sort((x, y) => x.at - y.at);
  const myTeam = stu ? teamOf(u.id, h.id) : null;
  let cta = '';
  if (stu && !mine && p.status === 'active' && !ended && now() <= h.regDeadline) {
    if (p.type === 'team' && t && !isMember(t, u.id) && !myTeam) cta = pendingBetween(t.id, u.id) ? html`<span class="pill brand">Request sent</span>` : html`<button class="btn primary sm" data-act="request" data-team="${t.id}" data-post="${p.id}">Request to join</button>`;
    if (p.type === 'individual' && !teamOf(a.id, h.id)) {
      if (myTeam && myTeam.leaderId === u.id) cta = pendingBetween(myTeam.id, a.id) ? html`<span class="pill brand">Invite sent</span>` : html`<button class="btn primary sm" data-act="invite" data-user="${a.id}" data-hack="${h.id}" data-post="${p.id}">Invite to ${myTeam.name}</button>`;
      else if (!myTeam) cta = html`<button class="btn secondary sm" data-act="invite" data-user="${a.id}" data-hack="${h.id}" data-post="${p.id}">Invite to a team</button>`;
    }
  }
  const type = p.type === 'team' ? html`${ic('users')}${t ? t.name : 'Team'}, ${t ? t.members.length : 1} of ${p.targetSize}` : html`${ic('user')}Looking for a team`;
  return html`<article class="post ${p.status !== 'active' ? 'is-' + p.status : ''}" aria-labelledby="ph-${p.id}">
    <header class="post-head"><a class="who" href="#u-${a.id}">${avatar(a, 40)}<span><b id="ph-${p.id}">${a.name}</b><span class="small muted">${uniFactor(a).name}, posted ${fmtRel(p.createdAt)}</span></span></a>
      <span class="score-pill" title="Builder Score">${scoreOf(a)}<small>score</small></span><span class="ptype ${p.type}">${type}</span></header>
    ${p.hidden ? html`<p class="warnbox">${ic('alert')}<span>Hidden by a moderator. Only you${isAdmin(u) ? ' and other admins' : ''} can see this post.</span></p>` : ''}
    ${p.status !== 'active' ? html`<p class="state-note">${ic(p.status === 'filled' ? 'check' : 'lock')}${p.status === 'filled' ? (p.filledTeam ? 'Filled: joined ' + p.filledTeam : 'Filled') : 'Closed'}</p>` : ''}
    <p class="post-body">${p.description}</p>
    <dl class="pfacts"><div><dt>${p.type === 'team' ? 'Needs' : 'Can play'}</dt><dd>${p.roles.map(roleChip)}</dd></div>
      ${p.skills.length ? html`<div><dt>Skills</dt><dd>${p.skills.map(tagChip)}</dd></div>` : ''}${p.idea ? html`<div><dt>Idea</dt><dd>${p.idea}</dd></div>` : ''}
      <div><dt>Team size</dt><dd>${p.type === 'team' && t ? `${t.members.length} of ${p.targetSize} filled` : `Wants a team of ${p.targetSize}`}</dd></div>
      ${p.mode !== 'any' || p.location ? html`<div><dt>Prefers</dt><dd>${[p.mode !== 'any' ? MODE_LABEL[p.mode] : '', p.location].filter(Boolean).join(', ')}</dd></div>` : ''}
      ${p.type === 'individual' ? html`<div><dt>Availability</dt><dd>${AVAIL[a.profile.availability]}</dd></div>` : ''}</dl>
    <footer class="pactions">${reactBtn(p, 'interested', u, ended)}${reactBtn(p, 'fire', u, ended)}
      <button class="btn ghost sm" data-act="toggle-replies" data-id="${p.id}" ${expanded(!!ui.openReplies[p.id])}>${ic('msg')}${reps.length ? reps.length + (reps.length === 1 ? ' reply' : ' replies') : 'Reply'}</button>
      <span class="grow"></span>${cta}${stu && !mine ? html`<button class="icon-btn" data-act="dm" data-user="${a.id}" aria-label="Message ${a.name}">${ic('send')}</button>` : ''}${u ? postMenu(p, u, mine, ended) : ''}</footer>
    ${ui.openReplies[p.id] ? repliesThread(p, reps, u, ended) : ''}</article>`;
}
function repliesThread(p, reps, u, ended) {
  const dk = 'reply-' + p.id;
  return html`<div class="replies">${reps.map(r => { const a = U(r.authorId); return html`<div class="reply">${avatar(a, 28)}<div><div class="small"><a href="#u-${a.id}"><b>${a.name}</b></a> <span class="muted">${fmtRel(r.at)}</span>${r.hidden ? html` <span class="pill bad">Hidden</span>` : ''}${u && r.authorId !== u.id ? html` <button class="link small" data-act="report" data-type="reply" data-id="${r.id}">Report</button>` : ''}</div><p>${r.text}</p></div></div>`; })}
    ${u && u.role === 'student' && !ended ? html`<form class="row reply-form" data-form="reply" data-id="${p.id}" data-draft="${dk}" novalidate><label class="sr" for="rp-${p.id}">Write a reply</label><input id="rp-${p.id}" name="text" placeholder="Write a reply" value="${dv(dk, 'text', '')}" maxlength="500" autocomplete="off"><button class="btn secondary sm" type="submit">Reply</button></form>` : ''}
    ${!reps.length && (ended || !u || u.role !== 'student') ? html`<p class="small muted">No replies.</p>` : ''}</div>`;
}
function myTeamPanel(u, h, t, myPost, ended) {
  if (t) {
    const cov = coverage(t);
    return html`<div class="panel"><h2 class="h-sm">Your team</h2><a class="who" href="#team-${t.id}" style="margin:10px 0"><span class="team-mark">${t.name.slice(0, 1)}</span><span><b>${t.name}</b><span class="small muted">${t.members.length} of ${h.maxTeam} members${t.leaderId === u.id ? ', you lead it' : ''}</span></span></a>
      ${cov.missing.length && !ended ? html`<p class="small">Missing: ${cov.missing.map(r => ROLE_PERSON[r]).join(', ')}</p>` : ''}<a class="btn secondary sm" href="#team-${t.id}" style="margin-top:10px">Open team page</a></div>`;
  }
  if (ended) return html`<div class="panel"><h2 class="h-sm">This hackathon has ended</h2><p class="small muted" style="margin-top:6px">You weren’t in a team for it.</p></div>`;
  return html`<div class="panel"><h2 class="h-sm">Find your team</h2><p class="small muted" style="margin:6px 0 12px">Post that you’re looking, or start a team and invite people.</p>
    <div class="stack" style="gap:8px">${myPost ? html`<button class="btn secondary" data-act="post-edit" data-id="${myPost.id}">${ic('pen')}Edit your post</button>` : html`<button class="btn primary" data-act="post-new" data-id="${h.id}" data-kind="individual">I’m looking for a team</button>`}
    <button class="btn secondary" data-act="team-create" data-id="${h.id}">${ic('users')}Start a team</button></div></div>`;
}
function suggestPanel(u, h, t) {
  const s = suggestTeammates(u, h.id, 5), lead = t && t.leaderId === u.id && now() <= h.regDeadline && t.members.length < h.maxTeam;
  return html`<div class="panel"><h2 class="h-sm">Suggested teammates</h2><p class="small muted" style="margin-top:6px">Ranked by the roles your ${t ? 'team is' : 'profile is'} missing, new skills, availability, location and a similar score.</p>
    ${s.length ? html`<ul class="sug-list">${s.map(x => html`<li><a class="who" href="#u-${x.user.id}">${avatar(x.user, 36)}<span><b>${x.user.name}</b><span class="small muted">${x.user.profile.roles.join(', ')}</span></span></a><span class="score-pill">${scoreOf(x.user)}</span>
      <p class="tiny muted why">${x.why.join('. ')}</p><div class="row">${lead ? (pendingBetween(t.id, x.user.id) ? html`<span class="pill brand">Invited</span>` : html`<button class="btn secondary sm" data-act="invite" data-user="${x.user.id}" data-hack="${h.id}">Invite</button>`) : ''}<button class="btn ghost sm" data-act="dm" data-user="${x.user.id}">${ic('send')}Message</button></div></li>`)}</ul>`
    : html`<p class="small muted" style="margin-top:10px">No one fits right now. Check back after more people post.</p>`}</div>`;
}

/* ===================== profile ===================== */
function viewProfile(viewer, u, own) {
  if (!u || u.role !== 'student' || u.status === 'deleted') return notFound('This profile doesn’t exist.');
  if (u.status === 'banned' && !isAdmin(viewer)) return notFound('This profile isn’t available.');
  const edit = own && !ui.publicPreview;
  const sc = computeScore(u), comp = completeness(u), stuViewer = viewer && viewer.role === 'student';
  const blocked = stuViewer && !own && isBlockedEither(viewer.id, u.id);
  return html`<h1 class="sr">${own && !ui.publicPreview ? 'Your profile' : u.name}</h1>${own && ui.publicPreview ? html`<div class="infobox">${ic('eye')}<span>You’re previewing your profile the way other students see it.</span><button class="btn secondary sm" data-act="public-preview">Back to editing</button></div>` : ''}
  <div class="cols left"><aside class="p-aside">${lanyard(u)}
    ${edit ? html`<div class="panel"><label class="lbl" for="avail-sel">Availability</label><select id="avail-sel" data-change="avail" style="margin-top:6px">${Object.entries(AVAIL).map(([k2, v]) => html`<option value="${k2}" ${sel(u.profile.availability === k2)}>${v}</option>`)}</select>
      <div class="stack" style="gap:8px;margin-top:12px"><button class="btn secondary" data-act="profile-edit">${ic('pen')}Edit profile</button><button class="btn ghost" data-act="public-preview">${ic('eye')}View as others see it</button></div></div>` : ''}
    ${!own && stuViewer ? html`<div class="panel stack" style="gap:8px">${blocked ? html`<p class="small muted">You can’t interact with this student.</p>` : html`<button class="btn primary" data-act="dm" data-user="${u.id}">${ic('send')}Message</button><button class="btn secondary" data-act="invite" data-user="${u.id}">${ic('users')}Invite to a team</button>`}
      <div class="row"><button class="btn ghost sm" data-act="report" data-type="profile" data-id="${u.id}">${ic('flag')}Report</button>${(viewer.blocked || []).includes(u.id) ? html`<button class="btn ghost sm" data-act="unblock" data-user="${u.id}">Unblock</button>` : html`<button class="btn ghost sm" data-act="block" data-user="${u.id}">Block</button>`}</div></div>` : ''}
    ${isAdmin(viewer) ? html`<div class="panel small stack" style="gap:6px">${u.status === 'banned' ? html`<span class="pill bad">Banned</span>` : ''}${u.suspendedUntil ? html`<span class="pill warn">Suspended until ${fmtDate(u.suspendedUntil)}</span>` : ''}<p class="muted">Warnings: ${(u.warnings || []).length}. Joined ${fmtDate(u.createdAt, true)}.</p></div>` : ''}
  </aside><div>
    ${edit && comp.pct < 100 ? completenessPanel(comp) : ''}
    ${section('score', 'Builder Score', scoreSection(u, sc, own, edit))}
    ${section('about', 'About', aboutSection(u))}
    ${section('github', 'GitHub', githubSection(u, edit), vlabel(u.github ? 'verified' : 'missing'))}
    ${section('coding', 'Coding profiles', codingSection(u, edit), vlabel(u.leetcode || u.codeforces ? 'self' : 'missing'))}
    ${section('acad', 'Academics', academicsSection(u, edit, viewer, sc), vlabel(academicsSummary(u) ? 'self' : 'missing'))}
    ${section('resume', 'Resume', resumeSection(u, edit, viewer), vlabel(u.resume && u.resume.confirmed ? 'self' : 'missing'))}
    ${section('history', 'Hackathon history', historySection(u, edit))}</div></div>`;
}
function completenessPanel(comp) {
  return html`<div class="panel complete"><div class="row"><h2 class="h-sm">Profile ${comp.pct}% complete</h2><span class="grow"></span><span class="small muted">Complete profiles get more invites.</span></div>
    <div class="cbar" role="progressbar" aria-valuenow="${comp.pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Profile completeness"><i style="width:${comp.pct}%"></i></div>
    <ul class="todo">${comp.missing.map(m => html`<li><button data-act="${m.act}">${ic('plus')}${m.label}<small>+${m.w}%</small></button></li>`)}</ul></div>`;
}
function scoreSection(u, sc, own, edit) {
  const pct = percentile(u);
  return html`<div class="bigscore"><b>${sc.total}</b><span class="muted">out of 1000${pct ? `, top ${pct}% of students on Alstr` : ''}</span></div>
  <p class="small muted" style="margin:8px 0 18px">Recalculated whenever ${own ? 'your' : 'their'} data changes. Missing parts count as 0.</p>
  ${scoreBreakdown(u, sc, edit)}
  <button class="btn secondary sm" style="margin-top:18px" data-act="score-toggle" ${expanded(ui.scoreOpen)}>${ui.scoreOpen ? 'Hide the calculation' : own ? 'How is my score calculated?' : 'How is this score calculated?'}</button>
  ${ui.scoreOpen ? scoreExplain(u, sc) : ''}${edit ? html`<h3 style="margin:24px 0 8px">Score history</h3>${lineChart(u.scoreHistory)}` : ''}`;
}
function aboutSection(u) {
  const p = u.profile, badges = badgesOf(u), peer = peerAggregate(u.id);
  return html`${p.bio ? html`<p class="prose">${p.bio}</p>` : html`<p class="muted">No bio yet.</p>`}
  <dl class="kv" style="margin-top:14px"><div><dt>College</dt><dd>${uniFactor(u).name}</dd></div><div><dt>Branch</dt><dd>${p.branch || 'Not set'}</dd></div>
    <div><dt>Year</dt><dd>${p.gradYear ? `Class of ${p.gradYear}, semester ${p.semester}` : 'Not set'}</dd></div><div><dt>Location</dt><dd>${p.city || 'Not set'} <span>${p.timezone}</span></dd></div><div><dt>Availability</dt><dd>${AVAIL[p.availability]}</dd></div></dl>
  <h3 class="h-sub">Roles</h3><div class="row" style="gap:6px">${p.roles.length ? p.roles.map(roleChip) : html`<span class="muted small">None picked</span>`}</div>
  <h3 class="h-sub">Skills</h3><div class="row" style="gap:6px">${p.skills.length ? p.skills.map(tagChip) : html`<span class="muted small">None added</span>`}</div>
  <h3 class="h-sub">Badges</h3>${badges.length ? html`<ul class="badges">${badges.map(b => html`<li><span class="medal">${ic(['winner', 'finalist', 'first'].includes(b.key) ? 'trophy' : 'star')}</span><span><b>${b.label}</b><span class="tiny muted">${b.desc}</span></span></li>`)}</ul>` : html`<p class="small muted">No badges yet. They come from verified results, solved problems, GitHub stars and teammate ratings.</p>`}
  <h3 class="h-sub">Teammate rating</h3>${peer.shown ? html`<p><span class="big">${peer.overall}</span> / 5 from ${peer.count} private ratings<span class="small muted" style="display:block">Reliability ${peer.reliability}, communication ${peer.communication}, skill ${peer.skill}</span></p>` : html`<p class="small muted">Shown once 3 or more teammates have rated them privately${peer.count ? ` (${peer.count} so far)` : ''}.</p>`}`;
}
function githubSection(u, edit) {
  const g = u.github;
  if (!g) return edit ? empty('Connect GitHub to verify your work', `Alstr reads public repos, languages, stars and commit activity. It’s worth up to ${DB.config.weights.github * 10} points.`, html`<button class="btn primary" data-act="github-connect">${ic('github')}Connect GitHub</button>`) : html`<p class="muted">Not connected, so this part of the score is 0.</p>`;
  const orig = g.repos.filter(r => !r.fork), stars = sum(orig.map(r => r.stars)), langs = uniq(orig.filter(r => r.commits >= 5).map(r => r.language).filter(Boolean));
  const top = orig.filter(r => r.commits >= 5).sort((a, b) => b.stars - a.stars || b.commits12m - a.commits12m).slice(0, 4);
  const wait = edit ? Math.max(0, (g.lastManualRefreshAt || 0) + HOUR - now()) : 0;
  return html`<p class="small muted row">${ic('github')}<span>Connected via GitHub as <a href="https://github.com/${g.username}" target="_blank" rel="noopener noreferrer">@${g.username}</a>. Last synced ${fmtRel(g.lastSyncedAt)}, and it syncs daily.</span></p>
  ${g.status === 'failed' ? html`<p class="warnbox">${ic('alert')}<span>The last sync failed ${fmtRel(g.lastAttemptAt)} (${g.error}). Showing data from ${fmtDateTime(g.lastSyncedAt)}.</span></p>` : ''}
  <div class="stats"><div class="stat"><b>${orig.length}</b><span>Original repos</span></div><div class="stat"><b>${num(stars)}</b><span>Stars</span></div><div class="stat"><b>${num(g.commits12m)}</b><span>Commits in 12 months</span></div><div class="stat"><b>${langs.length}</b><span>Languages</span></div></div>
  <div class="repos">${top.map(r => html`<div class="repo"><b>${r.name}</b>${r.description ? html`<p class="small muted">${r.description}</p>` : ''}<div class="rm"><span>${r.language}</span><span>${ic('star')} ${r.stars}</span><span>${r.commits12m} commits this year</span></div></div>`)}</div>
  ${edit ? html`<div class="row" style="margin-top:12px"><button class="btn secondary sm" data-act="github-refresh" ${raw(wait ? 'aria-disabled="true"' : '')}>${ic('refresh')}${wait ? 'Refresh available in ' + fmtDur(wait) : 'Refresh now'}</button><button class="btn ghost sm" data-act="github-disconnect">Disconnect GitHub</button></div>` : ''}`;
}
function codingSection(u, edit) {
  const l = u.leetcode, c = u.codeforces, flag = (u.statLog || []).find(e => e.flagged && e.review === 'open');
  if (!l && !c) return edit ? empty('Add your LeetCode or Codeforces stats', 'These are self-reported. Add your public profile link so teammates can check them.', html`<button class="btn primary" data-act="coding-edit">${ic('plus')}Add coding stats</button>`) : html`<p class="muted">No coding profiles added, so the DSA part of the score is 0.</p>`;
  const lnk = (url, label) => url ? html`<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ${ic('ext')}</a>` : html`${label} <span class="muted">(no profile link)</span>`;
  return html`${edit && flag ? html`<p class="warnbox">${ic('alert')}<span>A moderator is reviewing your last ${flag.source === 'leetcode' ? 'LeetCode' : 'Codeforces'} update: ${flag.reasons.join('; ')}. It still counts for now. Adding your public profile link speeds this up.</span></p>` : ''}
  <div class="code-grid">${l ? html`<div class="panel"><div class="row"><h3>LeetCode</h3><span class="grow"></span><span class="tiny muted">Updated ${fmtRel(l.updatedAt)}</span></div><p class="small" style="margin-top:4px">${lnk(l.url, l.username)}</p>
      <div class="bigline"><b>${num(l.total)}</b> solved</div>
      <div class="lcbar" role="img" aria-label="${l.easy} easy, ${l.medium} medium, ${l.hard} hard"><i class="e" style="width:${l.total ? (l.easy / l.total) * 100 : 0}%"></i><i class="m" style="width:${l.total ? (l.medium / l.total) * 100 : 0}%"></i><i class="h" style="width:${l.total ? (l.hard / l.total) * 100 : 0}%"></i></div>
      <p class="small legend"><span><i class="e"></i>Easy ${l.easy}</span><span><i class="m"></i>Medium ${l.medium}</span><span><i class="h"></i>Hard ${l.hard}</span></p>
      <p class="small" style="margin-top:8px">Contest rating <b>${l.contestRating == null ? 'none' : l.contestRating}</b>${l.globalRank ? html`, global rank <b>${num(l.globalRank)}</b>` : ''}</p></div>` : ''}
    ${c ? html`<div class="panel"><div class="row"><h3>Codeforces</h3><span class="grow"></span><span class="tiny muted">Updated ${fmtRel(c.updatedAt)}</span></div><p class="small" style="margin-top:4px">${lnk(c.url, c.handle)}</p>
      <div class="bigline cf cf-${cfRankFor(c.rating).cls}"><b class="cf">${c.rating}</b> ${c.rank}</div><p class="small" style="margin-top:8px">Max rating <b>${c.maxRating}</b>, <b>${num(c.solved)}</b> problems solved</p></div>` : ''}</div>
  ${edit ? html`<div class="row" style="margin-top:12px"><button class="btn secondary sm" data-act="coding-edit">${ic('pen')}Edit stats</button><button class="btn ghost sm" data-act="statlog-open">View edit history</button></div>` : ''}`;
}
function academicsSection(u, edit, viewer, sc) {
  const s = academicsSummary(u), uf = uniFactor(u), pts = sc.comps.find(c => c.key === 'academics').points;
  if (!s) return edit ? empty('Add your semester marks', 'Enter each semester on its own scale: 10-point, 4-point or percentage. Raw marks stay private unless you choose to show them.', html`<button class="btn primary" data-act="academics-edit">${ic('plus')}Add marks</button>`) : html`<p class="muted">No marks added, so the academics part of the score is 0.</p>`;
  const showRaw = edit || u.privacy.showMarks || isAdmin(viewer);
  return html`<p class="small muted">${uf.name}, university factor ×${uf.factor.toFixed(2)}. Updated ${fmtRel(u.academics.updatedAt || now())}.</p>
  ${showRaw ? html`<div class="tbl-wrap" style="margin-top:10px"><table class="tbl"><caption class="sr">Semester marks</caption><thead><tr><th scope="col">Semester</th><th scope="col">As entered</th><th scope="col">On a 10-point scale</th></tr></thead><tbody>${s.vals.map(v => html`<tr><td>${v.sem}</td><td>${v.scale === 'pct' ? v.raw + '%' : v.raw + ' / ' + v.scale}</td><td>${v.ten.toFixed(2)}</td></tr>`)}</tbody></table></div>
    <p style="margin-top:10px">CGPA <b>${s.cgpa.toFixed(2)}</b> out of 10, trend ${s.slope >= 0 ? '+' : '−'}${Math.abs(s.slope).toFixed(2)} per semester${edit && !u.privacy.showMarks ? html` <span class="pill">${ic('lock')}Only you can see these marks</span>` : ''}</p>`
    : html`<p class="infobox">${ic('lock')}<span>${firstName(u)} keeps raw marks private. Only the academics score is public: <b>${pts}</b> of ${DB.config.weights.academics * 10} points.</span></p>`}
  ${edit ? html`<div class="row" style="margin-top:12px"><button class="btn secondary sm" data-act="academics-edit">${ic('pen')}Edit marks</button><label class="check small"><input type="checkbox" data-change="privacy-marks" ${raw(u.privacy.showMarks ? 'checked' : '')}><span>Show my marks and CGPA on my public profile</span></label></div>` : ''}`;
}
const rlist = (title, arr, f) => html`<div><h3 class="h-sub" style="margin-top:0">${title} <span class="muted">${arr.length}</span></h3>${arr.length ? html`<ul class="rl">${arr.map(x => { const [a, b] = f(x); return html`<li><b>${a}</b>${b ? html`<span class="small muted">${b}</span>` : ''}</li>`; })}</ul>` : html`<p class="small muted">None listed</p>`}</div>`;
function resumeSection(u, edit, viewer) {
  const r = u.resume;
  if (!r) return edit ? empty('Upload your resume', 'PDF up to 5 MB. Alstr pulls out your skills, projects, internships, certifications and hackathon wins, and you review them before they count.', html`<button class="btn primary" data-act="resume-open">${ic('upload')}Upload resume</button>`) : html`<p class="muted">No resume uploaded, so the resume part of the score only counts verified hackathon results.</p>`;
  const c = r.confirmed, can = canSeeResume(viewer, u), shared = (r.sharedWith || []).map(id => (U(id) || {}).name).filter(Boolean);
  return html`${edit && r.status === 'review' ? html`<p class="warnbox">${ic('alert')}<span>Your new resume was parsed and is waiting for your review. It counts once you confirm it.</span><button class="btn secondary sm" data-act="resume-open">Review now</button></p>` : ''}
  ${c ? html`<div class="rgrid">${rlist('Internships', c.internships, x => [x.title, [x.org, x.duration].filter(Boolean).join(', ')])}${rlist('Projects', c.projects, x => [x.title, x.summary])}${rlist('Certifications', c.certifications, x => [x.title, x.issuer])}${rlist('Hackathon wins on resume', c.hackathonWins, x => [x.title, x.result])}</div>` : ''}
  <p class="small muted row" style="margin-top:14px">${ic('file')}<span>${r.fileName}, uploaded ${fmtRel(r.uploadedAt)}. ${edit ? 'The PDF is private' + (shared.length ? ' and shared with ' + shared.join(', ') + '.' : '.') : can ? 'You can open the PDF.' : 'The PDF is private.'}</span></p>
  <div class="row" style="margin-top:10px">${can ? html`<button class="btn secondary sm" data-act="resume-view" data-user="${u.id}">${ic('eye')}View PDF</button>` : ''}${edit ? html`<button class="btn secondary sm" data-act="resume-open">${ic('upload')}Replace</button><button class="btn ghost sm" data-act="resume-share">Manage access</button><button class="btn ghost sm" data-act="resume-delete">Delete</button>` : ''}</div>`;
}
function historySection(u, edit) {
  const teams = DB.teams.filter(t => isMember(t, u.id) && H(t.hackathonId) && hackStatus(H(t.hackathonId)).key === 'ended').sort((a, b) => H(b.hackathonId).endAt - H(a.hackathonId).endAt);
  if (!teams.length) return html`<p class="muted">No finished hackathons on Alstr yet.</p>`;
  return html`<ul class="hist">${teams.map(t => {
    const h = H(t.hackathonId), r = t.result, mine = t.members.find(m => m.userId === u.id);
    const st = !r ? html`<span class="pill">No result recorded</span>` : r.verification === 'verified' ? html`<span class="pill ok">${ic('shield')}${RESULT_LABEL[r.status]}, verified</span>` : r.verification === 'pending' ? html`<span class="pill warn">${RESULT_LABEL[r.status]}, awaiting verification</span>` : html`<span class="pill bad">${RESULT_LABEL[r.status]}, not verified</span>`;
    return html`<li><span class="hdate sm c-${h.color}" aria-hidden="true">${ic('trophy')}</span><div><b>${h.name}</b><span class="small muted">${t.name}, as ${mine.role}. Ended ${fmtDate(h.endAt, true)}.</span></div>${st}${edit && !r ? html`<a class="btn ghost sm" href="#team-${t.id}">Record result</a>` : ''}</li>`;
  })}</ul>`;
}
