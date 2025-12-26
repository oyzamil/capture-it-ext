const Watermark = ({ className = '' }) => {
  return (
    <div className={cn('font-mono text-sm', className)}>
      <div className="-my-1 inline-grid grid-cols-[.25rem_1fr_.25rem] grid-rows-[.25rem_1fr_.25rem] align-middle">
        <div className="border-s border-t border-app-600 [grid-area:1/1/2/2] animate-spark"></div>
        <div className="border-e border-t border-app-600 [grid-area:1/3/2/4] animate-spark-fast"></div>
        <div className="border-s border-b border-app-600 [grid-area:3/1/4/2] animate-spark-fast"></div>
        <div className="border-e border-b border-app-600 [grid-area:3/3/4/4] animate-spark"></div>
        <div className="m-0.5 bg-app-600 px-1 font-semibold tracking-wide text-white [grid-area:1/1/4/4]">{t('appName')}</div>
      </div>{' '}
      by{' '}
      <a href="https://instagram.com/oyzamil" target="_blank" className="text-app-500">
        Muzammil
      </a>
    </div>
  );
};

export default Watermark;
