/* ===================== onboarding ===================== */
function basicsFields(dk, u) {
  const d = k => dv(dk, k, k === 'name' ? u.name : u.profile[k]);
  const yr = new Date(now()).getFullYear();
  return html`${F({ name: 'name', label: 'Full name', value: d('name'), req: true, attrs: 'autocomplete="name"' })}
  ${F({ name: 'college', label: 'College or university', value: d('college'), req: true, attrs: 'data-rerender', opts: [['', 'Choose your college']].concat(DB.config.universities.map(x => [x.id, x.name])), hint: 'Sets the university factor in the academics part of your score.' })}
  ${d('college') === 'other' ? F({ name: 'collegeName', label: 'College name', value: d('collegeName'), req: true }) : ''}
  <div class="grid2">${F({ name: 'branch', label: 'Branch', value: d('branch'), req: true, opts: [['', 'Choose your branch']].concat(BRANCHES.map(b => [b, b])) })}
  ${F({ name: 'gradYear', label: 'Graduation year', value: d('gradYear'), req: true, opts: [['', 'Choose a year']].concat(Array.from({ length: 8 }, (_, i) => [String(yr - 1 + i), String(yr - 1 + i)])) })}
  ${F({ name: 'semester', label: 'Current semester', value: d('semester'), req: true, opts: [['', 'Choose a semester']].concat(Array.from({ length: 10 }, (_, i) => [String(i + 1), 'Semester ' + (i + 1)])) })}
  ${F({ name: 'city', label: 'City', value: d('city'), req: true, attrs: 'list="cities" autocomplete="address-level2"' })}</div>
  <datalist id="cities">${CITIES.map(c => html`<option value="${c}">`)}</datalist>
  ${F({ name: 'timezone', label: 'Timezone', value: d('timezone') || 'Asia/Kolkata', opts: TIMEZONES.map(t => [t, t]) })}`;
}
function rolesSkillsFields(dk, u) {
  const d = ensureDraft(dk, { roles: u.profile.roles.slice(), skills: u.profile.skills.slice(), bio: u.profile.bio, availability: u.profile.availability || 'looking' });
  if (!d.roles) d.roles = u.profile.roles.slice(); if (!d.skills) d.skills = u.profile.skills.slice();
  return html`${roleToggles(dk, 'roles', d.roles, 'Roles you like to play')}
  ${tagInput({ id: dk + '-skills', dk, field: 'skills', label: 'Skills', sugg: SKILLS, max: 25, hint: 'Add at least 3. Press Enter after each one.' })}
  ${F({ name: 'bio', label: 'Short bio', type: 'textarea', value: dv(dk, 'bio', u.profile.bio), rows: 3, ph: 'What do you like building? What are you looking for?', hint: 'Up to 280 characters.', attrs: 'maxlength="280"' })}
  ${F({ name: 'availability', label: 'Availability', value: dv(dk, 'availability', u.profile.availability || 'looking'), opts: Object.entries(AVAIL) })}`;
}
function viewOnboarding(u) {
  const step = ui.onbStep, names = ['About you', 'Roles and skills', 'Show your work'];
  let body;
  if (step === 1) body = html`<form data-form="onb1" data-draft="onb1" novalidate>${basicsFields('onb1', u)}<div class="row"><span class="grow"></span><button class="btn primary" type="submit">Continue</button></div></form>`;
  else if (step === 2) body = html`<form data-form="onb2" data-draft="onb2" novalidate>${rolesSkillsFields('onb2', u)}<div class="row"><button class="btn ghost" type="button" data-act="onb-back">Back</button><span class="grow"></span><button class="btn primary" type="submit">Continue</button></div></form>`;
  else {
    const cards = [['GitHub', u.github ? 'Connected as @' + u.github.username : 'Verified repos, stars and commit activity.', !!u.github, u.github ? '' : html`<button class="btn primary sm" data-act="github-connect">${ic('github')}Connect GitHub</button>`],
      ['LeetCode and Codeforces', u.leetcode || u.codeforces ? 'Added' : 'Self-reported solved counts and ratings.', !!(u.leetcode || u.codeforces), html`<button class="btn secondary sm" data-act="coding-edit">${u.leetcode || u.codeforces ? 'Edit stats' : 'Add stats'}</button>`],
      ['Semester marks', academicsSummary(u) ? 'Added. Private by default.' : 'Private by default. Only the score part is public.', !!academicsSummary(u), html`<button class="btn secondary sm" data-act="academics-edit">${academicsSummary(u) ? 'Edit marks' : 'Add marks'}</button>`],
      ['Resume', u.resume ? (u.resume.confirmed ? 'Confirmed' : 'Waiting for your review') : 'PDF up to 5 MB, parsed for you to review.', !!(u.resume && u.resume.confirmed), html`<button class="btn secondary sm" data-act="resume-open">${u.resume ? 'Review' : 'Upload'}</button>`]];
    body = html`<p class="muted" style="margin-bottom:14px">Each source adds to your Builder Score. You can skip any of them for now; missing ones count as 0 and show as missing on your profile.</p>
    <div class="connect">${cards.map(([t, dsc, done, b]) => html`<div class="card"><div class="row"><h3>${t}</h3><span class="grow"></span>${done ? html`<span class="pill ok">${ic('check')}Done</span>` : ''}</div><p class="small muted">${dsc}</p>${b}</div>`)}</div>
    <div class="row" style="margin-top:22px"><button class="btn ghost" data-act="onb-back">Back</button><span class="grow"></span><button class="btn primary" data-act="onb-finish">Finish and see my profile</button></div>`;
  }
  return html`<div class="cols"><div><h1>Welcome to Alstr, ${firstName(u)}</h1><p class="muted" style="margin:6px 0 18px">Three short steps. You can change everything later.</p>
    <ol class="stepper">${names.map((s, i) => html`<li class="${i + 1 < step ? 'done' : ''}" ${raw(i + 1 === step ? 'aria-current="step"' : '')}><b>${i + 1 < step ? ic('check') : i + 1}</b>${s}</li>`)}</ol>${body}</div>
    <aside class="onb-side">${lanyard(u)}<p class="small muted" style="text-align:center;margin-top:10px">Your badge updates as you add sources.</p></aside></div>`;
}

