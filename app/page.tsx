'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, FileCode2, Link2, Menu, Moon, QrCode, Share2, Sparkles, Sun, X } from 'lucide-react'

const initialLinks = [
  { slug: 'promo-ramadan', url: 'https://tokopedia.com/indocloud-ramadan-sale', clicks: 248, date: '18 Okt 2026' },
  { slug: 'docs-api-v2', url: 'https://docs.indocloud.web.id/guides/api-v2', clicks: 96, date: '16 Okt 2026' },
  { slug: 'daftar-event', url: 'https://forms.gle/indocloud-community-event', clicks: 51, date: '12 Okt 2026' },
]

const snippets = {
  cURL: `curl -X POST https://shortlink.indocloud.web.id/api/shorten \\\n  -H "Content-Type: application/json" \\\n  -d '{"url":"https://example.com/long-url","slug":"mypage"}'`,
  Python: `import requests\n\nresponse = requests.post(\n  "https://shortlink.indocloud.web.id/api/shorten",\n  json={"url": "https://example.com/long-url"}\n)`,
  JavaScript: `const response = await fetch(\n  "https://shortlink.indocloud.web.id/api/shorten",\n  { method: "POST", headers: {\n    "Content-Type": "application/json"\n  }, body: JSON.stringify({ url }) }\n)`,
}

