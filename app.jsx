// app.jsx — Team Points tracker for kids church

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "showCrown": true,
  "showLeaderboard": true,
  "bigButtons": "small",
  "maxScale": 100,
  "stepBig": 10,
  "stepSmall": 1,
  "celebrate": true
}/*EDITMODE-END*/;

const COLORS = [
  { c1: '#ff5e9d', name: 'Pink'   },
  { c1: '#00b8d4', name: 'Teal'   },
  { c1: '#ffb000', name: 'Sun'    },
  { c1: '#7c3aed', name: 'Purple' },
  { c1: '#22c55e', name: 'Green'  },
  { c1: '#ff6b3d', name: 'Orange' },
  { c1: '#3b82f6', name: 'Blue'   },
  { c1: '#e11d48', name: 'Red'    },
];

const EMOJIS = ['🦁','🐯','🦊','🐼','🦄','🐶','🐸','🐙','🦖','🐵','🦒','🐧','🐝','🦋','🐳','🦉'];
const STORAGE_KEY = 'glow-kids-points-v1';

// ── Icons ─────────────────────────────────────────────────────────────────────
function Svg({ size = 16, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      {children}
    </svg>
  );
}
const IconPencil  = ({ size }) => <Svg size={size}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></Svg>;
const IconX       = ({ size }) => <Svg size={size}><path d="M18 6 6 18M6 6l12 12"/></Svg>;
const IconReset   = ({ size }) => <Svg size={size}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></Svg>;
const IconTrash   = ({ size }) => <Svg size={size}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></Svg>;
const IconPlus    = ({ size }) => <Svg size={size}><path d="M5 12h14M12 5v14"/></Svg>;
const IconMoon    = ({ size }) => <Svg size={size}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></Svg>;
const IconSun     = ({ size }) => <Svg size={size}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></Svg>;
const IconCrown   = ({ size }) => <Svg size={size}><path d="M2 20h20"/><path d="m4 16 4-12 4 8 4-8 4 12"/></Svg>;
const IconTrophy  = ({ size }) => <Svg size={size}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></Svg>;
const IconSparkle = ({ size }) => <Svg size={size}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></Svg>;
const IconUndo    = ({ size }) => <Svg size={size}><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></Svg>;

// ── Data helpers ──────────────────────────────────────────────────────────────
function defaultTeams() {
  return [
    { id: 't1', name: 'Year 3', color: COLORS[0].c1, emoji: '🦁', score: 0 },
    { id: 't2', name: 'Year 4', color: COLORS[1].c1, emoji: '🦊', score: 0 },
    { id: 't3', name: 'Year 5', color: COLORS[2].c1, emoji: '🐼', score: 0 },
    { id: 't4', name: 'Year 6', color: COLORS[3].c1, emoji: '🦄', score: 0 },
  ];
}
function loadTeams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTeams();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (e) {}
  return defaultTeams();
}
function uid() { return 't' + Math.random().toString(36).slice(2, 8); }

function burstConfetti(x, y, color) {
  const layer = document.getElementById('confetti-layer');
  if (!layer) return;
  const colors = [color, '#ffd84d', '#ff7eb6', '#7be1ff', '#9cf0a2', '#c39bff'];
  for (let i = 0; i < 22; i++) {
    const d = document.createElement('div');
    d.className = 'confetti';
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.style.background = colors[i % colors.length];
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 140;
    d.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
    d.style.setProperty('--ty', Math.sin(angle) * dist - 30 + 'px');
    d.style.setProperty('--tr', (Math.random() * 720 - 360) + 'deg');
    d.style.animation = 'burst .9s cubic-bezier(.1,.6,.4,1) forwards';
    layer.appendChild(d);
    setTimeout(() => d.remove(), 1000);
  }
}