/* ===================== teams ===================== */
function inviteLine(i, u) {
  const t = T(i.teamId), from = U(i.fromId), to = U(i.toId);
  if (i.kind === 'invite') return i.fromId === u.id ? html`You invited <a href="#u-${to.id}">${to.name}</a> to <a href="#team-${t.id}">${t.name}</a>` : html`<a href="#u-${from.id}">${from.name}</a> invited you to join <b>${t.name}</b>`;
  return i.fromId === u.id ? html`You asked to join <b>${t.name}</b>` : html`<a href="#u-${from.id}">${from.name}</a> asked to join <a href="#team-${t.id}">${t.name}</a>`;
}
function inviteCard(i, u, readonly) {
  const h = H(i.hackathonId), other = U(i.fromId === u.id ? i.toId : i.fromId), incoming = i.fromId !== u.id;
  const atDeadline = Math.abs(i.expiresAt - h.regDeadline) < 1000;
  return html`<div class="inv">${avatar(other, 40)}<div class="inv-main"><p>${inviteLine(i, u)} <span class="muted">for</span> <a href="#h-${h.id}">${h.name}</a></p><p class="small muted">“${i.message}”</p>
    <p class="tiny muted">Sent ${fmtRel(i.createdAt)}. Expires in ${fmtDur(i.expiresAt - now())}${atDeadline ? ', when registration closes' : ''}.</p></div>
    ${readonly ? '' : html`<div class="row">${incoming ? html`<button class="btn primary sm" data-act="inv-accept" data-id="${i.id}">Accept</button><button class="btn secondary sm" data-act="inv-decline" data-id="${i.id}">Decline</button>` : html`<button class="btn secondary sm" data-act="inv-withdraw" data-id="${i.id}">Withdraw</button>`}</div>`}</div>`;
}
function teamCard(t, u) {
  const h = H(t.hackathonId), cov = coverage(t), ended = hackStatus(h).key === 'ended';
  return html`<a class="team-card" href="#team-${t.id}"><span class="team-mark">${t.name.slice(0, 1)}</span><span class="tc-main"><b>${t.name}</b><span class="small muted">${h.name}, ${t.members.length} of ${h.maxTeam} members${t.leaderId === u.id ? ', you lead it' : ''}</span>${cov.missing.length && !ended ? html`<span class="small">Missing: ${cov.missing.map(r => ROLE_PERSON[r]).join(', ')}</span>` : ''}${ended && t.result ? html`<span class="small">${RESULT_LABEL[t.result.status]}, ${t.result.verification}</span>` : ''}</span><span class="avs">${t.members.slice(0, 5).map(m => avatar(U(m.userId), 30))}</span></a>`;
}
function viewTeams(u) {
  const mine = DB.teams.filter(t => !t.disbanded && isMember(t, u.id));
  const active = mine.filter(t => hackStatus(H(t.hackathonId)).key !== 'ended'), past = mine.filter(t => hackStatus(H(t.hackathonId)).key === 'ended');
  const incoming = DB.invites.filter(i => i.status === 'pending' && ((i.kind === 'invite' && i.toId === u.id) || (i.kind === 'request' && T(i.teamId) && T(i.teamId).leaderId === u.id)));
  const sent = DB.invites.filter(i => i.status === 'pending' && i.fromId === u.id);
  const hist = DB.invites.filter(i => i.status !== 'pending' && (i.fromId === u.id || i.toId === u.id)).sort((a, b) => (b.resolvedAt || 0) - (a.resolvedAt || 0)).slice(0, 8);
  return html`<div class="page-head"><div><h1>Teams</h1><p class="muted">Your teams, plus the invites and join requests waiting for you.</p></div><a class="btn secondary" href="#hackathons">Find a hackathon</a></div>
  ${section('in', 'Waiting for you', incoming.length ? html`<div class="stack">${incoming.map(i => inviteCard(i, u))}</div>` : html`<p class="muted">Nothing waiting. Invites and join requests show up here.</p>`, incoming.length ? html`<span class="count">${incoming.length}</span>` : '')}
  ${section('active', 'Your teams', active.length ? html`<div class="team-list">${active.map(t => teamCard(t, u))}</div>` : empty('You’re not in a team yet', 'Pick a hackathon, then post that you’re looking or start a team.', html`<a class="btn primary" href="#hackathons">Browse hackathons</a>`))}
  ${sent.length ? section('sent', 'Sent by you', html`<div class="stack">${sent.map(i => inviteCard(i, u))}</div>`) : ''}
  ${past.length ? section('past', 'Past teams', html`<div class="team-list">${past.map(t => teamCard(t, u))}</div>`) : ''}
  ${hist.length ? section('hist', 'Recent history', html`<ul class="mini-hist">${hist.map(i => html`<li><span>${inviteLine(i, u)}${i.reason ? html` <span class="muted small">(${i.reason})</span>` : ''}</span><span class="pill ${i.status === 'accepted' ? 'ok' : i.status === 'declined' ? 'bad' : ''}">${cap(i.status)}</span></li>`)}</ul>`) : ''}`;
}
function memberBadge(t, m, u, manage) {
  const p = U(m.userId), id = 'mb-' + m.userId, open = ui.menu === id;
  return html`<div class="mini"><div class="mini-in"><div class="who">${avatar(p, 40)}<div style="min-width:0;flex:1"><a class="nm" href="#u-${p.id}">${p.name}</a><div class="tiny muted">${t.leaderId === p.id ? 'Leader' : 'Member'}${u && p.id === u.id ? ', you' : ''}</div></div>
    ${manage && p.id !== u.id ? html`<div class="menu-wrap"><button class="icon-btn sm" data-act="menu" data-id="${id}" ${expanded(open)} aria-haspopup="true" aria-label="Manage ${p.name}">${ic('more')}</button>${open ? html`<div class="menu"><button data-act="team-lead" data-id="${t.id}" data-user="${p.id}">${ic('shield')}Make leader</button><button class="danger" data-act="team-remove" data-id="${t.id}" data-user="${p.id}">${ic('x')}Remove from team</button></div>` : ''}</div>` : ''}</div>
    <div class="row" style="gap:8px;align-items:baseline"><span class="sc">${scoreOf(p)}</span><span class="tiny muted">Builder Score</span></div></div>
    <div class="stripe"><span class="r-${ROLE_KEY[m.role]}">${m.role}</span></div></div>`;
}
function viewTeam(u, t) {
  if (!t || t.disbanded) return notFound('This team doesn’t exist anymore.');
  const h = H(t.hackathonId), member = isMember(t, u.id), admin = isAdmin(u), lead = t.leaderId === u.id, st = hackStatus(h), ended = st.key === 'ended';
  if (!member && !admin) {
    const post = DB.posts.find(p => p.teamId === t.id && p.status === 'active');
    const canReq = u.role === 'student' && post && !teamOf(u.id, h.id) && now() <= h.regDeadline && !ended;
    return html`<p class="crumbs"><a href="#h-${h.id}">${ic('back')}${h.name}</a></p><div class="page-head"><div><h1>${t.name}</h1><p class="muted">${t.members.length} of ${h.maxTeam} members. Team chat and links are only visible to members.</p></div>
    ${canReq ? (pendingBetween(t.id, u.id) ? html`<span class="pill brand">Request sent</span>` : html`<button class="btn primary" data-act="request" data-team="${t.id}" data-post="${post.id}">Request to join</button>`) : ''}</div>
    <div class="badges-row">${t.members.map(m => memberBadge(t, m, u, false))}</div>`;
  }
  const cov = coverage(t), open = Math.max(0, h.maxTeam - t.members.length), reqs = DB.invites.filter(i => i.teamId === t.id && i.status === 'pending');
  const missing = cov.missing.slice();
  return html`<p class="crumbs"><a href="#h-${h.id}">${ic('back')}${h.name}</a></p>
  <div class="page-head"><div><div class="row">${statusPill(st)}<span class="small muted">${t.members.length} of ${h.maxTeam} members${t.members.length < h.minTeam ? `. Needs at least ${h.minTeam} to register` : ''}</span></div><h1 style="margin-top:8px">${t.name}</h1></div>
    <div class="row">${lead && !ended && open && now() <= h.regDeadline ? html`<button class="btn primary" data-act="invite-pick" data-id="${t.id}">${ic('plus')}Invite people</button>` : ''}${member && !ended ? html`<button class="btn ghost" data-act="team-leave" data-id="${t.id}">Leave team</button>` : ''}</div></div>
  <div class="badges-row">${t.members.map(m => memberBadge(t, m, u, lead && !ended))}${ended ? '' : Array.from({ length: open }, () => { const r = missing.shift(); return html`<div class="mini open">${ic('plus')}<b>Open spot</b><span class="small">${r ? 'Missing: ' + ROLE_PERSON[r] : 'Any role'}</span></div>`; })}</div>
  <div class="cover"><span class="small muted">Role coverage</span>${ROLES.map(r => { const on = cov.covered.has(r), need = !on && (t.neededRoles || []).includes(r); return html`<span class="cov r-${ROLE_KEY[r]} ${on ? 'on' : need ? 'need' : ''}">${on ? ic('check') : ''}${r}${need ? ' (missing)' : ''}</span>`; })}${lead && !ended ? html`<button class="link small" data-act="needed-edit" data-id="${t.id}">Change needed roles</button>` : ''}</div>
  <div class="cols" style="margin-top:24px"><div>${ended && member ? resultPanel(t, h) : ''}
    <section aria-labelledby="h-chat"><div class="sec-head"><h2 id="h-chat">Team chat</h2></div>${chatBox(u, C(t.convId))}</section></div>
  <aside class="stack">${reqs.length && (lead || admin) ? html`<div class="panel"><h2 class="h-sm">Pending invites and requests</h2><div class="stack" style="margin-top:10px">${reqs.map(i => inviteCard(i, u, !lead))}</div></div>` : ''}
    ${linksPanel(u, t, member)}
    ${member ? html`<div class="panel"><label class="h-sm lbl" for="myrole">Your role in the team</label><select id="myrole" data-change="my-role" data-id="${t.id}" style="margin-top:8px" ${raw(ended ? 'disabled' : '')}>${ROLES.map(r => html`<option value="${r}" ${sel(t.members.find(m => m.userId === u.id).role === r)}>${r}</option>`)}</select></div>` : ''}
    ${ended && member ? ratingsPanel(u, t) : ''}</aside></div>`;
}
function linksPanel(u, t, member) {
  const dk = 'link-' + t.id;
  return html`<div class="panel"><h2 class="h-sm">Shared links</h2>${t.links.length ? html`<ul class="links" style="margin-top:10px">${t.links.map(l => html`<li>${ic('link')}<a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label}</a><span class="tiny muted">${hostOf(l.url)}</span>${member ? html`<button class="icon-btn sm" data-act="link-remove" data-id="${t.id}" data-link="${l.id}" aria-label="Remove ${l.label}">${ic('x')}</button>` : ''}</li>`)}</ul>` : html`<p class="small muted" style="margin-top:6px">Add the repo, Figma file and docs so everyone has them.</p>`}
  ${member ? html`<form data-form="link" data-id="${t.id}" data-draft="${dk}" novalidate style="margin-top:14px"><div class="grid2">${F({ id: dk + '-l', name: 'linkLabel', label: 'Label', value: dv(dk, 'linkLabel', ''), ph: 'Repo' })}${F({ id: dk + '-u', name: 'linkUrl', label: 'Link', type: 'url', value: dv(dk, 'linkUrl', ''), ph: 'https://' })}</div><button class="btn secondary sm" type="submit">${ic('plus')}Add link</button></form>` : ''}</div>`;
}
function resultPanel(t, h) {
  const r = t.result, dk = 'res-' + t.id;
  if (r && r.verification !== 'rejected') return html`<div class="panel" style="margin-bottom:20px"><h2 class="h-sm">Result</h2><p style="margin-top:10px">${r.verification === 'verified' ? html`<span class="pill ok">${ic('shield')}${RESULT_LABEL[r.status]}, verified ${fmtDate(r.reviewedAt, true)}</span>` : html`<span class="pill warn">${RESULT_LABEL[r.status]}, waiting for an admin to verify</span>`}</p><p class="small muted" style="margin-top:8px">Proof: <a href="${r.proofUrl}" target="_blank" rel="noopener noreferrer">${r.proofUrl}</a></p></div>`;
  return html`<div class="panel" style="margin-bottom:20px"><h2 class="h-sm">Record your result</h2>${r ? html`<p class="warnbox">${ic('alert')}<span>The last submission wasn’t verified${r.note ? ': ' + r.note : '.'} You can submit again.</span></p>` : html`<p class="small muted" style="margin:6px 0 12px">Add a link that proves it, like the official results page or a certificate. Once an admin verifies it, it shows on every member’s profile and counts toward the resume part of the score.</p>`}
  <form data-form="result" data-id="${t.id}" data-draft="${dk}" novalidate><div class="grid2">${F({ id: dk + '-s', name: 'status', label: 'Result', value: dv(dk, 'status', ''), opts: [['', 'Choose a result'], ['participated', 'Participated'], ['finalist', 'Finalist'], ['winner', 'Winner']] })}${F({ id: dk + '-p', name: 'proofUrl', label: 'Proof link', type: 'url', value: dv(dk, 'proofUrl', ''), ph: 'https://' })}</div><button class="btn primary sm" type="submit">Submit for verification</button></form></div>`;
}
function ratingsPanel(u, t) {
  const mates = t.members.filter(m => m.userId !== u.id);
  return html`<div class="panel"><h2 class="h-sm">Rate your teammates</h2><p class="small muted" style="margin:6px 0 12px">Private. People only see an average once 3 or more teammates have rated them.</p>
  <ul class="rate-list">${mates.map(m => { const p = U(m.userId), mine = (t.ratings || []).find(r => r.from === u.id && r.to === p.id); return html`<li>${avatar(p, 30)}<span><b>${p.name}</b><span class="tiny muted">${mine ? `You rated ${mine.reliability}, ${mine.communication}, ${mine.skill}` : 'Not rated yet'}</span></span><button class="btn secondary sm" data-act="rate-open" data-id="${t.id}" data-user="${p.id}">${mine ? 'Edit' : 'Rate'}</button></li>`; })}</ul></div>`;
}

