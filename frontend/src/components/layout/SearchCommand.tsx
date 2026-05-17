import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import SearchDropdown from './SearchDropdown';
import type { SearchableItem } from './searchTypes';
import { useSearchCommand } from './useSearchCommand';

const resultsId = 'global-search-results';

export default function SearchCommand() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { results, loading } = useSearchCommand(query, isAdmin);

  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    }

    if (open) document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, [open]);

  const hasQuery = query.trim().length > 0;
  const visibleResults = useMemo(() => results, [results]);

  function selectResult(item: SearchableItem) {
    navigate(item.route);
    setOpen(false);
    setQuery('');
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (!open) setOpen(true);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, Math.max(visibleResults.length - 1, 0)));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === 'Enter' && visibleResults[activeIndex]) {
      event.preventDefault();
      selectResult(visibleResults[activeIndex]);
    }
  }

  return (
    <div className="top-search search-command" ref={panelRef}>
      <Search size={17} className="search-command-icon" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search animals, records, users..."
        className="input-field search-command-input"
        id="global-search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-controls={resultsId}
        aria-autocomplete="list"
        role="combobox"
      />
      <kbd>Ctrl K</kbd>

      {open && (hasQuery || loading) && (
        <SearchDropdown
          id={resultsId}
          query={query}
          loading={loading}
          results={visibleResults}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onSelect={selectResult}
        />
      )}
    </div>
  );
}
