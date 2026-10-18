import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Clipboard,
  ExternalLink,
  Link2,
  Moon,
  QrCode,
  Share2,
  Sun,
  WandSparkles,
  X,
} from 'lucide-react';
type Theme = 'dark' | 'light';
type ShortLink = { slug: string; target_url: string; clicks: number };

const randomSlug = () => Math.random().toString(36).slice(2, 8);

function App() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
  const [longUrl, setLongUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [shortLink, setShortLink] = useState<ShortLink | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const isRedirectPage = window.location.pathname.length > 1;
  const baseUrl = useMemo(() => window.location.origin, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isRedirectPage) return;

    const slug = window.location.pathname.slice(1).split('/')[0];
    if (!slug || slug === 'favicon.ico') return;

    const resolveLink = async () => {
      setRedirecting(true);
      const response = await fetch(`/api/links?slug=${encodeURIComponent(slug)}`);
      const data = response.ok ? await response.json() as ShortLink : null;

      if (!data) {
        setRedirecting(false);
        setNotFound(true);
        return;
      }

      const destination = data.target_url;
      try {
        const parsed = new URL(destination);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported protocol');
      } catch {
        setRedirecting(false);
        setNotFound(true);
        return;
      }

      await fetch(`/api/links?slug=${encodeURIComponent(slug)}`, { method: 'PATCH' });
      window.location.replace(destination);
    };

    void resolveLink();
  }, [isRedirectPage]);

  const fullShortUrl = shortLink ? `${baseUrl}/${shortLink.slug}` : '';

  const createShortLink = async () => {
    setError('');
    setCopied(false);
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(longUrl.trim());
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Unsupported protocol');
    } catch {
      setError('Masukkan URL lengkap yang diawali http:// atau https://.');
      return;
    }

    const cleanAlias = alias.trim().replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-');
    const slug = cleanAlias || randomSlug();
    setIsCreating(true);

    const response = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, target_url: parsedUrl.toString() }),
    });
    const data = response.ok ? await response.json() as ShortLink : null;

    setIsCreating(false);
    if (!data) {
      setError(response.status === 409 ? 'Alias itu sudah digunakan. Pilih alias lain.' : 'Link belum bisa dibuat. Coba lagi.');
      return;
    }
    setShortLink(data);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const shareLink = async () => {
    if (navigator.share) await navigator.share({ title: 'Short link', url: fullShortUrl });
    else await copyLink();
  };

  if (redirecting) {
    return <main className="redirect-screen"><div className="redirect-card"><div className="brand-mark"><Link2 size={20} /></div><p>Membuka link Anda...</p><span>Anda akan diarahkan sebentar lagi.</span></div></main>;
  }

  if (notFound) {
    return <main className="redirect-screen"><div className="redirect-card"><div className="brand-mark error-mark"><X size={20} /></div><h1>Link tidak ditemukan</h1><p>Slug ini mungkin sudah dihapus atau belum pernah dibuat.</p><a className="primary-button inline-button" href={baseUrl}>Buat short link <ArrowUpRight size={16} /></a></div></main>;
  }

  if (isRedirectPage) return null;

  return (
    <div className="app-shell">
      <header className="topbar page-width">
        <a className="brand" href="/" aria-label="Shortener home"><span className="brand-mark"><Link2 size={18} /></span><span>Shortener</span></a>
        <div className="top-actions">
          <span className="host-pill"><i /> shortlink.indocloud.web.id</span>
          <span className="nav-link active">Dashboard</span>
          <span className="nav-link">API Docs</span>
          <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Ubah tema">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="page-width main-content">
        <section className="hero-row">
          <div><p className="eyebrow">URL SHORTENER</p><h1>Short links, <em>simplified.</em></h1><p className="hero-copy">Pendekkan, bagikan, dan kelola link Anda dari satu ruang kerja yang rapi.</p></div>
          <div className="status-pill"><span /> All systems operational</div>
        </section>

        <section className="create-card">
          <div className="card-heading"><span className="feature-icon"><WandSparkles size={19} /></span><div><h2>Create a short link</h2><p>Paste a long URL to generate your short link.</p></div></div>
          <div className="form-grid">
            <label>Long URL<input value={longUrl} onChange={(event) => setLongUrl(event.target.value)} placeholder="https://example.com/your-long-url" type="url" /></label>
            <label>Custom alias <small>optional</small><div className="alias-input"><span>shortlink.indocloud.web.id/</span><input value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="mypage" /></div></label>
            <button className="primary-button create-button" onClick={createShortLink} disabled={isCreating}>{isCreating ? 'Creating...' : <>Shorten URL <Link2 size={16} /></>}</button>
          </div>
          {error && <p className="form-error">{error}</p>}
          {shortLink && <div className="result-card"><div><p className="result-label">Your short link is ready</p><a className="result-url" href={fullShortUrl}>{fullShortUrl}</a></div><div className="result-actions"><button onClick={copyLink}>{copied ? <Check size={17} /> : <Clipboard size={17} />} {copied ? 'Copied' : 'Copy'}</button><button onClick={shareLink}><Share2 size={17} /> Share</button><button onClick={() => window.alert('QR code siap digunakan dari link ini: ' + fullShortUrl)}><QrCode size={17} /> QR code</button></div></div>}
        </section>

        <section className="privacy-section"><p className="eyebrow">PRIVACY &amp; SECURITY</p><h2>Your links stay private</h2><div className="privacy-card"><span className="privacy-icon"><Check size={20} /></span><div><h3>Private by default</h3><p>Hanya Anda yang mengelola link yang dibuat di ruang kerja ini. Kami tidak menampilkan riwayat link publik.</p><span className="privacy-meta">Secure workspace <b>•</b> No public history</span></div><ExternalLink className="privacy-arrow" size={17} /></div></section>

        <footer><span>Shortener</span><span>Built for <strong>indocloud</strong></span></footer>
      </main>
    </div>
  );
}

export default App;
