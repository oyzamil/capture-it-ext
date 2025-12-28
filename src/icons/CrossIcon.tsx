export default ({ className = 'size-4', stroke = '2' }: IconType) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 15 15">
      <path fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" d="M3 3l9 9M12 3l-9 9" />
    </svg>
  );
};
