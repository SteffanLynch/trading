import {useMemo, useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {library} from '../data/library';

export default function SearchPage(): ReactNode {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return library;
    return library.filter((item) => `${item.title} ${item.description} ${item.section} ${item.keywords}`.toLowerCase().includes(value));
  }, [query]);

  return (
    <Layout title="Search" description="Search every note in the trading library.">
      <main className="search-page">
        <p className="kicker"><span /> Library index</p>
        <h1>Find a note.</h1>
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try ‘risk’, ‘liquidity’ or ‘indecision’…" />
        </label>
        <p className="result-count">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
        <div className="search-results">
          {results.map((item) => (
            <Link className="search-result" to={item.href} key={item.href}>
              <span>{item.number ?? '—'}</span>
              <div><small>{item.section}</small><h2>{item.title}</h2><p>{item.description}</p></div>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
          {!results.length && <div className="empty-results"><h2>No notes found</h2><p>Try a broader term or browse the full library.</p></div>}
        </div>
      </main>
    </Layout>
  );
}