export default function Page() {
  const [tab, setTab] = useState<'Dashboard' | 'API Docs'>('Dashboard')
  const [longUrl, setLongUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [links, setLinks] = useState(initialLinks)
  const [result, setResult] = useState<{ slug: string; url: string } | null>(null)
  const [copied, setCopied] = useState('')
  const [snippetTab, setSnippetTab] = useState<keyof typeof snippets>('cURL')
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system')

  const cycleTheme = () => setTheme(current => current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system')
  const themeLabel = theme === 'system' ? 'System theme' : theme === 'light' ? 'Light theme' : 'Dark theme'

  const shortBase = 'https://shortlink.indocloud.web.id/'
  const previewCode = useMemo(() => alias.trim().replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase() || 'my-custom-link', [alias])
  const copy = async (value: string, key: string) => { await navigator.clipboard?.writeText(value); setCopied(key); window.setTimeout(() => setCopied(''), 1500) }
  const shorten = () => { if (!longUrl.trim()) return; const slug = previewCode; setResult({ slug, url: shortBase + slug }); setLinks([{ slug, url: longUrl.trim(), clicks: 0, date: 'Hari ini' }, ...links]) }
  const remove = (slug: string) => setLinks(links.filter(link => link.slug !== slug))

  return <div className={`shortener-shell theme-${theme}`}>
    <div className={`mobile-drawer ${showMobileNav ? 'open' : ''}`}><div className="drawer-head"><span className="brand"><span className="brand-icon"><Link2 /></span>Shortener</span><button className="icon-btn" onClick={() => setShowMobileNav(false)} aria-label="Tutup menu"><X /></button></div><nav><button className={tab === 'Dashboard' ? 'nav-active' : ''} onClick={() => { setTab('Dashboard'); setShowMobileNav(false) }}>Dashboard</button><button className={tab === 'API Docs' ? 'nav-active' : ''} onClick={() => { setTab('API Docs'); setShowMobileNav(false) }}>API Docs</button></nav></div>
    <header className="topbar"><div className="topbar-inner"><button className="menu-btn" onClick={() => setShowMobileNav(true)} aria-label="Buka menu"><Menu /></button><span className="brand"><span className="brand-icon"><Link2 /></span>Shortener</span><div className="domain-pill"><i />shortlink.indocloud.web.id</div><nav className="desktop-nav"><button className={tab === 'Dashboard' ? 'active' : ''} onClick={() => setTab('Dashboard')}>Dashboard</button><button className={tab === 'API Docs' ? 'active' : ''} onClick={() => setTab('API Docs')}>API Docs</button></nav><button className="theme-btn" onClick={cycleTheme} aria-label={`Change theme, currently ${themeLabel}`} title={themeLabel}>{theme === 'light' ? <Sun /> : theme === 'dark' ? <Moon /> : <span className="system-icon">◐</span>}</button></div></header>
    <main className="main-container">{tab === 'Dashboard' ? <>
      <section className="page-heading"><div><p className="eyebrow">URL SHORTENER</p><h1>Short links, <span>simplified.</span></h1><p>Shorten, share, and track your links from one clean workspace.</p></div><div className="status"><span />All systems operational</div></section>
      <section className="shorten-card"><div className="section-title"><div className="title-icon"><Sparkles /></div><div><h2>Create a short link</h2><p>Paste a long URL to generate your short link.</p></div></div><div className="form-grid"><label>Long URL<input value={longUrl} onChange={e => setLongUrl(e.target.value)} placeholder="https://example.com/your-long-url" type="url" /></label><label>Custom alias <small>optional</small><div className="alias-input"><span>shortlink.indocloud.web.id/</span><input value={alias} onChange={e => setAlias(e.target.value)} placeholder="mypage" /></div></label><button className="primary-btn" onClick={shorten}>Shorten URL <Link2 /></button></div>{result && <div className="result-box"><div><p>Your short link is ready</p><strong>{result.url}</strong></div><div className="result-actions"><button onClick={() => copy(result.url, 'result')}>{copied === 'result' ? <Check /> : <Copy />} {copied === 'result' ? 'Copied' : 'Copy'}</button><button onClick={() => navigator.share?.({ title: 'Short link', url: result.url })}><Share2 /> Share</button><button onClick={() => setShowQr(true)}><QrCode /> QR code</button></div></div>}</section>
      <section className="links-section"><div className="section-header"><div><p className="eyebrow">PRIVACY & SECURITY</p><h2>Your links stay private</h2></div></div><article className="link-card"><div className="link-mark"><Check /></div><div className="link-info"><strong>Private by default</strong><p>Only you can manage the links you create in this workspace. We do not publish a recent-links list or expose your destination URLs.</p><div className="link-meta"><span>Secure workspace</span><i />No public history</div></div></article></section>
    </> : <section className="docs-page"><div className="page-heading"><div><p className="eyebrow">DEVELOPER RESOURCES</p><h1>API <span>Documentation.</span></h1><p>Build short-link creation into your WhatsApp, Telegram, or internal bots.</p></div><div className="status"><FileCode2 /> REST API v1</div></div><div className="endpoint-card"><div className="endpoint-label"><span className="method">POST</span><code>/api/shorten</code></div><p>Create a short link programmatically with a single request.</p><div className="code-row"><span>Base URL</span><code>https://shortlink.indocloud.web.id</code></div><div className="code-row"><span>Content-Type</span><code>application/json</code></div></div><div className="docs-grid"><div><h2>Request body</h2><p>Send the URL you want to shorten. The slug field is optional.</p><pre>{`{\n  "url": "https://example.com/long-url",\n  "slug": "mypage"\n}`}</pre><h2 className="response-title">Response</h2><pre>{`{\n  "success": true,\n  "shortUrl": "https://shortlink.indocloud.web.id/slug",\n  "slug": "slug"\n}`}</pre></div><div><h2>Code examples</h2><div className="snippet-card"><div className="snippet-tabs">{(Object.keys(snippets) as Array<keyof typeof snippets>).map(name => <button key={name} className={snippetTab === name ? 'active' : ''} onClick={() => setSnippetTab(name)}>{name}</button>)}<button className="copy-snippet" onClick={() => copy(snippets[snippetTab], 'snippet')}>{copied === 'snippet' ? <Check /> : <Copy />}</button></div><pre>{snippets[snippetTab]}</pre></div></div></div></section>}</main>
    {showQr && <div className="modal-layer" onClick={() => setShowQr(false)}><div className="qr-modal" onClick={e => e.stopPropagation()}><button className="close-modal" onClick={() => setShowQr(false)}><X /></button><QrCode /><h2>QR code ready</h2><p>Scan to open your short link.</p><code>{result?.url}</code><div className="fake-qr">{Array.from({ length: 49 }).map((_, i) => <i key={i} />)}</div></div></div>}
    <footer><span>Shortener</span><span>Built for <b>indocloud</b></span></footer>
  </div>
}
