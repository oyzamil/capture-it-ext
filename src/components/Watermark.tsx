const Watermark = ({ className = '', glass }: { className: string; glass?: boolean }) => {
  const borderColor = glass ? 'border-white' : 'border-app-500';
  return (
    <div className={cn('text-sm', className)}>
      <div className="-my-1 inline-grid grid-cols-[.25rem_1fr_.25rem] grid-rows-[.25rem_1fr_.25rem] align-middle">
        <div className={cn('border-s border-t [grid-area:1/1/2/2] animate-spark', borderColor)}></div>
        <div className={cn('border-e border-t [grid-area:1/3/2/4] animate-spark-fast', borderColor)}></div>
        <div className={cn('border-s border-b [grid-area:3/1/4/2] animate-spark-fast', borderColor)}></div>
        <div className={cn('border-e border-b [grid-area:3/3/4/4] animate-spark', borderColor)}></div>
        <div className={cn('m-0.5 px-1 tracking-wide text-white [grid-area:1/1/4/4] flex-center gap-1 rounded-md', glass ? 'glass p-1' : '')}>
          {glass ? (
            <div className="flex-center gap-1 text-xs">
              <span>Designed by</span>
              <Logo size="size-5" />
              <span className="font-semibold">{i18n.t('appName')}</span>
              <span>Browser Extension</span>
            </div>
          ) : (
            <>
              <Logo size="size-8" scale="scale-120" />
              <span className="font-semibold bg-app-500 rounded-md px-2">{i18n.t('appName')}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watermark;
