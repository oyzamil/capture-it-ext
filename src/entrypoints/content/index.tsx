const manifest = browser.runtime.getManifest();
import { createAndMountUI } from '@/providers/ThemeProvider';
// const selector = new ElementSelector({
//   showEraser: true,
//   onCapture: (element, rect, base64) => {
//     console.log('Captured element:', element);
//     console.log('Bounding rect:', rect);
//     console.log('Image Base64:', base64);
//     selector.handleCancel();
//   },
//   onCancel: () => {
//     console.log('Selection cancelled.');
//   },
// });
import { CaptureMessage } from '@/utils/constants';
import ActionButtons from './ActionButtons';

export default defineContentScript({
  matches: ['*://*.example.com/*'],
  // 2. Set cssInjectionMode
  cssInjectionMode: 'ui',

  async main(ctx) {
    let divhiglighterClicked: boolean = false;
    let hoveredElement: Nullable<HTMLElement> = null;
    let insideDiv: Nullable<HTMLDivElement> = null;
    let borderDiv: Nullable<HTMLDivElement> = null;
    let divElement: Nullable<HTMLDivElement> = null;
    let buttonClicked: boolean = false;
    let base64ImageData: string | null = null;
    let currentUrl: string = window.location.href;
    let eraserElement: Nullable<HTMLElement> = null;
    let isEventListenerAdded: boolean = false;
    let isDragging: boolean = false;
    let selectionBox: Nullable<HTMLDivElement> = null;
    let bodyEle: HTMLElement = document.body;

    let startX: number | null = null;
    let startY: number | null = null;
    let endX: number | null = null;
    let endY: number | null = null;

    let capturedivTask: boolean = false;

    type Nullable<T> = T | null;

    const afterGetMsg = (message: CaptureMessage) => {
      console.log('msg', message);
      capturedivTask = true;
      buttonClicked = false;
      isEventListenerAdded = false;
      let appendedDiv = document.querySelector('.blur-div');
      let selectboxdiv = document.querySelector('.selectionbox');
      if (appendedDiv && message === CaptureMessage.CAPTURE_DIV && !selectboxdiv) {
        appendedDiv.remove();
        divhiglighterClicked = !divhiglighterClicked;
        hoveredElement?.removeEventListener('mouseover', eraserHeighLight);
        document?.body?.removeEventListener('mouseover', afterMouseOver);
      } else if (selectboxdiv && message === CaptureMessage.CUSTOM_CAPTURE) {
        divhiglighterClicked = !divhiglighterClicked;
        appendedDiv?.remove();
        selectboxdiv?.remove();
        clearGrabElements();
      } else {
        if (appendedDiv) {
          appendedDiv.remove();
          selectboxdiv?.remove();
          divhiglighterClicked = !divhiglighterClicked;
          hoveredElement?.removeEventListener('mouseover', eraserHeighLight);
          document?.body?.removeEventListener('mouseover', afterMouseOver);
          if (selectboxdiv) {
            clearGrabElements();
          }
        }
        divElement = document.createElement('div');
        insideDiv = document.createElement('div');
        borderDiv = document.createElement('div');
        insideDiv.classList.add('inside-div');
        divElement.classList.add('blur-div');
        // divElement.style.zIndex = '999999999';

        divElement.style.position = 'fixed';

        insideDiv.style.pointerEvents = 'none';

        insideDiv.style.position = 'fixed';
        insideDiv.style.inset = '0px';

        insideDiv.style.display = 'flex';
        insideDiv.style.flexDirection = 'column';
        insideDiv.style.alignItems = 'center';
        insideDiv.style.justifyContent = 'center';
        insideDiv.style.fontSize = '50px';
        insideDiv.style.fontWeight = 'bold';
        insideDiv.style.lineHeight = '1.4';
        if (message === CaptureMessage.CAPTURE_DIV) {
          insideDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.58)';
          insideDiv.innerHTML = 'Move the mouse and Click<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;to select area';
          insideDiv.style.color = 'white';
        } else {
          isDragging = true;
          selectionBox = document.createElement('div');
          selectionBox.classList.add('selectionbox');
          selectionBox.style.border = '2px dashed rgb(243, 248, 255)';
          selectionBox.style.position = 'fixed';
          selectionBox.style.pointerEvents = 'none';
          selectionBox.style.zIndex = '290';
          document.body.appendChild(selectionBox);
          insideDiv.innerHTML = 'Double click and  Drag<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;to select area';
          insideDiv.style.color = 'white';
          bodyEle.style.cursor = 'crosshair';
          capturedivTask = false;
          insideDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.58)';
        }

        //border
        borderDiv.style.position = 'fixed';
        borderDiv.style.left = '-2px';
        borderDiv.style.top = '-2px';
        borderDiv.style.width = '4px';
        borderDiv.style.height = '4px';
        borderDiv.style.borderWidth = '1px';
        borderDiv.style.borderColor = 'rgb(243, 248, 255)';
        borderDiv.style.borderStyle = 'dashed';
        borderDiv.style.boxSizing = 'border-box';
        borderDiv.style.pointerEvents = 'none';
        borderDiv.id = 'borderDiv';

        divElement.appendChild(insideDiv);
        divElement.appendChild(borderDiv);
        document.body.appendChild(divElement);

        divhiglighting(message);
      }
    };

    browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
      console.log(msg);
      const { message } = msg;
      afterGetMsg(message);
    });

    function divhiglighting(task: string) {
      divhiglighterClicked = !divhiglighterClicked;
      if (divhiglighterClicked) {
        if (task === CaptureMessage.CAPTURE_DIV) {
          document.body.addEventListener('mouseover', afterMouseOver);
        }
        if (task === CaptureMessage.CUSTOM_CAPTURE) {
          document.body.addEventListener('mousedown', afterMouseDown);
          document.body.addEventListener('mouseover', clearTextElement);
        }
      }
    }

    function afterMouseOver(event: MouseEvent) {
      let appenedDivWithText = document.querySelector('.inside-div');
      if (!borderDiv || !insideDiv) return;

      if (borderDiv.style.pointerEvents === 'auto') {
        borderDiv.style.pointerEvents = 'none';
      }
      if (divhiglighterClicked && !buttonClicked) {
        if (appenedDivWithText && appenedDivWithText.innerHTML?.trim() !== '') {
          appenedDivWithText.innerHTML = '';
        }
        hoveredElement = event.target as HTMLElement;

        const rect = hoveredElement.getBoundingClientRect();
        const vertices = {
          topLeft: {
            x: rect.left,
            y: rect.top,
          },
          bottomLeft: {
            x: rect.left,
            y: rect.bottom,
          },
          bottomRight: {
            x: rect.right,
            y: rect.bottom,
          },
          topRight: {
            x: rect.right,
            y: rect.top,
          },
        };

        borderDiv.style.top = `${Math.floor(rect.top)}px`;
        borderDiv.style.left = `${Math.floor(rect.left)}px`;
        borderDiv.style.width = `${Math.floor(rect.width)}px`;
        borderDiv.style.height = `${Math.floor(rect.height)}px`;

        const polygonString = Object.values(vertices)
          .map((vertex) => `${Math.floor(vertex.x)}px ${Math.floor(vertex.y)}px`)
          .join(', ');
        insideDiv.style.clipPath = `polygon(${polygonString}, ${Math.floor(vertices.topLeft.x)}px ${Math.floor(vertices.topLeft.y)}px,0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)`;
        let tagName = hoveredElement.tagName.toLowerCase();

        if (tagName === 'iframe') {
          hoveredElement.style.pointerEvents = 'none';
        }

        hoveredElement.addEventListener('click', handleClick);
      }
    }

    const createCanvas = async (selectorEle: HTMLElement) => {
      try {
        // Create a promise to handle the asynchronous messaging
        const sendMessage = () =>
          new Promise((resolve, reject) => {
            browser.runtime.sendMessage(
              {
                captureVisibleTab: true,
              },
              function (response) {
                if (response && response.screenshotUrl) {
                  resolve(response);
                } else {
                  reject(new Error('Failed to get screenshot URL'));
                }
              }
            );
          });

        // Use the promise to get the response
        const response: any = await sendMessage();

        let templateDiv = selectorEle.getBoundingClientRect();

        let image = new Image();
        image.src = response.screenshotUrl;

        // Use another promise to handle the image loading
        const imageLoad = () =>
          new Promise((resolve) => {
            image.onload = resolve;
          });

        await imageLoad(); // Wait for the image to load

        let imageHeight = image.height;
        let imageWidth = image.width;
        let innerHeight = window.innerHeight;
        let innerWidth = window.innerWidth;
        let heightRatio = imageHeight / innerHeight;
        let widthRatio = imageWidth / innerWidth;
        var canvas = document.createElement('canvas');
        canvas.width = templateDiv.width * widthRatio;
        canvas.height = templateDiv.height * widthRatio;
        var context = canvas.getContext('2d');

        // Draw the cropped portion of the screenshot onto the canvas
        context?.drawImage(
          image,
          Math.floor(templateDiv.x * widthRatio),
          Math.floor(templateDiv.y * heightRatio),
          Math.floor(templateDiv.width * widthRatio),
          Math.floor(templateDiv.height * heightRatio),
          0,
          0,
          Math.floor(templateDiv.width * widthRatio),
          Math.floor(templateDiv.height * heightRatio)
        );

        // Convert the canvas to a data URL
        let screenshotDataUrl = canvas.toDataURL(`image/${response.png}`);
        browser.storage.local.set({
          base64Image: screenshotDataUrl,
        });

        return screenshotDataUrl;
      } catch (err) {
        console.log(err);
      }
    };

    function handleClick(event: MouseEvent) {
      if (!borderDiv) return;

      let buttonsDiv = document.getElementById('overlayDiv');

      borderDiv.style.borderColor = '';
      borderDiv.style.borderStyle = '';

      event.preventDefault();
      event.stopPropagation();
      buttonClicked = true;

      if (!buttonsDiv && hoveredElement) {
        creatingDownloadBtn(hoveredElement);
      }
    }

    async function creatingDownloadBtn(ele: HTMLElement) {
      if (!divElement) return;
      let rect = ele.getBoundingClientRect();
      const actionButtons = await createAndMountUI(ctx, {
        anchor: 'body',
        children: (
          <ActionButtons
            position={rect}
            showEraser={true}
            onCopy={() => {
              handleCopy();
              actionButtons?.remove();
            }}
            onEdit={() => {
              handleEdit();
              actionButtons?.remove();
            }}
            onDownload={() => {
              handleDownload();
              actionButtons?.remove();
            }}
            onEraser={() => {
              if (!hoveredElement) return;
              if (isEventListenerAdded) {
                hoveredElement.removeEventListener('mouseover', eraserHeighLight);
                isEventListenerAdded = false;
              } else {
                hoveredElement.addEventListener('mouseover', eraserHeighLight);
                isEventListenerAdded = true;
              }
            }}
            onCancel={() => {
              handleCancel();
              actionButtons?.remove();
            }}
          />
        ),
      });
      // let copyButton = createBtn('copyButton', 'Images/Copy.svg');

      // let downloadButton = createBtn('downloadButton', 'Images/Download.svg');

      // let cancelBtn = createBtn('cancelButton', 'Images/Cancel.svg');

      // let editBtn = createBtn('cancelButton', 'Images/Edit.svg');

      // let eraserBtn = createBtn('cancelButton', 'Images/Light bolt.svg');

      // let middleLine = document.createElement('img');
      // middleLine.src = browser.runtime.getURL('Images/MiddleLine.svg');
      // middleLine.style.height = '40px';

      // // Append buttons to overlayDiv
      // overlayDiv.appendChild(copyButton);
      // overlayDiv.appendChild(editBtn);
      // if (capturedivTask) {
      //   overlayDiv.appendChild(eraserBtn);
      // }
      // overlayDiv.appendChild(downloadButton);
      // overlayDiv.appendChild(middleLine);
      // overlayDiv.appendChild(cancelBtn);

      // divElement.appendChild(overlayDiv);
      // downloadButton.addEventListener('click', handleDownload);
      // copyButton.addEventListener('click', handleCopy);

      // cancelBtn.addEventListener('click', handleCancel);

      // editBtn.addEventListener('click', handleEdit);

      // eraserBtn.addEventListener('click', () => {
      // if (!hoveredElement) return;
      // if (isEventListenerAdded) {
      //   hoveredElement.removeEventListener('mouseover', eraserHeighLight);
      //   isEventListenerAdded = false;
      // } else {
      //   hoveredElement.addEventListener('mouseover', eraserHeighLight);
      //   isEventListenerAdded = true;
      // }
      // });
    }

    async function handleDownload() {
      if (!hoveredElement) return;
      await removeSelectionBoxBorder();
      const base64ImageData = await createCanvas(hoveredElement);
      let url = new URL(currentUrl);
      let domainWithoutSubdomain = url?.hostname?.replace(/^(www\.)+/i, '');

      let currentDate = new Date();
      let formattedDate = currentDate.toISOString().split('T')[0];
      let formattedTime = currentDate.toTimeString().split(' ')[0];

      // Extract the domain without subdomain

      let filename = domainWithoutSubdomain + '_' + formattedDate + '_' + formattedTime + '.png';

      buttonClicked = false;
      divhiglighterClicked = !divhiglighterClicked;

      const newWindow = window.open();

      newWindow?.document.write(`
            <html>
            <head>
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: black;
                    }
                    img {
                        max-width: 100%;
                        max-height: 100%;
                    }
                </style>
            </head>
            <body>
                <img src="${base64ImageData}" />
            </body>
            </html>
        `);

      // Trigger the download within the new window
      newWindow?.document?.querySelector('img')?.addEventListener('load', function () {
        newWindow.document.write('<a href="' + base64ImageData + '" download="' + filename + '"></a>');
        newWindow.document.querySelector('a')?.click();

        setTimeout(() => {
          newWindow.close();
        }, 1000);
      });

      // Clean up
      isEventListenerAdded = false;

      hoveredElement?.removeEventListener('mouseover', eraserHeighLight);
      document.body.removeEventListener('mouseover', afterMouseOver);
      divElement?.remove();
      if (selectionBox) {
        clearGrabElements();
      }
    }

    async function handleEdit() {
      await removeSelectionBoxBorder();
      if (!hoveredElement) return;
      const base64ImageData = await createCanvas(hoveredElement);
      buttonClicked = false;
      divhiglighterClicked = !divhiglighterClicked;
      isEventListenerAdded = false;

      hoveredElement?.removeEventListener('mouseover', eraserHeighLight);
      document.body.removeEventListener('mouseover', afterMouseOver);
      divElement?.remove();
      if (selectionBox) {
        clearGrabElements();
      }

      browser.runtime.sendMessage({
        message: 'showOptions',
      });
    }

    async function handleCopy() {
      if (!hoveredElement) return;
      alert('Image is copied');
      await removeSelectionBoxBorder();
      const base64ImageData = await createCanvas(hoveredElement);
      if (base64ImageData) await copyPicture(base64ImageData);
      buttonClicked = false;
      divhiglighterClicked = !divhiglighterClicked;
      isEventListenerAdded = false;
      hoveredElement?.removeEventListener('mouseover', eraserHeighLight);
      document.body.removeEventListener('mouseover', afterMouseOver);
      divElement?.remove();
      if (selectionBox) {
        clearGrabElements();
      }
    }

    async function copyPicture(img: string) {
      try {
        const response = await fetch(img);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
      } catch (err: any) {
        console.error(err.name, err.message);
      }
    }

    function handleCancel() {
      buttonClicked = false;
      divhiglighterClicked = !divhiglighterClicked;
      isEventListenerAdded = false;

      hoveredElement?.removeEventListener('mouseover', eraserHeighLight);
      document.body.removeEventListener('mouseover', afterMouseOver);
      divElement?.remove();
      if (selectionBox) {
        clearGrabElements();
      }
    }

    function eraserHeighLight(e: MouseEvent) {
      if (hoveredElement) {
        hoveredElement.classList.remove('eraser_element');
      }

      eraserElement = e.target as HTMLElement;
      eraserElement.classList.add('eraser_element');

      eraserElement.style.border = '3px solid red';

      eraserElement.addEventListener('click', handleEraser);

      hoveredElement?.addEventListener('mouseout', function (event) {
        if (eraserElement) {
          eraserElement.classList.remove('eraser_element');
          eraserElement.style.border = '';
          eraserElement = null;
        }
      });
    }

    function handleEraser(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();
      if (eraserElement) eraserElement.remove();
    }

    //if clicked the Esc key
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape' || event.keyCode === 27) {
        buttonClicked = false;
        divhiglighterClicked = !divhiglighterClicked;
        isEventListenerAdded = false;
        hoveredElement?.removeEventListener('mouseover', eraserHeighLight);
        document.body.removeEventListener('mouseover', afterMouseOver);
        divElement?.remove();
        if (selectionBox) {
          clearGrabElements();
        }
      }
    }

    // Adding an event listener to the document to listen for "keydown" events
    document.addEventListener('keydown', handleEscKey);

    // selection by user
    function afterMouseDown(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      document.body.addEventListener('mousemove', mouseMoving);
    }

    function mouseMoving(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging || !selectionBox || !insideDiv) return;

      if (isDragging) {
        endX = e.clientX;
        endY = e.clientY;

        const left = Math.min(startX!, endX);
        const top = Math.min(startY!, endY);
        const width = Math.abs(endX - startX!);
        const height = Math.abs(endY - startY!);

        selectionBox.style.left = `${left}px`;
        selectionBox.style.top = `${top}px`;
        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;
        const rect = selectionBox.getBoundingClientRect();
        const vertices = {
          topLeft: {
            x: rect.left,
            y: rect.top,
          },
          bottomLeft: {
            x: rect.left,
            y: rect.bottom,
          },
          bottomRight: {
            x: rect.right,
            y: rect.bottom,
          },
          topRight: {
            x: rect.right,
            y: rect.top,
          },
        };

        const polygonString = Object.values(vertices)
          .map((vertex) => `${Math.floor(vertex.x)}px ${Math.floor(vertex.y)}px`)
          .join(', ');
        insideDiv.style.clipPath = `polygon(${polygonString}, ${Math.floor(vertices.topLeft.x)}px ${Math.floor(vertices.topLeft.y)}px,0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)`;

        // const clipPathValue = `polygon(${left}px ${top}px, ${left + width}px ${top}px, ${left + width}px ${top + height}px, ${left}px ${top + height}px)`;
        // selectionBox.style.clipPath = clipPathValue;
        document.body.addEventListener('mouseup', afterMouseUp);
        document.body.removeEventListener('mouseover', clearTextElement);
      }
    }

    function afterMouseUp(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      document?.body?.removeEventListener('mousedown', afterMouseDown);
      document?.body?.removeEventListener('mousemove', mouseMoving);
      if (selectionBox) creatingDownloadBtn(selectionBox);
      hoveredElement = selectionBox;
      isDragging = false;
    }

    function clearGrabElements() {
      bodyEle.style.cursor = 'default';
      if (selectionBox) {
        selectionBox.style.border = 'none';
        selectionBox.style.width = '0';
        selectionBox.style.height = '0';
      }
      document?.body?.removeEventListener('mousedown', afterMouseDown);
      document?.body?.removeEventListener('mousemove', mouseMoving);
      document?.body?.removeEventListener('mouseup', afterMouseUp);
      selectionBox?.remove();
    }

    async function removeSelectionBoxBorder() {
      if (selectionBox) {
        selectionBox.style.border = 'none';
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 10);
        });
      } else {
        return false;
      }
    }

    function clearTextElement() {
      let appenedDivWithText = document.querySelector('.inside-div');
      if (appenedDivWithText && appenedDivWithText.innerHTML?.trim() !== '') {
        appenedDivWithText.innerHTML = '';
      }
    }

    //shortcut key's
    document.addEventListener('keydown', handleKeyDown);

    // Function to handle keyboard events
    function handleKeyDown(event: KeyboardEvent) {
      // Check if the pressed key combination is Alt + D
      if ((event.metaKey && event.altKey && event.code === 'KeyZ') || (event.ctrlKey && event.altKey && event.code === 'KeyZ')) {
        console.log('cadiv');

        afterGetMsg(CaptureMessage.CAPTURE_DIV);
      }
      // Check if the pressed key combination is Alt + C
      else if ((event.metaKey && event.altKey && event.code === 'KeyX') || (event.ctrlKey && event.altKey && event.code === 'KeyX')) {
        console.log('cacus');

        afterGetMsg(CaptureMessage.CUSTOM_CAPTURE);
      }
    }

    // settingsHook.subscribe(({ settings }) => {
    //   if (settings.licenseModalVisible) {
    //     selector.start();
    //   } else {
    //     selector.handleCancel();
    //   }
    //   console.log('settings changed', settings);
    // });

    // selector.setButtonsShowCallback(async (element, rect) => {
    //   console.log({ element, rect });
    // const actionButtons = await createAndMountUI(ctx, {
    //   anchor: 'body',
    //   children: (
    //     <ActionButtons
    //       position={rect}
    //       showEraser={true}
    //       onCopy={() => {
    //         selector.handleCopy();
    //       }}
    //       onDownload={() => {
    //         selector.handleDownload();
    //       }}
    //       onEraser={() => {
    //         selector.toggleEraser();
    //       }}
    //       onCancel={() => {
    //         selector.handleCancel();
    //         actionButtons?.remove();
    //       }}
    //     />
    //   ),
    // });
    // });
  },
});
