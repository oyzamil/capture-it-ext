import { ReactNode } from 'react';

type IconLabelType = {
  icon?: ReactNode;
  label?: ReactNode;
  className?: string;
};

export default function IconLabel({ icon, label, className }: IconLabelType) {
  return (
    <>
      <div className={cn('flex-center gap-2', className)}>
        {icon && icon} {label && <span>{label}</span>}
      </div>
    </>
  );
}