// ── TeamCard ──────────────────────────────────────────────────────────────────
function TeamCard({ team, isLeader, isOnlyTeam, t, onChange, onEdit, isSelected }) {
  const cardRef = React.useRef(null);
  const scoreRef = React.useRef(null);
  const prevScore = React.useRef(team.score);

  React.useEffect(() => {
    if (team.score !== prevScore.current) {
      const el = scoreRef.current;
      if (el) {
        el.classList.remove('pop', 'shake');
        void el.offsetWidth;
        el.classList.add(team.score > prevScore.current ? 'pop' : 'shake');
      }
      if (team.score > prevScore.current && t.celebrate && cardRef.current) {
        const r = cardRef.current.getBoundingClientRect();
        burstConfetti(r.left + r.width / 2, r.top + r.height / 2, team.color);
      }
      prevScore.current = team.score;
    }
  }, [team.score, t.celebrate, team.color]);

  const setScore = (n) => onChange({ ...team, score: Math.max(0, Math.min(9999, Math.round(n))) });
  const bump = (n) => setScore(team.score + n);

  const sliderMax = t.maxScale;
  const sliderVal = Math.max(0, Math.min(sliderMax, team.score));
  const pct = (sliderVal / sliderMax) * 100;
  const sB = t.stepBig;
  const sS = t.stepSmall;
  const big = t.bigButtons === 'big';

  return (
    <div ref={cardRef}
         className={'card' + (isLeader && t.showCrown ? ' leader-glow' : '') + (isSelected ? ' card-selected' : '')}
         style={{ '--c1': team.color }}>
      <div className="accent"></div>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 2 }}>
        {team.emoji
          ? <span className="emoji">{team.emoji}</span>
          : <span style={{ width: 38, display: 'inline-block' }}></span>}
        <div style={{ flex: 1, minWidth: 0, fontFamily: 'Fredoka', fontWeight: 700, fontSize: 24,
                      lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {team.name}
        </div>
        {isLeader && t.showCrown && <span title="In the lead!" style={{ fontSize: 20 }}>👑</span>}
        <button className="iconBtn" onClick={onEdit} title="Edit team"
                style={{ color: isSelected ? 'var(--c1)' : undefined }}>
          <IconPencil size={15} />
        </button>
      </div>

      {/* score */}
      <div ref={scoreRef} className="score-big" style={{ marginTop: 6, position: 'relative', zIndex: 2 }}>
        {team.score}
      </div>

      {/* +/- buttons */}
      <div className="delta-row" style={{ position: 'relative', zIndex: 2 }}>
        <button className={'deltaBtn minus btn-tactile' + (big ? ' big' : '')} onClick={() => bump(-sB)}>−{sB}</button>
        <button className={'deltaBtn plus btn-tactile' + (big ? ' big' : '')} onClick={() => bump(sB)}>+{sB}</button>
        <button className={'deltaBtn plus btn-tactile' + (big ? ' big' : '')} onClick={() => bump(sB * 5)}>+{sB * 5}🎉</button>
      </div>

      {/* stepper */}
      <div className="stepper" style={{ position: 'relative', zIndex: 2 }}>
        <button className="stepBtn minus btn-tactile" onClick={() => bump(-sS)}>−{sS}</button>
        <div style={{ textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 13,
                      opacity: .5, letterSpacing: '.14em', textTransform: 'uppercase' }}>
          One at a time
        </div>
        <button className="stepBtn btn-tactile" onClick={() => bump(sS)}>+{sS}</button>
      </div>

      {/* slider */}
      <div className="slider-wrap" style={{ position: 'relative', zIndex: 2 }}>
        <input type="range" className="pts-slider" min={0} max={sliderMax} step={1}
               value={sliderVal}
               style={{ '--c1': team.color, '--p': pct + '%' }}
               onChange={(e) => setScore(Number(e.target.value))} />
        <div className="slider-labels">
          <span>0</span><span>{Math.round(sliderMax / 2)}</span><span>{sliderMax}</span>
        </div>
      </div>
    </div>
  );
}

