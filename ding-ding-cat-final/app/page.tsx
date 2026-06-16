'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FESTIVALS = [
  { id: 'lunar',     label: '🧧 Lunar New Year', color: '#ef4444', glow: '#ef444433', dot: '#fca5a5',
    hint: 'Red envelopes, lanterns, gold coins & fireworks',
    desc: 'Lunar New Year with red lanterns, gold coins, fireworks, lucky symbols',
    picks: [
      { label: '🏮 Lantern dance',    prompt: 'dancing with red lanterns and firecrackers' },
      { label: '🧧 Red envelope',     prompt: 'holding a lucky red envelope, happy and excited' },
      { label: '🐉 Lucky dragon',     prompt: 'riding on a golden lucky dragon' },
      { label: '🎆 Fireworks',        prompt: 'watching fireworks in the night sky' },
      { label: '🍡 Tangyuan',         prompt: 'eating tangyuan rice balls' },
      { label: '👘 Traditional dress', prompt: 'wearing a traditional cheongsam dress' },
    ],
  },
  { id: 'christmas', label: '🎄 Christmas',       color: '#22c55e', glow: '#22c55e33', dot: '#86efac',
    hint: 'Christmas trees, santa hat, snow & presents',
    desc: 'Christmas with Christmas tree, santa hat, snow, presents, reindeer',
    picks: [
      { label: '🎅 Santa hat',    prompt: 'wearing a fluffy santa hat, merry and jolly' },
      { label: '🎁 Gift opening', prompt: 'excitedly unwrapping a big Christmas present' },
      { label: '⛄ Snowman',       prompt: 'building a snowman in a snowy field' },
      { label: '🦌 Reindeer',     prompt: 'riding Rudolph the red-nosed reindeer' },
      { label: '🍪 Cookies',      prompt: 'baking Christmas cookies wearing a chef hat' },
      { label: '🎶 Caroling',     prompt: 'singing Christmas carols with a tiny songbook' },
    ],
  },
  { id: 'halloween', label: '🎃 Halloween',       color: '#f97316', glow: '#f9731633', dot: '#fdba74',
    hint: 'Pumpkins, witch hats, bats & spooky night',
    desc: 'Halloween with jack-o-lantern, witch hat, bats, spooky dark night, moon',
    picks: [
      { label: '🎃 Jack-o-lantern', prompt: 'sitting inside a glowing jack-o-lantern' },
      { label: '🧙 Witch hat',      prompt: 'wearing a pointy witch hat casting a magic spell' },
      { label: '🦇 Bat wings',      prompt: 'flying with tiny bat wings under a full moon' },
      { label: '👻 Ghost',          prompt: 'dressed as a tiny cute ghost saying boo' },
      { label: '🕷 Spider web',     prompt: 'tangled in a spooky spider web, scared face' },
      { label: '🍬 Trick or treat', prompt: 'holding a candy bucket, trick or treating' },
    ],
  },
  { id: 'valentine', label: '💝 Valentine',       color: '#ec4899', glow: '#ec489933', dot: '#f9a8d4',
    hint: 'Hearts, roses, love letters & romance',
    desc: 'Valentine with hearts, roses, love letters, cupid arrow, romantic',
    picks: [
      { label: '💌 Love letter', prompt: 'writing a love letter with a tiny quill pen' },
      { label: '🌹 Roses',       prompt: 'holding a big bouquet of red roses' },
      { label: '💘 Cupid',       prompt: 'hit by a cupid arrow with heart eyes' },
      { label: '🍫 Chocolates',  prompt: 'presenting a heart-shaped chocolate box' },
      { label: '🥂 Cheers',      prompt: 'toasting with tiny champagne glasses' },
      { label: '💕 Love cloud',  prompt: 'floating on a pink cloud surrounded by hearts' },
    ],
  },
  { id: 'easter',    label: '🐣 Easter',          color: '#a78bfa', glow: '#a78bfa33', dot: '#c4b5fd',
    hint: 'Easter eggs, bunny ears, spring flowers & pastels',
    desc: 'Easter with colorful Easter eggs, bunny ears, spring flowers, pastel colors',
    picks: [
      { label: '🥚 Easter egg',    prompt: 'decorating a giant colorful Easter egg' },
      { label: '🐰 Bunny ears',    prompt: 'wearing fluffy white bunny ears, nose twitching' },
      { label: '🌸 Spring flowers', prompt: 'sitting in a field of cherry blossoms' },
      { label: '🐤 Baby chick',    prompt: 'cuddling a tiny newly hatched baby chick' },
      { label: '🍭 Candy hunt',    prompt: 'finding hidden Easter candies in the grass' },
      { label: '🌈 Rainbow',       prompt: 'hopping over a pastel rainbow' },
    ],
  },
];

