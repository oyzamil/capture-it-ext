type FieldSetProps = {
  label: string | React.ReactNode;
  children: React.ReactNode;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
};

export function FieldSet({ label, children, orientation = 'vertical', className }: FieldSetProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <fieldset className={cn('rounded-lg bg-gray-50 border border-gray-200/50 dark:bg-black dark:border-black', isHorizontal ? 'flex items-center gap-2 px-2 py-3' : 'p-2', className)}>
      {/* Real legend for accessibility (visually neutralized) */}
      <legend className={cn(isHorizontal && 'sr-only', 'bg-gray-50 px-2 rounded-md py-0 border border-gray-200/50 dark:bg-black dark:border-black')}>{label}</legend>
      {/* Visual label */}
      <span className={cn('text-sm font-medium whitespace-nowrap bg-gray-50 px-2 rounded-md py-0 dark:bg-transparent', isHorizontal ? 'block' : 'hidden')}>{label}</span>

      <div className={cn(isHorizontal ? 'flex items-center gap-2' : 'flex flex-col gap-2')}>{children}</div>
    </fieldset>
  );
}
