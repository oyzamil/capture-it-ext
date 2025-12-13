import { Button, Space } from 'antd';

interface Rectangle {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ActionButtonsProps {
  position: Rectangle;
  showEraser: boolean;
  onEdit: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onEraser: () => void;
  onCancel: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ position, showEraser, onEdit, onCopy, onDownload, onEraser, onCancel }) => {
  const isCloserToBottom = position.top + position.height + 40 > window.innerHeight;
  const isCloserToLeft = position.left + 220 > window.innerWidth;

  const top = isCloserToBottom ? Math.floor(position.top) - 45 : Math.floor(position.top + position.height) + 5;

  const left = isCloserToLeft ? Math.floor(position.left - 100) : Math.floor(position.left);

  return (
    <div
      style={{
        top: `${top}px`,
        left: `${left}px`,
        position: 'fixed',
      }}
    >
      <Space.Compact>
        <Button
          type="primary"
          onClick={onEdit}
          title="Edit"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M16.698 21.996h-11.6a3.06 3.06 0 0 1-2.2-.92a3.09 3.09 0 0 1-.9-2.21V7.276a3 3 0 0 1 .91-2.19a3 3 0 0 1 1-.67a3.06 3.06 0 0 1 1.2-.24h4.44a.75.75 0 0 1 0 1.5h-4.44a2 2 0 0 0-.63.12a1.62 1.62 0 0 0-.99 1.5v11.59a1.62 1.62 0 0 0 .47 1.16a1.62 1.62 0 0 0 1.15.47h11.6c.213 0 .423-.04.62-.12a1.54 1.54 0 0 0 .52-.35a1.49 1.49 0 0 0 .35-.52a1.51 1.51 0 0 0 .13-.63v-4.44a.75.75 0 1 1 1.5 0v4.47a3.06 3.06 0 0 1-.92 2.2a3.16 3.16 0 0 1-1 .68c-.387.14-.798.205-1.21.19"
              />
              <path
                fill="currentColor"
                d="M21.808 5.456a1.86 1.86 0 0 0-.46-.68l-2.15-2.15a1.86 1.86 0 0 0-.68-.46a2.1 2.1 0 0 0-2.31.46l-1.71 1.71v.05l-7.74 7.73a2.11 2.11 0 0 0-.61 1.48v2.17a2.12 2.12 0 0 0 2.11 2.11h2.17a2.07 2.07 0 0 0 1.48-.62l7.74-7.74l1.72-1.72c.202-.19.36-.422.46-.68a2 2 0 0 0 0-1.63zm-1.38 1.05a.56.56 0 0 1-.14.2l-1.22 1.22l-3-3l1.23-1.23a.64.64 0 0 1 .44-.18a.59.59 0 0 1 .23.05c.076.032.145.08.2.14l2.16 2.15a.69.69 0 0 1 .13.2a.59.59 0 0 1 0 .23a.6.6 0 0 1-.03.22"
              />
            </svg>
          }
        >
          Edit
        </Button>
        <Button
          type="primary"
          onClick={onCopy}
          title="Copy"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                <path d="M16.94 4.697H17c.796 0 1.559.308 2.121.856A2.88 2.88 0 0 1 20 7.618v9.737a3.844 3.844 0 0 1-1.172 2.754A4.055 4.055 0 0 1 16 21.25H8c-1.06 0-2.078-.41-2.828-1.14A3.844 3.844 0 0 1 4 17.355V7.618c0-.764.308-1.499.857-2.045a3.04 3.04 0 0 1 2.083-.876" />
                <path d="M15.94 2.75h-8c-.552 0-1 .436-1 .974V5.67c0 .538.448.974 1 .974h8c.552 0 1-.436 1-.974V3.724a.987.987 0 0 0-1-.974m-7.787 8.71h7.694m-7.694 4.398h7.694" />
              </g>
            </svg>
          }
        >
          Copy
        </Button>

        <Button
          type="primary"
          onClick={onDownload}
          title="Download"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5">
                <path strokeLinejoin="round" d="M21.25 13V8.5a5 5 0 0 0-5-5h-8.5a5 5 0 0 0-5 5v7a5 5 0 0 0 5 5h6.26" />
                <path
                  strokeLinejoin="round"
                  d="m3.01 17l2.74-3.2a2.2 2.2 0 0 1 2.77-.27a2.2 2.2 0 0 0 2.77-.27l2.33-2.33a4 4 0 0 1 5.16-.43l2.47 1.91M8.01 10.17a1.66 1.66 0 1 0-.02-3.32a1.66 1.66 0 0 0 .02 3.32"
                />
                <path strokeMiterlimit="10" d="M18.707 20v-5" />
                <path strokeLinejoin="round" d="m16.414 17.895l1.967 1.967a.459.459 0 0 0 .652 0L21 17.895" />
              </g>
            </svg>
          }
        >
          Download
        </Button>

        {showEraser && (
          <Button
            type="primary"
            onClick={onEraser}
            title="Eraser"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m9.4 16.5l2.6-2.6l2.6 2.6l1.4-1.4l-2.6-2.6L16 9.9l-1.4-1.4l-2.6 2.6l-2.6-2.6L8 9.9l2.6 2.6L8 15.1l1.4 1.4ZM7 21q-.825 0-1.413-.588T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.588 1.413T17 21H7Z"
                />
              </svg>
            }
          >
            Delete
          </Button>
        )}

        <Button
          type="primary"
          onClick={onCancel}
          title="Cancel"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 15 15">
              <path
                fill="currentColor"
                d="M3.64 2.27L7.5 6.13l3.84-3.84A.92.92 0 0 1 12 2a1 1 0 0 1 1 1a.9.9 0 0 1-.27.66L8.84 7.5l3.89 3.89A.9.9 0 0 1 13 12a1 1 0 0 1-1 1a.92.92 0 0 1-.69-.27L7.5 8.87l-3.85 3.85A.92.92 0 0 1 3 13a1 1 0 0 1-1-1a.9.9 0 0 1 .27-.66L6.16 7.5L2.27 3.61A.9.9 0 0 1 2 3a1 1 0 0 1 1-1c.24.003.47.1.64.27Z"
              />
            </svg>
          }
        >
          Close
        </Button>
      </Space.Compact>
    </div>
  );
};

export default ActionButtons;
// import { useAntd } from '@/providers/ThemeProvider';
// import { Button } from 'antd';

// export default function Main() {
//   const { settings } = useSettings();
//   const { message, notification } = useAntd();
//   useEffect(() => {
//     if (!settings) return;
//     console.log('Settings:', settings);
//     return () => {};
//   }, [settings]);
//   return (
//     <>
//       <Button
//         type="primary"
//         className="fixed right-0 bottom-0 m-4"
//         onClick={async () => {
//           message.success('Success!');
//           notification.success({
//             title: 'Yes',
//             description: 'Its a success notification!',
//           });
//           // await sendMessage("OPEN_POPUP", {});
//         }}
//       >
//         Open Popup
//       </Button>
//     </>
//   );
// }