const LOADING_MSGS = [
  'Ding Ding is posing...',
  'Adding festival magic...',
  'Painting whiskers...',
  'Almost ready, meow!',
];

export default function Home() {
  const [festival, setFestival] = useState(FESTIVALS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectFestival = (f: typeof FESTIVALS[0]) => {
    setFestival(f);
    setDropdownOpen(false);
    setImage(null);
    setError(null);
    setPrompt('');
  };

  const generate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;
    setLoading(true);
    setError(null);
    setImage(null);
    setLoadingMsg(LOADING_MSGS[0]);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i = (i + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[i]);
    }, 1800);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, festival: festival.label, festivalDesc: festival.desc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setImage(data.image);
    } catch (err: any) {
      setError(err.message || 'Something went wrong!');
    } finally {
      setLoading(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const download = () => {
    if (!image) return;
    const a = document.createElement('a');
    a.href = image;
    a.download = `ding-ding-cat-${festival.id}-${Date.now()}.png`;
    a.click();
  };

  const reset = () => { setImage(null); setPrompt(''); setError(null); };
  const f = festival;

  return (
    <main style={{ minHeight: '100vh', background: '#111', padding: '40px 16px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
            🐱 Ding Ding Cat Sticker Generator
          </h1>
          <p style={{ fontSize: 13, color: '#555' }}>Describe a cat sticker and let AI bring it to life</p>
        </div>

        {/* Festival Dropdown */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Festival style
          </p>
          <div style={{ position: 'relative' }}>
            {/* Trigger button */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: '100%', height: 48, background: '#1e1e1e',
                border: `1.5px solid ${dropdownOpen ? f.color : '#2e2e2e'}`,
                borderRadius: dropdownOpen ? '10px 10px 0 0' : 10,
                padding: '0 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.18s',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{f.label}</span>
              <span style={{ color: '#555', fontSize: 12, transition: 'transform 0.2s', display: 'inline-block', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </button>

            {/* Dropdown list */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: '#1a1a1a', border: `1.5px solid ${f.color}`,
                    borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden',
                  }}
                >
                  {FESTIVALS.map((fest, idx) => (
                    <button
                      key={fest.id}
                      onClick={() => selectFestival(fest)}
                      style={{
                        width: '100%', padding: '13px 16px',
                        background: fest.id === f.id ? fest.color + '22' : 'transparent',
                        border: 'none',
                        borderBottom: idx < FESTIVALS.length - 1 ? '1px solid #2a2a2a' : 'none',
                        cursor: 'pointer', textAlign: 'left',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = fest.color + '22')}
                      onMouseLeave={e => (e.currentTarget.style.background = fest.id === f.id ? fest.color + '22' : 'transparent')}
                    >
                      <span style={{ fontSize: 14, fontWeight: fest.id === f.id ? 600 : 400, color: fest.id === f.id ? fest.color : '#ccc' }}>
                        {fest.label}
                      </span>
                      {fest.id === f.id && <span style={{ color: f.color, fontSize: 13 }}>✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Festival hint */}
        <div style={{
          fontSize: 12, padding: '8px 14px', borderRadius: 8,
          background: `${f.color}18`, color: f.dot, border: `1px solid ${f.color}33`,
        }}>
          ✨ {f.hint}
        </div>

        {/* Prompt input */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Describe your sticker
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && generate()}
              placeholder={`e.g. ${f.picks[0].prompt.slice(0, 38)}...`}
              disabled={loading}
              onClick={() => setDropdownOpen(false)}
              style={{
                flex: 1, height: 48, background: '#1e1e1e',
                border: '1.5px solid #2e2e2e', borderRadius: 10,
                padding: '0 16px', fontSize: 13, color: '#fff',
                outline: 'none',
              }}
            />
            <button
              onClick={() => { setDropdownOpen(false); generate(); }}
              disabled={loading || !prompt.trim()}
              style={{
                height: 48, padding: '0 20px', borderRadius: 10, border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: f.color, color: '#fff',
                boxShadow: `0 0 18px ${f.glow}`,
                opacity: loading || !prompt.trim() ? 0.4 : 1,
                display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
              }}
            >
              {loading ? '⏳' : '✦'} Generate
            </button>
          </div>
        </div>

        {/* Quick picks */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Quick picks
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {f.picks.map((q) => (
              <button
                key={q.label}
                onClick={() => { setDropdownOpen(false); setPrompt(q.prompt); generate(q.prompt); }}
                disabled={loading}
                style={{
                  padding: '5px 12px', borderRadius: 20,
                  border: '1px solid #2a2a2a', background: '#1a1a1a',
                  color: '#666', fontSize: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                  opacity: loading ? 0.4 : 1,
                }}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div
          onClick={() => setDropdownOpen(false)}
          style={{
            background: '#1a1a1a',
            border: `1.5px solid ${image || loading ? f.color + '55' : '#2a2a2a'}`,
            borderRadius: image ? '14px 14px 0 0' : 14,
            minHeight: 260,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 24, textAlign: 'center',
            transition: 'border-color 0.35s',
          }}
        >
          <AnimatePresence mode="wait">
            {!loading && !image && !error && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 38, opacity: 0.18 }}>🐾</span>
                <p style={{ fontSize: 13, color: '#3a3a3a' }}>Your sticker will appear here</p>
              </motion.div>
            )}
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 0.55 }} style={{ fontSize: 50 }}>
                  🐱
                </motion.div>
                <p style={{ fontSize: 13, fontWeight: 500, color: f.dot }}>{loadingMsg}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i}
                      animate={{ scale: [1, 1.7, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                      style={{ width: 7, height: 7, borderRadius: '50%', background: f.dot }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            {error && !loading && (
              <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 32 }}>😿</span>
                <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>
                <button onClick={reset} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: 12 }}>
                  Try again
                </button>
              </motion.div>
            )}
            {image && !loading && (
              <motion.div key="result"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
                <img src={image} alt="Ding Ding Cat sticker" style={{ maxHeight: 260, objectFit: 'contain', borderRadius: 12 }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Download footer */}
        {image && !loading && (
          <div style={{
            display: 'flex', gap: 8,
            background: '#1a1a1a',
            border: `1.5px solid ${f.color}55`,
            borderTop: '1px solid #2a2a2a',
            borderRadius: '0 0 14px 14px',
            padding: '12px 16px',
            marginTop: -20,
          }}>
            <button onClick={download} style={{
              flex: 1, height: 42, borderRadius: 10, border: 'none',
              background: f.color, color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: `0 0 12px ${f.glow}`,
            }}>
              ↓ Download sticker
            </button>
            <button onClick={reset} style={{
              padding: '0 16px', height: 42, borderRadius: 10,
              border: '1.5px solid #333', background: 'transparent',
              color: '#777', fontSize: 13, cursor: 'pointer',
            }}>
              ↺ New
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: '#2a2a2a', paddingBottom: 8 }}>
          Made with 💕 by tramplus · Powered by Gemini Nano Banana 2
        </p>
      </div>
    </main>
  );
}
