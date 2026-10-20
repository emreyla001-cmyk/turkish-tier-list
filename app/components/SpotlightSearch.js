'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import TierBadge from './TierBadge';

export default function SpotlightSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Ctrl+K veya Cmd+K ile açma / Esc ile kapama
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Modal açıldığında inputa odaklan ve karakterleri yükle
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (characters.length === 0) {
        setLoading(true);
        supabase
          .from('characters')
          .select('id, name, series, tier, category, image_url, power_score')
          .eq('status', 'published')
          .order('name', { ascending: true })
          .then(({ data }) => {
            setCharacters(data || []);
            setLoading(false);
          });
      }
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Arama filtrelemesi
  const filtered = characters.filter((c) => {
    if (!query.trim()) return true;
    const q = query.trim().toLocaleLowerCase('tr');
    return (
      c.name?.toLocaleLowerCase('tr').includes(q) ||
      c.series?.toLocaleLowerCase('tr').includes(q) ||
      c.category?.toLocaleLowerCase('tr').includes(q) ||
      c.tier?.toLocaleLowerCase('tr').includes(q)
    );
  }).slice(0, 8); // İlk 8 sonuç

  // Klavye ok tuşları ile gezinme
  function handleInputKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      window.location.href = `/karakter/${filtered[selectedIndex].id}`;
    }
  }

  return (
    <>
      {/* Üst Menü Arama Butonu */}
      <button
        type="button"
        className="spotlight-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Karakter ara"
      >
        <span className="search-icon">🔍</span>
        <span className="search-text">Karakter ara...</span>
        <kbd className="search-kbd">Ctrl K</kbd>
      </button>

      {/* Spotlight Modal Overlay */}
      {isOpen && (
        <div className="spotlight-overlay" onClick={() => setIsOpen(false)}>
          <div className="spotlight-modal" onClick={(e) => e.stopPropagation()}>
            <div className="spotlight-header">
              <span className="spotlight-input-icon">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Karakter, dizi/film veya tier ara... (Örn: Hızır, 2-B)"
                className="spotlight-input"
              />
              <button
                type="button"
                className="spotlight-close"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="spotlight-body">
              {loading && <div className="spotlight-empty">Karakterler yükleniyor...</div>}
              {!loading && filtered.length === 0 && (
                <div className="spotlight-empty">
                  &ldquo;{query}&rdquo; ile eşleşen bir karakter bulunamadı.
                </div>
              )}
              {!loading && filtered.map((c, i) => (
                <a
                  key={c.id}
                  href={`/karakter/${c.id}`}
                  className={`spotlight-item ${i === selectedIndex ? 'selected' : ''}`}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <div className="spotlight-thumb">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} />
                    ) : (
                      <span className="thumb-fallback">🎭</span>
                    )}
                  </div>
                  <div className="spotlight-info">
                    <div className="spotlight-name">{c.name}</div>
                    <div className="spotlight-series">
                      {c.series || 'Belirtilmemiş'} {c.category ? `· ${c.category}` : ''}
                    </div>
                  </div>
                  <div className="spotlight-tier">
                    <TierBadge tier={c.tier} />
                  </div>
                </a>
              ))}
            </div>

            <div className="spotlight-footer">
              <span><kbd>↑</kbd> <kbd>↓</kbd> Gezin</span>
              <span><kbd>↵</kbd> Seç</span>
              <span><kbd>Esc</kbd> Kapat</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
