type FieldSetProps = {
  label: string | React.ReactNode;
  children: React.ReactNode;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
};

export function FieldSet({ label, children, orientation = 'vertical', className }: FieldSetProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <fieldset className={cn('rounded-lg bg-gray-100 add-border', isHorizontal ? 'flex items-center gap-2 px-2 py-3' : 'p-2', className)}>
      {/* Real legend for accessibility (visually neutralized) */}
      <legend className={cn(isHorizontal && 'sr-only', 'bg-gray-100 px-2 rounded-md py-0 add-border')}>{label}</legend>
      {/* Visual label */}
      <span className={cn('text-sm font-medium whitespace-nowrap bg-gray-100 px-2 rounded-md py-0', isHorizontal ? 'block' : 'hidden')}>{label}</span>

      <div className={cn(isHorizontal ? 'flex items-center gap-2' : 'flex flex-col gap-2')}>{children}</div>
    </fieldset>
  );
}

export function PartialSideBorder() {
  return (
    <svg className="pointer-events-none absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Left */}
      <line x1="0" y1="25" x2="0" y2="75" stroke="currentColor" strokeWidth="1" />

      {/* Right */}
      <line x1="100" y1="25" x2="100" y2="75" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
