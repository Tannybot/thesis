export type SearchType = 'animal' | 'record' | 'treatment' | 'vaccination' | 'user' | 'movement';

export type SearchableItem = {
  id: string;
  type: SearchType;
  title: string;
  description: string;
  route: string;
};

export const searchTypeLabels = {
  animal: 'Animal',
  record: 'Record',
  treatment: 'Treatment',
  vaccination: 'Vaccination',
  user: 'User',
  movement: 'Supply',
} satisfies Record<SearchType, string>;

export function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function searchItemMatches(item: SearchableItem, query: string) {
  const target = `${item.type} ${item.title} ${item.description}`.toLowerCase();
  return target.includes(query);
}
