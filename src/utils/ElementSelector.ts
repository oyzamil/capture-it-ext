interface Position {
  x: number;
  y: number;
}

interface Rectangle {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface SelectionOptions {
  onCapture?: (element: HTMLElement, rect: Rectangle, base64: string) => void;
  onCancel?: () => void;
  showEraser?: boolean;
}

export default class ElementSelector {
  private isActive: boolean = false;
  private hoveredElement: HTMLElement | null = null;
  private overlayDiv: HTMLDivElement | null = null;
  private borderDiv: HTMLDivElement | null = null;
  private insideDiv: HTMLDivElement | null = null;
  private buttonsContainer: HTMLDivElement | null = null;
  private options: SelectionOptions;
  private isEraserActive: boolean = false;
  private eraserElement: HTMLElement | null = null;
  private onButtonsShow?: (element: HTMLElement, rect: Rectangle) => void;

  constructor(options: SelectionOptions = {}) {
    this.options = {
      showEraser: true,
      ...options,
    };
  }

  public setButtonsShowCallback(callback: (element: HTMLElement, rect: Rectangle) => void): void {
    this.onButtonsShow = callback;
  }

  public start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.createOverlay();
    this.attachEventListeners();
  }

  public stop(): void {
    if (!this.isActive) return;

    this.isActive = false;
    this.removeOverlay();
    this.removeEventListeners();
    this.options.onCancel?.();
  }

