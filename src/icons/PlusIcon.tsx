export default ({ className, stroke = '2' }: IconType) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={cn('size-4', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
};

// className={className}