// ── EditPanel ─────────────────────────────────────────────────────────────────
function EditPanel({ team, onClose, onChange, onRemove, isOnlyTeam }) {
  const update = (patch) => onChange({ ...team, ...patch });
  const setScore = (n) => update({ score: Math.max(0, Math.min(9999, Math.round(n || 0))) });

  return (
    <div className="edit-panel" style={{ borderTop: `4px solid ${team.color}` }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 18, color: team.color }}>
          Edit Team
        </span>
        <button className="iconBtn" onClick={onClose}><IconX size={16} /></button>
      </div>

      {/* name */}
      <div>
        <label className="edit-section-label">Name</label>
        <input className="edit-input"
               value={team.name} onChange={e => update({ name: e.target.value })}
               style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 20, color: team.color }} />
      </div>

      {/* score */}
      <div>
        <label className="edit-section-label">Score</label>
        <input type="number" className="edit-input num-input"
               value={team.score} onChange={e => setScore(Number(e.target.value))}
               style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 28, color: team.color }} />
      </div>

      {/* emoji */}
      <div>
        <label className="edit-section-label">Emoji</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 38px)', gap: 4 }}>
          <button onClick={() => update({ emoji: '' })} title="No emoji"
                  style={{ border: '1.5px dashed rgba(0,0,0,.2)',
                           background: !team.emoji ? 'rgba(0,0,0,.06)' : 'transparent',
                           borderRadius: 8, cursor: 'pointer', width: 38, height: 38,
                           display: 'flex', alignItems: 'center', justifyContent: 'center',
                           color: 'rgba(0,0,0,.35)' }}>
            <IconX size={14} />
          </button>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => update({ emoji: e })}
                    style={{ border: team.emoji === e ? `2px solid ${team.color}` : '2px solid transparent',
                             background: team.emoji === e ? `${team.color}18` : 'transparent',
                             fontSize: 20, borderRadius: 8, cursor: 'pointer', width: 38, height: 38 }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* color */}
      <div>
        <label className="edit-section-label">Color</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button key={c.c1} onClick={() => update({ color: c.c1 })} title={c.name}
                    style={{ width: 30, height: 30, borderRadius: '50%', background: c.c1,
                             border: team.color === c.c1 ? '3px solid #1a1a2e' : '3px solid transparent',
                             cursor: 'pointer', padding: 0, outline: 'none',
                             boxShadow: team.color === c.c1 ? '0 0 0 2px #fff inset' : 'none' }} />
          ))}
        </div>
      </div>

      {/* actions */}
      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 2, marginTop: 'auto' }}>
        <button className="edit-action-btn" onClick={() => update({ score: 0 })}>
          <IconReset size={15} /> Reset score to 0
        </button>
        {!isOnlyTeam && (
          <button className="edit-action-btn danger" onClick={onRemove}>
            <IconTrash size={15} /> Remove team
          </button>
        )}
      </div>
    </div>
  );
}

