import { Modal as AntdModal, ModalProps as AntdModalProps } from "antd";
import React, { ReactNode } from "react";

interface ModalProps
  extends Omit<AntdModalProps, "title" | "open" | "onCancel"> {
  isOpen?: boolean;
  onClose?: () => void;
  noTitle?: boolean;
  title?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  noTitle = false,
  title,
  icon,
  children,
  className,
  ...rest
}) => {
  return (
    <AntdModal
      open={isOpen}
      onCancel={onClose}
      title={
        noTitle ? null : (
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
        )
      }
      className={cn("min-w-[700px] w-[80%]", className)}
      {...rest}
    >
      {children}
    </AntdModal>
  );
};

export default Modal;
