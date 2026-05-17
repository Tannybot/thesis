import { FileText, Pill, Search, Shield, Syringe, Truck, UserRound } from 'lucide-react';
import type { SearchableItem, SearchType } from './searchTypes';
import { searchTypeLabels } from './searchTypes';

const typeIcons = {
  animal: Shield,
  record: FileText,
  treatment: Pill,
  vaccination: Syringe,
  user: UserRound,
  movement: Truck,
} satisfies Record<SearchType, typeof Search>;

function Highlight({ text, query }: { text: string; query: string }) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return <>{text}</>;

  const index = text.toLowerCase().indexOf(cleanQuery.toLowerCase());
  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + cleanQuery.length)}</mark>
      {text.slice(index + cleanQuery.length)}
    </>
  );
}

type SearchResultItemProps = {
  item: SearchableItem;
  query: string;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
};

export default function SearchResultItem({ item, query, active, onHover, onSelect }: SearchResultItemProps) {
  const Icon = typeIcons[item.type];

  return (
    <button
      type="button"
      className={`search-command-result ${active ? 'active' : ''}`}
      onMouseEnter={onHover}
      onClick={onSelect}
      role="option"
      aria-selected={active}
    >
      <span className={`search-result-icon ${item.type}`}><Icon size={16} /></span>
      <span className="search-result-copy">
        <strong><Highlight text={item.title} query={query} /></strong>
        <span><Highlight text={item.description} query={query} /></span>
      </span>
      <span className="search-result-type">{searchTypeLabels[item.type]}</span>
    </button>
  );
}
