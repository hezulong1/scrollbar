// reference https://github.com/noeldelgado/gemini-scrollbar/blob/master/index.js

import './style.less';

import { merge, getScrollbarWidth, addClass, removeClass, cancelBubble, getComputedStyle, isFunction, isNode, isFirefox, isMobile, requestAnimationFrame, cancelAnimationFrame, supportPassive } from './utils';
import { addListener as addResizeListener, removeListener as removeResizeListener } from './resize-detector';
import { GlobalName, CLASSNAMES } from './const';

// import scrollTo from './smooth-scroll';

const WHEEL = 'onwheel' in document.body ? 'wheel' : document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
const ENABLE_TRACK_SCROLL_SMOOTH = true

class Scrollbar {
  constructor(options) {
    if (isNode(options)) {
      options = { element: options };
    }
    // 作用对象
    this.element = null;
    // 配置
    this.horizontal = false; // 启用滚动反转，默认关闭
    this.minThumbSize = 20; // 滚动滑块最小长度
    this.forceRenderTrack = true; // 启用强制渲染虚拟滚动条（仅在 PC 端有效），原始滚动条宽度为 0，则不渲染虚拟滚动条，默认开启
    this.useRender = true; // 启用渲染模式，默认打开渲染默认，关闭需要手动渲染
    this.useResize = true; // 启用监听模式，默认值根据滚动条宽度是否大于0
    this.useShadow = false; // 启用阴影模式，默认关闭
    // 事件钩子
    this.beforeCreate = null;
    this.created = null;
    this.beforeDestroy = null;
    this.destroyed = null;
    this.onResize = null;
    this.onScroll = null;
    this.onUpdate = null;
    // 合并参数
    merge(this, options);
    // 记录值
    this._events = {};
    this._scrollbarWidth = getScrollbarWidth();
    this._preventRenderTrack = isMobile || (this.forceRenderTrack === false && this._scrollbarWidth === 0);
    this._created = false;
    this._cursorDown = false;
    // 变化值
    this._prevPageX = 0;
    this._prevPageY = 0;
    this._scrollTopMax = 0;
    this._scrollLeftMax = 0;
    this._trackTopMax = 0;
    this._trackLeftMax = 0;
    // DomNode
    this.$view = this.element;
    this.$scrollbarY = null;
    this.$scrollbarX = null;
    this.$sliderY = null;
    this.$sliderX = null;
    this.$shadowY = null;
    this.$shadowX = null;
    this.$resizeObserver = null;

    // 处理是否需要监听器
    if ('useResize' in options) {
      this.useResize = options.useResize;
    } else if (this._preventRenderTrack) {
      this.useResize = isFunction(this.onResize);
    }
  }

  create() {
    if (this._created) {
      console.warn('calling on a already-created object');
      return this;
    }

    isFunction(this.beforeCreate) && this.beforeCreate();

    if (this.useRender) {
      this.$view = document.createElement('div');
      this.$resizeObserver = document.createElement('div');

      this.$view.className = CLASSNAMES.view;
      this.$resizeObserver.className = CLASSNAMES.resizeObserver;

      while (this.element.childNodes.length > 0) {
        this.$resizeObserver.appendChild(this.element.childNodes[0]);
      }
      this.$view.appendChild(this.$resizeObserver);
      this.element.appendChild(this.$view);

      if (this._preventRenderTrack === false) {
        this.$scrollbarX = document.createElement('div');
        this.$scrollbarY = document.createElement('div');
        this.$sliderX = document.createElement('div');
        this.$sliderY = document.createElement('div');

        this.$scrollbarX.className = CLASSNAMES.horizontalScrollbar;
        this.$scrollbarY.className = CLASSNAMES.verticalScrollbar;
        this.$sliderX.className = CLASSNAMES.thumb;
        this.$sliderY.className = CLASSNAMES.thumb;

        this.$scrollbarX.appendChild(this.$sliderX);
        this.$scrollbarY.appendChild(this.$sliderY);
        this.element.appendChild(this.$scrollbarX);
        this.element.appendChild(this.$scrollbarY);
      }
    } else {
      this.$view = this.element.querySelector('.' + CLASSNAMES.view);
      this.$resizeObserver = this.$view.querySelector('.' + CLASSNAMES.resizeObserver);
      this.$scrollbarX = this.element.querySelector('.' + CLASSNAMES.horizontalScrollbar.split(/\s/).join('.'));
      this.$scrollbarY = this.element.querySelector('.' + CLASSNAMES.verticalScrollbar.split(/\s/).join('.'));

      if (this.$scrollbarX) {
        this.$sliderX = this.$scrollbarX.querySelector('.' + CLASSNAMES.thumb);
      }

      if (this.$scrollbarY) {
        this.$sliderY = this.$scrollbarY.querySelector('.' + CLASSNAMES.thumb);
      }
    }

    addClass(this.element, CLASSNAMES.element);
    this.forceRenderTrack && addClass(this.element, CLASSNAMES.force);
    this._scrollbarWidth <= 0 && addClass(this.element, CLASSNAMES.hiddenDefault);
    this._preventRenderTrack && addClass(this.element, CLASSNAMES.prevented);

    if (this.horizontal === true) {
      // this.$view.style.overflowY = 'auto';
      addClass(this.element, CLASSNAMES.horizontal);
      addClass(this.$scrollbarY, CLASSNAMES.invisible);
    }

    if (this.useShadow) {
      this._createShadow();
    }

    if (this.useResize) {
      this._createResizeTrigger();
    }

    this._created = true;

    isFunction(this.created) && this.created();

    return this._bindEvents().update();
  }

