export function isFunction(fn) {
  return Object.prototype.toString.call(fn) === '[object Function]';
}

export function isNode(node) {
  return node && node.nodeType === 1 && typeof node.nodeName === 'string';
}
const userAgent = navigator.userAgent;

export const isFirefox = (userAgent.indexOf('Firefox') >= 0);
export const isPad = userAgent.match(/(iPad).*OS\s([\d_]+)/);
export const isPhone = !isPad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/);
export const isAndroid = userAgent.match(/(Android)\s+([\d.]+)/);

export function getDeviceScaleRadio() {
  let ratio = 0;
  const screen = window.screen;

  if (window.devicePixelRatio !== undefined) {
    ratio = window.devicePixelRatio;
  } else if (~userAgent.toLowerCase().indexOf('msie')) {
    if (screen.deviceXDPI && screen.logicalXDPI) {
      ratio = screen.deviceXDPI / screen.logicalXDPI;
    }
  } else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
    ratio = window.outerWidth / window.innerWidth;
  }

  if (ratio) {
    ratio = Math.round(ratio * 100);
  }

  return ratio;
}

export function merge() {
  for (let i = 1; i < arguments.length; i++) {
    for (const key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key)) {
        arguments[0][key] = arguments[i][key];
      }
    }
  }
  return arguments[0];
}

let scrollbarWidth;
export const getScrollbarWidth = function() {
  if (scrollbarWidth !== undefined) return scrollbarWidth;
  const e = document.createElement('div');
  e.style.position = 'absolute';
  e.style.top = '-9999px';
  e.style.width = '100px';
  e.style.height = '100px';
  e.style.overflow = 'scroll';
  document.body.appendChild(e);
  scrollbarWidth = e.offsetWidth - e.clientWidth;
  document.body.removeChild(e);
  return scrollbarWidth;
};

export const cancelBubble = function(event) {
  if (!event) event = window.event;

  if (isFunction(event.stopPropagation)) {
    event.stopPropagation();
  } else {
    event.cancelBubble = true;
  }

  if (event.cancelBubble === false) {
    event.cancelBubble = true;
  }
};

const trim = str => str.replace(/(^\s*)|(\s*$)/g, '');

function hasClass(element, className) {
  if (!element || !className) return false;

  className = trim(className);

  if (element.classList) {
    return element.classList.contains(className);
  } else {
    return ` ${element.className} `.indexOf(` ${className} `) > -1;
  }
}

export function addClass(element, classNames) {
  if (!element || !classNames) return;

  const array = Array.isArray(classNames) ? classNames : trim(classNames).split(/\s/);
  const len = array.length;

  for (let i = 0; i < len; i++) {
    const className = array[i];

    if (className && !hasClass(element, className)) {
      if (element.classList) {
        element.classList.add(className);
      } else {
        element.className += ' ' + className;
      }
    }
  }
}

export function removeClass(element, classNames) {
  if (!element || !classNames) return;

  const array = Array.isArray(classNames) ? classNames : trim(classNames).split(/\s/);
  const len = array.length;

  for (let i = 0; i < len; i++) {
    const className = array[i];

    if (className && hasClass(element, className)) {
      if (element.classList) {
        element.classList.remove(className);
      } else {
        element.className = ` ${element.className} `.replace(` ${className} `, ' ');
        element.className = trim(element.className);
      }
    }
  }
}

let raf;
export function requestAnimationFrame(callback) {
  if (!raf) {
    raf = (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function(callback) {
        return setTimeout(callback, 16);
      }
    ).bind(window);
  }
  return raf(callback);
}

let caf;
export function cancelAnimationFrame(id) {
  if (!caf) {
    caf = (
      window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame ||
      function(id) {
        clearTimeout(id);
      }
    ).bind(window);
  }
  caf(id);
}

export function createStyles(styleText) {
  var style = document.createElement('style');
  style.type = 'text/css';

  if (style.styleSheet) {
    style.styleSheet.cssText = styleText;
  } else {
    style.appendChild(document.createTextNode(styleText));
  }
  (document.querySelector('head') || document.body).appendChild(style);
  return style;
}

export function getComputedStyle(elem, prop, pseudo) {
  // for older versions of Firefox, `getComputedStyle` required
  // the second argument and may return `null` for some elements
  // when `display: none`
  const computedStyle = window.getComputedStyle(elem, pseudo || null) || {
    display: 'none'
  };

  return computedStyle[prop];
}

export function getRenderInfo(elem) {
  if (!document.documentElement.contains(elem)) {
    return {
      detached: true,
      rendered: false
    };
  }

  let current = elem;
  while (current !== document) {
    if (getComputedStyle(current, 'display') === 'none') {
      return {
        detached: false,
        rendered: false
      };
    }
    current = current.parentNode;
  }

  return {
    detached: false,
    rendered: true
  };
}
