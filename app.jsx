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
    const tx = Math.cos(angle) * dist + 'px';
    const ty = Math.sin(angle) * dist - 30 + 'px';
    d.style.setProperty('--tx', tx);
    d.style.setProperty('--ty', ty);
    d.style.setProperty('--tr', (Math.random() * 720 - 360) + 'deg');
    d.style.animation = 'burst .9s cubic-bezier(.1,.6,.4,1) forwards';
    layer.appendChild(d);
    setTimeout(() => d.remove(), 1000);
  }
}

function TeamCard({ team, isLeader, isOnlyTeam, t, onChange, onRemove }) {
  const cardRef = React.useRef(null);
  const scoreRef = React.useRef(null);
  const prevScore = React.useRef(team.score);
  const [editingName, setEditingName] = React.useState(false);
  const [editingScore, setEditingScore] = React.useState(false);
  const [pickColor, setPickColor] = React.useState(false);
  const [pickEmoji, setPickEmoji] = React.useState(false);
  const [tempScore, setTempScore] = React.useState(String(team.score));

  React.useEffect(() => {
    if (team.score !== prevScore.current) {
      const el = scoreRef.current;
      if (el) {
        el.classList.remove('pop','shake');
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

  const update = (patch) => onChange({ ...team, ...patch });
  const setScore = (n) => {
    const clamped = Math.max(0, Math.min(9999, Math.round(n)));
    update({ score: clamped });
  };
  const bump = (n) => setScore(team.score + n);

  const sliderMax = t.maxScale;
  const sliderMin = 0;
  const sliderVal = Math.max(sliderMin, Math.min(sliderMax, team.score));
  const pct = ((sliderVal - sliderMin) / (sliderMax - sliderMin)) * 100;

  const sB = t.stepBig;
  const sS = t.stepSmall;
  const big = t.bigButtons === 'big';

  return (
    <div ref={cardRef} className={'card' + (isLeader && t.showCrown ? ' leader-glow' : '')}
         style={{ '--c1': team.color }} data-screen-label={`Team ${team.name}`}>
      <div className="accent"></div>

      {/* header row */}
      <div className="row" style={{ position: 'relative', zIndex: 10, gap: 10 }}>
        <button className="btn-tactile" onClick={() => setPickEmoji((v) => !v)}
                style={{ border: team.emoji ? 'none' : '1.5px dashed rgba(0,0,0,.2)', background: 'transparent', padding: 4, borderRadius: 12, cursor: 'pointer', width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {team.emoji
            ? <span className="emoji">{team.emoji}</span>
            : <span style={{ fontSize: 12, color: 'rgba(0,0,0,.3)', fontWeight: 700 }}>+</span>}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editingName ? (
            <input autoFocus className="team-name" value={team.name}
              onChange={(e) => update({ name: e.target.value })}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)} />
          ) : (
            <div className="team-name" onClick={() => setEditingName(true)}
                 style={{ cursor: 'text' }}>{team.name}</div>
          )}
        </div>
        {isLeader && t.showCrown && (
          <div title="In the lead!" style={{ fontSize: 24 }}>👑</div>
        )}
        <button className="iconBtn" title="Change color" onClick={() => setPickColor((v) => !v)}>
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 8, background: team.color, verticalAlign: 'middle', boxShadow: '0 0 0 2px rgba(0,0,0,.1)' }}></span>
        </button>
        <div className={'color-pop' + (pickColor ? ' open' : '')}>
          {COLORS.map((c) => (
            <button key={c.c1} style={{ background: c.c1 }} title={c.name}
                    onClick={() => { update({ color: c.c1 }); setPickColor(false); }} />
          ))}
        </div>
      </div>

      {/* emoji picker */}
      {pickEmoji && (
        <div style={{ position: 'absolute', top: 52, left: 14, zIndex: 20, padding: 8, borderRadius: 14,
                      background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,.15)',
                      display: 'grid', gridTemplateColumns: 'repeat(8, 36px)', gap: 2, width: 'max-content' }}>
          <button onClick={() => { update({ emoji: '' }); setPickEmoji(false); }}
            title="No emoji"
            style={{ border: '1.5px dashed rgba(0,0,0,.2)', background: 'transparent', fontSize: 14, color: 'rgba(0,0,0,.35)', borderRadius: 8, cursor: 'pointer', width: 36, height: 36 }}>
            ✕
          </button>
          {EMOJIS.map((e) => (
            <button key={e} onClick={() => { update({ emoji: e }); setPickEmoji(false); }}
              style={{ border: 'none', background: 'transparent', fontSize: 22, padding: 4, borderRadius: 8, cursor: 'pointer', width: 36, height: 36 }}>
              {e}
            </button>
          ))}
        </div>
      )}

      {/* score */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: 6, textAlign: 'center' }}>
        {editingScore ? (
          <input autoFocus className="num-input" type="number" value={tempScore}
                 style={{ fontSize: 'clamp(72px,9vw,120px)', color: team.color, letterSpacing: '-.04em' }}
                 onChange={(e) => setTempScore(e.target.value)}
                 onBlur={() => { setScore(Number(tempScore || 0)); setEditingScore(false); }}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') { setScore(Number(tempScore || 0)); setEditingScore(false); }
                   if (e.key === 'Escape') { setTempScore(String(team.score)); setEditingScore(false); }
                 }} />
        ) : (
          <div ref={scoreRef} className="score-big" onClick={() => { setTempScore(String(team.score)); setEditingScore(true); }}
               style={{ cursor: 'text' }} title="Tap to type">
            {team.score}
          </div>
        )}
      </div>

      {/* big +/- buttons */}
      <div className="delta-row" style={{ position: 'relative', zIndex: 2 }}>
        <button className={'deltaBtn minus btn-tactile' + (big ? ' big' : '')} onClick={() => bump(-sB)}>−{sB}</button>
        <button className={'deltaBtn plus btn-tactile' + (big ? ' big' : '')} onClick={() => bump(sB)}>+{sB}</button>
        <button className={'deltaBtn plus btn-tactile' + (big ? ' big' : '')} onClick={() => bump(sB * 5)} title={`+${sB*5} bonus!`}>+{sB*5}🎉</button>
      </div>

      {/* fine stepper */}
      <div className="stepper" style={{ position: 'relative', zIndex: 2 }}>
        <button className="stepBtn minus btn-tactile" onClick={() => bump(-sS)}>−{sS}</button>
        <div style={{ textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 13, opacity: .55, letterSpacing: '.16em', textTransform: 'uppercase' }}>
          One at a time
        </div>
        <button className="stepBtn btn-tactile" onClick={() => bump(sS)}>+{sS}</button>
      </div>

      {/* slider */}
      <div className="slider-wrap" style={{ position: 'relative', zIndex: 2 }}>
        <input type="range" className="pts-slider" min={sliderMin} max={sliderMax} step={1}
               value={sliderVal}
               style={{ '--c1': team.color, '--p': pct + '%' }}
               onChange={(e) => setScore(Number(e.target.value))} />
        <div className="slider-labels">
          <span>{sliderMin}</span><span>{Math.round(sliderMax/2)}</span><span>{sliderMax}</span>
        </div>
      </div>

      <div className="card-foot" style={{ position: 'relative', zIndex: 2 }}>
        <button className="iconBtn" onClick={() => setScore(0)} title="Reset to 0">↺ RESET</button>
        {!isOnlyTeam && (
          <button className="iconBtn" onClick={onRemove} title="Remove team"
                  style={{ color: '#c81d57' }}>✕ REMOVE</button>
        )}
      </div>
    </div>
  );
}

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
      <span className="menu-icon" aria-hidden="true">{opts.icon}</span>
      <span>{label}</span>
      {opts.right && <span className="menu-right">{opts.right}</span>}
    </button>
  );
  return (
    <div className="menu-wrap" ref={ref}>
      <button className={'pill primary btn-tactile menu-btn' + (open ? ' open' : '')}
              onClick={() => setOpen((v) => !v)} aria-label="Menu">
        <span className="menu-bars"><i></i><i></i><i></i></span>
        Menu
      </button>
      {open && (
        <div className="menu-pop" role="menu">
          {item('Add a team', onAddTeam, { icon: '➕' })}
          {item('Reset all scores', onResetAll, { icon: '↺' })}
          <div className="menu-sep"></div>
          {item(t.dark ? 'Light mode' : 'Dark mode',
                () => setTweak('dark', !t.dark),
                { icon: t.dark ? '☀️' : '🌙', keepOpen: true })}
          {item('Crown on leader',
                () => setTweak('showCrown', !t.showCrown),
                { icon: '👑', keepOpen: true, right: t.showCrown ? '✓' : '' })}
          {item('Leaderboard',
                () => setTweak('showLeaderboard', !t.showLeaderboard),
                { icon: '🏆', keepOpen: true, right: t.showLeaderboard ? '✓' : '' })}
          {item('Confetti on +points',
                () => setTweak('celebrate', !t.celebrate),
                { icon: '🎉', keepOpen: true, right: t.celebrate ? '✓' : '' })}
          <div className="menu-sep"></div>
          {item('Restore default 4 teams', onRestoreDefaults, { icon: '↩︎' })}
        </div>
      )}
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [teams, setTeams] = React.useState(loadTeams);
  const [confirmReset, setConfirmReset] = React.useState(false);

  React.useEffect(() => {
    document.body.classList.toggle('dark', !!t.dark);
  }, [t.dark]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(teams)); } catch (e) {}
  }, [teams]);

  const updateTeam = (idx, next) => {
    setTeams((prev) => prev.map((x, i) => i === idx ? next : x));
  };
  const removeTeam = (idx) => {
    setTeams((prev) => prev.filter((_, i) => i !== idx));
  };
  const addTeam = () => {
    setTeams((prev) => {
      const usedColors = new Set(prev.map((x) => x.color));
      const usedEmojis = new Set(prev.map((x) => x.emoji));
      const color = (COLORS.find((c) => !usedColors.has(c.c1)) || COLORS[prev.length % COLORS.length]).c1;
      const emoji = EMOJIS.find((e) => !usedEmojis.has(e)) || EMOJIS[prev.length % EMOJIS.length];
      const n = prev.length + 1;
      const guess = 'Year ' + (2 + n);
      return [...prev, { id: uid(), name: guess, color, emoji, score: 0 }];
    });
  };
  const resetAll = () => {
    setTeams((prev) => prev.map((x) => ({ ...x, score: 0 })));
    setConfirmReset(false);
  };

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
        <Menu t={t} setTweak={setTweak}
              onAddTeam={addTeam}
              onResetAll={() => setConfirmReset(true)}
              onRestoreDefaults={() => setTeams(defaultTeams())} />
      </header>

      <div className="grid-center"><div className="grid">
        {teams.map((team, i) => (
          <TeamCard key={team.id}
                    team={team}
                    isLeader={teams.length > 1 && team.score === max && max > 0}
                    isOnlyTeam={teams.length <= 1}
                    t={t}
                    onChange={(n) => updateTeam(i, n)}
                    onRemove={() => removeTeam(i)} />
        ))}
      </div></div>

      {/* leaderboard */}
      {t.showLeaderboard && teams.length > 1 && max > 0 && (
        <div className="leaderboard">
          <span>🏆</span>
          {sorted.slice(0, 3).map((tm, i) => (
            <React.Fragment key={tm.id}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="lb-dot" style={{ '--c1': tm.color, background: tm.color }}></span>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 56 }}>🎯</div>
            <h2>Reset every team to 0?</h2>
            <p>This sets every score back to zero. The teams themselves stay.</p>
            <div className="actions">
              <button className="cancel" onClick={() => setConfirmReset(false)}>Cancel</button>
              <button className="confirm" onClick={resetAll}>Yes, reset all</button>
            </div>
          </div>
        </div>
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Look">
          <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />
          <TweakToggle label="Crown on leader" value={t.showCrown} onChange={(v) => setTweak('showCrown', v)} />
          <TweakToggle label="Top-3 leaderboard" value={t.showLeaderboard} onChange={(v) => setTweak('showLeaderboard', v)} />
          <TweakToggle label="Confetti on +points" value={t.celebrate} onChange={(v) => setTweak('celebrate', v)} />
          <TweakRadio label="Big buttons" value={t.bigButtons}
                      options={['small','big']}
                      onChange={(v) => setTweak('bigButtons', v)} />
        </TweakSection>
        <TweakSection label="Scoring">
          <TweakNumber label="Slider max" value={t.maxScale} min={10} max={500} step={10}
                       onChange={(v) => setTweak('maxScale', v)} />
          <TweakNumber label="Main step (±)" value={t.stepBig} min={1} max={50} step={1}
                       onChange={(v) => setTweak('stepBig', v)} />
          <TweakNumber label="Fine step (±)" value={t.stepSmall} min={1} max={10} step={1}
                       onChange={(v) => setTweak('stepSmall', v)} />
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
