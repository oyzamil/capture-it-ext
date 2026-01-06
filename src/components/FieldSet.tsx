type FieldSetProps = {
  label: string | React.ReactNode;
  children: React.ReactNode;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
};

export function FieldSet({ label, children, orientation = 'vertical', className }: FieldSetProps) {
  return (
    <fieldset className={cn('grid grid-cols-2 items-center', className)}>
      <span className={cn('text-sm whitespace-nowrap')}>{label}</span>

      <div className={cn('w-full flex justify-end')}>{children}</div>
    </fieldset>
  );
}