// ── Menu ──────────────────────────────────────────────────────────────────────
function Menu({ t, setTweak, onAddTeam, onResetAll, onRestoreDefaults }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  const item = (label, icon, onClick, opts = {}) => (
    <button className="menu-item" onClick={() => { onClick(); if (!opts.keepOpen) setOpen(false); }}>
      <span className="menu-icon">{icon}</span>
      <span>{label}</span>
      {opts.check && <span className="menu-right">✓</span>}
    </button>
  );

  return (
    <div className="menu-wrap" ref={ref}>
      <button className={'pill primary btn-tactile menu-btn' + (open ? ' open' : '')}
              onClick={() => setOpen(v => !v)} aria-label="Menu">
        <span className="menu-bars"><i></i><i></i><i></i></span>
        Menu
      </button>
      {open && (
        <div className="menu-pop" role="menu">
          {item('Add a team',          <IconPlus size={16} />,    onAddTeam)}
          {item('Reset all scores',    <IconReset size={16} />,   onResetAll)}
          <div className="menu-sep"></div>
          {item(t.dark ? 'Light mode' : 'Dark mode',
                t.dark ? <IconSun size={16} /> : <IconMoon size={16} />,
                () => setTweak('dark', !t.dark), { keepOpen: true })}
          {item('Crown on leader',     <IconCrown size={16} />,   () => setTweak('showCrown', !t.showCrown),         { keepOpen: true, check: t.showCrown })}
          {item('Leaderboard',         <IconTrophy size={16} />,  () => setTweak('showLeaderboard', !t.showLeaderboard), { keepOpen: true, check: t.showLeaderboard })}
          {item('Confetti on +points', <IconSparkle size={16} />, () => setTweak('celebrate', !t.celebrate),         { keepOpen: true, check: t.celebrate })}
          <div className="menu-sep"></div>
          {item('Restore default teams', <IconUndo size={16} />,  onRestoreDefaults)}
        </div>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [teams, setTeams] = React.useState(loadTeams);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [selectedIdx, setSelectedIdx] = React.useState(null);

  React.useEffect(() => { document.body.classList.toggle('dark', !!t.dark); }, [t.dark]);
  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(teams)); } catch (e) {}
  }, [teams]);
  React.useEffect(() => {
    if (selectedIdx !== null && selectedIdx >= teams.length) setSelectedIdx(null);
  }, [teams.length]);

  const updateTeam = (idx, next) => setTeams(prev => prev.map((x, i) => i === idx ? next : x));
  const removeTeam = (idx) => { setTeams(prev => prev.filter((_, i) => i !== idx)); setSelectedIdx(null); };
  const addTeam = () => {
    setTeams(prev => {
      const usedColors = new Set(prev.map(x => x.color));
      const usedEmojis = new Set(prev.map(x => x.emoji));
      const color = (COLORS.find(c => !usedColors.has(c.c1)) || COLORS[prev.length % COLORS.length]).c1;
      const emoji = EMOJIS.find(e => !usedEmojis.has(e)) || EMOJIS[prev.length % EMOJIS.length];
      return [...prev, { id: uid(), name: 'Year ' + (2 + prev.length + 1), color, emoji, score: 0 }];
    });
  };
  const resetAll = () => { setTeams(prev => prev.map(x => ({ ...x, score: 0 }))); setConfirmReset(false); };

  const max = teams.reduce((m, x) => Math.max(m, x.score), -Infinity);
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const panelOpen = selectedIdx !== null && selectedIdx < teams.length;

  return (
    <div className={'wrap' + (panelOpen ? ' panel-open' : '')}>
      <div id="confetti-layer" className="top-celebration"></div>

      <header className="top-bar">
        <div className="brand">
          <span className="sub">Kids Church</span>
          Glow Kids
        </div>
        <Menu t={t} setTweak={setTweak} onAddTeam={addTeam}
              onResetAll={() => setConfirmReset(true)} onRestoreDefaults={() => setTeams(defaultTeams())} />
      </header>

      <div className="grid-center">
        <div className="grid" style={{ width: '100%' }}>
          {teams.map((team, i) => (
            <TeamCard key={team.id}
                      team={team}
                      isLeader={teams.length > 1 && team.score === max && max > 0}
                      isOnlyTeam={teams.length <= 1}
                      isSelected={selectedIdx === i}
                      t={t}
                      onChange={next => updateTeam(i, next)}
                      onEdit={() => setSelectedIdx(selectedIdx === i ? null : i)} />
          ))}
        </div>
      </div>

      {panelOpen && (
        <EditPanel
          team={teams[selectedIdx]}
          onClose={() => setSelectedIdx(null)}
          onChange={next => updateTeam(selectedIdx, next)}
          onRemove={() => removeTeam(selectedIdx)}
          isOnlyTeam={teams.length <= 1} />
      )}

      {/* leaderboard */}
      {t.showLeaderboard && teams.length > 1 && max > 0 && (
        <div className="leaderboard">
          <IconTrophy size={14} />
          {sorted.slice(0, 3).map((tm, i) => (
            <React.Fragment key={tm.id}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="lb-dot" style={{ background: tm.color }}></span>
                <span className="lb-name">{tm.name}</span>
                <span style={{ opacity: .7 }}>{tm.score}</span>
              </span>
              {i < Math.min(2, sorted.length - 1) && <span style={{ opacity: .3 }}>|</span>}
            </React.Fragment>
          ))}
        </div>
      )}

      {confirmReset && (
        <div className="modal-back" onClick={() => setConfirmReset(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎯</div>
            <h2>Reset every team to 0?</h2>
            <p>This sets every score back to zero. The teams stay.</p>
            <div className="actions">
              <button className="cancel" onClick={() => setConfirmReset(false)}>Cancel</button>
              <button className="confirm" onClick={resetAll}>Yes, reset all</button>
            </div>
          </div>
        </div>
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Look">
          <TweakToggle label="Dark mode"          value={t.dark}            onChange={v => setTweak('dark', v)} />
          <TweakToggle label="Crown on leader"    value={t.showCrown}       onChange={v => setTweak('showCrown', v)} />
          <TweakToggle label="Top-3 leaderboard"  value={t.showLeaderboard} onChange={v => setTweak('showLeaderboard', v)} />
          <TweakToggle label="Confetti on +points" value={t.celebrate}      onChange={v => setTweak('celebrate', v)} />
          <TweakRadio  label="Big buttons"        value={t.bigButtons}      options={['small','big']} onChange={v => setTweak('bigButtons', v)} />
        </TweakSection>
        <TweakSection label="Scoring">
          <TweakNumber label="Slider max"   value={t.maxScale}  min={10} max={500} step={10} onChange={v => setTweak('maxScale', v)} />
          <TweakNumber label="Main step (±)" value={t.stepBig}  min={1}  max={50}  step={1}  onChange={v => setTweak('stepBig', v)} />
          <TweakNumber label="Fine step (±)" value={t.stepSmall} min={1} max={10}  step={1}  onChange={v => setTweak('stepSmall', v)} />
        </TweakSection>
        <TweakSection label="Teams">
          <TweakButton label="+ Add team"           onClick={addTeam} />
          <TweakButton label="Reset scores to 0"    secondary onClick={() => setConfirmReset(true)} />
          <TweakButton label="Restore default teams" secondary onClick={() => setTeams(defaultTeams())} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
