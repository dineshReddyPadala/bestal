import { ArrowRight } from 'lucide-react';
import { cn } from '@bestal/shared-utils';

type ForwardArrowProps = {
  className?: string;
};

/** Lucide arrow-right — standard forward icon for links and CTAs */
export function ForwardArrow({ className }: ForwardArrowProps) {
  return <ArrowRight className={cn('h-3.5 w-3.5', className)} aria-hidden="true" />;
}
