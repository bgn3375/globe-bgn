import React, { useState, useEffect } from 'react'
import { geoEqualEarth, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'

const SHARE_URL = "40by40.bgn.ro"

// Mapare nume RO -> coduri ISO 3166-1 numerice (folosite de world-atlas)
// UK (826) acopera Anglia, Scotia, Tara Galilor, Irlanda de Nord
const ISO_CODES = {
  "Andorra": "020", "Anglia": "826", "Austria": "040", "Belgia": "056", "Elvetia": "756",
  "Franta": "250", "Germania": "276", "Irlanda de Nord": "826", "Luxemburg": "442",
  "Monaco": "492", "Olanda": "528", "Scotia": "826", "Tara Galilor": "826",
  "Danemarca": "208", "Estonia": "233", "Finlanda": "246", "Irlanda": "372",
  "Islanda": "352", "Letonia": "428", "Lituania": "440", "Norvegia": "578", "Suedia": "752",
  "Albania": "008", "Bosnia si Hertegovina": "070", "Cipru": "196", "Croatia": "191",
  "Grecia": "300", "Italia": "380", "Malta": "470", "Muntenegru": "499",
  "Macedonia de Nord": "807", "Portugalia": "620", "Serbia": "688", "Slovenia": "705",
  "Spania": "724", "Vatican": "336",
  "Bulgaria": "100", "Cehia": "203", "Moldova": "498", "Polonia": "616",
  "Romania": "642", "Rusia": "643", "Slovacia": "703", "Ungaria": "348",
  "Armenia": "051", "Azerbaijan": "031", "Georgia": "268", "Turcia": "792",
  "Arabia Saudita": "682", "Bahrain": "048", "Emiratele Arabe Unite": "784",
  "Iordania": "400", "Iran": "364", "Israel": "376", "Kuwait": "414",
  "Liban": "422", "Oman": "512", "Qatar": "634",
  "Kazahstan": "398", "Uzbekistan": "860",
  "Bangladesh": "050", "India": "356", "Maldive": "462", "Nepal": "524", "Sri Lanka": "144",
  "China": "156", "Coreea de Sud": "410", "Japonia": "392", "Mongolia": "496", "Taiwan": "158",
  "Cambodgia": "116", "Filipine": "608", "Indonezia": "360", "Laos": "418",
  "Malaysia": "458", "Singapore": "702", "Thailanda": "764", "Vietnam": "704",
  "Algeria": "012", "Egipt": "818", "Maroc": "504", "Tunisia": "788",
  "Africa de Sud": "710", "Botswana": "072", "Coasta de Fildes": "384", "Etiopia": "231",
  "Ghana": "288", "Kenya": "404", "Mauritius": "480", "Namibia": "516", "Nigeria": "566",
  "Rwanda": "646", "Seychelles": "690", "Tanzania": "834", "Uganda": "800",
  "Canada": "124", "Mexic": "484", "SUA": "840",
  "Costa Rica": "188", "Cuba": "192", "Jamaica": "388", "Panama": "591", "Republica Dominicana": "214",
  "Argentina": "032", "Brazilia": "076", "Chile": "152", "Columbia": "170",
  "Ecuador": "218", "Peru": "604", "Uruguay": "858", "Venezuela": "862",
  "Australia": "036", "Fiji": "242", "Noua Zeelanda": "554"
}

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
        padding: '12px 16px', marginBottom: 4, background: isChecked ? 'rgba(168,85,247,0.08)' : 'transparent',
        border: 'none', cursor: 'pointer', transition: 'background 0.15s'
      }}
    >
      <span
        style={{
          width: 26, height: 26, borderRadius: 6,
          border: isChecked ? 'none' : '2px solid rgba(255,255,255,0.15)',
          background: isChecked ? 'linear-gradient(135deg, #a855f7, #3b82f6)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', flexShrink: 0
        }}
      >
        {isChecked && (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span style={{ fontSize: 18, color: isChecked ? '#fff' : '#a0a4b8', fontWeight: 500 }}>{country}</span>
    </div>
  )
}

