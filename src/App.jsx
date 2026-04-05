import React, { useState, useEffect } from 'react'

const SHARE_URL = "https://globe-bgn.vercel.app"

const COUNTRIES = {
  "Europa de Vest": ["Andorra","Anglia","Austria","Belgia","Elvetia","Franta","Germania","Irlanda de Nord","Luxemburg","Monaco","Olanda","Scotia","Tara Galilor"],
  "Europa de Nord": ["Danemarca","Estonia","Finlanda","Irlanda","Islanda","Letonia","Lituania","Norvegia","Suedia"],
  "Europa de Sud": ["Albania","Bosnia si Hertegovina","Cipru","Croatia","Grecia","Italia","Malta","Muntenegru","Macedonia de Nord","Portugalia","Serbia","Slovenia","Spania","Vatican"],
  "Europa de Est": ["Bulgaria","Cehia","Moldova","Polonia","Romania","Rusia","Slovacia","Ungaria"],
  "Turcia & Caucaz": ["Armenia","Azerbaijan","Georgia","Turcia"],
  "Orientul Mijlociu": ["Arabia Saudita","Bahrain","Emiratele Arabe Unite","Iordania","Iran","Israel","Kuwait","Liban","Oman","Qatar"],
  "Asia Centrala": ["Kazahstan","Uzbekistan"],
  "Asia de Sud": ["Bangladesh","India","Maldive","Nepal","Sri Lanka"],
  "Asia de Est": ["China","Coreea de Sud","Japonia","Mongolia","Taiwan"],
  "Asia de Sud-Est": ["Cambodgia","Filipine","Indonezia","Laos","Malaysia","Singapore","Thailanda","Vietnam"],
  "Africa de Nord": ["Algeria","Egipt","Maroc","Tunisia"],
  "Africa Subsahariana": ["Africa de Sud","Botswana","Coasta de Fildes","Etiopia","Ghana","Kenya","Mauritius","Namibia","Nigeria","Rwanda","Seychelles","Tanzania","Uganda"],
  "America de Nord": ["Canada","Mexic","SUA"],
  "America Centrala & Caraibe": ["Costa Rica","Cuba","Jamaica","Panama","Republica Dominicana"],
  "America de Sud": ["Argentina","Brazilia","Chile","Columbia","Ecuador","Peru","Uruguay","Venezuela"],
  "Oceania": ["Australia","Fiji","Noua Zeelanda"]
}

const CONTINENTS = {
  "Europa": ["Europa de Vest","Europa de Nord","Europa de Sud","Europa de Est"],
  "Asia": ["Turcia & Caucaz","Orientul Mijlociu","Asia Centrala","Asia de Sud","Asia de Est","Asia de Sud-Est"],
  "Africa": ["Africa de Nord","Africa Subsahariana"],
  "America de Nord & Centrala": ["America de Nord","America Centrala & Caraibe"],
  "America de Sud": ["America de Sud"],
  "Oceania": ["Oceania"]
}

const TOTAL = Object.values(COUNTRIES).flat().length

function getTitle(n) {
  if (n === 0) return { title: "Canapea Explorer" }
  if (n <= 3) return { title: "Debutant" }
  if (n <= 7) return { title: "Calator Curios" }
  if (n <= 15) return { title: "Explorer" }
  if (n <= 25) return { title: "Aventurier" }
  if (n <= 40) return { title: "Globetrotter" }
  if (n <= 60) return { title: "Marco Polo" }
  if (n <= 80) return { title: "Magellan" }
  if (n <= 100) return { title: "World Dominator" }
  return { title: "Legenda" }
}

function CountryRow({ country, isChecked, onToggle }) {
  return (
    <div
      onClick={() => onToggle(country)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '12px 16px', background: isChecked ? 'rgba(168,85,247,0.08)' : 'transparent',
        border: 'none', cursor: 'pointer', transition: 'background 0.15s'
      }}
    >
      <span
        style={{
          width: 24, height: 24, borderRadius: 6,
          border: isChecked ? 'none' : '2px solid rgba(255,255,255,0.15)',
          background: isChecked ? 'linear-gradient(135deg, #a855f7, #3b82f6)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', flexShrink: 0
        }}
      >
        {isChecked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span style={{ fontSize: 16, color: isChecked ? '#fff' : '#a0a4b8', fontWeight: 500 }}>{country}</span>
    </div>
  )
}