/* ===================== messaging ===================== */
const dayLabel = ts => { const d = new Date(ts).toDateString(); if (d === new Date(now()).toDateString()) return 'Today'; if (d === new Date(now() - DAY).toDateString()) return 'Yesterday'; return fmtDate(ts, true); };
function chatBox(u, c) {
  if (!c) return '';
  const msgs = DB.messages.filter(m => m.convId === c.id && (!m.hidden || isAdmin(u) || m.senderId === u.id));
  const canSend = u.role === 'student' && convParticipants(c).includes(u.id);
  const req = c.type === 'dm' ? c.request : null, other = c.type === 'dm' ? U(c.members.find(x => x !== u.id)) : null;
  const inReq = req && req.state === 'pending' && req.by !== u.id, outReq = req && req.state === 'pending' && req.by === u.id;
  const blocked = other && isBlockedEither(u.id, other.id);
  const ty = ui.typing[c.id] ? U(ui.typing[c.id].userId) : null;
  let last = '';
  const items = msgs.map(m => {
    const day = new Date(m.at).toDateString(), sep = day !== last ? html`<div class="daysep">${dayLabel(m.at)}</div>` : ''; last = day;
    if (m.system) return html`${sep}<div class="sysmsg">${m.text}</div>`;
    const mine = m.senderId === u.id, s = U(m.senderId);
    return html`${sep}<div class="bw ${mine ? 'mine' : ''}"><div class="bubble ${mine ? 'mine' : ''}">${!mine && c.type === 'team' ? html`<span class="from">${s ? s.name : 'Someone'}</span>` : ''}${m.hidden ? html`<em>Hidden by a moderator. </em>` : ''}${m.text}<span class="t">${fmtTime(m.at)}</span></div>${!mine && !m.deleted && canSend ? html`<button class="mact" data-act="report" data-type="message" data-id="${m.id}" aria-label="Report this message">${ic('flag')}</button>` : ''}</div>`;
  });
  const dk = 'msg-' + c.id;
  let foot = '';
  if (blocked) foot = html`<p class="reqbar small muted">You can’t message each other because one of you blocked the other.</p>`;
  else if (inReq) foot = html`<div class="reqbar"><p class="small"><b>${other.name}</b> wants to message you. Accept to reply, or decline and they can’t message you again.</p><div class="row"><button class="btn primary sm" data-act="msg-accept" data-id="${c.id}">Accept</button><button class="btn secondary sm" data-act="msg-decline" data-id="${c.id}">Decline</button><button class="btn ghost sm" data-act="block" data-user="${other.id}">Block</button><button class="btn ghost sm" data-act="report" data-type="profile" data-id="${other.id}">Report</button></div></div>`;
  else if (req && req.state === 'declined' && req.by === u.id) foot = html`<p class="reqbar small muted">${other.name} isn’t accepting messages from you.</p>`;
  else if (canSend) foot = html`${outReq ? html`<p class="typing">This is a message request. ${firstName(other)} sees it in their requests, and you can send up to 3 messages until they accept.</p>` : ''}<form class="composer" data-form="msg" data-id="${c.id}" data-draft="${dk}" novalidate><label class="sr" for="cmp-${c.id}">Message</label><textarea id="cmp-${c.id}" name="text" rows="1" placeholder="Write a message" data-enter-send maxlength="2000">${dv(dk, 'text', '')}</textarea><button class="btn primary" type="submit" aria-label="Send message">${ic('send')}</button></form>`;
  return html`<div class="chatbox"><div class="msgs" data-keep="msgs-${c.id}">${items.length ? items : html`<p class="small muted" style="margin:auto;text-align:center">No messages yet. Say hi.</p>`}</div>${ty ? html`<p class="typing" aria-live="polite">${firstName(ty)} is typing…</p>` : ''}${foot}</div>`;
}
function convTitle(u, c) {
  if (c.type === 'team') { const t = T(c.teamId); return { name: t.name, sub: H(t.hackathonId).name, av: html`<span class="team-mark sm" aria-hidden="true">${t.name.slice(0, 1)}</span>` }; }
  const o = U(c.members.find(x => x !== u.id)); return { name: o.name, sub: uniFactor(o).name, av: avatar(o, 38), user: o };
}
function viewInbox(u, id) {
  const convs = visibleConvs(u.id), reqs = convs.filter(c => isRequestFor(u.id, c)), chats = convs.filter(c => !isRequestFor(u.id, c));
  const cur = id ? convs.find(c => c.id === id) : null;
  if (cur && isRequestFor(u.id, cur)) ui.inboxTab = 'requests';
  const tab = ui.inboxTab, list = tab === 'requests' ? reqs : chats, un = unreadTotal(u.id);
  return html`<div class="page-head"><div><h1>Inbox</h1><p class="muted">Direct messages and team chats.</p></div></div>
  <div class="inbox ${cur ? 'has-thread' : ''}"><div class="conv-list"><div class="tabs" role="tablist" aria-label="Conversations">
    <button role="tab" ${raw(`aria-selected="${tab === 'chats'}"`)} data-act="inbox-tab" data-v="chats">Chats${un ? html` <span class="count">${un}</span>` : ''}</button>
    <button role="tab" ${raw(`aria-selected="${tab === 'requests'}"`)} data-act="inbox-tab" data-v="requests">Message requests${reqs.length ? html` <span class="count">${reqs.length}</span>` : ''}</button></div>
    ${list.length ? html`<ul>${list.map(c => { const ti = convTitle(u, c), lm = DB.messages.filter(m => m.convId === c.id).pop(), n = unreadIn(u.id, c); return html`<li><a class="conv ${n ? 'unread' : ''}" href="#inbox-${c.id}" ${raw(cur && cur.id === c.id ? 'aria-current="page"' : '')}>${ti.av}<span class="meta"><b>${ti.name}</b><span>${lm ? (lm.senderId === u.id ? 'You: ' : '') + lm.text : ''}</span></span><span class="tiny muted">${lm ? fmtRel(lm.at).replace(' ago', '') : ''}${n ? html`<span class="count" style="display:block;margin:4px 0 0 auto;width:fit-content"><span class="sr">Unread: </span>${n}</span>` : ''}</span></a></li>`; })}</ul>`
    : html`<p class="small muted" style="padding:16px">${tab === 'requests' ? 'No message requests. First messages from people you haven’t worked with land here.' : 'No chats yet. Message someone from their profile or a post.'}</p>`}</div>
  <div class="thread">${cur ? threadView(u, cur) : id ? html`<div class="empty" style="margin:auto;border:0"><h3>This conversation isn’t available</h3><p>It may have been declined or blocked.</p></div>` : html`<div class="empty" style="margin:auto;border:0"><h3>Pick a conversation</h3><p>Team chats appear here automatically when you join a team.</p></div>`}</div></div>`;
}
function threadView(u, c) {
  const ti = convTitle(u, c), id = 'tm-' + c.id, open = ui.menu === id;
  return html`<div class="th-head"><a class="icon-btn back-btn" href="#inbox" aria-label="Back to conversations">${ic('back')}</a>${ti.av}<div style="min-width:0;flex:1"><b>${ti.user ? html`<a class="plain" href="#u-${ti.user.id}">${ti.name}</a>` : html`<a class="plain" href="#team-${c.teamId}">${ti.name}</a>`}</b><div class="tiny muted">${ti.sub}</div></div>
    ${ti.user ? html`<div class="menu-wrap"><button class="icon-btn" data-act="menu" data-id="${id}" ${expanded(open)} aria-haspopup="true" aria-label="Conversation options">${ic('more')}</button>${open ? html`<div class="menu"><a href="#u-${ti.user.id}">${ic('user')}View profile</a><button data-act="block" data-user="${ti.user.id}">${ic('lock')}Block</button><button class="danger" data-act="report" data-type="profile" data-id="${ti.user.id}">${ic('flag')}Report</button></div>` : ''}</div>` : html`<a class="btn ghost sm" href="#team-${c.teamId}">Team page</a>`}</div>${chatBox(u, c)}`;
}