  update() {
    if (this._preventRenderTrack) return this;

    if (this._created === false) {
      console.warn('calling on a not-yet-created object');
      return this;
    }

    if (this._scrollbarWidth > 0) {
      this.$view.style.width = `calc(100% + ${this._scrollbarWidth}px)`;
      this.$view.style.height = `calc(100% + ${this._scrollbarWidth}px)`;
    } else {
      this.$view.style.width = '';
      this.$view.style.height = '';
    }

    // fixed: padding
    const padding = getComputedStyle(this.element, 'padding');
    if (!padding.split(' ').every(item => parseInt(item) === 0)) {
      this.$resizeObserver.style.padding = padding;
      this.element.style.cssText += ';padding: 0px !important;';
    }

    removeClass(this.$scrollbarY, CLASSNAMES.invisible);
    removeClass(this.$scrollbarX, CLASSNAMES.invisible);

    const naturalThumbSizeX = this.$view.clientWidth / this.$view.scrollWidth * this.$scrollbarX.offsetWidth;
    const naturalThumbSizeY = this.$view.clientHeight / this.$view.scrollHeight * this.$scrollbarY.offsetHeight;

    this._scrollTopMax = this.$view.scrollHeight - this.$view.clientHeight;
    this._scrollLeftMax = this.$view.scrollWidth - this.$view.clientWidth;

    let thumbSizeX = 0;
    let thumbSizeY = 0;

    if (this._scrollLeftMax <= 0) {
      addClass(this.$scrollbarX, CLASSNAMES.invisible);
    } else {
      thumbSizeX = Math.max(naturalThumbSizeX, this.minThumbSize);
    }
    this.$sliderX.style.width = thumbSizeX + 'px';

    if (this._scrollTopMax <= 0) {
      addClass(this.$scrollbarY, CLASSNAMES.invisible);
    } else {
      thumbSizeY = Math.max(naturalThumbSizeY, this.minThumbSize);
    }
    this.$sliderY.style.height = thumbSizeY + 'px';

    this._trackTopMax = this.$scrollbarY.clientHeight - this.$sliderY.offsetHeight;
    this._trackLeftMax = this.$scrollbarX.clientWidth - this.$sliderX.offsetWidth;

    isFunction(this.onUpdate) && this.onUpdate();

    this._scrollHandler();
    return this;
  }

