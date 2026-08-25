import {useEffect, useState, type ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import {library} from '../data/library';

export default function Root({children}: {children: ReactNode}) {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [image, setImage] = useState<{src: string; alt: string} | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setSearchOpen(false);
    setQuery('');
    setImage(null);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setImage(null);
      }
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.search-trigger')) setSearchOpen(true);
      const selectedImage = target.closest('.theme-doc-markdown img') as HTMLImageElement | null;
      if (selectedImage) setImage({src: selectedImage.src, alt: selectedImage.alt});
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      if (!location.pathname.startsWith('/library/')) return setProgress(0);
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(100, (window.scrollY / height) * 100) : 0);
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, {passive: true});
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [location.pathname]);

  const value = query.trim().toLowerCase();
  const results = library.filter((item) => !value || `${item.title} ${item.description} ${item.keywords}`.toLowerCase().includes(value)).slice(0, 7);

  return (
    <>
      {location.pathname.startsWith('/library/') && <div className="reading-progress" style={{width: `${progress}%`}} />}
      {children}
      {searchOpen && (
        <div className="command-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSearchOpen(false)}>
          <section className="command-palette" role="dialog" aria-modal="true" aria-label="Search the trading library">
            <label><span aria-hidden="true">⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes, ideas and terms…" /><kbd>ESC</kbd></label>
            <div className="command-results">
              {results.map((item) => (
                <Link to={item.href} key={item.href}>
                  <span className="command-number">{item.number ?? '—'}</span>
                  <span><small>{item.section}</small><strong>{item.title}</strong></span>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
              {!results.length && <p className="command-empty">No matching notes. Try another word.</p>}
            </div>
            <footer><span><kbd>↵</kbd> Open</span><Link to="/search">Browse full index →</Link></footer>
          </section>
        </div>
      )}
      {image && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={image.alt || 'Expanded chart'} onClick={() => setImage(null)}>
          <button type="button" aria-label="Close image">×</button>
          <img src={image.src} alt={image.alt} />
        </div>
      )}
    </>
  );
}
