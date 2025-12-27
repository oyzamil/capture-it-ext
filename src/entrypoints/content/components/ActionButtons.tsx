import { BinIcon, CopyIcon, CrossIcon, EditIcon, SaveIcon } from '@/icons';
import { Button, Space } from 'antd';

interface ActionButtonsProps {
  ref?: React.Ref<HTMLDivElement>;
  selection: { y: number; x: number; width: number; height: number };

  onEdit: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onEraser: () => void;
  onCancel: () => void;
  options: {
    downloading: boolean;
    copying: boolean;
    eraser: boolean;
  };
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ ref, options, selection, onEdit, onCopy, onDownload, onEraser, onCancel }) => {
  const isCloserToBottom = selection.y + selection.height + 40 > window.innerHeight;
  const isCloserToLeft = selection.x + 220 > window.innerWidth;

  const top = isCloserToBottom ? Math.floor(selection.y) - 45 : Math.floor(selection.y + selection.height) + 5;

  const left = isCloserToLeft ? Math.floor(selection.x - 100) : Math.floor(selection.x);

  return (
    <div
      ref={ref}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        position: 'fixed',
      }}
    >
      <Space.Compact>
        <Button type="primary" onClick={onEdit} title={i18n.t('edit')}>
          <IconLabel icon={<EditIcon />} label={i18n.t('edit')} />
        </Button>
        <Button type="primary" onClick={onCopy} loading={options.copying} title={i18n.t('copy')}>
          <IconLabel icon={<CopyIcon />} label={i18n.t('copy')} />
        </Button>

        <Button type="primary" onClick={onDownload} loading={options.downloading} title={i18n.t('download')}>
          <IconLabel icon={<SaveIcon />} label={i18n.t('download')} />
        </Button>

        {options.eraser && (
          <Button type="primary" onClick={onEraser} title={i18n.t('delete')}>
            <IconLabel icon={<BinIcon />} label={i18n.t('delete')} />
          </Button>
        )}

        <Button type="primary" onClick={onCancel} title={i18n.t('close')} danger>
          <IconLabel icon={<CrossIcon />} label={i18n.t('close')} />
        </Button>
      </Space.Compact>
    </div>
  );
};

export default ActionButtons;
