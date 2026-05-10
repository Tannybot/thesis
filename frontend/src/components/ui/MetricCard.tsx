import { ArrowUpRight } from 'lucide-react';
import type { ComponentType, CSSProperties } from 'react';

type MetricCardProps = {
  label: string;
  value: number | string;
  icon: ComponentType<{ size?: number }>;
  tone?: string;
  visual?: 'livestock' | 'verified' | 'records' | 'activity';
};

export default function MetricCard({ label, value, icon: Icon, tone = 'var(--emerald)', visual = 'activity' }: MetricCardProps) {
  return (
    <div
      className="ui-card animate-in metric-card-shell"
      data-visual={visual}
      style={{ '--metric-tone': tone } as CSSProperties}
    >
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
