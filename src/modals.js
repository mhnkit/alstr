/* ===================== modals ===================== */
function shell(title, body, foot, o) {
  o = o || {};
  return html`<div class="scrim" data-act="modal-close"></div><div class="modal ${o.wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="mdl-t"><div class="m-head"><h2 id="mdl-t">${title}</h2><button class="icon-btn" data-act="modal-close" aria-label="Close">${ic('x')}</button></div><div class="m-body">${body}</div>${foot ? html`<div class="m-foot">${foot}</div>` : ''}</div>`;
}
const cancelBtn = (l) => html`<button class="btn ghost" data-act="modal-close">${l || 'Cancel'}</button>`;
const submitBtn = (l, cls) => html`<button class="btn ${cls || 'primary'}" type="submit" form="mf">${l}</button>`;
function renderModal() {
  const m = ui.modal, fn = MODALS[m.type];
  return fn ? fn(m) : '';
}
const MODALS = {
  google: () => {
    const known = [['arjun.menon@gmail.com', 'Arjun Menon', 'Existing student with a full profile'], ['riya.kapoor@gmail.com', 'Riya Kapoor', 'New to Alstr, goes through onboarding']];
    return shell(html`${gmark()} Sign in with Google`, html`<p class="small muted" style="margin-bottom:12px">Choose an account to continue to Alstr. This demo skips Google’s password screen.</p>
    <ul class="acct-list">${known.map(([e, n, d]) => html`<li><button data-act="google-pick" data-email="${e}" data-name="${n}">${avatar({ name: n, hue: hashHue(e) }, 38)}<span><b>${n}</b><span class="tiny muted" style="display:block">${e}</span><span class="tiny muted" style="display:block">${d}</span></span></button></li>`)}</ul>
    <form data-form="google-other" data-draft="gother" novalidate style="margin-top:18px"><p class="lbl" style="margin-bottom:8px">Or use another Google account</p><div class="grid2">${F({ name: 'name', label: 'Your name', value: dv('gother', 'name', ''), attrs: 'autocomplete="name"' })}${F({ name: 'email', label: 'Gmail address', type: 'email', value: dv('gother', 'email', ''), attrs: 'autocomplete="email"' })}</div><button class="btn secondary" type="submit">Continue</button></form>
    <p class="tiny muted" style="margin-top:14px">Students sign in with Google only. Staff use the <a href="#admin-login" data-act="modal-close">admin login</a>.</p>`);
  },
  github: () => {
    const u = me();
    return shell(html`${ic('github')} Authorize Alstr`, html`<p>Alstr will read your <b>public</b> repositories, languages, stars and contribution activity. It can’t write to your account or see private code.</p>
    <form id="mf" data-form="github" data-draft="gh" novalidate style="margin-top:14px">${F({ name: 'gh', label: 'GitHub username', value: dv('gh', 'gh', u.github ? u.github.username : u.id === 'u1' ? 'arjun-menon' : ''), ph: 'your-username', attrs: 'autocomplete="off" autocapitalize="off" spellcheck="false"', hint: 'In the live app, GitHub’s own sign-in page confirms the account is yours.' })}</form>`,
    html`${cancelBtn()}<button class="btn primary" type="submit" form="mf" ${raw(ui.busy ? 'disabled' : '')}>${ui.busy ? 'Connecting…' : 'Authorize and connect'}</button>`);
  },
  coding: m => {
    const u = me(), tab = m.tab || 'leetcode', l = u.leetcode || {}, c = u.codeforces || {}, dk = tab === 'leetcode' ? 'lc' : 'cf';
    const d = (k, def) => dv(dk, k, def == null ? '' : def);
    const body = tab === 'leetcode' ? html`<form id="mf" data-form="leetcode" data-draft="lc" novalidate>
      <div class="grid2">${F({ name: 'lc_username', label: 'Username', value: d('lc_username', l.username), req: true, attrs: 'autocomplete="off" autocapitalize="off"' })}${F({ name: 'lc_url', label: 'Profile link (optional)', type: 'url', value: d('lc_url', l.url), ph: 'https://leetcode.com/u/…', hint: 'Shown on your profile so others can check.' })}</div>
      <fieldset class="fld"><legend class="lbl">Questions solved</legend><div class="grid4">${[['lc_easy', 'Easy', l.easy], ['lc_medium', 'Medium', l.medium], ['lc_hard', 'Hard', l.hard], ['lc_total', 'Total', l.total]].map(([n, lb, v]) => F({ name: n, label: lb, value: d(n, v), attrs: 'inputmode="numeric"' }))}</div><p class="hint">Easy + Medium + Hard must equal Total.</p></fieldset>
      <div class="grid2">${F({ name: 'lc_rating', label: 'Contest rating (optional)', value: d('lc_rating', l.contestRating), attrs: 'inputmode="numeric"', hint: '0 to 4,000' })}${F({ name: 'lc_rank', label: 'Global contest ranking (optional)', value: d('lc_rank', l.globalRank), attrs: 'inputmode="numeric"' })}</div></form>`
      : html`<form id="mf" data-form="codeforces" data-draft="cf" novalidate>
      <div class="grid2">${F({ name: 'cf_handle', label: 'Handle', value: d('cf_handle', c.handle), req: true, attrs: 'autocomplete="off" autocapitalize="off"' })}${F({ name: 'cf_url', label: 'Profile link (optional)', type: 'url', value: d('cf_url', c.url), ph: 'https://codeforces.com/profile/…' })}
      ${F({ name: 'cf_rating', label: 'Current rating', value: d('cf_rating', c.rating), attrs: 'inputmode="numeric"', hint: '0 to 4,000' })}${F({ name: 'cf_max', label: 'Max rating', value: d('cf_max', c.maxRating), attrs: 'inputmode="numeric"' })}
      ${F({ name: 'cf_rank', label: 'Rank title', value: d('cf_rank', c.rank), opts: [['', 'Choose your rank']].concat(CF_RANKS.map(r => [r.title, r.title + ' (' + r.min + '+)'])) })}${F({ name: 'cf_solved', label: 'Problems solved', value: d('cf_solved', c.solved), attrs: 'inputmode="numeric"' })}</div></form>`;
    const has = tab === 'leetcode' ? u.leetcode : u.codeforces;
    return shell('Coding profiles', html`<div class="tabs" role="tablist">${[['leetcode', 'LeetCode', u.leetcode], ['codeforces', 'Codeforces', u.codeforces]].map(([k, lb, h]) => html`<button role="tab" ${raw(`aria-selected="${tab === k}"`)} data-act="coding-tab" data-v="${k}">${lb}${h ? ic('check') : ''}</button>`)}</div>
      <p class="small muted" style="margin-bottom:14px">Self-reported. Every edit is timestamped, and unusually big jumps go to a moderator for review.</p>${body}`,
      html`${has ? html`<button class="btn ghost" data-act="coding-remove" data-v="${tab}">Remove</button><span class="grow"></span>` : ''}${cancelBtn()}${submitBtn('Save ' + (tab === 'leetcode' ? 'LeetCode' : 'Codeforces') + ' stats')}`);
  },
  acad: () => {
    const u = me(), rows = ensureDraft('acad', { rows: (u.academics.semesters.length ? u.academics.semesters : [{ sem: 1, scale: '10', value: '' }]).map(s => ({ sem: String(s.sem), scale: s.scale, value: String(s.value) })) }).rows;
    return shell('Semester marks', html`<p class="small muted" style="margin-bottom:14px">Enter each semester on the scale your college uses. Alstr converts everything to a 10-point scale: 4-point marks × 2.5, percentages ÷ 10. Raw marks are private unless you choose to show them.</p>
    <form id="mf" data-form="academics" novalidate><div class="acad-rows"><div class="acad-row head" aria-hidden="true"><span>Semester</span><span>Scale</span><span>Grade</span><span></span></div>
    ${rows.map((r, i) => { const e = ui.errors['sem_' + i] || ui.errors['scale_' + i] || ui.errors['val_' + i]; return html`<div class="acad-row ${e ? 'has-err' : ''}"><select aria-label="Semester for row ${i + 1}" id="acs-${i}" data-acad="${i}" data-k="sem">${Array.from({ length: 10 }, (_, k) => html`<option value="${k + 1}" ${sel(String(k + 1) === String(r.sem))}>Semester ${k + 1}</option>`)}</select><select aria-label="Grading scale for row ${i + 1}" id="acc-${i}" data-acad="${i}" data-k="scale">${[['10', '10-point SGPA'], ['4', '4-point GPA'], ['pct', 'Percentage']].map(([v, lb]) => html`<option value="${v}" ${sel(r.scale === v)}>${lb}</option>`)}</select><input aria-label="Grade for row ${i + 1}" id="acv-${i}" value="${r.value}" inputmode="decimal" placeholder="${r.scale === 'pct' ? '78.5' : r.scale === '4' ? '3.6' : '8.4'}" data-acad="${i}" data-k="value"><button type="button" class="icon-btn sm" data-act="acad-del" data-i="${i}" aria-label="Remove row ${i + 1}">${ic('trash')}</button>${e ? html`<p class="err">${e}</p>` : ''}</div>`; })}</div>
    <div class="row" style="margin-top:12px"><button type="button" class="btn secondary sm" data-act="acad-add">${ic('plus')}Add semester</button><span class="grow"></span><span class="small">CGPA preview: <b id="cgpa-prev">${cgpaPreview()}</b> out of 10</span></div></form>`, html`${cancelBtn()}${submitBtn('Save marks')}`);
  },
  resume: m => {
    const u = me(), st = m.stage || 'upload';
    if (st === 'parsing') return shell('Reading your resume', html`<div class="parsing" role="status"><div class="sk" style="height:12px;width:70%"></div><div class="sk" style="height:12px;width:92%"></div><div class="sk" style="height:12px;width:58%"></div><p class="small muted" style="margin-top:10px">${m.msg || 'Extracting text…'}</p></div>`, html`<button class="btn ghost" data-act="resume-cancel">Cancel</button>`);
    if (st === 'review') return resumeReview(u);
    if (st === 'paste') return shell('Paste your resume text', html`<p class="small muted" style="margin-bottom:12px">Alstr couldn’t read text from that PDF${m.reason ? ' (' + m.reason + ')' : ''}. It may be a scanned image. Paste the text from your resume instead, or fill in the fields yourself.</p><form id="mf" data-form="resume-paste" data-draft="rpaste" novalidate>${F({ name: 'text', label: 'Resume text', type: 'textarea', rows: 10, value: dv('rpaste', 'text', '') })}</form>`, html`<button class="btn ghost" data-act="resume-manual">Fill in manually</button><span class="grow"></span>${submitBtn('Read this text')}`);
    return shell(u.resume ? 'Replace your resume' : 'Upload your resume', html`<label class="drop" for="resume-file">${ic('upload')}<b>Choose a PDF</b><span class="small muted">Up to 5 MB. Drop it here or click to browse.</span><input id="resume-file" type="file" accept="application/pdf,.pdf" data-change="resume-file" class="sr"></label>
    ${m.error ? html`<p class="err" role="alert" style="margin-top:10px">${m.error}</p>` : ''}
    <ul class="points small"><li>${ic('sparkle')}<span>${caps.sample ? 'Claude reads it and pulls out' : 'Alstr pulls out'} your skills, projects, internships, certifications and hackathon wins.</span></li><li>${ic('check')}<span>You review and correct everything before it counts toward your score.</span></li><li>${ic('lock')}<span>The PDF stays private. Only you, admins and people you share it with can open it.</span></li></ul>`, cancelBtn());
  },
  rview: m => {
    const o = U(m.userId), left = m.expiresAt - now();
    const body = left <= 0 ? html`<div class="empty"><h3>This link expired</h3><p>Links to resumes last 10 minutes.</p><button class="btn primary" data-act="resume-view" data-user="${o.id}">Get a new link</button></div>`
      : m.pdf === 'loading' ? html`<div class="pdfview"><p class="small muted">Loading the PDF…</p></div>`
      : m.pdf === 'ok' ? html`<div class="pdfview">${m.images.map((src, i) => html`<img src="${src}" alt="Page ${i + 1} of ${o.name}’s resume">`)}</div>` : resumeSheet(o, m.note);
    return shell(firstName(o) + '’s resume', html`<div class="sigbar">${ic('lock')}<span>Private link <code>${m.token.slice(0, 12)}…</code> ${left > 0 ? html`expires in <b data-cd="${m.expiresAt}">${fmtCountdown(left)}</b>` : html`<b class="err">expired</b>`}</span></div>${body}`, html`<button class="btn secondary" data-act="modal-close">Close</button>`, { wide: true });
  },
  share: () => {
    const u = me(), sw = new Set((u.resume && u.resume.sharedWith) || []);
    const mates = uniq(DB.teams.filter(t => isMember(t, u.id) && !t.disbanded).flatMap(t => t.members.map(x => x.userId))).filter(x => x !== u.id).map(U).filter(Boolean);
    const others = [...sw].map(U).filter(x => x && !mates.includes(x));
    const q = lc(ui.shareQ || '').trim(), found = q ? students().filter(s => s.id !== u.id && s.onboarded && s.status === 'active' && lc(s.name).includes(q) && !mates.includes(s) && !sw.has(s.id)).slice(0, 5) : [];
    const row = s => html`<li>${avatar(s, 32)}<span><b>${s.name}</b><span class="tiny muted">${uniFactor(s).name}</span></span><label class="check small"><input type="checkbox" data-change="share" data-user="${s.id}" ${raw(sw.has(s.id) ? 'checked' : '')}><span>Can view</span></label></li>`;
    return shell('Who can see your resume', html`<p class="small muted" style="margin-bottom:12px">Admins can always open it. Everyone else needs your permission, and each view uses a link that expires after 10 minutes.</p>
    ${mates.length ? html`<h3 class="h-sub" style="margin-top:0">Your teammates</h3><ul class="dev-list">${mates.map(row)}</ul>` : ''}${others.length ? html`<h3 class="h-sub">Others with access</h3><ul class="dev-list">${others.map(row)}</ul>` : ''}
    <h3 class="h-sub">Share with someone else</h3><label class="sr" for="share-q">Search students by name</label><input id="share-q" placeholder="Search students by name" value="${ui.shareQ || ''}" data-live="shareq" autocomplete="off">${found.length ? html`<ul class="dev-list" style="margin-top:8px">${found.map(row)}</ul>` : q ? html`<p class="small muted" style="margin-top:8px">No students match.</p>` : ''}`, html`<button class="btn primary" data-act="modal-close">Done</button>`);
  },
  profile: () => {
    const u = me();
    ensureDraft('prof', { name: u.name, college: u.profile.college, collegeName: u.profile.collegeName, branch: u.profile.branch, gradYear: u.profile.gradYear, semester: u.profile.semester, city: u.profile.city, timezone: u.profile.timezone, roles: u.profile.roles.slice(), skills: u.profile.skills.slice(), bio: u.profile.bio, availability: u.profile.availability });
    return shell('Edit profile', html`<form id="mf" data-form="profile" data-draft="prof" novalidate>${basicsFields('prof', u)}${rolesSkillsFields('prof', u)}</form>`, html`${cancelBtn()}${submitBtn('Save profile')}`, { wide: true });
  },
  post: m => {
    const u = me(), h = H(m.hackId), p = m.postId ? P(m.postId) : null, team = teamOf(u.id, h.id), type0 = p ? p.type : m.kind || (team ? 'team' : 'individual');
    const d = ensureDraft('post', p ? { type: p.type, description: p.description, roles: p.roles.slice(), skills: p.skills.slice(), targetSize: String(p.targetSize), idea: p.idea, mode: p.mode, location: p.location }
      : { type: type0, description: '', roles: type0 === 'team' ? (team ? team.neededRoles.slice() : []) : u.profile.roles.slice(), skills: type0 === 'team' ? [] : u.profile.skills.slice(0, 6), targetSize: String(Math.min(h.maxTeam, Math.max(h.minTeam, team ? team.members.length + 1 : 3))), idea: '', mode: 'any', location: u.profile.city, teamName: '', myRole: u.profile.roles[0] || '' });
    const isTeam = d.type === 'team';
    const sizes = Array.from({ length: h.maxTeam - h.minTeam + 1 }, (_, i) => h.minTeam + i).filter(n => !isTeam || n > (team ? team.members.length : 1));
    return shell(p ? 'Edit your post' : 'New post for ' + h.name, html`<form id="mf" data-form="post" data-draft="post" novalidate>
    ${p ? '' : html`<fieldset class="fld"><legend class="lbl">What are you posting?</legend><div class="seg">${[['individual', 'I’m looking for a team'], ['team', 'My team is looking for members']].map(([v, lb]) => html`<button type="button" class="chip-toggle" data-act="draft-set" data-dk="post" data-field="type" data-val="${v}" ${pressed(d.type === v)} ${raw(v === 'individual' && team ? 'disabled' : '')}>${lb}</button>`)}</div>${team ? html`<p class="hint">You’re in ${team.name} for this hackathon, so you post for your team.</p>` : ''}</fieldset>`}
    ${isTeam && !team && !p ? html`<div class="grid2">${F({ name: 'teamName', label: 'Team name', value: d.teamName, req: true, attrs: 'maxlength="40"' })}${F({ name: 'myRole', label: 'Your role in the team', value: d.myRole, opts: [['', 'Choose a role']].concat(ROLES.map(r => [r, r])) })}</div>` : ''}
    ${F({ name: 'description', label: isTeam ? 'What are you building, and who do you need?' : 'What can you bring, and what are you looking for?', type: 'textarea', rows: 4, value: d.description, attrs: 'maxlength="1000"', hint: '20 to 1,000 characters.' })}
    ${roleToggles('post', 'roles', d.roles, isTeam ? 'Roles your team needs' : 'Roles you can play')}
    ${tagInput({ id: 'post-skills', dk: 'post', field: 'skills', label: isTeam ? 'Skills you’re looking for' : 'Your key skills', sugg: SKILLS, max: 12 })}
    <div class="grid2">${F({ name: 'targetSize', label: isTeam ? 'Target team size' : 'Preferred team size', value: d.targetSize, opts: sizes.map(n => [String(n), n + ' people']), hint: isTeam && team ? `You have ${team.members.length} now.` : `This hackathon allows teams of ${teamRange(h)}.` })}
    ${F({ name: 'mode', label: 'Preferred mode', value: d.mode, opts: [['any', 'Any'], ['online', 'Online'], ['offline', 'Offline'], ['hybrid', 'Hybrid']] })}
    ${F({ name: 'idea', label: 'Idea (optional)', value: d.idea, attrs: 'maxlength="200"' })}${F({ name: 'location', label: 'Location (optional)', value: d.location, attrs: 'maxlength="60"' })}</div></form>
    <p class="tiny muted">One active post per hackathon. You can publish ${rateLeft(u, 'post')} more ${rateLeft(u, 'post') === 1 ? 'post' : 'posts'} today.</p>`, html`${cancelBtn()}${submitBtn(p ? 'Save changes' : 'Publish post')}`, { wide: true });
  },
  team: m => {
    const u = me(), h = H(m.hackId), d = ensureDraft('tc', { teamName: '', myRole: u.profile.roles[0] || '', neededRoles: ROLES.filter(r => !u.profile.roles.includes(r)).slice(0, 2) });
    return shell('Start a team for ' + h.name, html`<form id="mf" data-form="team-create" data-draft="tc" novalidate>${F({ name: 'teamName', label: 'Team name', value: d.teamName, req: true, attrs: 'maxlength="40"' })}${F({ name: 'myRole', label: 'Your role', value: d.myRole, opts: [['', 'Choose a role']].concat(ROLES.map(r => [r, r])) })}${roleToggles('tc', 'neededRoles', d.neededRoles, 'Roles you still need')}</form>
    <p class="small muted">You’ll lead the team. Teams for this hackathon have ${teamRange(h)} people.${activePostOf(u.id, h.id) ? ' Your “looking for a team” post will be closed.' : ''}</p>`, html`${cancelBtn()}${submitBtn('Create team')}`);
  },
  request: m => {
    const t = T(m.teamId), h = H(t.hackathonId), u = me();
    return shell('Ask to join ' + t.name, html`<p class="small muted" style="margin-bottom:12px">${U(t.leaderId).name} leads this team for ${h.name}. Requests expire after 7 days or when registration closes.</p><form id="mf" data-form="request" data-draft="req" novalidate>${F({ name: 'message', label: 'Message to the team', type: 'textarea', rows: 3, value: dv('req', 'message', ''), ph: 'What would you own on the team?', attrs: 'maxlength="300"', hint: '5 to 300 characters.' })}</form><p class="tiny muted">${rateLeft(u, 'request')} join requests left today.</p>`, html`${cancelBtn()}${submitBtn('Send request')}`);
  },
  invite: m => {
    const u = me(), target = U(m.userId);
    const lead = DB.teams.filter(t => !t.disbanded && t.leaderId === u.id && hackStatus(H(t.hackathonId)).key !== 'ended' && now() <= H(t.hackathonId).regDeadline && t.members.length < H(t.hackathonId).maxTeam && !teamOf(target.id, t.hackathonId) && (!m.hackId || t.hackathonId === m.hackId));
    if (!lead.length) {
      const h = m.hackId ? H(m.hackId) : null, mine = h ? teamOf(u.id, h.id) : null;
      const msg = h ? (mine ? (mine.leaderId !== u.id ? `Only ${U(mine.leaderId).name}, who leads ${mine.name}, can send invites.` : teamOf(target.id, h.id) ? `${firstName(target)} is already in a team for ${h.name}.` : `${mine.name} is full, or registration has closed.`) : `You need a team for ${h.name} before you can invite people.`) : 'You don’t lead a team with an open spot right now. Start a team from a hackathon page first.';
      return shell('Invite ' + target.name, html`<p>${msg}</p>`, html`${cancelBtn('Close')}${h && !mine && now() <= h.regDeadline ? html`<button class="btn primary" data-act="team-create" data-id="${h.id}" data-then="${target.id}">Start a team first</button>` : ''}`);
    }
    const d = ensureDraft('inv', { teamId: lead[0].id, message: '' });
    if (!lead.some(t => t.id === d.teamId)) d.teamId = lead[0].id;
    return shell('Invite ' + target.name, html`<form id="mf" data-form="invite" data-draft="inv" novalidate>${F({ name: 'teamId', label: 'Team', value: d.teamId, opts: lead.map(t => [t.id, t.name + ', ' + H(t.hackathonId).name]) })}${F({ name: 'message', label: 'Message', type: 'textarea', rows: 3, value: d.message, ph: 'Why would they be a great fit?', attrs: 'maxlength="300"', hint: '5 to 300 characters.' })}</form><p class="tiny muted">Invites expire after 7 days or when registration closes. ${rateLeft(u, 'invite')} invites left today.</p>`, html`${cancelBtn()}${submitBtn('Send invite')}`);
  },
  pick: m => {
    const u = me(), t = T(m.teamId), h = H(t.hackathonId), q = lc(ui.pickQ || '').trim();
    const found = q ? students().filter(s => s.onboarded && s.status === 'active' && s.id !== u.id && !isMember(t, s.id) && lc(s.name + ' ' + s.profile.skills.join(' ') + ' ' + uniFactor(s).name).includes(q)).slice(0, 8) : [];
    const row = s => { const busy = teamOf(s.id, h.id), pend = pendingBetween(t.id, s.id); return html`<li>${avatar(s, 34)}<span><b>${s.name}</b><span class="tiny muted">${s.profile.roles.join(', ')}, score ${scoreOf(s)}</span></span>${busy ? html`<span class="pill">In a team</span>` : pend ? html`<span class="pill brand">Pending</span>` : html`<button class="btn secondary sm" data-act="invite" data-user="${s.id}" data-hack="${h.id}">Invite</button>`}</li>`; };
    const sug = suggestTeammates(u, h.id, 6);
    return shell('Invite people to ' + t.name, html`<div class="search-in">${ic('search')}<label class="sr" for="pick-q">Search students</label><input id="pick-q" placeholder="Search by name, skill or college" value="${ui.pickQ || ''}" data-live="pickq" autocomplete="off"></div>
    ${q ? (found.length ? html`<ul class="dev-list" style="margin-top:12px">${found.map(row)}</ul>` : html`<p class="small muted" style="margin-top:12px">No students match “${ui.pickQ}”.</p>`) : html`<h3 class="h-sub">Suggested for ${t.name}</h3>${sug.length ? html`<ul class="dev-list">${sug.map(x => row(x.user))}</ul>` : html`<p class="small muted">No suggestions right now.</p>`}`}`, html`<button class="btn primary" data-act="modal-close">Done</button>`);
  },
  dm: m => {
    const o = U(m.userId), u = me(), pending = !hasInteracted(u.id, o.id);
    return shell('Message ' + o.name, html`${pending ? html`<p class="infobox">${ic('msg')}<span>You haven’t worked with ${firstName(o)} yet, so this goes to their message requests. You can send up to 3 messages until they accept.</span></p>` : ''}<form id="mf" data-form="dm" data-draft="dm" novalidate>${F({ name: 'text', label: 'Message', type: 'textarea', rows: 4, value: dv('dm', 'text', ''), attrs: 'maxlength="2000"' })}</form>`, html`${cancelBtn()}<button class="btn primary" type="submit" form="mf">${ic('send')}Send</button>`);
  },
  report: m => {
    const reasons = REPORT_REASONS.filter(r => r !== 'Inaccurate stats' || m.targetType === 'profile');
    return shell('Report this ' + m.targetType, html`<form id="mf" data-form="report" data-draft="rep" novalidate>${F({ name: 'reason', label: 'What’s wrong?', value: dv('rep', 'reason', ''), opts: [['', 'Choose a reason']].concat(reasons.map(r => [r, r])) })}${F({ name: 'details', label: 'Details (optional)', type: 'textarea', rows: 3, value: dv('rep', 'details', ''), attrs: 'maxlength="500"', hint: 'Moderators see this. The person you report won’t see who reported them.' })}</form>`, html`${cancelBtn()}${submitBtn('Send report', 'danger')}`);
  },
  confirm: m => shell(m.title, html`<p>${m.body}</p>`, html`${cancelBtn()}<button class="btn ${m.danger ? 'danger' : 'primary'}" data-act="confirm-yes">${m.yes}</button>`),
  calendar: m => {
    const h = H(m.hackId);
    return shell('Add ' + h.name + ' to your calendar', html`<div class="stack"><a class="btn secondary" href="${gcalUrl(h)}" target="_blank" rel="noopener noreferrer">${ic('cal')}Open in Google Calendar ${ic('ext')}</a>
    <p class="small muted">For Apple Calendar or Outlook, copy this text into a file named <code>${slug(h.name)}.ics</code> and open it. It adds the event plus a separate reminder for the registration deadline.</p>
    <label class="sr" for="ics-text">Calendar file text</label><textarea id="ics-text" rows="8" readonly class="mono-area">${buildICS(h)}</textarea><div class="row"><button class="btn secondary sm" data-act="copy" data-target="ics-text">Copy .ics text</button></div></div>`, html`<button class="btn primary" data-act="modal-close">Done</button>`);
  },
  hack: m => {
    const h = m.id ? H(m.id) : null;
    const loc = ts => { if (!ts) return ''; const x = new Date(ts - new Date(ts).getTimezoneOffset() * MIN); return x.toISOString().slice(0, 16); };
    const d = ensureDraft('hk', h ? { name: h.name, organizer: h.organizer, mode: h.mode, location: h.mode === 'online' ? '' : h.location, regOpensAt: loc(h.regOpensAt), regDeadline: loc(h.regDeadline), startAt: loc(h.startAt), endAt: loc(h.endAt), minTeam: String(h.minTeam), maxTeam: String(h.maxTeam), eligibility: h.eligibility, themes: h.themes.slice(), prizePool: String(h.prizePool || ''), prizes: h.prizes, regLink: h.regLink, description: h.description, color: h.color, banner: h.banner }
      : { name: '', organizer: '', mode: 'online', location: '', regOpensAt: loc(now()), regDeadline: loc(now() + 14 * DAY), startAt: loc(now() + 21 * DAY), endAt: loc(now() + 22 * DAY), minTeam: '2', maxTeam: '4', eligibility: '', themes: [], prizePool: '', prizes: '', regLink: 'https://', description: '', color: 'blue', banner: null });
    const sizes = Array.from({ length: 10 }, (_, i) => [String(i + 1), String(i + 1)]);
    return shell(h ? 'Edit ' + h.name : 'New hackathon', html`<form id="mf" data-form="hack" data-draft="hk" novalidate>
    <div class="grid2">${F({ name: 'name', label: 'Name', value: d.name })}${F({ name: 'organizer', label: 'Organizer', value: d.organizer })}
    ${F({ name: 'mode', label: 'Mode', value: d.mode, attrs: 'data-rerender', opts: [['online', 'Online'], ['offline', 'Offline'], ['hybrid', 'Hybrid']] })}${F({ name: 'location', label: d.mode === 'online' ? 'Location (optional)' : 'Location', value: d.location, ph: d.mode === 'online' ? 'Online' : 'City and venue' })}
    ${F({ name: 'regOpensAt', label: 'Registration opens (optional)', type: 'datetime-local', value: d.regOpensAt, hint: 'Before this, the status shows Upcoming.' })}${F({ name: 'regDeadline', label: 'Registration deadline', type: 'datetime-local', value: d.regDeadline })}
    ${F({ name: 'startAt', label: 'Starts', type: 'datetime-local', value: d.startAt })}${F({ name: 'endAt', label: 'Ends', type: 'datetime-local', value: d.endAt })}
    ${F({ name: 'minTeam', label: 'Minimum team size', value: d.minTeam, opts: sizes })}${F({ name: 'maxTeam', label: 'Maximum team size', value: d.maxTeam, opts: sizes })}</div>
    <fieldset class="fld"><legend class="lbl">Themes and tracks</legend><div class="row" style="gap:6px">${THEMES.map(t => html`<button type="button" class="chip-toggle" data-act="draft-toggle" data-dk="hk" data-field="themes" data-val="${t}" ${pressed(d.themes.includes(t))}>${t}</button>`)}</div>${ui.errors.themes ? html`<p class="err">${ui.errors.themes}</p>` : ''}</fieldset>
    ${F({ name: 'description', label: 'Description', type: 'textarea', rows: 4, value: d.description })}${F({ name: 'eligibility', label: 'Eligibility', value: d.eligibility, ph: 'Open to all college students' })}
    <div class="grid2">${F({ name: 'prizePool', label: 'Total prize pool in ₹ (optional)', value: d.prizePool, attrs: 'inputmode="numeric"' })}${F({ name: 'regLink', label: 'Official registration link', type: 'url', value: d.regLink })}</div>
    ${F({ name: 'prizes', label: 'Prize details (optional)', value: d.prizes })}
    <fieldset class="fld"><legend class="lbl">Banner</legend><div class="row" style="gap:6px">${HACK_COLORS.map(c => html`<button type="button" class="swatch c-${c}" data-act="draft-set" data-dk="hk" data-field="color" data-val="${c}" ${pressed(d.color === c)} aria-label="${c} banner"></button>`)}<label class="btn secondary sm" for="banner-file">${ic('upload')}Upload image</label><input id="banner-file" class="sr" type="file" accept="image/*" data-change="banner-file">${d.banner ? html`<button type="button" class="link small" data-act="draft-set" data-dk="hk" data-field="banner" data-val="">Remove image</button>` : ''}</div>
    <div class="banner preview c-${d.color}" style="margin-top:10px">${d.banner ? html`<img src="${d.banner}" alt="">` : ''}<div class="bn-date">${d.name || 'Banner preview'}</div></div></fieldset></form>`,
    html`${cancelBtn()}${submitBtn(h ? 'Save changes' : 'Create hackathon')}`, { wide: true });
  },
  demo: () => {
    const u = me(), code = totp(), secs = 30 - (Math.floor(Date.now() / 1000) % 30);
    return shell('Demo controls', html`<p class="small muted">This prototype runs in your browser with sample data. Other students are simulated: they answer invites, requests and messages after a few seconds.</p>
    <h3 class="h-sub">Signed in as</h3><p>${u ? html`<b>${u.name}</b>, ${u.role === 'admin' ? 'admin' : 'student'}` : 'Nobody (visitor)'}</p>
    <div class="row" style="margin-top:8px"><button class="btn secondary sm" data-act="demo-as" data-v="arjun">Arjun, existing student</button><button class="btn secondary sm" data-act="demo-as" data-v="riya">Riya, new student</button><button class="btn secondary sm" data-act="demo-as" data-v="admin">Admin</button><button class="btn secondary sm" data-act="demo-as" data-v="visitor">Visitor</button></div>
    <h3 class="h-sub">Admin authenticator</h3><p>Code <b class="code" id="totp">${code.slice(0, 3) + ' ' + code.slice(3)}</b> <span class="small muted">changes in <span id="totp-s">${secs}</span>s. Use it at the admin login.</span></p>
    <h3 class="h-sub">Clock</h3><p class="small">Demo time: <b>${fmtDateTime(now())}</b>${DB.clock ? html` <span class="muted">(${fmtDur(Math.abs(DB.clock))} ahead)</span>` : ''}</p>
    <div class="row" style="margin-top:8px"><button class="btn secondary sm" data-act="demo-time" data-v="${HOUR}">+1 hour</button><button class="btn secondary sm" data-act="demo-time" data-v="${DAY}">+1 day</button><button class="btn secondary sm" data-act="demo-time" data-v="${7 * DAY}">+7 days</button><button class="btn ghost sm" data-act="demo-time" data-v="0">Reset clock</button></div>
    <p class="tiny muted" style="margin-top:6px">Jump ahead to watch deadlines pass, invites expire and hackathons end.</p>
    <h3 class="h-sub">Simulate</h3><div class="row"><button class="btn secondary sm" data-act="demo-sim" data-v="dm">An incoming message</button><button class="btn secondary sm" data-act="demo-sim" data-v="request">An incoming request or invite</button><button class="chip-toggle" data-act="demo-fail" ${pressed(DB.demo.failNextSync)}>Make the next GitHub sync fail</button></div>
    <h3 class="h-sub">Data</h3><button class="btn danger sm" data-act="demo-reset">Reset all demo data</button>${storageOK ? '' : html`<p class="warnbox">${ic('alert')}<span>This browser blocked storage, so changes last until you reload.</span></p>`}`, html`<button class="btn primary" data-act="modal-close">Close</button>`);
  },
  search: () => {
    const u = me(), q = lc(ui.searchQ || '').trim();
    const hk = q ? DB.hackathons.filter(h => !h.archived && lc(h.name + ' ' + h.organizer + ' ' + h.themes.join(' ') + ' ' + h.location).includes(q)).slice(0, 6) : [];
    const st = q && u ? students().filter(s => s.onboarded && s.status === 'active' && lc(s.name + ' ' + uniFactor(s).name + ' ' + s.profile.skills.join(' ') + ' ' + s.profile.roles.join(' ')).includes(q)).slice(0, 8) : [];
    return html`<div class="scrim" data-act="modal-close"></div><div class="modal search-modal" role="dialog" aria-modal="true" aria-label="Search"><div class="m-body" style="padding-top:16px">
    <div class="search-in">${ic('search')}<label class="sr" for="gsearch">Search students and hackathons</label><input id="gsearch" type="search" placeholder="Search students by name, college or skill, and hackathons" value="${ui.searchQ || ''}" data-live="search" autocomplete="off"></div>
    ${!q ? html`<p class="small muted" style="margin-top:14px">Try “React”, “IIT”, “climate” or someone’s name. Press Escape to close.</p>` : html`<div class="results" aria-live="polite">
      ${hk.length ? html`<h3>Hackathons</h3>${hk.map(h => html`<a href="#h-${h.id}" data-act="modal-close"><span class="hdate xs c-${h.color}" aria-hidden="true"></span><span><b>${h.name}</b><span class="tiny muted" style="display:block">${h.organizer}, ${hackStatus(h).label}</span></span></a>`)}` : ''}
      ${u ? (st.length ? html`<h3>Students</h3>${st.map(s => html`<a href="#u-${s.id}" data-act="modal-close">${avatar(s, 32)}<span style="flex:1;min-width:0"><b>${s.name}</b><span class="tiny muted" style="display:block">${uniFactor(s).name}, ${s.profile.skills.slice(0, 4).join(', ')}</span></span><span class="score-pill">${scoreOf(s)}</span></a>`)}` : '') : html`<p class="small muted" style="margin-top:12px">Sign in to search students.</p>`}
      ${!hk.length && !st.length ? html`<p class="small muted" style="margin-top:12px">Nothing matches “${ui.searchQ}”.</p>` : ''}</div>`}</div></div>`;
  },
  export: m => shell('Your data', html`<p class="small muted" style="margin-bottom:10px">Saving files isn’t available in this view, so here’s your export as JSON. Copy it and save it as a .json file.</p><label class="sr" for="export-text">Exported data</label><textarea id="export-text" class="mono-area" rows="14" readonly>${m.json}</textarea>`, html`<button class="btn secondary" data-act="copy" data-target="export-text">Copy</button><button class="btn primary" data-act="modal-close">Done</button>`, { wide: true }),
  delete: () => shell('Delete your account', html`<p>This permanently removes your profile, stats, resume file, posts and replies, and takes you out of your teams. Messages you sent show as “Message deleted”. You can’t undo this.</p><form id="mf" data-form="delete" data-draft="del" novalidate style="margin-top:14px">${F({ name: 'confirm', label: 'Type DELETE to confirm', value: dv('del', 'confirm', ''), attrs: 'autocomplete="off" autocapitalize="characters"' })}</form>`, html`${cancelBtn()}${submitBtn('Delete my account', 'danger')}`),
  rate: m => {
    const t = T(m.teamId), p = U(m.userId), u = me(), ex = (t.ratings || []).find(r => r.from === u.id && r.to === p.id) || {};
    const d = ensureDraft('rate', { reliability: String(ex.reliability || ''), communication: String(ex.communication || ''), skill: String(ex.skill || '') });
    const scale = (k, label, hint) => html`<fieldset class="fld"><legend class="lbl">${label}</legend><p class="hint" style="margin-bottom:6px">${hint}</p><div class="row" style="gap:6px">${[1, 2, 3, 4, 5].map(v => html`<button type="button" class="chip-toggle rate-btn" data-act="draft-set" data-dk="rate" data-field="${k}" data-val="${v}" ${pressed(String(d[k]) === String(v))} aria-label="${label}: ${v} out of 5">${v}</button>`)}</div>${ui.errors[k] ? html`<p class="err">${ui.errors[k]}</p>` : ''}</fieldset>`;
    return shell('Rate ' + p.name, html`<p class="small muted" style="margin-bottom:14px">Only you and Alstr see individual ratings. ${firstName(p)} sees an average once 3 or more teammates have rated them.</p>${scale('reliability', 'Reliability', 'Did they show up and deliver what they said they would?')}${scale('communication', 'Communication', 'Were they easy to work with?')}${scale('skill', 'Skill', 'How strong was their work?')}`, html`${cancelBtn()}<button class="btn primary" data-act="rate-save">Save rating</button>`);
  },
  statlog: () => {
    const u = me(), L = u.statLog || [];
    const f = (s, o) => !o ? 'nothing' : s === 'leetcode' ? `${num(o.total)} solved (${o.easy}/${o.medium}/${o.hard}), rating ${o.contestRating == null ? 'none' : o.contestRating}` : `rating ${o.rating}, max ${o.maxRating}, ${o.rank}, ${num(o.solved)} solved`;
    return shell('Coding stats edit history', L.length ? html`<p class="small muted" style="margin-bottom:12px">Every change is timestamped. Moderators can see this history.</p><ul class="mini-hist">${L.map(e => html`<li style="display:grid;gap:2px"><span><b>${e.source === 'leetcode' ? 'LeetCode' : 'Codeforces'}</b> <span class="muted small">${fmtDateTime(e.at)}</span> ${e.flagged ? html`<span class="pill warn">${e.review === 'open' ? 'Under review' : cap(e.review)}</span>` : ''}</span><span class="small">${e.before ? 'From ' + f(e.source, e.before) + ' to ' : 'Added: '}${f(e.source, e.after)}</span>${e.reasons.length ? html`<span class="tiny muted">${e.reasons.join('; ')}</span>` : ''}</li>`)}</ul>` : html`<p class="muted">No edits yet.</p>`, html`<button class="btn primary" data-act="modal-close">Close</button>`);
  },
  needed: m => {
    const t = T(m.teamId), d = ensureDraft('need', { roles: t.neededRoles.slice() });
    return shell('Roles ' + t.name + ' needs', html`${roleToggles('need', 'roles', d.roles, 'Pick the roles you’re still looking for')}<p class="small muted">Used for “Missing” labels, open spots and teammate suggestions.</p>`, html`${cancelBtn()}<button class="btn primary" data-act="needed-save">Save</button>`);
  },
  reject: () => shell('Reject this result', html`<form id="mf" data-form="reject" data-draft="rej" novalidate>${F({ name: 'note', label: 'Reason shown to the team (optional)', type: 'textarea', rows: 3, value: dv('rej', 'note', ''), ph: 'The results page doesn’t list your team.' })}</form>`, html`${cancelBtn()}${submitBtn('Reject result', 'danger')}`)
};
function resumeReview(u) {
  const r = u.resume, d = ensureDraft('rrev', JSON.parse(JSON.stringify(r.parsed)));
  const group = (key, title, one, cols) => html`<div class="rgroup"><h3>${title} <span class="muted">${d[key].length}</span></h3>${d[key].map((x, i) => html`<div class="rrow" style="grid-template-columns:${cols.map(c => c[2] || '1fr').join(' ')} 32px">${cols.map(([k, lb]) => html`<input aria-label="${lb}, ${one} ${i + 1}" placeholder="${lb}" value="${x[k] || ''}" data-rr="${key}" data-i="${i}" data-k="${k}">`)}<button type="button" class="icon-btn sm" data-act="rr-del" data-k="${key}" data-i="${i}" aria-label="Remove ${one} ${i + 1}">${ic('x')}</button></div>`)}<button type="button" class="link small" data-act="rr-add" data-k="${key}">${ic('plus')}Add ${one}</button></div>`;
  const src = r.parser === 'claude' ? 'Claude read' : r.parser === 'heuristic' ? 'Alstr scanned' : 'You’re filling in the details for';
  return shell('Review your resume', html`<p class="small muted" style="margin-bottom:16px">${src} <b>${r.fileName}</b>. Fix anything that’s wrong. Nothing counts until you confirm.</p>
  ${tagInput({ id: 'rr-skills', dk: 'rrev', field: 'skills', label: 'Skills', sugg: SKILLS, max: 30, hint: 'New skills are added to your profile when you confirm.' })}
  ${group('internships', 'Internships', 'internship', [['title', 'Role'], ['org', 'Company'], ['duration', 'Dates', '0.8fr']])}
  ${group('projects', 'Projects', 'project', [['title', 'Project'], ['summary', 'One-line summary', '1.6fr']])}
  ${group('certifications', 'Certifications', 'certification', [['title', 'Certificate'], ['issuer', 'Issuer']])}
  ${group('hackathonWins', 'Hackathon wins', 'win', [['title', 'Hackathon'], ['result', 'Result', '0.7fr']])}
  <p class="small muted">Each hackathon win listed on a resume counts as 0.5. Results verified on Alstr count more.</p>`, html`${cancelBtn('Decide later')}<button class="btn primary" data-act="resume-confirm">Confirm and add to profile</button>`, { wide: true });
}
function resumeSheet(o, note) {
  const c = (o.resume && o.resume.confirmed) || {}, p = o.profile;
  const parts = [['Experience', (c.internships || []).map(x => x.title + (x.org ? ', ' + x.org : '') + (x.duration ? ' (' + x.duration + ')' : ''))], ['Projects', (c.projects || []).map(x => x.title + (x.summary ? ': ' + x.summary : ''))], ['Certifications', (c.certifications || []).map(x => x.title + (x.issuer ? ', ' + x.issuer : ''))], ['Achievements', (c.hackathonWins || []).map(x => x.title + (x.result ? ' (' + x.result + ')' : ''))], ['Skills', [uniq((c.skills || []).concat(p.skills)).join(', ')]]].filter(([, a]) => a.length && a[0]);
  return html`<div class="pdfview"><p class="tiny muted">${note || 'Sample profiles don’t include a real PDF, so this preview is built from ' + firstName(o) + '’s confirmed resume.'}</p><article class="sheet"><h3>${o.name}</h3><p>${uniFactor(o).name}, ${p.branch}, class of ${p.gradYear}. ${p.city}.</p>${parts.map(([t, a]) => html`<h4>${t}</h4><ul>${a.map(x => html`<li>${x}</li>`)}</ul>`)}</article></div>`;
}
function cgpaPreview() {
  const rows = (ui.drafts.acad && ui.drafts.acad.rows) || [];
  const vals = rows.filter(r => r.value !== '' && !isNaN(+r.value)).map(r => clamp(toTen(r.scale, r.value), 0, 10));
  return vals.length ? mean(vals).toFixed(2) : 'none yet';
}
const icsDate = ts => new Date(ts).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsEsc = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
function icsFold(line) { const out = []; let s = line; while (s.length > 74) { out.push(s.slice(0, 74)); s = ' ' + s.slice(74); } out.push(s); return out.join('\r\n'); }
function buildICS(h) {
  const ev = (id, a, b, sum2, desc) => ['BEGIN:VEVENT', 'UID:' + id + '@alstr.app', 'DTSTAMP:' + icsDate(now()), 'DTSTART:' + icsDate(a), 'DTEND:' + icsDate(b), 'SUMMARY:' + icsEsc(sum2), 'DESCRIPTION:' + icsEsc(desc), 'LOCATION:' + icsEsc(h.location), 'URL:' + h.regLink, 'END:VEVENT'];
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Alstr//Hackathons//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
    .concat(ev(h.id, h.startAt, h.endAt, h.name, h.organizer + '. ' + h.description + '\nRegister: ' + h.regLink), ev(h.id + '-deadline', h.regDeadline - 30 * MIN, h.regDeadline, 'Registration deadline: ' + h.name, 'Last chance to register: ' + h.regLink), ['END:VCALENDAR']).map(icsFold).join('\r\n');
}
const gcalUrl = h => 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(h.name) + '&dates=' + icsDate(h.startAt) + '/' + icsDate(h.endAt) + '&details=' + encodeURIComponent(h.organizer + '. Register: ' + h.regLink) + '&location=' + encodeURIComponent(h.location);
const slug = s => lc(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
