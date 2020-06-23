declare namespace Scrollbar {
  export interface Options {
    /**
     * 作用对象
     * @default null
     */
    element: string | HTMLElement;
    /**
     * 启用滚动反转
     * @default false
     */
    horizontal?: boolean;
    /**
     * 滚动滑块最小长度
     * @default 20
     */
    minThumbSize?: number;
    /**
     * 启用强制渲染虚拟滚动条（仅在 PC 端有效），原始滚动条宽度为 0，则不渲染虚拟滚动条
     * @default true
     */
    forceRenderTrack?: boolean;
    /**
     * 启用渲染模式
     * @default true
     */
    useRender?: boolean;
    /**
     * 启用监听模式，默认值根据滚动条宽度是否大于0
     * @default 根据滚动条宽度是否大于0
     */
    useResize?: boolean;
    /**
     * 启用阴影模式
     * @default false
     */
    useShadow?: boolean;
    
    /**
     * 渲染前钩子
     */
    beforeCreate(): void;
    /**
     * 渲染后钩子
     */
    created(): void;
    /**
     * 销毁前钩子
     */
    beforeDestroy(): void;
    /**
     * 销毁后钩子
     */
    destroyed(): void;
    /**
     * 变化时钩子
     */
    onResize(): void;
    /**
     * 滚动时钩子
     */
    onScroll(): void;
    /**
     * 更新时钩子
     */
    onUpdate(): void;
  }
}

declare class Scrollbar {
  constructor(element: string | HTMLElement, options?: Scrollbar.Options);
  element: string | HTMLElement;
  horizontal: boolean;
  minThumbSize: number;
  forceRenderTrack: boolean;
  useRender: boolean;
  useResize: boolean;
  useShadow: boolean;
  beforeCreate: any;
  created: any;
  beforeDestroy: any;
  destroyed: any;
  onResize: any;
  onScroll: any;
  onUpdate: any;
  private _events: {};
  private _scrollbarWidth: number;
  private _preventRenderTrack: any;
  private _created: boolean;
  private _cursorDown: boolean;
  private _prevPageX: number;
  private _prevPageY: number;
  private _scrollTopMax: number;
  private _scrollLeftMax: number;
  private _trackTopMax: number;
  private _trackLeftMax: number;
  $view: HTMLElement;
  $scrollbarY: HTMLElement;
  $scrollbarX: HTMLElement;
  $sliderY: HTMLElement;
  $sliderX: HTMLElement;
  $shadowY: HTMLElement;
  $shadowX: HTMLElement;
  $resizeObserver: HTMLElement;
  create(): this;
  update(): this;
  destroy(): void;
  getViewElement(): HTMLElement;
  private _createResizeTrigger(): void;
  private _createShadow(): void;
  private _resizeHandler(): void;
  private _bindEvents(): this;
  private _unbindEvents(): this;
  private _scrollHandler(): void;
  private _setShadowStyle(): void;
  private _mouseScrollTrackHandler(e: Event): void;
  private _clickTrackHandler(vertical: boolean): (e: Event) => void;
  private _clickThumbHandler(vertical: boolean): (e: Event) => void;
  private _startDrag(e: Event): void;
  private _mouseUpDocumentHandler(): void;
  private _mouseMoveDocumentHandler(e: Event): void;
}

export default Scrollbar;