/* ===================== notifications and settings ===================== */
const NICON = { invite: 'users', response: 'check', reply: 'msg', message: 'send', hackathon: 'cal', deadline: 'clock', score: 'star', team: 'trophy', system: 'shield' };
function viewNotifications(u) {
  const L = DB.notifications.filter(n => n.userId === u.id), unread = L.filter(n => !n.read).length;
  return html`<div class="page-head"><div><h1>Notifications</h1><p class="muted">${unread ? unread + ' unread.' : 'You’re all caught up.'} Choose what reaches you in the app or by email in <a href="#account">settings</a>.</p></div>${unread ? html`<button class="btn secondary" data-act="notif-all">Mark all as read</button>` : ''}</div>
  ${L.length ? html`<ul class="nlist">${L.slice(0, 80).map(n => html`<li><button class="nitem ${n.read ? '' : 'unread'}" data-act="notif-open" data-id="${n.id}"><span class="dot" aria-hidden="true"></span><span class="ntype" aria-hidden="true">${ic(NICON[n.type] || 'bell')}</span><span style="flex:1;min-width:0">${n.read ? '' : html`<span class="sr">Unread: </span>`}<b>${n.title}</b>${n.body ? html`<span class="small muted" style="display:block">${n.body}</span>` : ''}<span class="tiny muted">${fmtRel(n.at)}</span></span></button></li>`)}</ul>` : empty('No notifications yet', 'Invites, replies, deadlines and score changes show up here.')}`;
}
function viewAccount(u) {
  const st = u.role === 'student';
  return html`<div class="page-head"><div><h1>Settings and privacy</h1><p class="muted">Signed in as ${u.email}</p></div></div>
  ${section('appearance', 'Appearance', html`<div class="seg" role="group" aria-label="Theme">${[['system', 'Match my device'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => html`<button class="chip-toggle" ${pressed(ui.theme === v)} data-act="theme" data-v="${v}">${l}</button>`)}</div>`)}
  ${st ? section('privacy', 'Privacy', html`<label class="check"><input type="checkbox" data-change="privacy-marks" ${raw(u.privacy.showMarks ? 'checked' : '')}><span><b>Show my marks and CGPA on my profile</b><span class="small muted" style="display:block">Off by default. When it’s off, people only see the academics part of your Builder Score.</span></span></label>
    <div class="infobox" style="margin-top:16px">${ic('lock')}<span>Your resume PDF is only visible to you, Alstr admins and people you share it with. Every view uses a link that expires after 10 minutes.</span>${u.resume ? html`<button class="btn secondary sm" data-act="resume-share">Manage access</button>` : ''}</div>`) : ''}
  ${section('notif', 'Notifications', html`<div class="tbl-wrap"><table class="tbl pref-tbl"><caption class="sr">Notification settings</caption><thead><tr><th scope="col">Notify me about</th><th scope="col">In the app</th><th scope="col">Email</th></tr></thead><tbody>${NOTIF_TYPES.map(t => { const p = (u.notifPrefs || {})[t.key] || {}; return html`<tr><td>${t.label}</td><td><input type="checkbox" aria-label="${t.label}, in the app" data-change="pref" data-type="${t.key}" data-ch="inapp" ${raw(p.inapp !== false ? 'checked' : '')}></td><td><input type="checkbox" aria-label="${t.label}, by email" data-change="pref" data-type="${t.key}" data-ch="email" ${raw(p.email ? 'checked' : '')}></td></tr>`; })}</tbody></table></div><p class="tiny muted" style="margin-top:8px">Account and moderation notices are always sent.</p>`)}
  ${section('sessions', 'Signed-in devices', html`<ul class="dev-list">${(u.sessions || []).map(s => html`<li>${ic('lock')}<span><b>${s.device}</b><span class="tiny muted">Signed in ${fmtDate(s.createdAt, true)}${SESS && s.id === SESS.sid ? ', this device' : ', last active ' + fmtRel(s.lastSeen)}</span></span></li>`)}</ul><button class="btn secondary" style="margin-top:12px" data-act="logout-all">Log out of all devices</button>`)}
  ${st ? section('blocked', 'Blocked people', (u.blocked || []).length ? html`<ul class="dev-list">${u.blocked.map(U).filter(Boolean).map(b => html`<li>${avatar(b, 30)}<span><b>${b.name}</b></span><button class="btn ghost sm" data-act="unblock" data-user="${b.id}">Unblock</button></li>`)}</ul>` : html`<p class="muted">You haven’t blocked anyone.</p>`) : ''}
  ${st ? section('accounts', 'Connected accounts', html`<ul class="dev-list"><li>${gmark()}<span><b>Google</b><span class="tiny muted">${u.email}, used to sign in</span></span></li><li>${ic('github')}<span><b>GitHub</b><span class="tiny muted">${u.github ? 'Connected as @' + u.github.username : 'Not connected'}</span></span>${u.github ? html`<button class="btn ghost sm" data-act="github-disconnect">Disconnect</button>` : html`<button class="btn secondary sm" data-act="github-connect">Connect</button>`}</li></ul>`) : ''}
  ${st ? section('data', 'Your data', html`<p class="muted" style="margin-bottom:12px;max-width:70ch">Download everything Alstr stores about you, or delete your account. Deleting removes your profile, posts, replies, resume file and stats. Messages you sent show as “Message deleted”.</p><div class="row"><button class="btn secondary" data-act="export">${ic('download')}Export my data</button><button class="btn danger" data-act="delete-open">Delete my account</button></div>`) : ''}`;
}
