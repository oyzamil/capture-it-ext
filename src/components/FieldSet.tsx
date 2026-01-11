type FieldSetProps = {
  label: string | React.ReactNode;
  children: React.ReactNode;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
};

export function FieldSet({ label, children, orientation = 'vertical', className }: FieldSetProps) {
  return (
    <fieldset className={cn('grid grid-cols-2 items-center px-2 py-2', className)}>
      <span className={cn('text-sm whitespace-nowrap')}>{label}</span>

      <div className={cn('flex w-full justify-end')}>{children}</div>
    </fieldset>
  );
}