  destroy() {
    if (this._created === false) {
      console.warn('calling on a not-yet-created object');
      return this;
    }

    removeClass(this.element, [
      CLASSNAMES.horizontal,
      CLASSNAMES.observed,
      CLASSNAMES.prevented,
      CLASSNAMES.hiddenDefault,
      CLASSNAMES.force,
      CLASSNAMES.element
    ]);

    this._unbindEvents();

    if (this.useResize) {
      removeResizeListener(this.$resizeObserver, this._events.resizeHandler);
    }

    if (this.useShadow) {
      this.element.removeChild(this.$shadowY);
      this.element.removeChild(this.$shadowX);
      this.$shadowY = null;
      this.$shadowX = null;
    }

    if (this.useRender === true) {
      if (!this._preventRenderTrack) {
        this.element.removeChild(this.$scrollbarY);
        this.element.removeChild(this.$scrollbarX);

        this.$scrollbarY = null;
        this.$scrollbarX = null;
        this.$sliderY = null;
        this.$sliderX = null;
      }

      while (this.$resizeObserver.childNodes.length > 0) {
        this.element.appendChild(this.$resizeObserver.childNodes[0]);
      }

      this.element.removeChild(this.$view);
      this.$resizeObserver = null;
      this.$view = null;
    } else {
      this.$view.style.width = '';
      this.$view.style.height = '';

      if (this._preventRenderTrack === false) {
        removeClass(this.$scrollbarY, CLASSNAMES.invisible);
        removeClass(this.$scrollbarX, CLASSNAMES.invisible);
      } else {
        addClass(this.$scrollbarY, CLASSNAMES.invisible);
        addClass(this.$scrollbarX, CLASSNAMES.invisible);
      }
    }

    this._created = false;
    return null;
  }

  getViewElement() {
    return this.$view;
  }

  _createResizeTrigger() {
    addClass(this.element, CLASSNAMES.observed);
    this._events.resizeHandler = this._resizeHandler.bind(this);
    addResizeListener(this.$resizeObserver, this._events.resizeHandler);
  }

  _createShadow() {
    this.$shadowX = document.createElement('div');
    this.$shadowY = document.createElement('div');
    this.element.appendChild(this.$shadowX);
    this.element.appendChild(this.$shadowY);
    this.$shadowX.className = CLASSNAMES.horizontalShadow + ' ' + CLASSNAMES.invisible;
    this.$shadowY.className = CLASSNAMES.verticalShadow + ' ' + CLASSNAMES.invisible;
  }

  _resizeHandler() {
    // 浏览器缩放，需要重新计算
    // 无须考虑特殊情况，浏览器已经处理好了
    const ratio = window.devicePixelRatio || 1;
    if (ratio) {
      this._scrollbarWidth = getScrollbarWidth() / ratio;
    }
    this.update();
    isFunction(this.onResize) && this.onResize();
  }

  _bindEvents() {
    this._events.scrollHandler = this._scrollHandler.bind(this);
    this._events.clickHorizontalTrackHandler = this._clickTrackHandler(false).bind(this);
    this._events.clickVerticalTrackHandler = this._clickTrackHandler(true).bind(this);
    this._events.clickHorizontalThumbHandler = this._clickThumbHandler(false).bind(this);
    this._events.clickVerticalThumbHandler = this._clickThumbHandler(true).bind(this);
    this._events.mouseScrollTrackHandler = this._mouseScrollTrackHandler.bind(this);
    this._events.mouseUpDocumentHandler = this._mouseUpDocumentHandler.bind(this);
    this._events.mouseMoveDocumentHandler = this._mouseMoveDocumentHandler.bind(this);

    if (!isMobile && this.horizontal) {
      this.$view.addEventListener(WHEEL, this._events.mouseScrollTrackHandler, supportPassive ? { capture: false, passive: passive } : false); // { passive: true }
    } else {
      this.$view.addEventListener('scroll', this._events.scrollHandler);
    }

    if (this._preventRenderTrack === false) {
      this.$scrollbarX.addEventListener('mousedown', this._events.clickHorizontalTrackHandler);
      this.$scrollbarY.addEventListener('mousedown', this._events.clickVerticalTrackHandler);
      this.$sliderX.addEventListener('mousedown', this._events.clickHorizontalThumbHandler);
      this.$sliderY.addEventListener('mousedown', this._events.clickVerticalThumbHandler);
      this.$scrollbarX.addEventListener(WHEEL, this._events.mouseScrollTrackHandler);
      this.$scrollbarY.addEventListener(WHEEL, this._events.mouseScrollTrackHandler);
      document.addEventListener('mouseup', this._events.mouseUpDocumentHandler);
    }

    return this;
  }

