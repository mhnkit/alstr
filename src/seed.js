/* =====================================================================
   Demo seed. Every date is relative to the moment the demo is created,
   so statuses, countdowns and expiries are live.
   ===================================================================== */
function seed() {
  const t0 = Date.now(), d = n => t0 + n * DAY;
  const db = {
    v: SCHEMA, seededAt: t0, clock: 0, seq: 0,
    config: {
      weights: { academics: 20, dsa: 25, github: 30, resume: 25 },
      universities: [
        { id: 'iitb', name: 'IIT Bombay', factor: 1.0 }, { id: 'iitm', name: 'IIT Madras', factor: 1.0 }, { id: 'iisc', name: 'IISc Bengaluru', factor: 1.0 },
        { id: 'iiith', name: 'IIIT Hyderabad', factor: 0.99 }, { id: 'bits', name: 'BITS Pilani', factor: 0.98 }, { id: 'iiitb', name: 'IIIT Bangalore', factor: 0.97 },
        { id: 'nitk', name: 'NIT Surathkal', factor: 0.96 }, { id: 'nitt', name: 'NIT Tiruchirappalli', factor: 0.96 }, { id: 'rvce', name: 'RV College of Engineering', factor: 0.93 },
        { id: 'coep', name: 'COEP Technological University', factor: 0.92 }, { id: 'pes', name: 'PES University', factor: 0.92 }, { id: 'vit', name: 'VIT Vellore', factor: 0.92 },
        { id: 'bmsce', name: 'BMS College of Engineering', factor: 0.91 }, { id: 'mit', name: 'Manipal Institute of Technology', factor: 0.91 },
        { id: 'srm', name: 'SRM Institute of Science and Technology', factor: 0.89 }, { id: 'other', name: 'Other / not listed', factor: 0.88 }],
      rateLimits: { post: 5, reply: 30, invite: 15, request: 15, dm: 10, report: 10 },
      adminAllowList: ['admin@alstr.dev', 'ops@alstr.dev'],
      announcement: { enabled: true, text: 'Hack the Monsoon registrations close this week. Find your team before the deadline.', tone: 'info', updatedAt: t0 }
    },
    users: [], hackathons: [], posts: [], replies: [], teams: [], invites: [], convs: [], messages: [], reads: {},
    notifications: [], emails: [], reports: [], rate: {}, flags: { deadline: {} }, demo: { failNextSync: false }, botQueue: [], ghFixtures: {}
  };
  DB = db;

  /* ---------- GitHub fixture for the demo student ---------- */
  db.ghFixtures['arjun-menon'] = { commits12m: 412, repos: [
    { name: 'campuseats-api', language: 'Go', stars: 41, commits: 312, commits12m: 120, fork: false, hasReadme: true, description: 'Canteen ordering backend used by 2,000 students' },
    { name: 'monsoon-alert', language: 'TypeScript', stars: 6, commits: 48, commits12m: 48, fork: false, hasReadme: true, description: 'Flood alerts from rainfall data and community reports' },
    { name: 'leetcode-solutions', language: 'Go', stars: 9, commits: 420, commits12m: 160, fork: false, hasReadme: true, description: 'Solutions with notes on patterns' },
    { name: 'k8s-lab', language: 'Shell', stars: 12, commits: 76, commits12m: 30, fork: false, hasReadme: true, description: 'Helm charts and GitOps for student clusters' },
    { name: 'pg-backup-cron', language: 'Python', stars: 3, commits: 22, commits12m: 8, fork: false, hasReadme: true, description: 'Point-in-time Postgres backups to S3' },
    { name: 'dotfiles', language: 'Shell', stars: 2, commits: 90, commits12m: 15, fork: false, hasReadme: false, description: '' },
    { name: 'react-playground', language: 'JavaScript', stars: 0, commits: 3, commits12m: 0, fork: false, hasReadme: false, description: '' },
    { name: 'hello-world', language: 'Python', stars: 0, commits: 1, commits12m: 0, fork: false, hasReadme: false, description: '' },
    { name: 'awesome-go', language: 'Go', stars: 0, commits: 0, commits12m: 0, fork: true, hasReadme: true, description: 'Fork of a curated list' }] };

  /* ---------- students ---------- */
  const S = [
    { id: 'u1', bot: false, name: 'Arjun Menon', email: 'arjun.menon@gmail.com', uni: 'rvce', branch: 'Computer Science', grad: 2027, sem: 6, city: 'Bengaluru', roles: ['Backend', 'DevOps'], skills: ['Go', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis', 'React'], avail: 'looking', created: 70,
      bio: 'Backend dev who likes boring, reliable systems. Built a canteen ordering API that 2,000 students use every day. Looking for an ML person and a mobile dev for Hack the Monsoon.',
      gh: 'arjun-menon', lc: [140, 232, 48, 1842, 48210], lcUser: 'arjun-menon', cf: ['arjun_m', 1523, 1611, 'Specialist', 186], sems: ['10', [8.4, 8.7, 8.6, 9.0, 8.9]],
      resume: { skills: ['Go', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis', 'gRPC'], internships: [{ title: 'Backend Engineering Intern', org: 'Kite Labs', duration: 'May–Jul 2025' }],
        projects: [{ title: 'CampusEats API', summary: 'Canteen ordering backend in Go and Postgres with 2,000 daily users' }, { title: 'k8s-lab', summary: 'Helm charts and GitOps setup for student clusters' }, { title: 'pg-backup-cron', summary: 'Point-in-time Postgres backups to S3' }],
        certifications: [{ title: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services' }, { title: 'Introduction to Kubernetes (LFS158)', issuer: 'Linux Foundation' }], hackathonWins: [{ title: 'Namma Hacks 2025', result: 'Winner' }] } },
    { id: 'u2', name: 'Sneha Rao', email: 'sneha.rao@gmail.com', uni: 'pes', branch: 'Information Science', grad: 2027, sem: 6, city: 'Bengaluru', roles: ['UI/UX Design', 'Frontend'], skills: ['Figma', 'Prototyping', 'User research', 'React', 'TypeScript', 'Tailwind CSS'], avail: 'inteam', created: 60,
      bio: 'Designer who codes. I care about calm, accessible interfaces, and I ship both the Figma file and the React components.', gh: 'sneha-designs', lc: [80, 42, 3], sems: ['pct', [82, 85.5, 84, 88, 87]],
      resume: { skills: ['Figma', 'React', 'User research'], internships: [{ title: 'UX Design Intern', org: 'Lumen Studio', duration: 'Jun–Aug 2025' }], projects: [{ title: 'Accessible campus map', summary: 'Wayfinding app designed screen-reader first' }, { title: 'Hostel complaint portal', summary: 'React and Firebase portal used by three hostels' }, { title: 'Design tokens kit', summary: 'Figma-to-Tailwind token pipeline' }], certifications: [{ title: 'Google UX Design Certificate', issuer: 'Google' }], hackathonWins: [] } },
    { id: 'u3', name: 'Kabir Shah', email: 'kabir.shah@gmail.com', uni: 'iitb', branch: 'Computer Science', grad: 2026, sem: 8, city: 'Mumbai', roles: ['ML/AI', 'Backend'], skills: ['Python', 'PyTorch', 'LLMs', 'FastAPI', 'Time series', 'Docker'], avail: 'looking', created: 65,
      bio: 'ML engineer. I fine-tune models, write the eval harness, and still have time for a FastAPI backend. Most interested in climate and health problems.', gh: 'kabirshah-ml', lc: [120, 260, 70, 1965, 21004], cf: ['kabir.s', 1688, 1743, 'Expert', 240], sems: ['10', [8.9, 9.1, 9.2, 9.0, 9.3, 9.4, 9.2]],
      resume: { skills: ['PyTorch', 'LLMs', 'FastAPI', 'Time series'], internships: [{ title: 'ML Intern', org: 'Monsoon Analytics', duration: 'May–Jul 2025' }, { title: 'Research Intern', org: 'IIT Bombay data science lab', duration: 'Dec 2024–Feb 2025' }], projects: [{ title: 'Rainfall nowcasting', summary: 'LSTM nowcasts from radar data' }, { title: 'LLM eval harness', summary: 'Benchmarks for Indic-language QA models' }, { title: 'Crop price predictor', summary: 'Gradient-boosted mandi price forecasts' }, { title: 'FastAPI model server', summary: 'Batching inference server for PyTorch models' }], certifications: [{ title: 'TensorFlow Developer Certificate', issuer: 'Google' }, { title: 'Machine Learning Specialization', issuer: 'Coursera' }], hackathonWins: [{ title: 'Code Rush 24h', result: 'Winner' }] } },
    { id: 'u4', name: 'Ishita Verma', email: 'ishita.verma@gmail.com', uni: 'bits', branch: 'Electronics and Communication', grad: 2027, sem: 6, city: 'Pilani', roles: ['Pitch/PM', 'Frontend'], skills: ['Product strategy', 'Public speaking', 'Figma', 'Next.js', 'Excel'], avail: 'looking', created: 55,
      bio: 'I turn a messy idea into a three-minute pitch judges remember. Comfortable building the landing page too.', gh: 'ishita-v', lc: [60, 20, 2], sems: ['10', [7.8, 8.1, 8.4, 8.6, 8.8]],
      resume: { skills: ['Product strategy', 'Next.js'], internships: [{ title: 'Product Intern', org: 'Swiftcart', duration: 'May–Jul 2025' }], projects: [{ title: 'Shuttle ETA', summary: 'Next.js tracker with live ETAs for campus buses' }, { title: 'Pitch deck library', summary: 'Templates used by 40+ student teams' }], certifications: [{ title: 'Product Management Fundamentals', issuer: 'Coursera' }], hackathonWins: [{ title: 'Smart Campus Challenge', result: 'Finalist' }] } },
    { id: 'u5', name: 'Rohan Iyer', email: 'rohan.iyer@gmail.com', uni: 'nitk', branch: 'Computer Science', grad: 2028, sem: 4, city: 'Mangaluru', roles: ['Mobile', 'Frontend'], skills: ['Flutter', 'Dart', 'Kotlin', 'Firebase', 'React Native'], avail: 'looking', created: 40,
      bio: 'Flutter dev with two apps on the Play Store (5,000+ installs combined). I like shipping fast and polishing later.', gh: 'rohan-iyer', lc: [90, 70, 5, 1580, 160220], cf: ['rohan_iyer', 1310, 1356, 'Pupil', 95], sems: ['10', [8.2, 8.0, 8.5]],
      resume: { skills: ['Flutter', 'Kotlin', 'Firebase'], internships: [], projects: [{ title: 'Tiffin Box', summary: 'Flutter app for home-cooked meal subscriptions, 3,000 installs' }, { title: 'Attendance tracker', summary: 'Kotlin app with offline sync' }, { title: 'Quiz battle', summary: 'Realtime Firebase quiz game, 2,000 installs' }], certifications: [{ title: 'Associate Android Developer', issuer: 'Google' }], hackathonWins: [] } },
    { id: 'u6', name: 'Ananya Krishnan', email: 'ananya.k@gmail.com', uni: 'iiith', branch: 'Computer Science', grad: 2026, sem: 8, city: 'Hyderabad', roles: ['ML/AI', 'Backend'], skills: ['Python', 'scikit-learn', 'NLP', 'Django', 'SQL', 'PostgreSQL'], avail: 'looking', created: 50,
      bio: 'NLP and competitive programming. Expert on Codeforces and a former research intern. Building LedgerLoop for DevSprint.', gh: 'ananya-krish', lc: [150, 300, 95, 2050, 9120], cf: ['ananya_k', 1712, 1790, 'Expert', 410], sems: ['10', [9.0, 9.2, 8.9, 9.4, 9.5, 9.3, 9.6]],
      resume: { skills: ['NLP', 'Python', 'Django'], internships: [{ title: 'Research Intern', org: 'IIIT Hyderabad language lab', duration: 'May–Jul 2024' }, { title: 'Data Science Intern', org: 'Civic Data Lab', duration: 'May–Jul 2025' }], projects: [{ title: 'Hinglish sentiment model', summary: 'Fine-tuned transformer on code-mixed text' }, { title: 'UPI SMS parser', summary: 'Extracts transactions from bank SMS' }, { title: 'Court order search', summary: 'Semantic search over district court orders' }, { title: 'CP practice planner', summary: 'Codeforces training tracker' }], certifications: [{ title: 'Deep Learning Specialization', issuer: 'Coursera' }, { title: 'NPTEL Data Structures (Elite)', issuer: 'NPTEL' }], hackathonWins: [{ title: 'HackOverflow 2025', result: 'Runner-up' }, { title: 'DevJam Hyderabad', result: 'Winner' }] } },
    { id: 'u7', name: 'Vikram Joshi', email: 'vikram.joshi@gmail.com', uni: 'coep', branch: 'Information Technology', grad: 2027, sem: 6, city: 'Pune', roles: ['DevOps', 'Backend'], skills: ['AWS', 'Terraform', 'Docker', 'Go', 'Linux', 'CI/CD'], avail: 'looking', created: 35,
      bio: 'DevOps and backend. I set up CI, infra and a clean deploy so your demo doesn’t fall over on stage.', gh: 'vikram-ops', lc: [70, 90, 10], sems: ['4', [3.4, 3.5, 3.6, 3.5, 3.7]],
      resume: { skills: ['AWS', 'Terraform', 'Go'], internships: [{ title: 'Cloud Intern', org: 'Nimbus Systems', duration: 'Jun–Aug 2025' }], projects: [{ title: 'One-click demo deploys', summary: 'Terraform modules for hackathon stacks' }, { title: 'Log shipper', summary: 'Go agent that ships logs to Loki' }], certifications: [{ title: 'AWS Solutions Architect Associate', issuer: 'Amazon Web Services' }, { title: 'Terraform Associate', issuer: 'HashiCorp' }, { title: 'Certified Kubernetes Administrator', issuer: 'CNCF' }], hackathonWins: [] } },
    { id: 'u8', name: 'Meera Pillai', email: 'meera.pillai@gmail.com', uni: 'vit', branch: 'Computer Science', grad: 2028, sem: 4, city: 'Vellore', roles: ['UI/UX Design'], skills: ['Figma', 'Framer', 'Prototyping', 'Illustration', 'User research'], avail: 'looking', created: 30,
      bio: 'Product designer, three hackathons in. Research, flows and a polished prototype by demo time. I prefer climate and social-good ideas.', sems: ['pct', [88, 90, 86]],
      resume: { skills: ['Figma', 'Framer'], internships: [{ title: 'Design Intern', org: 'Kalam Studio', duration: 'May–Jun 2025' }], projects: [{ title: 'Air quality dashboard', summary: 'Citizen-facing AQI dashboard' }, { title: 'Farmer advisory app', summary: 'Voice-first flows for low-literacy users' }, { title: 'Game jam UI kit', summary: 'Design system for Pixel Pushers' }], certifications: [{ title: 'UX Research Fundamentals', issuer: 'Interaction Design Foundation' }], hackathonWins: [{ title: 'GameJam Mumbai', result: 'Winner' }] } },
    { id: 'u9', name: 'Aditya Kulkarni', email: 'aditya.k@gmail.com', uni: 'iitm', branch: 'Mechanical', grad: 2027, sem: 6, city: 'Chennai', roles: ['Pitch/PM', 'ML/AI'], skills: ['Python', 'Data analysis', 'Pitching', 'Excel', 'Product strategy'], avail: 'unavailable', created: 45,
      bio: 'Mechanical engineer with a soft spot for data. Busy with exams until next month.', gh: 'adityak', lc: [40, 10, 0], sems: ['10', [7.9, 8.2, 8.0, 8.3, 8.1]] },
    { id: 'u10', name: 'Fatima Sheikh', email: 'fatima.sheikh@gmail.com', uni: 'bmsce', branch: 'Computer Science', grad: 2027, sem: 6, city: 'Bengaluru', roles: ['Frontend', 'Mobile'], skills: ['React', 'TypeScript', 'React Native', 'GraphQL', 'Next.js'], avail: 'inteam', created: 28,
      bio: 'Frontend dev who loves fast, accessible UIs. With DataDhara for Hack the Monsoon.', gh: 'fatima-codes', lc: [110, 120, 15, 1650, 98010], sems: ['10', [8.6, 8.4, 8.9, 8.7, 9.0]],
      resume: { skills: ['React', 'GraphQL'], internships: [{ title: 'Frontend Intern', org: 'Paybridge', duration: 'May–Jul 2025' }], projects: [{ title: 'Fest check-in', summary: 'React Native QR check-in used at the college fest' }, { title: 'Portfolio generator', summary: 'Next.js starter used by 200+ students' }, { title: 'GraphQL playground', summary: 'Schema explorer with live docs' }], certifications: [{ title: 'Meta Front-End Developer', issuer: 'Meta' }], hackathonWins: [] } },
    { id: 'u11', name: 'Karthik Reddy', email: 'karthik.reddy@gmail.com', uni: 'srm', branch: 'Computer Science', grad: 2028, sem: 4, city: 'Chennai', roles: ['Backend'], skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Go'], avail: 'looking', created: 12,
      bio: 'Backend learner: Spring Boot now, Go next. I write tests and I show up on time.', gh: 'karthik-r', lc: [95, 60, 4, 1490, 210400], sems: ['10', [7.6, 7.9, 8.1]] },
    { id: 'u12', name: 'Nikhil Bansal', email: 'nikhil.bansal@gmail.com', uni: 'mit', branch: 'Computer Science', grad: 2026, sem: 8, city: 'Manipal', roles: ['Backend', 'ML/AI'], skills: ['Rust', 'Python', 'Solidity', 'Web3'], avail: 'looking', created: 20,
      bio: 'Rust and Web3. Shipping on-chain things since 2024.', gh: 'nikhil-rs', lc: [300, 480, 125, 2210, 2300], lcAge: 2, sems: ['10', [7.1, 7.4, 7.0, 7.6, 7.2, 7.5, 7.3]],
      resume: { skills: ['Rust', 'Solidity'], internships: [], projects: [{ title: 'On-chain scholarship fund', summary: 'Solidity contracts with milestone payouts' }, { title: 'git-stats CLI', summary: 'Rust CLI for repository stats, 30 stars' }], certifications: [], hackathonWins: [{ title: 'ChainCraft Mini Jam', result: 'Winner' }] } },
    { id: 'u13', name: 'Diya Mukherjee', email: 'diya.m@gmail.com', uni: 'iiitb', branch: 'Data Science', grad: 2027, sem: 6, city: 'Bengaluru', roles: ['ML/AI', 'Pitch/PM'], skills: ['Python', 'Pandas', 'Statistics', 'Tableau', 'R'], avail: 'inteam', created: 25,
      bio: 'Data scientist who likes open government data. Leading DataDhara at Hack the Monsoon.', gh: 'diya-data', lc: [50, 30, 2], sems: ['10', [8.8, 8.7, 9.1, 8.9, 9.2]],
      resume: { skills: ['Pandas', 'Tableau', 'R'], internships: [{ title: 'Data Science Intern', org: 'Civic Data Lab', duration: 'Jun–Aug 2025' }], projects: [{ title: 'Groundwater explorer', summary: 'District-level well data visualised' }, { title: 'Turnout analysis', summary: 'R notebooks on election turnout trends' }, { title: 'Tableau portfolio', summary: '12 published dashboards' }], certifications: [{ title: 'Tableau Desktop Specialist', issuer: 'Tableau' }, { title: 'Statistics with R', issuer: 'Coursera' }], hackathonWins: [] } },
    { id: 'u14', name: 'Harsh Patel', email: 'harsh.patel@gmail.com', uni: 'nitt', branch: 'Electrical and Electronics', grad: 2027, sem: 6, city: 'Tiruchirappalli', roles: ['Mobile'], skills: ['Arduino', 'ESP32', 'C++', 'Embedded C', 'Flutter'], avail: 'looking', created: 18,
      bio: 'Hardware and IoT. I can bring ESP32 rain gauges for a live demo. Looking for a climate or disaster-response team.', gh: 'harsh-iot', lc: [30, 12, 0], sems: ['10', [8.0, 8.3, 8.1, 8.4, 8.6]],
      resume: { skills: ['ESP32', 'Arduino', 'Flutter'], internships: [], projects: [{ title: 'ESP32 rain gauge', summary: 'Low-cost tipping-bucket gauge with LoRa' }, { title: 'Smart irrigation', summary: 'Soil moisture sensors driving pumps' }, { title: 'Home energy monitor', summary: 'Flutter app with an Arduino current sensor' }], certifications: [{ title: 'Embedded Systems Essentials', issuer: 'NPTEL' }], hackathonWins: [{ title: 'GameJam Mumbai', result: 'Winner' }] } },
    { id: 'u15', name: 'Zoya Khan', email: 'zoya.khan@gmail.com', uni: 'pes', branch: 'Computer Science', grad: 2028, sem: 4, city: 'Bengaluru', roles: ['Frontend', 'UI/UX Design'], skills: ['React', 'Svelte', 'HTML/CSS', 'Figma', 'Three.js'], avail: 'looking', created: 15,
      bio: 'Frontend dev obsessed with accessibility and motion. I’ll make your demo feel finished.', gh: 'zoya-k', lc: [70, 40, 2], sems: ['pct', [91, 89, 92]],
      resume: { skills: ['Svelte', 'Three.js'], internships: [], projects: [{ title: 'Motion UI kit', summary: 'Svelte components that respect reduced motion' }, { title: '3D campus tour', summary: 'Three.js walkthrough of the campus' }, { title: 'ARIA audit extension', summary: 'Flags common accessibility issues' }, { title: 'Pixel Pushers front end', summary: 'UI for the GameJam Mumbai winner' }], certifications: [], hackathonWins: [{ title: 'GameJam Mumbai', result: 'Winner' }] } },
    { id: 'u16', name: 'Siddharth Nair', email: 'siddharth.nair@gmail.com', uni: 'rvce', branch: 'Electronics and Communication', grad: 2027, sem: 6, city: 'Bengaluru', roles: ['Pitch/PM'], skills: ['Public speaking', 'Pitching', 'Product strategy', 'Figma'], avail: 'inteam', created: 22,
      bio: 'I keep teams on schedule and make sure the pitch lands. Former debate captain.', sems: ['10', [8.0, 8.2, 7.9, 8.4, 8.3]],
      resume: { skills: ['Pitching'], internships: [{ title: 'Product Intern', org: 'Tiffin Box', duration: 'May–Jul 2025' }], projects: [{ title: 'Club scheduler', summary: 'No-code tool used by five clubs' }], certifications: [{ title: 'Agile Foundations', issuer: 'LinkedIn Learning' }], hackathonWins: [{ title: 'GameJam Mumbai', result: 'Winner' }] } },
    { id: 'u17', name: 'Rahul Gupta', email: 'rahul.projects@gmail.com', uni: 'other', collegeName: 'Not specified', branch: 'Other', grad: 2026, sem: 8, city: 'Delhi', roles: ['Pitch/PM'], skills: ['Excel', 'Pitching', 'Public speaking'], avail: 'looking', created: 3, bio: 'Project help available for any hackathon.' }
  ];
  for (const o of S) {
    const u = newStudent(o.email, o.name);
    Object.assign(u, { id: o.id, bot: o.bot !== false, onboarded: true, createdAt: d(-o.created), lastActiveAt: d(-(o.created % 9) / 3 - 0.1) });
    Object.assign(u.profile, { college: o.uni, collegeName: o.collegeName || '', branch: o.branch, gradYear: String(o.grad), semester: String(o.sem), city: o.city, timezone: 'Asia/Kolkata', roles: o.roles, skills: o.skills, bio: o.bio, availability: o.avail });
    if (o.gh) {
      const data = db.ghFixtures[o.gh] ? JSON.parse(JSON.stringify(db.ghFixtures[o.gh])) : genGitHub(o.gh, o.skills);
      u.github = Object.assign({ username: o.gh, connectedAt: d(-o.created + 1), lastSyncedAt: d(-0.35), lastAttemptAt: d(-0.35), lastManualRefreshAt: 0, status: 'ok', error: '' }, data);
    }
    if (o.lc) {
      const [e, m, h, rating, rank] = o.lc, handle = o.lcUser || (o.gh || o.name.split(' ')[0].toLowerCase());
      u.leetcode = { username: handle, url: o.id === 'u1' || o.id === 'u3' || o.id === 'u6' ? 'https://leetcode.com/u/' + handle : '', easy: e, medium: m, hard: h, total: e + m + h, contestRating: rating == null ? null : rating, globalRank: rank == null ? null : rank, updatedAt: d(-(o.lcAge || 12)) };
      u.statLog.push({ id: 'l' + o.id + 'lc', at: d(-(o.lcAge || 12)), source: 'leetcode', before: null, after: Object.assign({}, u.leetcode), flagged: false, reasons: [], review: null });
    }
    if (o.cf) {
      const [handle, rating, max, rank, solved] = o.cf;
      u.codeforces = { handle, url: 'https://codeforces.com/profile/' + handle, rating, maxRating: max, rank, solved, updatedAt: d(-15) };
      u.statLog.push({ id: 'l' + o.id + 'cf', at: d(-15), source: 'codeforces', before: null, after: Object.assign({}, u.codeforces), flagged: false, reasons: [], review: null });
    }
    if (o.sems) u.academics = { semesters: o.sems[1].map((v, i) => ({ sem: i + 1, scale: o.sems[0], value: v })), updatedAt: d(-20) };
    if (o.resume) {
      const r = Object.assign({ skills: [], internships: [], projects: [], certifications: [], hackathonWins: [] }, o.resume);
      u.resume = { fileName: o.name.split(' ')[0].toLowerCase() + '-resume.pdf', size: 160000 + Math.floor(rng(o.id)() * 220000), fileKey: null, uploadedAt: d(-o.created + 2), parser: 'claude', parsed: r, status: 'confirmed', confirmed: r, confirmedAt: d(-o.created + 2), sharedWith: [] };
    }
    db.users.push(u);
  }
  const u1 = U('u1');
  u1.statLog = [
    { id: 'lu1a', at: d(-12), source: 'leetcode', before: { username: 'arjun-menon', url: 'https://leetcode.com/u/arjun-menon', easy: 131, medium: 210, hard: 39, total: 380, contestRating: 1801, globalRank: 56330 }, after: Object.assign({}, u1.leetcode), flagged: false, reasons: [], review: null },
    { id: 'lu1b', at: d(-15), source: 'codeforces', before: null, after: Object.assign({}, u1.codeforces), flagged: false, reasons: [], review: null },
    { id: 'lu1c', at: d(-41), source: 'leetcode', before: null, after: { username: 'arjun-menon', url: 'https://leetcode.com/u/arjun-menon', easy: 131, medium: 210, hard: 39, total: 380, contestRating: 1801, globalRank: 56330 }, flagged: false, reasons: [], review: null }];
  u1.resume.sharedWith = ['u2'];
  u1.bookmarks = ['h1', 'h2', 'h9'];
  u1.sessions = [{ id: 'sx1', device: 'Chrome on Android', createdAt: d(-9), lastSeen: d(-1) }, { id: 'sx2', device: 'Safari on iOS', createdAt: d(-30), lastSeen: d(-6) }];
  const u12 = U('u12');
  u12.statLog = [
    { id: 'lnik2', at: d(-2), source: 'leetcode', before: { username: 'nikhil-rs', url: '', easy: 60, medium: 52, hard: 8, total: 120, contestRating: 1600, globalRank: 301200 }, after: Object.assign({}, u12.leetcode), flagged: true, reasons: ['Solved count jumped by 785 in 4 days', 'Rating jumped by 610 in 4 days'], review: 'open' },
    { id: 'lnik1', at: d(-6), source: 'leetcode', before: null, after: { username: 'nikhil-rs', url: '', easy: 60, medium: 52, hard: 8, total: 120, contestRating: 1600, globalRank: 301200 }, flagged: false, reasons: [], review: null }];
  U('u2').bookmarks = ['h1'];
  U('u3').bookmarks = ['h1', 'h9'];

  db.users.push({ id: 'a1', role: 'admin', email: 'admin@alstr.dev', name: 'Alstr Ops', hue: 230, createdAt: d(-120), status: 'active', sessions: [], blocked: [], notifPrefs: defaultPrefs() });

  /* ---------- hackathons ---------- */
  const HK = [
    { id: 'h1', name: 'Hack the Monsoon 2026', organizer: 'Namma Tech Collective', mode: 'hybrid', location: 'Bengaluru (Koramangala) and online', regOpensAt: d(-20), regDeadline: d(1.6), startAt: d(5), endAt: d(6.5), minTeam: 2, maxTeam: 4, eligibility: 'Undergraduate and postgraduate students in India', themes: ['Climate', 'AI/ML', 'Social Good'], prizePool: 300000, prizes: 'First ₹1,50,000, second ₹1,00,000, third ₹50,000, plus cloud credits for the top 10 teams', regLink: 'https://namma-tech.example/hack-the-monsoon', color: 'blue', pinned: true,
      description: 'A 36-hour build sprint on flooding, heat and water in Indian cities. Bring a problem you’ve seen on your own street and ship something a ward office or resident group could use on Monday. Mentors from city agencies and climate startups will be on site in Koramangala; remote teams get the same mentor hours over video.' },
    { id: 'h2', name: 'DevSprint: FinTech Edition', organizer: 'FinLabs India', mode: 'online', location: 'Online', regOpensAt: d(-10), regDeadline: d(9), startAt: d(14), endAt: d(16), minTeam: 1, maxTeam: 3, eligibility: 'Students graduating between 2026 and 2029', themes: ['FinTech', 'AI/ML', 'Developer Tools'], prizePool: 200000, prizes: 'The top three teams split ₹2,00,000 and get interview fast-tracks', regLink: 'https://finlabs.example/devsprint', color: 'teal',
      description: 'Build tools that make money simpler for students and small businesses: UPI insights, credit for thin-file borrowers, or smarter expense splitting. Sandbox APIs for payments and account aggregation are shared after registration.' },
    { id: 'h3', name: 'HealthHack Pune', organizer: 'Pune MedTech Forum', mode: 'offline', location: 'Pune (Shivajinagar)', regOpensAt: d(-5), regDeadline: d(15), startAt: d(22), endAt: d(23), minTeam: 3, maxTeam: 5, eligibility: 'Engineering, medical and design students', themes: ['HealthTech', 'AI/ML', 'IoT'], prizePool: 150000, prizes: '₹1,00,000 grand prize and ₹50,000 for the best hardware build', regLink: 'https://punemedtech.example/healthhack', color: 'pink',
      description: 'Two days with doctors and public-health researchers. Tracks cover triage for primary health centres, medicine adherence, and low-cost diagnostics. Hardware teams get a sensor lab and a soldering station.' },
    { id: 'h4', name: 'Code for Campus 24h', organizer: 'Campus Builders Guild', mode: 'offline', location: 'Chennai (Guindy)', regOpensAt: d(-30), regDeadline: d(-8), startAt: d(-0.5), endAt: d(0.5), minTeam: 2, maxTeam: 4, eligibility: 'Students from colleges in Tamil Nadu', themes: ['EdTech', 'Open Innovation'], prizePool: 75000, prizes: '₹50,000 first, ₹25,000 second', regLink: 'https://campusbuilders.example/c4c', color: 'orange',
      description: 'Twenty-four hours to fix something annoying about college life, from timetables to hostel admin. Judging is on working demos, not slides.' },
    { id: 'h5', name: 'OpenSource Odyssey', organizer: 'Open Source Collective India', mode: 'online', location: 'Online', regOpensAt: d(-2), regDeadline: d(25), startAt: d(30), endAt: d(37), minTeam: 1, maxTeam: 4, eligibility: 'Anyone enrolled in a college or university', themes: ['Open Source', 'Developer Tools'], prizePool: 100000, prizes: 'Cash prizes and maintainer mentorship for the top five projects', regLink: 'https://oscindia.example/odyssey', color: 'gold',
      description: 'A week-long sprint contributing to Indian open-source projects. Teams pick from issue lists prepared by partner maintainers and are judged on merged pull requests and code quality.' },
    { id: 'h6', name: 'Web3 Builders Weekend', organizer: 'ChainCraft Labs', mode: 'hybrid', location: 'Hyderabad (HITEC City) and online', regOpensAt: d(6), regDeadline: d(20), startAt: d(27), endAt: d(29), minTeam: 2, maxTeam: 4, eligibility: 'College students and recent graduates', themes: ['Web3', 'FinTech'], prizePool: 250000, prizes: '₹1,50,000 first, ₹1,00,000 for the best public-good project', regLink: 'https://chaincraft.example/weekend', color: 'violet',
      description: 'Build useful on-chain apps beyond trading: credentials, supply-chain records and transparent grants. Testnet funds and workshops are provided.' },
    { id: 'h7', name: 'Winter of Code AI Jam', organizer: 'Neural Nest', mode: 'online', location: 'Online', regOpensAt: d(-70), regDeadline: d(-40), startAt: d(-35), endAt: d(-33), minTeam: 2, maxTeam: 4, eligibility: 'College students in India', themes: ['AI/ML', 'EdTech'], prizePool: 120000, prizes: '₹60,000 first, ₹40,000 second, ₹20,000 third', regLink: 'https://neuralnest.example/ai-jam', color: 'slate',
      description: 'A 48-hour online jam for AI tools that help students learn. Winners and finalists are listed on the official results page.' },
    { id: 'h8', name: 'GameJam Mumbai', organizer: 'Indie Pixel Society', mode: 'offline', location: 'Mumbai (Powai)', regOpensAt: d(-120), regDeadline: d(-95), startAt: d(-90), endAt: d(-88), minTeam: 2, maxTeam: 4, eligibility: 'Students and indie developers', themes: ['Gaming'], prizePool: 60000, prizes: '₹40,000 first, ₹20,000 audience choice', regLink: 'https://indiepixel.example/gamejam', color: 'gold', archived: true,
      description: 'A weekend game jam with a surprise theme announced at kickoff.' },
    { id: 'h9', name: 'Climate Data Challenge', organizer: 'GreenGrid Foundation', mode: 'online', location: 'Online', regOpensAt: d(-1), regDeadline: d(12), startAt: d(18), endAt: d(20), minTeam: 2, maxTeam: 4, eligibility: 'Students in India and South Asia', themes: ['Climate', 'Data Science', 'AI/ML'], prizePool: 180000, prizes: '₹1,00,000 first and two ₹40,000 track prizes', regLink: 'https://greengrid.example/climate-data', color: 'green',
      description: 'Turn open climate datasets into decisions: heat-risk maps, crop advisories or flood early warnings. Datasets from IMD, ISRO Bhuvan and CPCB are pre-loaded in a shared notebook environment.' }];
  for (const h of HK) db.hackathons.push(Object.assign({ pinned: false, archived: false, createdAt: (h.regOpensAt || t0) - 2 * DAY, banner: null }, h));

  /* ---------- teams and chats ---------- */
  const msg = (convId, senderId, text, at) => { db.messages.push({ id: 'm' + (db.messages.length + 1), convId, senderId, system: !senderId, text, at, seq: ++db.seq }); const c = db.convs.find(x => x.id === convId); if (c) c.lastAt = Math.max(c.lastAt || 0, at); };
  const team = (id, hid, name, leader, members, needed, extra) => {
    const t = Object.assign({ id, hackathonId: hid, name, leaderId: leader, members: members.map(([uid2, role], i) => ({ userId: uid2, role, joinedAt: d(-6 + i) })), neededRoles: needed, links: [], createdAt: d(-6), result: null, ratings: [], convId: 'c' + id }, extra || {});
    db.teams.push(t); db.convs.push({ id: 'c' + id, type: 'team', teamId: id, createdAt: t.createdAt, lastAt: t.createdAt });
    return t;
  };
  const t1 = team('t1', 'h1', 'Monsoon Mavericks', 'u1', [['u1', 'Backend'], ['u2', 'UI/UX Design']], ['ML/AI', 'Mobile'], { links: [{ id: 'k1', label: 'Repo', url: 'https://github.com/arjun-menon/monsoon-alert', by: 'u1', at: d(-4) }, { id: 'k2', label: 'Figma', url: 'https://www.figma.com/design/monsoon-alert-ui', by: 'u2', at: d(-3) }] });
  team('t2', 'h1', 'DataDhara', 'u13', [['u13', 'ML/AI'], ['u16', 'Pitch/PM'], ['u10', 'Frontend']], ['Backend']);
  team('t3', 'h2', 'LedgerLoop', 'u6', [['u6', 'ML/AI'], ['u10', 'Frontend']], ['Backend']);
  const t4 = team('t4', 'h7', 'Gradient Descenders', 'u3', [['u3', 'ML/AI'], ['u1', 'Backend'], ['u4', 'Pitch/PM']], [], { createdAt: d(-45), result: { status: 'finalist', proofUrl: 'https://neuralnest.example/ai-jam/results', submittedBy: 'u3', submittedAt: d(-31), verification: 'verified', reviewedAt: d(-30) } });
  t4.ratings = [{ from: 'u3', to: 'u1', reliability: 5, communication: 4, skill: 5, at: d(-30) }, { from: 'u4', to: 'u1', reliability: 4, communication: 5, skill: 4, at: d(-29) }, { from: 'u4', to: 'u3', reliability: 5, communication: 5, skill: 5, at: d(-29) }];
  team('t5', 'h7', 'Neural Ninjas', 'u6', [['u6', 'ML/AI'], ['u12', 'Backend'], ['u5', 'Mobile']], [], { createdAt: d(-45), result: { status: 'winner', proofUrl: 'https://neuralnest.example/ai-jam/winners', submittedBy: 'u6', submittedAt: d(-1.2), verification: 'pending' } });
  const t6 = team('t6', 'h8', 'Pixel Pushers', 'u8', [['u8', 'UI/UX Design'], ['u14', 'Mobile'], ['u15', 'Frontend'], ['u16', 'Pitch/PM']], [], { createdAt: d(-100), result: { status: 'winner', proofUrl: 'https://indiepixel.example/gamejam/winners', submittedBy: 'u8', submittedAt: d(-86), verification: 'verified', reviewedAt: d(-85) } });
  t6.ratings = [{ from: 'u14', to: 'u8', reliability: 5, communication: 5, skill: 4, at: d(-85) }, { from: 'u15', to: 'u8', reliability: 5, communication: 4, skill: 5, at: d(-85) }, { from: 'u16', to: 'u8', reliability: 4, communication: 5, skill: 5, at: d(-84) }, { from: 'u8', to: 'u15', reliability: 5, communication: 5, skill: 5, at: d(-84) }];

  msg('ct1', null, 'Arjun Menon created the team', d(-5));
  msg('ct1', null, 'Sneha Rao joined the team', d(-4));
  msg('ct1', 'u1', 'Plan so far: Go and Postgres for the API, MapLibre with OSM tiles for maps. We still need ML and mobile, so I’ve posted on the hackathon page.', d(-3.9));
  msg('ct1', 'u2', 'I’ll keep the design system small so whoever builds the app can move fast. First alert screens are in the Figma link.', d(-3.2));
  msg('ct1', 'u1', 'Perfect. Rohan (Flutter) asked to join, checking his profile tonight.', d(-0.8));
  msg('ct2', null, 'Diya Mukherjee created the team', d(-6));
  msg('ct3', null, 'Ananya Krishnan created the team', d(-4));
  msg('ct4', 'u3', 'Finalists! Thanks both. The eval harness saved us at 4 am.', d(-32));
  msg('ct4', 'u1', 'GG. Next time we take the whole thing.', d(-31.9));

  /* ---------- direct messages ---------- */
  db.convs.push({ id: 'c1', type: 'dm', members: ['u1', 'u2'], request: null, createdAt: d(-5), lastAt: d(-5) });
  msg('c1', 'u2', 'I pushed the first pass of the alert screens. Can you check the ward selector?', d(-1.1));
  msg('c1', 'u1', 'Looks great. Can the severity colors work for colorblind users too?', d(-1.05));
  msg('c1', 'u2', 'Yes, switching to icons plus labels instead of only red and amber. Will update by tonight.', d(-0.15));
  db.convs.push({ id: 'c5', type: 'dm', members: ['u1', 'u3'], request: null, createdAt: d(-33), lastAt: d(-33) });
  msg('c5', 'u3', 'GG on the AI Jam. Finalist with a 36-hour model isn’t bad 😄', d(-32.5));
  msg('c5', 'u1', 'Let’s go for the win next time. Are you doing Hack the Monsoon?', d(-32.4));
  db.convs.push({ id: 'c3', type: 'dm', members: ['u11', 'u1'], request: { by: 'u11', state: 'pending' }, createdAt: d(-0.2), lastAt: d(-0.2) });
  msg('c3', 'u11', 'Hey Arjun! Saw your Go projects. I’m moving from Spring Boot to Go. Any chance you’d look at my API design before DevSprint?', d(-0.2));
  db.convs.push({ id: 'c6', type: 'dm', members: ['u17', 'u10'], request: { by: 'u17', state: 'pending' }, createdAt: d(-0.5), lastAt: d(-0.5) });
  msg('c6', 'u17', 'Need a guaranteed win? Paid project help, message me on Telegram @fastprojects 💰', d(-0.5));
  msg('c6', 'u17', 'Reply fast, limited slots!!', d(-0.45));
  const lastSeq = cid => Math.max(...db.messages.filter(m => m.convId === cid).map(m => m.seq));
  db.reads.u1 = { c1: db.messages.filter(m => m.convId === 'c1')[1].seq, ct1: lastSeq('ct1'), c5: lastSeq('c5'), ct4: lastSeq('ct4') };

  /* ---------- team-finding posts ---------- */
  const post = (id, hid, author, type, teamId, o) => db.posts.push(Object.assign({ id, hackathonId: hid, authorId: author, type, teamId, status: 'active', hidden: false, idea: '', mode: 'any', location: '', skills: [], reactions: { interested: [], fire: [] }, createdAt: d(-2), updatedAt: d(-2) }, o));
  post('p1', 'h1', 'u1', 'team', 't1', { description: 'We’re building Monsoon Alert: flood warnings from rainfall data plus community reports. Backend and design are covered. We need someone to own the rainfall forecasting model and someone to ship the Flutter app.', roles: ['ML/AI', 'Mobile'], skills: ['Python', 'Time series', 'Flutter'], targetSize: 4, idea: 'Ward-level flood alerts for Bengaluru', mode: 'hybrid', location: 'Bengaluru', reactions: { interested: ['u3', 'u5', 'u14'], fire: ['u8'] }, createdAt: d(-3), updatedAt: d(-3) });
  post('p2', 'h1', 'u3', 'individual', null, { description: 'ML engineer comfortable with PyTorch, LLM fine-tuning and quick FastAPI backends. Looking for a team that wants a real model, not a thin wrapper around an API.', roles: ['ML/AI'], skills: ['Python', 'PyTorch', 'LLMs', 'FastAPI'], targetSize: 4, mode: 'hybrid', location: 'Mumbai, can travel', reactions: { interested: ['u13'], fire: [] }, createdAt: d(-2) });
  post('p3', 'h1', 'u8', 'individual', null, { description: 'Product designer, three hackathons in. I do research, flows and a polished Figma prototype by demo time. Prefer climate or social-good ideas.', roles: ['UI/UX Design'], skills: ['Figma', 'Prototyping', 'User research'], targetSize: 4, mode: 'online', reactions: { interested: ['u15'], fire: ['u2'] }, createdAt: d(-2.5) });
  post('p4', 'h1', 'u13', 'team', 't2', { description: 'DataDhara is building a groundwater dashboard from open government well data. We need a backend dev to own the data pipeline and APIs.', roles: ['Backend'], skills: ['Python', 'PostgreSQL', 'REST APIs'], targetSize: 4, idea: 'District groundwater early warnings', mode: 'hybrid', location: 'Bengaluru', createdAt: d(-4) });
  post('p5', 'h1', 'u14', 'individual', null, { description: 'Embedded and IoT person. I can bring ESP32 rain gauges for a hardware demo. Looking for a team working on climate or disaster response.', roles: ['Mobile'], skills: ['ESP32', 'Arduino', 'C++', 'Flutter'], targetSize: 4, mode: 'hybrid', location: 'Tiruchirappalli, can travel', reactions: { interested: ['u1'], fire: [] }, createdAt: d(-1.5) });
  post('p6', 'h1', 'u10', 'individual', null, { description: 'Frontend dev (React, TypeScript, React Native) looking for a team that cares about polish and accessibility.', roles: ['Frontend', 'Mobile'], skills: ['React', 'TypeScript', 'React Native'], targetSize: 4, status: 'filled', filledTeam: 'DataDhara', createdAt: d(-7) });
  post('p7', 'h2', 'u7', 'individual', null, { description: 'DevOps and backend. I’ll set up CI, infra and a clean deploy so your demo doesn’t fall over on stage.', roles: ['DevOps', 'Backend'], skills: ['AWS', 'Terraform', 'Docker', 'Go'], targetSize: 3, mode: 'online', createdAt: d(-2.2) });
  post('p8', 'h2', 'u6', 'team', 't3', { description: 'LedgerLoop is an AI expense splitter for hostels and flatmates that reads UPI SMS. We need a backend dev who is comfortable with Postgres and queues.', roles: ['Backend'], skills: ['Node.js', 'PostgreSQL', 'Redis'], targetSize: 3, idea: 'Expense splitting from UPI SMS', mode: 'online', createdAt: d(-3) });
  post('p9', 'h3', 'u5', 'individual', null, { description: 'Flutter dev looking for a HealthHack team. Happy to build the patient-facing app and the offline sync.', roles: ['Mobile'], skills: ['Flutter', 'Firebase', 'Kotlin'], targetSize: 4, mode: 'offline', location: 'Pune', createdAt: d(-1) });
  post('p10', 'h1', 'u17', 'individual', null, { description: 'Need help with your project? 💰 Paid assignment and hackathon project help, guaranteed win. Message me on Telegram @fastprojects.', roles: ['Pitch/PM'], skills: ['Excel'], targetSize: 4, createdAt: d(-0.6) });
  post('p11', 'h5', 'u15', 'individual', null, { description: 'Frontend dev who loves accessibility work. Looking for a team to pick up a11y issues across a couple of Indian open-source projects.', roles: ['Frontend', 'UI/UX Design'], skills: ['React', 'Svelte', 'HTML/CSS'], targetSize: 3, mode: 'online', createdAt: d(-1.2) });
  post('p12', 'h9', 'u3', 'individual', null, { description: 'Looking for a data-heavy team for the Climate Data Challenge. I can handle forecasting and model evaluation.', roles: ['ML/AI'], skills: ['Python', 'Time series', 'PyTorch'], targetSize: 3, mode: 'online', createdAt: d(-0.4) });
  const reply = (id, postId, author, text, at) => db.replies.push({ id, postId, authorId: author, text, at, hidden: false });
  reply('r1', 'p1', 'u5', 'Flutter is my main stack, so I just sent a request. Do you already have a map provider in mind?', d(-1));
  reply('r2', 'p1', 'u1', 'Thinking MapLibre with OSM tiles to keep it free. I’ll look at your request tonight!', d(-0.9));
  reply('r3', 'p1', 'u3', 'I’ve done LSTM rainfall nowcasting before. Happy to chat about the model.', d(-0.5));
  reply('r4', 'p2', 'u13', 'DataDhara could use a forecasting model too. Messaging you.', d(-1.4));

  /* ---------- invites and join requests ---------- */
  const inv = (id, kind, teamId, from, to, message, created, status, extra) => {
    const tm = db.teams.find(t => t.id === teamId), h = db.hackathons.find(x => x.id === tm.hackathonId);
    db.invites.push(Object.assign({ id, kind, teamId, hackathonId: h.id, fromId: from, toId: to, postId: null, message, status: status || 'pending', createdAt: created, expiresAt: Math.min(created + 7 * DAY, h.regDeadline) }, extra || {}));
  };
  inv('i1', 'request', 't1', 'u5', 'u1', 'Flutter is my main stack (two apps on the Play Store). I’d love to build the mobile client for Monsoon Alert.', d(-1));
  inv('i2', 'invite', 't3', 'u6', 'u1', 'Your CampusEats API is exactly the backend experience LedgerLoop needs. Want to join us for DevSprint?', d(-0.5));
  inv('i3', 'request', 't3', 'u7', 'u6', 'I can handle infra and the backend, and I’ve worked with Postgres queues before.', d(-2));
  inv('i4', 'invite', 't1', 'u1', 'u3', 'Saw your post. Want to own the forecasting model for Monsoon Alert?', d(-0.3));
  inv('i5', 'request', 't2', 'u10', 'u13', 'I can own the frontend for DataDhara.', d(-6), 'accepted', { resolvedAt: d(-5.5) });
  inv('i6', 'request', 't2', 'u7', 'u13', 'I can set up the data pipeline and deploys for DataDhara.', d(-5), 'declined', { resolvedAt: d(-4.5) });
  inv('i7', 'invite', 't3', 'u6', 'u12', 'Want to build LedgerLoop with us for DevSprint?', d(-5), 'withdrawn', { resolvedAt: d(-4) });

  /* ---------- reports ---------- */
  db.reports.push({ id: 'rp1', reporterId: 'u8', targetType: 'post', targetId: 'p10', reason: 'Spam or promotion', details: 'Selling paid project help and pushing people to Telegram.', at: d(-0.4), status: 'open' });
  db.reports.push({ id: 'rp2', reporterId: 'u6', targetType: 'profile', targetId: 'u12', reason: 'Inaccurate stats', details: 'Claims 905 LeetCode problems, but his public profile showed about 120 last week.', at: d(-1), status: 'open' });
  db.reports.push({ id: 'rp3', reporterId: 'u10', targetType: 'message', targetId: db.messages.find(m => m.convId === 'c6').id, reason: 'Harassment or hate', details: 'Keeps messaging me about paid work after I ignored him.', at: d(-0.2), status: 'open' });

  /* ---------- scores and history ---------- */
  for (const u of students()) {
    const s = computeScore(u).total;
    u.score = { total: s, at: t0 };
    const steps = u.id === 'u1' ? [0.48, 0.55, 0.62, 0.71, 0.78, 0.86, 0.93] : [0.6, 0.74, 0.86];
    const span = Math.max(3, u.createdAt ? (t0 - u.createdAt) / DAY - 1 : 30);
    u.scoreHistory = steps.map((f, i) => ({ at: t0 - span * DAY + (i * span * DAY) / steps.length, score: Math.round(s * f), reason: i ? 'Profile updated' : 'Profile created' })).concat({ at: t0 - 6 * DAY, score: s, reason: 'GitHub synced' });
  }

  /* ---------- notifications for the demo student ---------- */
  const note = (type, title, body, link, at, read) => db.notifications.push({ id: 'n' + (db.notifications.length + 1), userId: 'u1', type, title, body, link, at, read: !!read, convId: null });
  note('invite', 'Rohan Iyer asked to join Monsoon Mavericks', 'Flutter is my main stack (two apps on the Play Store).', 'team-t1', d(-1));
  note('reply', 'Kabir Shah replied to your post', 'I’ve done LSTM rainfall nowcasting before. Happy to chat about the model.', 'h-h1', d(-0.5));
  note('invite', 'Ananya Krishnan invited you to join LedgerLoop', 'DevSprint: FinTech Edition', 'teams', d(-0.5));
  note('hackathon', 'New hackathon for you: Climate Data Challenge', 'Matches your interest in AI/ML. Registration closes ' + fmtDate(d(12)) + '.', 'h-h9', d(-0.9), true);
  note('score', 'Your Builder Score went up 18 points', 'GitHub synced', 'me', d(-6), true);
  note('team', 'Verified: Finalist at Winter of Code AI Jam', 'It’s on your profile now and counts toward your Builder Score.', 'team-t4', d(-30), true);
  db.notifications.sort((a, b) => b.at - a.at);
  return db;
}
