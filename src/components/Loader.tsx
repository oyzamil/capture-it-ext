import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

type LoaderProps = {
  text?: string;
  className?: string;
};

export default function Loader({ text = 'Please Wait...', className }: LoaderProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "flex min-h-[250px] flex-col items-center justify-center gap-4",
          className
        )
      )}
    >
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      <div className="text-center">
        <p className="text-gray-900 dark:text-white">{text}</p>
      </div>
    </div>
  );
}