export default function App() {
  const [checked, setChecked] = useState({})
  const [expanded, setExpanded] = useState({})
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState("")
  const [started, setStarted] = useState(false)
  const [shareImg, setShareImg] = useState(null)

  useEffect(() => { setMounted(true) }, [])

  const toggleCountry = (c) => {
    setChecked(prev => {
      const next = { ...prev }
      if (next[c]) delete next[c]
      else next[c] = true
      return next
    })
  }
  const toggleRegion = (r) => setExpanded(prev => ({ ...prev, [r]: !prev[r] }))

  const count = Object.keys(checked).length
  const pct = TOTAL > 0 ? count / TOTAL * 100 : 0
  const badge = getTitle(count)

  const summary = () => Object.entries(COUNTRIES)
    .map(([region, list]) => ({ region, count: list.filter(c => checked[c]).length, total: list.length }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)

  const makeShareCanvas = () => {
    const stats = summary()
    const W = 640, H = 560 + stats.length * 58
    const canvas = document.createElement('canvas')
    canvas.width = W * 2; canvas.height = H * 2
    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)
    const grad = ctx.createLinearGradient(0, 0, W * .6, H)
    grad.addColorStop(0, '#0a0a15')
    grad.addColorStop(.3, '#1a0f2e')
    grad.addColorStop(.55, '#2d1b4e')
    grad.addColorStop(.8, '#1e3a8a')
    grad.addColorStop(1, '#0f172a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
    const FF = "'DM Sans', sans-serif"
    ctx.textAlign = 'center'
    ctx.fillStyle = '#fff'
    if (name.trim()) {
      ctx.font = `800 26px ${FF}`
      ctx.fillText(name.trim(), W / 2, 44)
    }
    ctx.font = `700 20px ${FF}`
    ctx.fillText("GLOBE 40BY40", W / 2, name.trim() ? 78 : 50)
    const lineY = name.trim() ? 92 : 64
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(W / 2 - 80, lineY); ctx.lineTo(W / 2 + 80, lineY); ctx.stroke()
    ctx.font = `900 152px ${FF}`
    ctx.shadowColor = 'rgba(168,85,247,0.5)'
    ctx.shadowBlur = 24
    ctx.fillText(`${count}`, W / 2, name.trim() ? 233 : 205)
    ctx.shadowBlur = 0
    ctx.font = `600 22px ${FF}`
    ctx.fillText(`tari vizitate din ${TOTAL}`, W / 2, name.trim() ? 270 : 242)
    const barX = 80, barY = name.trim() ? 300 : 272, barW = W - 160, barH = 8
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 4); ctx.fill()
    ctx.fillStyle = '#a855f7'
    ctx.beginPath(); ctx.roundRect(barX, barY, Math.max(barW * pct / 100, 8), barH, 4); ctx.fill()
    ctx.font = `800 16px ${FF}`
    ctx.textAlign = 'right'
    ctx.fillText(`${pct.toFixed(1)}%`, W - 80, barY + 6)
    ctx.textAlign = 'center'
    let yy = name.trim() ? 352 : 324
    if (stats.length > 0) {
      ctx.font = `800 16px ${FF}`
      ctx.fillText("DEFALCARE PE REGIUNI", W / 2, yy)
      yy += 32
      stats.forEach(s => {
        ctx.fillStyle = 'rgba(255,255,255,0.05)'
        ctx.beginPath(); ctx.roundRect(70, yy - 22, W - 140, 48, 14); ctx.fill()
        ctx.strokeStyle = 'rgba(168,85,247,0.12)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.roundRect(70, yy - 22, W - 140, 48, 14); ctx.stroke()
        ctx.textAlign = 'left'
        ctx.font = `700 20px ${FF}`
        ctx.fillStyle = '#fff'
        ctx.fillText(s.region, 92, yy + 8)
        ctx.textAlign = 'right'
        ctx.font = `800 20px ${FF}`
        ctx.fillStyle = '#a855f7'
        ctx.fillText(`${s.count}/${s.total}`, W - 92, yy + 8)
        ctx.textAlign = 'center'
        yy += 58
      })
    }
    const btnW = 280, btnH = 52, btnX = (W - btnW) / 2, btnY = H - 88
    ctx.fillStyle = '#a855f7'
    ctx.beginPath(); ctx.roundRect(btnX, btnY, btnW, btnH, 26); ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `800 20px ${FF}`
    ctx.fillText(badge.title.toUpperCase(), W / 2, btnY + 33)
    ctx.font = `500 16px ${FF}`
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText(SHARE_URL, W / 2, H - 16)
    return canvas.toDataURL('image/png')
  }

  const showShare = () => setShareImg(makeShareCanvas())
  const doShare = async () => {
    const img = shareImg || makeShareCanvas()
    if (!shareImg) setShareImg(img)
    try {
      const blob = await (await fetch(img)).blob()
      const file = new File([blob], 'globe-40by40.png', { type: 'image/png' })
      const text = `${name.trim() ? name.trim() + ' a' : 'Am'} vizitat ${count} tari din ${TOTAL}! Tu cate ai vizitat? ${SHARE_URL}`
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Globe 40by40', text })
      } else if (navigator.share) {
        await navigator.share({ title: 'Globe 40by40', text, url: SHARE_URL })
      }
    } catch { }
  }
  const start = () => setStarted(true)

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a15, #1a0f2e, #2d1b4e)', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 18, opacity: .6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Se incarca...
      </div>
    )
  }

  if (!started) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a15, #1a0f2e, #2d1b4e)', color: '#fff', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>Globe40by40</div>
        <div style={{ fontSize: 16, color: '#a0a4b8', marginBottom: 24 }}>Bifeaza tarile in care ai fost</div>
        <input
          type="text"
          placeholder={`Prenume: de ex "Ana"`}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') start() }}
          style={{ width: '100%', maxWidth: 320, padding: '14px 18px', fontSize: 18, outline: 'none', boxSizing: 'border-box', fontWeight: 500, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontFamily: 'inherit' }}
        />
        <style>{`input::placeholder { color: rgba(255,255,255,0.28) !important; font-weight: 400 !important; }`}</style>
        <button
          onClick={start}
          style={{ marginTop: 16, width: '100%', maxWidth: 320, padding: '14px 18px', fontSize: 17, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'inherit' }}
        >
          Incepe
        </button>
        <div style={{ fontSize: 13, color: '#a0a4b8', marginTop: 12 }}>Poti lasa si gol</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a15, #1a0f2e, #2d1b4e)', color: '#fff', fontFamily: "'DM Sans', sans-serif", paddingBottom: 80 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,21,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 20px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{count}</div>
                <div style={{ fontSize: 14, color: '#a0a4b8' }}>din {TOTAL}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {name.trim() && <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{name.trim()}</div>}
              <div style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 20, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: '#a855f7' }}>{badge.title}</div>
            </div>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: 'linear-gradient(90deg, #a855f7, #3b82f6)', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {shareImg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <button onClick={() => setShareImg(null)} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>×</button>
          <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <img src={shareImg} alt="Globe 40by40" style={{ width: '100%', borderRadius: 16, boxShadow: '0 8px 40px rgba(168,85,247,0.3)' }} />
            <button onClick={doShare} style={{ marginTop: 16, width: '100%', padding: '16px 20px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share
            </button>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>Apasa pentru a salva sau trimite imaginea</div>
          </div>
        </div>
      )}

      <div style={{ padding: '12px 20px', margin: '0 auto', maxWidth: 600, letterSpacing: '0.02em', fontWeight: 500 }}>Bifeaza tarile in care ai fost</div>

      <div style={{ padding: '0 20px', maxWidth: 600, margin: '0 auto' }}>
        {Object.entries(CONTINENTS).map(([continent, regions]) => (
          <div key={continent} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#a0a4b8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>{continent}</div>
            {regions.map(region => {
              const list = COUNTRIES[region]
              const countR = list.filter(c => checked[c]).length
              const open = expanded[region]
              return (
                <div key={region} style={{ marginBottom: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 14, overflow: 'hidden' }}>
                  <div onClick={() => toggleRegion(region)} style={{ width: '100%', padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 17, fontWeight: 600 }}>{region}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: countR > 0 ? '#a855f7' : '#555a6e', background: countR > 0 ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: 10 }}>{countR}/{list.length}</div>
                      <div style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</div>
                    </div>
                  </div>
                  {open && (
                    <div>
                      {list.map(c => (
                        <CountryRow key={c} country={c} isChecked={!!checked[c]} onToggle={toggleCountry} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {count > 0 && (
        <div style={{ position: 'fixed', bottom: 20, left: 20, right: 20, display: 'flex', justifyContent: 'center' }}>
          <button onClick={showShare} style={{ width: '100%', maxWidth: 600, padding: '16px 20px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', color: '#fff', fontSize: 17, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 32px rgba(168,85,247,0.4)' }}>
            Share cu prietenii
          </button>
        </div>
      )}
    </div>
  )
}
