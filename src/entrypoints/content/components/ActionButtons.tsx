import { CopyIcon, CrossIcon, EditIcon, SaveIcon } from '@/icons';
import { Button, Space } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';
import { ensureFontsReady, sketchImage } from '../utils';

interface ActionButtonsProps {
  mode: 'custom' | 'element';
  selection: ElementSelection;
  hideCropperUI: () => void;
}
export interface ActionButtonsHandle {
  div: HTMLDivElement | null;
}

const ActionButtons = forwardRef<ActionButtonsHandle, ActionButtonsProps>(({ mode, selection, hideCropperUI }, ref) => {
  const { settings, saveSettings } = useSettings();
  const [options, setOptions] = useStateUpdater({
    downloading: false,
    copying: false,
  });
  const localRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => ({
    div: localRef.current,
  }));

  const isCloserToBottom = selection.rect.y + selection.rect.height + 40 > window.innerHeight;
  const isCloserToLeft = selection.rect.x + 220 > window.innerWidth;
  const top = isCloserToBottom ? Math.floor(selection.rect.y) - 45 : Math.floor(selection.rect.y + selection.rect.height) + 5;
  const left = isCloserToLeft ? Math.floor(selection.rect.x - 100) : Math.floor(selection.rect.x);

  const createCanvas = async (): Promise<CanvasResult> => {
    if (!selection) throw new Error('No selection to capture');

    await ensureFontsReady();
    hideCropperUI();

    const captureMargin = mode === 'custom' ? 0 : settings.captureMargin;
    try {
      const { blob, dataUrl } = await sketchImage(selection, {
        padding: { top: captureMargin, right: captureMargin, bottom: captureMargin, left: captureMargin },
      });
      return { blob, dataUrl };
    } catch (error) {
      throw new Error(`Capture failed: ${(error as Error).message}`);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!selection) return;

    try {
      await setOptions({ downloading: true });
      const { dataUrl } = await createCanvas();
      await sendMessage(GENERAL_MESSAGES.DOWNLOAD, { dataUrl, filename: validFilename(`${settings.resolution}`, 'png') });
      await sendMessage(GENERAL_MESSAGES.NOTIFY, { title: 'Image Downloaded!', message: 'Image download completed!' });
    } catch (error: any) {
      throw new Error(`Screenshot download failed: ${error?.message || error}`);
    } finally {
      await setOptions({ downloading: false });
      handleClose();
    }
  }, [selection, settings.captureMargin]);

  const handleCopy = useCallback(async () => {
    try {
      await setOptions({ copying: true });
      const { blob } = await createCanvas();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch (error: any) {
      throw new Error(`Screenshot copy failed: ${error?.message || error}`);
    } finally {
      await setOptions({ copying: false });
      handleClose();
    }
  }, [selection, settings.captureMargin]);

  const handleEdit = useCallback(async () => {
    try {
      const { dataUrl } = await createCanvas();

      await saveSettings({ base64Image: dataUrl });
      await sendMessage(GENERAL_MESSAGES.SHOW_EDITOR);
    } catch (error: any) {
      throw new Error(`Screenshot editing failed: ${error?.message || error}`);
    } finally {
      // cropperRef.current?.resetSelection();
      handleClose();
    }
  }, [selection, settings.captureMargin]);

  const handleClose = useCallback(async () => {
    sendMessageToMain(GENERAL_MESSAGES.UNMOUNT);
  }, [sendMessageToMain]);

  return (
    <>
      {(selection.rect.width > 30 || selection.rect.height > 30) && (
        <div
          style={{
            top: `${top}px`,
            left: `${left}px`,
            position: 'fixed',
          }}
        >
          <Space.Compact>
            <Button type="primary" onClick={handleEdit} title={i18n.t('edit')}>
              <IconLabel icon={<EditIcon />} label={i18n.t('edit')} />
            </Button>
            <Button type="primary" onClick={handleCopy} loading={options.copying} title={i18n.t('copy')}>
              <IconLabel icon={<CopyIcon />} label={i18n.t('copy')} />
            </Button>

            <Button type="primary" onClick={handleDownload} loading={options.downloading} title={i18n.t('download')}>
              <IconLabel icon={<SaveIcon />} label={i18n.t('download')} />
            </Button>

            <Button type="primary" onClick={handleClose} title={i18n.t('close')} danger>
              <IconLabel icon={<CrossIcon />} label={i18n.t('close')} />
            </Button>
          </Space.Compact>
        </div>
      )}
    </>
  );
});

export default ActionButtons;
