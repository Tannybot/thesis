import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function Card({ children, className = '', bodyClassName = '' }: CardProps) {
  return (
    <section className={`ui-card ${className}`}>
      <div className={`ui-card-body ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}

type SectionTitleProps = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function SectionTitle({ icon, title, subtitle, action }: SectionTitleProps) {
  return (
    <div className="section-header">
      <div className="min-w-0">
        <h2 className="section-title">
          {icon}
          <span>{title}</span>
        </h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