  _unbindEvents() {
    this.$view.removeEventListener('scroll', this._events.scrollHandler);
    this.$view.removeEventListener(WHEEL, this._events.mouseScrollTrackHandler);

    if (this._preventRenderTrack === false) {
      this.$scrollbarY.removeEventListener('mousedown', this._events.clickVerticalTrackHandler);
      this.$scrollbarX.removeEventListener('mousedown', this._events.clickHorizontalTrackHandler);
      this.$sliderY.removeEventListener('mousedown', this._events.clickVerticalThumbHandler);
      this.$sliderX.removeEventListener('mousedown', this._events.clickHorizontalThumbHandler);
      this.$scrollbarY.removeEventListener(WHEEL, this._events.mouseScrollTrackHandler);
      this.$scrollbarX.removeEventListener(WHEEL, this._events.mouseScrollTrackHandler);
      document.removeEventListener('mouseup', this._events.mouseUpDocumentHandler);
      document.removeEventListener('mousemove', this._events.mouseMoveDocumentHandler);
    }

    return this;
  }

  _scrollHandler() {
    const x = (this.$view.scrollLeft * this._trackLeftMax / this._scrollLeftMax) || 0;
    const y = (this.$view.scrollTop * this._trackTopMax / this._scrollTopMax) || 0;

    this.useShadow && this._setShadowStyle();

    if (this._preventRenderTrack === false) {
      this.$sliderX.style.msTransform = `translateX(${x}px)`;
      this.$sliderX.style.webkitTransform = `translate3d(${x}px, 0, 0)`;
      this.$sliderX.style.transform = `translate3d(${x}px, 0, 0)`;

      this.$sliderY.style.msTransform = `translateY(${y}px)`;
      this.$sliderY.style.webkitTransform = `translate3d(0, ${y}px, 0)`;
      this.$sliderY.style.transform = `translate3d(0, ${y}px, 0)`;
    }
    // perf: 传入真实的 scrollTop / scrollLeft
    isFunction(this.onScroll) && this.onScroll(this.$view.scrollLeft, this.$view.scrollTop);
  }

  _setShadowStyle() {
    if (this.$view.scrollTop <= 0) {
      removeClass(this.$shadowY, CLASSNAMES.visible);
      addClass(this.$shadowY, CLASSNAMES.invisible);
    } else {
      addClass(this.$shadowY, CLASSNAMES.visible);
      removeClass(this.$shadowY, CLASSNAMES.invisible);
    }

    if (this.$view.scrollLeft >= this.$view.scrollWidth - this.$view.clientWidth) {
      removeClass(this.$shadowX, CLASSNAMES.visible);
      addClass(this.$shadowX, CLASSNAMES.invisible);
    } else {
      addClass(this.$shadowX, CLASSNAMES.visible);
      removeClass(this.$shadowX, CLASSNAMES.invisible);
    }
  }

  _mouseScrollTrackHandler(e) {
    let deltaX = 0;
    let deltaY = 0;

    cancelBubble(e);
    isFunction(e.preventDefault) ? e.preventDefault() : e.returnValue = false; // 阻止默认滚动行为，防止父级滚动

    deltaY = e.deltaY || e.wheelDeltaY || -e.wheelDelta || 0;
    deltaX = e.deltaX || e.wheelDeltaX || 0;

    if (isFirefox) {
      deltaY *= 40;
      deltaX *= 40;
    }

    if (e.shiftKey) {
      [deltaX, deltaY] = [deltaY, deltaX];
    }

    if (this.horizontal) {
      [deltaX, deltaY] = [deltaY, deltaX];
    }

    if (e.altKey) {
      deltaX *= deltaX;
      deltaY *= deltaY;
    }

    if (ENABLE_TRACK_SCROLL_SMOOTH) {
      let stepX = 0;
      let stepY = 0;
      let __id;

      if (Math.abs(deltaY) > 0 || Math.abs(deltaX) > 0) {
        stepX = Math.abs(deltaX) / 10;
        stepY = Math.abs(deltaY) / 10;
      }

      const smoothScrollHandler = () => {
        if (stepX >= Math.abs(deltaX) && stepY >= Math.abs(deltaY)) {
          cancelAnimationFrame(__id);
        } else {
          if (deltaY !== 0 && Math.abs(stepY) <= Math.abs(deltaY)) {
            stepY += deltaY > 0 ? 10 : -10;
            this.$view.scrollTop += deltaY > 0 ? 10 : -10;
          }

          if (deltaX !== 0 && Math.abs(stepX) <= Math.abs(deltaX)) {
            stepX += deltaX > 0 ? 10 : -10;
            this.$view.scrollLeft += deltaX > 0 ? 10 : -10;
          }

          this.horizontal && this._scrollHandler();

          __id = requestAnimationFrame(smoothScrollHandler);
        }
      };
      __id = requestAnimationFrame(smoothScrollHandler);
    } else {
      this.$view.scrollTop += deltaY;
      this.$view.scrollLeft += deltaX;
      this.horizontal && this._scrollHandler();
    }
  }

