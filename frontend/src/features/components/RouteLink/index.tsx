import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { cn } from '@/lib/utils'; // optional: className helper (Shadcn style)

interface RouteLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  external?: boolean;
  className?: string;
  icon?: React.ReactNode;
  underline?: boolean;
}

/**
 * A reusable Link component that handles both internal and external navigation.
 * Supports optional icon, variant styling, and underline.
 */
const RouteLink: React.FC<RouteLinkProps> = ({
  href,
  children,
  variant = 'primary',
  external = false,
  className,
  icon,
  underline = false,
}) => {
  const baseClasses =
    'inline-flex items-center gap-1 text-sm font-medium transition-colors duration-200';
  const variantClasses = {
    primary: 'text-blue-600 hover:text-blue-700',
    secondary: 'text-gray-600 hover:text-gray-800',
    ghost: 'text-inherit hover:text-blue-500',
  };

  const underlineClass = underline ? 'underline underline-offset-4' : '';

  const combinedClasses = cn(baseClasses, variantClasses[variant], underlineClass, className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={combinedClasses}>
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={href} className={combinedClasses}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </RouterLink>
  );
};

export default RouteLink;
