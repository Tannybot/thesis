import SearchResultItem from './SearchResultItem';
import type { SearchableItem } from './searchTypes';

type SearchDropdownProps = {
  id: string;
  query: string;
  loading: boolean;
  results: SearchableItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelect: (item: SearchableItem) => void;
};

export default function SearchDropdown({
  id,
  query,
  loading,
  results,
  activeIndex,
  onActiveIndexChange,
  onSelect,
}: SearchDropdownProps) {
  return (
    <div className="search-command-panel animate-in" id={id} role="listbox">
      {loading ? (
        <div className="search-command-state"><div className="spinner w-4 h-4 border-2" /> Searching records</div>
      ) : results.length === 0 ? (
        <div className="search-command-state">No results found</div>
      ) : results.map((item, index) => (
        <SearchResultItem
          key={item.id}
          item={item}
          query={query}
          active={index === activeIndex}
          onHover={() => onActiveIndexChange(index)}
          onSelect={() => onSelect(item)}
        />
      ))}
    </div>
  );
}