  _clickTrackHandler(vertical) {
    return e => {
      let offset;
      let thumbPositionPercentage;

      if (vertical) {
        offset = Math.abs(e.target.getBoundingClientRect().top - e.clientY) - this.$sliderY.offsetHeight / 2;
        thumbPositionPercentage = offset * 100 / this.$scrollbarY.offsetHeight;
        this.$view.scrollTop = thumbPositionPercentage * this.$view.scrollHeight / 100;
      } else {
        offset = Math.abs(e.target.getBoundingClientRect().left - e.clientX) - this.$sliderX.offsetWidth / 2;
        thumbPositionPercentage = offset * 100 / this.$scrollbarX.offsetWidth;
        this.$view.scrollLeft = thumbPositionPercentage * this.$view.scrollWidth / 100;
      }

      this.horizontal === true && this._scrollHandler();
    };
  }

  _clickThumbHandler(vertical) {
    return e => {
      cancelBubble(e);

      if (e.ctrlKey || e.button === 2) {
        return;
      }

      addClass(e.currentTarget, CLASSNAMES.active);

      this._startDrag(e);

      if (vertical) {
        this._prevPageY = e.currentTarget.offsetHeight - (e.clientY - e.currentTarget.getBoundingClientRect().top);
      } else {
        this._prevPageX = e.currentTarget.offsetWidth - (e.clientX - e.currentTarget.getBoundingClientRect().left);
      }
    };
  }

  _startDrag(e) {
    e.stopImmediatePropagation();

    this._cursorDown = true;
    addClass(document.body, CLASSNAMES.unselect);

    document.addEventListener('mousemove', this._events.mouseMoveDocumentHandler);
    document.onselectstart = () => false;
  }

  _mouseUpDocumentHandler() {
    this._cursorDown = false;
    this._prevPageX = this._prevPageY = 0;

    removeClass(document.body, CLASSNAMES.unselect);
    removeClass(this.$sliderY, CLASSNAMES.active);
    removeClass(this.$sliderX, CLASSNAMES.active);

    document.removeEventListener('mousemove', this._events.mouseMoveDocumentHandler);
    document.onselectstart = null;
  }

  _mouseMoveDocumentHandler(e) {
    if (this._cursorDown === false) return;

    let offset, thumbClickPosition;

    if (this._prevPageY) {
      offset = e.clientY - this.$scrollbarY.getBoundingClientRect().top;
      thumbClickPosition = this.$sliderY.offsetHeight - this._prevPageY;
      this.$view.scrollTop = this._scrollTopMax * (offset - thumbClickPosition) / this._trackTopMax;
      this.horizontal === true && this._scrollHandler();
      return;
    }

    if (this._prevPageX) {
      offset = e.clientX - this.$scrollbarX.getBoundingClientRect().left;
      thumbClickPosition = this.$sliderX.offsetWidth - this._prevPageX;
      this.$view.scrollLeft = this._scrollLeftMax * (offset - thumbClickPosition) / this._trackLeftMax;

      this.horizontal === true && this._scrollHandler();
    }
  }
}

if (!window[GlobalName]) {
  window[GlobalName] = Scrollbar;
}

export default Scrollbar;
