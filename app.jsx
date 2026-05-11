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

// ── TeamCard ─────────────────────────────────────────────────────────────────
// Read-only display + scoring buttons only. Editing lives in EditPanel.
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
        <div style={{ flex: 1, minWidth: 0, fontFamily: 'Fredoka', fontWeight: 700, fontSize: 24, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {team.name}
        </div>
        {isLeader && t.showCrown && <span title="In the lead!" style={{ fontSize: 22 }}>👑</span>}
        <button className="iconBtn" onClick={onEdit} title="Edit team"
                style={{ fontSize: 15, opacity: isSelected ? 1 : 0.5 }}>✏️</button>
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
        <div style={{ textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 13, opacity: .5, letterSpacing: '.14em', textTransform: 'uppercase' }}>
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
const LABEL = { fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };

function EditPanel({ team, onClose, onChange, onRemove, isOnlyTeam }) {
  const update = (patch) => onChange({ ...team, ...patch });
  const setScore = (n) => update({ score: Math.max(0, Math.min(9999, Math.round(n || 0))) });

  return (
    <div className="edit-panel" style={{ borderTop: `4px solid ${team.color}` }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 18, color: team.color }}>Edit Team</span>
        <button className="iconBtn" onClick={onClose} style={{ fontSize: 16 }}>✕</button>
      </div>

      {/* name */}
      <div style={{ marginBottom: 18 }}>
        <label style={LABEL}>Name</label>
        <input value={team.name} onChange={e => update({ name: e.target.value })}
               style={{ width: '100%', fontFamily: 'Fredoka', fontWeight: 700, fontSize: 20,
                        border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 12px',
                        outline: 'none', color: team.color, background: 'transparent', boxSizing: 'border-box' }} />
      </div>

      {/* score */}
      <div style={{ marginBottom: 18 }}>
        <label style={LABEL}>Score</label>
        <input type="number" value={team.score} onChange={e => setScore(Number(e.target.value))}
               style={{ width: '100%', fontFamily: 'Fredoka', fontWeight: 700, fontSize: 28,
                        border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 12px',
                        outline: 'none', color: team.color, background: 'transparent',
                        boxSizing: 'border-box', MozAppearance: 'textfield' }} />
      </div>

      {/* emoji */}
      <div style={{ marginBottom: 18 }}>
        <label style={LABEL}>Emoji</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 38px)', gap: 4 }}>
          <button onClick={() => update({ emoji: '' })} title="No emoji"
                  style={{ border: '1.5px dashed rgba(0,0,0,.2)', background: !team.emoji ? 'rgba(0,0,0,.06)' : 'transparent',
                           fontSize: 13, color: 'rgba(0,0,0,.4)', borderRadius: 8, cursor: 'pointer', width: 38, height: 38 }}>
            ✕
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
      <div style={{ marginBottom: 24 }}>
        <label style={LABEL}>Color</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button key={c.c1} onClick={() => update({ color: c.c1 })} title={c.name}
                    style={{ width: 30, height: 30, borderRadius: '50%', background: c.c1,
                             border: team.color === c.c1 ? '3px solid #1a1a2e' : '3px solid transparent',
                             cursor: 'pointer', padding: 0, outline: 'none', boxShadow: team.color === c.c1 ? '0 0 0 2px #fff inset' : 'none' }} />
          ))}
        </div>
      </div>

      {/* actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
        <button className="iconBtn" onClick={() => update({ score: 0 })} style={{ textAlign: 'left', padding: '8px 10px' }}>↺ Reset score to 0</button>
        {!isOnlyTeam && (
          <button className="iconBtn" onClick={onRemove} style={{ color: '#e11d48', textAlign: 'left', padding: '8px 10px' }}>✕ Remove team</button>
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
  const item = (label, onClick, opts = {}) => (
    <button className="menu-item" onClick={() => { onClick(); if (!opts.keepOpen) setOpen(false); }}>
      <span className="menu-icon">{opts.icon}</span>
      <span>{label}</span>
      {opts.right && <span className="menu-right">{opts.right}</span>}
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
          {item('Add a team', onAddTeam, { icon: '➕' })}
          {item('Reset all scores', onResetAll, { icon: '↺' })}
          <div className="menu-sep"></div>
          {item(t.dark ? 'Light mode' : 'Dark mode', () => setTweak('dark', !t.dark), { icon: t.dark ? '☀️' : '🌙', keepOpen: true })}
          {item('Crown on leader', () => setTweak('showCrown', !t.showCrown), { icon: '👑', keepOpen: true, right: t.showCrown ? '✓' : '' })}
          {item('Leaderboard', () => setTweak('showLeaderboard', !t.showLeaderboard), { icon: '🏆', keepOpen: true, right: t.showLeaderboard ? '✓' : '' })}
          {item('Confetti on +points', () => setTweak('celebrate', !t.celebrate), { icon: '🎉', keepOpen: true, right: t.celebrate ? '✓' : '' })}
          <div className="menu-sep"></div>
          {item('Restore default 4 teams', onRestoreDefaults, { icon: '↩︎' })}
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

  return (
    <div className="wrap">
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
        <div style={{ display: 'flex', gap: 20, width: '100%', alignItems: 'flex-start' }}>
          <div className="grid" style={{ flex: 1 }}>
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

          {selectedIdx !== null && selectedIdx < teams.length && (
            <EditPanel
              team={teams[selectedIdx]}
              onClose={() => setSelectedIdx(null)}
              onChange={next => updateTeam(selectedIdx, next)}
              onRemove={() => removeTeam(selectedIdx)}
              isOnlyTeam={teams.length <= 1} />
          )}
        </div>
      </div>

      {/* leaderboard */}
      {t.showLeaderboard && teams.length > 1 && max > 0 && (
        <div className="leaderboard">
          <span>🏆</span>
          {sorted.slice(0, 3).map((tm, i) => (
            <React.Fragment key={tm.id}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="lb-dot" style={{ background: tm.color }}></span>
                <span className="lb-name">{tm.name}</span>
                <span style={{ opacity: .7 }}>{tm.score}</span>
              </span>
              {i < Math.min(2, sorted.length - 1) && <span style={{ opacity: .4 }}>•</span>}
            </React.Fragment>
          ))}
        </div>
      )}

      {confirmReset && (
        <div className="modal-back" onClick={() => setConfirmReset(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48 }}>🎯</div>
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
          <TweakToggle label="Dark mode" value={t.dark} onChange={v => setTweak('dark', v)} />
          <TweakToggle label="Crown on leader" value={t.showCrown} onChange={v => setTweak('showCrown', v)} />
          <TweakToggle label="Top-3 leaderboard" value={t.showLeaderboard} onChange={v => setTweak('showLeaderboard', v)} />
          <TweakToggle label="Confetti on +points" value={t.celebrate} onChange={v => setTweak('celebrate', v)} />
          <TweakRadio label="Big buttons" value={t.bigButtons} options={['small','big']} onChange={v => setTweak('bigButtons', v)} />
        </TweakSection>
        <TweakSection label="Scoring">
          <TweakNumber label="Slider max" value={t.maxScale} min={10} max={500} step={10} onChange={v => setTweak('maxScale', v)} />
          <TweakNumber label="Main step (±)" value={t.stepBig} min={1} max={50} step={1} onChange={v => setTweak('stepBig', v)} />
          <TweakNumber label="Fine step (±)" value={t.stepSmall} min={1} max={10} step={1} onChange={v => setTweak('stepSmall', v)} />
        </TweakSection>
        <TweakSection label="Teams">
          <TweakButton label="+ Add team" onClick={addTeam} />
          <TweakButton label="Reset scores to 0" secondary onClick={() => setConfirmReset(true)} />
          <TweakButton label="Restore default 4 teams" secondary onClick={() => setTeams(defaultTeams())} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
