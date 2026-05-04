import { useState } from 'react';

type CollapsibleTextProps = {
  text?: string | null;
  collapsedLength?: number;
  emptyText?: string;
};

export default function CollapsibleText({
  text,
  collapsedLength = 96,
  emptyText = '—',
}: CollapsibleTextProps) {
  const [expanded, setExpanded] = useState(false);
  const value = text?.trim();

  if (!value) return <span>{emptyText}</span>;

  const shouldCollapse = value.length > collapsedLength;
  const visibleText = !shouldCollapse || expanded ? value : `${value.slice(0, collapsedLength).trim()}...`;

  return (
    <span className="collapsible-text">
      <span>{visibleText}</span>
      {shouldCollapse && (
        <button type="button" onClick={() => setExpanded((current) => !current)}>
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </span>
  );
}