  private createOverlay(): void {
    this.overlayDiv = document.createElement('div');
    this.overlayDiv.className = 'element-selector-overlay';
    this.overlayDiv.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 999999999;
      pointer-events: none;
    `;

    this.insideDiv = document.createElement('div');
    this.insideDiv.style.cssText = `
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.58);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 50px;
      font-weight: bold;
      line-height: 1.4;
      color: white;
      pointer-events: none;
    `;
    this.insideDiv.innerHTML = 'Move the mouse and Click<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;to select area';

    this.borderDiv = document.createElement('div');
    this.borderDiv.style.cssText = `
      position: fixed;
      left: -2px;
      top: -2px;
      width: 4px;
      height: 4px;
      border: 1px dashed rgb(243, 248, 255);
      box-sizing: border-box;
      pointer-events: none;
    `;

    this.overlayDiv.appendChild(this.insideDiv);
    this.overlayDiv.appendChild(this.borderDiv);
    document.body.appendChild(this.overlayDiv);
  }

  private removeOverlay(): void {
    this.overlayDiv?.remove();
    this.overlayDiv = null;
    this.insideDiv = null;
    this.borderDiv = null;
    this.removeButtonsContainer();
  }

  private removeButtonsContainer(): void {
    this.buttonsContainer?.remove();
    this.buttonsContainer = null;
  }

  private attachEventListeners(): void {
    document.addEventListener('mouseover', this.handleMouseOver);
    document.addEventListener('click', this.handleClick);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  private removeEventListeners(): void {
    document.removeEventListener('mouseover', this.handleMouseOver);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleMouseOver = (event: MouseEvent): void => {
    if (!this.isActive || this.buttonsContainer) return;

    if (this.insideDiv && this.insideDiv.innerHTML.trim() !== '') {
      this.insideDiv.innerHTML = '';
    }

    this.hoveredElement = event.target as HTMLElement;
    const rect = this.hoveredElement.getBoundingClientRect();

    if (this.borderDiv) {
      this.borderDiv.style.top = `${Math.floor(rect.top)}px`;
      this.borderDiv.style.left = `${Math.floor(rect.left)}px`;
      this.borderDiv.style.width = `${Math.floor(rect.width)}px`;
      this.borderDiv.style.height = `${Math.floor(rect.height)}px`;
    }

    const vertices = {
      topLeft: { x: rect.left, y: rect.top },
      bottomLeft: { x: rect.left, y: rect.bottom },
      bottomRight: { x: rect.right, y: rect.bottom },
      topRight: { x: rect.right, y: rect.top },
    };

    const polygonString = Object.values(vertices)
      .map((vertex) => `${Math.floor(vertex.x)}px ${Math.floor(vertex.y)}px`)
      .join(', ');

    if (this.insideDiv) {
      this.insideDiv.style.clipPath = `polygon(${polygonString}, ${Math.floor(vertices.topLeft.x)}px ${Math.floor(vertices.topLeft.y)}px, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)`;
    }
  };

  private handleClick = (event: MouseEvent): void => {
    if (!this.isActive || this.buttonsContainer || !this.hoveredElement) return;

    event.preventDefault();
    event.stopPropagation();

    if (this.borderDiv) {
      this.borderDiv.style.border = 'none';
    }

    this.showButtonsContainer();
  };

  private showButtonsContainer(): void {
    if (!this.hoveredElement) return;

    const rect = this.hoveredElement.getBoundingClientRect();

    this.buttonsContainer = document.createElement('div');
    this.buttonsContainer.id = 'element-selector-buttons';
    this.buttonsContainer.style.cssText = `
      position: fixed;
      z-index: 999999;
      pointer-events: auto;
    `;

    this.overlayDiv?.appendChild(this.buttonsContainer);

    // Notify React component to render buttons
    this.onButtonsShow?.(this.hoveredElement, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }

  public async captureElementAsImage(): Promise<string | null> {
    if (!this.hoveredElement) return null;

    try {
      const rect = this.hoveredElement.getBoundingClientRect();
      const canvas = document.createElement('canvas');
      const scale = window.devicePixelRatio || 1;

      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.scale(scale, scale);
      ctx.fillStyle = window.getComputedStyle(this.hoveredElement).backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.fillStyle = '#333333';
      ctx.font = '16px Arial';
      ctx.fillText(`Element: ${this.hoveredElement.tagName}`, 10, 30);
      ctx.fillText(`Size: ${Math.round(rect.width)}x${Math.round(rect.height)}`, 10, 50);

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing element:', error);
      return null;
    }
  }

  public async handleCopy(): Promise<void> {
    if (!this.hoveredElement) return;

    try {
      const base64Image = await this.captureElementAsImage();
      if (!base64Image) return;

      const response = await fetch(base64Image);
      const blob = await response.blob();

      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);

      const rect = this.hoveredElement.getBoundingClientRect();
      this.options.onCapture?.(
        this.hoveredElement,
        {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        base64Image
      );

      this.stop();
    } catch (error) {
      console.error('Error copying image:', error);
    }
  }

  public async handleDownload(): Promise<void> {
    if (!this.hoveredElement) return;

    try {
      const base64Image = await this.captureElementAsImage();
      if (!base64Image) return;

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const elementName = this.hoveredElement.tagName.toLowerCase();
      link.download = `element-${elementName}-${timestamp}.png`;
      link.href = base64Image;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const rect = this.hoveredElement.getBoundingClientRect();
      this.options.onCapture?.(
        this.hoveredElement,
        {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        base64Image
      );

      this.stop();
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }

  public handleCancel(): void {
    this.stop();
  }

  public toggleEraser(): void {
    this.isEraserActive = !this.isEraserActive;

    if (this.isEraserActive) {
      document.addEventListener('mouseover', this.handleEraserMouseOver);
      document.addEventListener('click', this.handleEraserClick);
    } else {
      document.removeEventListener('mouseover', this.handleEraserMouseOver);
      document.removeEventListener('click', this.handleEraserClick);
      this.clearEraserHighlight();
    }
  }

  private handleEraserMouseOver = (event: MouseEvent): void => {
    if (!this.isEraserActive) return;

    this.clearEraserHighlight();
    this.eraserElement = event.target as HTMLElement;

    if (this.eraserElement !== this.overlayDiv && !this.overlayDiv?.contains(this.eraserElement)) {
      this.eraserElement.style.outline = '3px solid red';
      this.eraserElement.style.cursor = 'pointer';
    }
  };

  private handleEraserClick = (event: MouseEvent): void => {
    if (!this.isEraserActive || !this.eraserElement) return;

    event.preventDefault();
    event.stopPropagation();

    if (this.eraserElement !== this.overlayDiv && !this.overlayDiv?.contains(this.eraserElement)) {
      this.eraserElement.remove();
      this.eraserElement = null;
    }
  };

  private clearEraserHighlight(): void {
    if (this.eraserElement) {
      this.eraserElement.style.outline = '';
      this.eraserElement.style.cursor = '';
      this.eraserElement = null;
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' || event.keyCode === 27) {
      this.stop();
    }
  };

  public getHoveredElement(): HTMLElement | null {
    return this.hoveredElement;
  }

  public isActiveSelector(): boolean {
    return this.isActive;
  }
}
