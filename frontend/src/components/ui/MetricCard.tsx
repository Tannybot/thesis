import { ArrowUpRight } from 'lucide-react';
import type { ComponentType, CSSProperties } from 'react';

type MetricCardProps = {
  label: string;
  value: number | string;
  icon: ComponentType<{ size?: number }>;
  tone?: string;
};

const cardImages: Record<string, string> = {
  animals: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=720&q=70',
  active: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=720&q=70',
  health: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=720&q=70',
  vaccination: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=720&q=70',
};

function getCardImage(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes('vaccination')) return cardImages.vaccination;
  if (normalized.includes('health')) return cardImages.health;
  if (normalized.includes('active')) return cardImages.active;
  return cardImages.animals;
}

export default function MetricCard({ label, value, icon: Icon, tone = 'var(--emerald)' }: MetricCardProps) {
  const imageStyle = {
    '--metric-bg-image': `url("${getCardImage(label)}")`,
  } as CSSProperties;

  return (
    <div className="ui-card metric-card-shell animate-in" style={imageStyle}>
      <div className="ui-card-body metric-card">
        <div className="metric-card-header">
          <div className="metric-card-icon" style={{ background: `linear-gradient(135deg, ${tone}, var(--cyan))` }}>
            <Icon size={22} />
          </div>
          <ArrowUpRight size={17} style={{ color: 'var(--muted)' }} />
        </div>
        <div>
          <p className="metric-card-value">{value}</p>
          <p className="metric-card-label">{label}</p>
        </div>
      </div>
    </div>
  );
}
