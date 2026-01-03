import logo from '@/assets/icon.svg';

const Logo = ({ size = 'size-9', scale = 'scale-100', animation = 'animate-wheel-slow' }: { size?: string; scale?: string; animation?: string }) => {
  return (
    <span className="rounded-md bg-app-500">
      <span className={cn('flex-center rounded-full overflow-hidden', size)}>
        <img src={logo} className={cn(animation, scale)} />
      </span>
    </span>
  );
};

export default Logo;