export default function App() {
  const [checked, setChecked] = useState({})
  const [expanded, setExpanded] = useState(() => Object.fromEntries(Object.keys(COUNTRIES).map(r => [r, true])))
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState("")
  const [started, setStarted] = useState(false)
  const [shareImg, setShareImg] = useState(null)
  const [worldData, setWorldData] = useState(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    // Incarcam topojson cu tarile lumii (50m = include micro-state ca Monaco, Vatican, Singapore)
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
      .then(r => r.json())
      .then(topo => {
        const geo = feature(topo, topo.objects.countries)
        setWorldData(geo)
      })
      .catch(() => { /* silent fail, cardul ramane fara harta */ })
  }, [])

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

  const summary = () => Object.entries(CONTINENTS)
    .map(([continent, regions]) => {
      const allCountries = regions.flatMap(r => COUNTRIES[r])
      return { region: continent, count: allCountries.filter(c => checked[c]).length, total: allCountries.length }
    })
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)

  const makeShareCanvas = () => {
    const stats = summary()
    const FF = "'DM Sans', sans-serif"
    const W = 640
    const MAP_H = 320
    const STATS_TOP = 300 + MAP_H + 20
    const H = STATS_TOP + stats.length * 54 + 90

    const canvas = document.createElement('canvas')
    canvas.width = W * 2; canvas.height = H * 2
    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)
    // Lovable-style bright gradient: indigo -> pink -> orange
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#6366f1')
    grad.addColorStop(.25, '#a855f7')
    grad.addColorStop(.5, '#ec4899')
    grad.addColorStop(.75, '#f43f5e')
    grad.addColorStop(1, '#f97316')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
    // Radial glow top-center pentru luminozitate extra
    const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.9)
    glow.addColorStop(0, 'rgba(255,255,255,0.35)')
    glow.addColorStop(0.4, 'rgba(255,255,255,0.08)')
    glow.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)

    // Deseneaza harta lumii full-width
    if (worldData) {
      const visitedIds = new Set(
        Object.keys(checked).map(name => ISO_CODES[name]).filter(Boolean)
      )
      const mapTop = 290
      const mapBottom = mapTop + MAP_H
      const projection = geoEqualEarth().fitExtent([[4, mapTop], [W - 4, mapBottom]], worldData)
      const path = geoPath(projection, ctx)

      worldData.features.forEach(f => {
        const id = String(f.id).padStart(3, '0')
        if (visitedIds.has(id)) return
        ctx.beginPath()
        path(f)
        ctx.fillStyle = 'rgba(255,255,255,0.22)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      })
      worldData.features.forEach(f => {
        const id = String(f.id).padStart(3, '0')
        if (!visitedIds.has(id)) return
        ctx.beginPath()
        path(f)
        ctx.fillStyle = 'rgba(16,185,129,0.92)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(236,253,245,1)'
        ctx.lineWidth = 0.9
        ctx.stroke()
      })
    }

    // 1. Rand: nume + badge inline (centrate impreuna)
    const nameText = name.trim()
    const badgeText = badge.title.toUpperCase()
    ctx.font = `800 26px ${FF}`
    const nameW = nameText ? ctx.measureText(nameText).width : 0
    ctx.font = `800 15px ${FF}`
    const badgeTextW = ctx.measureText(badgeText).width
    const badgePadX = 16, badgeH = 32
    const badgeW = badgeTextW + badgePadX * 2
    const gap = nameText ? 14 : 0
    const rowW = nameW + gap + badgeW
    const rowStartX = (W - rowW) / 2
    const rowCenterY = 56

    if (nameText) {
      ctx.textAlign = 'left'
      ctx.fillStyle = '#fff'
      ctx.font = `800 26px ${FF}`
      ctx.textBaseline = 'middle'
      ctx.fillText(nameText, rowStartX, rowCenterY)
    }
    const badgeX = rowStartX + nameW + gap
    const badgeY = rowCenterY - badgeH / 2
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.font = `800 15px ${FF}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(badgeText, badgeX + badgeW / 2, rowCenterY + 1)
    ctx.textBaseline = 'alphabetic'

    // 2. Numarul mare
    ctx.textAlign = 'center'
    ctx.font = `900 142px ${FF}`
    ctx.shadowColor = 'rgba(30,27,75,0.35)'
    ctx.shadowBlur = 28
    ctx.fillStyle = '#fff'
    ctx.fillText(`${count}`, W / 2, 218)
    ctx.shadowBlur = 0

    // 3. Subtitlu
    ctx.font = `600 22px ${FF}`
    ctx.fillStyle = 'rgba(255,255,255,1)'
    ctx.fillText('tari vizitate', W / 2, 252)

    // 4. Lista de continente (dupa harta)
    let yy = STATS_TOP
    stats.forEach(s => {
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.beginPath(); ctx.roundRect(60, yy - 22, W - 120, 46, 14); ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.roundRect(60, yy - 22, W - 120, 46, 14); ctx.stroke()
      ctx.textAlign = 'left'
      ctx.font = `700 21px ${FF}`
      ctx.fillStyle = '#fff'
      ctx.fillText(s.region, 80, yy + 7)
      ctx.textAlign = 'right'
      ctx.font = `800 21px ${FF}`
      ctx.fillStyle = '#fff'
      ctx.fillText(`${s.count}`, W - 80, yy + 7)
      yy += 54
    })

    // 5. Footer: 40BY40 + URL
    ctx.textAlign = 'center'
    ctx.font = `800 32px ${FF}`
    ctx.fillStyle = '#fff'
    ctx.fillText('40BY40', W / 2, H - 48)
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(W / 2 - 80, H - 34); ctx.lineTo(W / 2 + 80, H - 34); ctx.stroke()
    ctx.font = `500 15px ${FF}`
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillText(SHARE_URL, W / 2, H - 14)

    return canvas.toDataURL('image/png')
  }

  const showShare = () => setShareImg(makeShareCanvas())
  const doShare = async () => {
    const img = shareImg || makeShareCanvas()
    if (!shareImg) setShareImg(img)
    const text = `${name.trim() ? name.trim() + ' a' : 'Am'} vizitat ${count} tari! Tu cate ai vizitat? ${SHARE_URL}`
    // Incearca Web Share API cu imagine (pe mobil functioneaza catre WhatsApp)
    try {
      const blob = await (await fetch(img)).blob()
      const file = new File([blob], 'globe-40by40.png', { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '40by40', text })
        return
      }
    } catch { }
    // Fallback: deschide WhatsApp direct
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
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
            <button onClick={doShare} style={{ marginTop: 16, width: '100%', padding: '16px 20px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 25%, #ec4899 55%, #f97316 100%)', color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 32px rgba(236,72,153,0.35)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </button>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>Apasa pentru a trimite pe WhatsApp</div>
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
