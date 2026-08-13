import type { ButtonHTMLAttributes } from 'react';
import { useOptionalPostJobModal } from './PostJobProvider';

type PostJobButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children?: React.ReactNode;
};

export function PostJobButton({
  className = 'mkt-btn mkt-btn-primary mkt-btn-lg',
  children = 'Post a Job',
  type = 'button',
  ...props
}: PostJobButtonProps) {
  const postJob = useOptionalPostJobModal();

  return (
    <button
      {...props}
      type={type}
      className={className}
      onClick={(e) => {
        postJob?.openPostJobModal();
        props.onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
