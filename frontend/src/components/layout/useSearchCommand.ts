import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Animal, HealthRecord, Movement, Treatment, User, Vaccination } from '@/types';
import type { SearchableItem } from './searchTypes';
import { normalizeSearch, searchItemMatches } from './searchTypes';

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}

function animalDescription(animal: Animal) {
  return [animal.animal_uid, animal.species, animal.breed].filter(Boolean).join(' - ');
}

function uniqueResults(items: SearchableItem[]) {
  const unique = new Map<string, SearchableItem>();
  items.forEach((item) => unique.set(item.id, item));
  return Array.from(unique.values());
}

export function useSearchCommand(query: string, isAdmin: boolean) {
  const debouncedQuery = useDebouncedValue(query, 300);
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cleanQuery = normalizeSearch(debouncedQuery);
    let cancelled = false;

    async function runSearch() {
      if (!cleanQuery) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const animalsRes = await api.get('/animals/', { params: { search: cleanQuery, per_page: 40 } });
        const animals: Animal[] = animalsRes.data.animals || [];
        const items: SearchableItem[] = animals.map((animal) => ({
          id: `animal-${animal.id}`,
          type: 'animal',
          title: animal.name || animal.animal_uid,
          description: animalDescription(animal),
          route: `/animals/${animal.id}`,
        }));

        const relatedRequests = animals.slice(0, 12).flatMap((animal) => [
          api.get<HealthRecord[]>(`/health-records/animal/${animal.id}`).then((res) => res.data.map((record) => ({
            id: `record-${record.id}`,
            type: 'record' as const,
            title: `${record.record_type} - ${record.animal_uid}`,
            description: [record.description, record.diagnosis].filter(Boolean).join(' - '),
            route: '/health-records',
          }))),
          api.get<Treatment[]>(`/treatments/animal/${animal.id}`).then((res) => res.data.map((treatment) => ({
            id: `treatment-${treatment.id}`,
            type: 'treatment' as const,
            title: `${treatment.treatment_type} - ${treatment.animal_uid}`,
            description: [treatment.medication, treatment.dosage, treatment.administered_by].filter(Boolean).join(' - ') || 'Treatment record',
            route: '/treatments',
          }))),
          api.get<Vaccination[]>(`/vaccinations/animal/${animal.id}`).then((res) => res.data.map((vaccination) => ({
            id: `vaccination-${vaccination.id}`,
            type: 'vaccination' as const,
            title: `${vaccination.vaccine_name} - ${vaccination.animal_uid}`,
            description: [vaccination.batch_number, vaccination.administered_by, vaccination.next_due_date].filter(Boolean).join(' - ') || 'Vaccination record',
            route: '/vaccinations',
          }))),
          api.get<Movement[]>(`/movements/animal/${animal.id}`).then((res) => res.data.map((movement) => ({
            id: `movement-${movement.id}`,
            type: 'movement' as const,
            title: `${movement.movement_type} - ${movement.animal_uid}`,
            description: [movement.from_location, movement.to_location, movement.purpose, movement.buyer_info].filter(Boolean).join(' - ') || 'Supply chain movement',
            route: '/supply-chain',
          }))),
        ]);

        const related = await Promise.allSettled(relatedRequests);
        related.forEach((entry) => {
          if (entry.status === 'fulfilled') items.push(...entry.value);
        });

        const activityRes = await api.get('/dashboard/recent-activity').catch(() => ({ data: [] }));
        (activityRes.data || []).forEach((activity: { type: string; title: string; description: string }, index: number) => {
          const routeByType: Record<string, SearchableItem['route']> = {
            health: '/health-records',
            treatment: '/treatments',
            vaccination: '/vaccinations',
            movement: '/supply-chain',
          };
          const route = routeByType[activity.type];
          if (!route) return;
          items.push({
            id: `activity-${index}`,
            type: activity.type === 'health' ? 'record' : activity.type === 'movement' ? 'movement' : activity.type as SearchableItem['type'],
            title: activity.title,
            description: activity.description,
            route,
          });
        });

        if (isAdmin) {
          const usersRes = await api.get('/users/').catch(() => ({ data: { users: [] } }));
          (usersRes.data.users || []).forEach((user: User) => {
            items.push({
              id: `user-${user.id}`,
              type: 'user',
              title: user.full_name,
              description: `${user.email} - ${user.role_name}`,
              route: '/users',
            });
          });
        }

        const filtered = uniqueResults(items).filter((item) => searchItemMatches(item, cleanQuery)).slice(0, 12);
        if (!cancelled) setResults(filtered);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, isAdmin]);

  return { results, loading };
}
