// https://github.com/TheoXiong/scroll-ease-efficient/blob/master/index.js

import { requestAnimationFrame, cancelAnimationFrame } from './utils';

const RUN = 1;
/**
 * Scroll the element to the specified position, it is apply to vertical direction
 * @param {Dom} ele target element
 * @param {Number} pos specified position
 * @param {Object} options include property: direction timingFunction duration factor
 *        direction: vertical or horizontal
 *        timingFunction: specify velocity curve of scrolling, default value is 'linear'
 *        duration: specify time of scrolling, default value is 1000,
 *        factor: specify the factor of gradually scrolling, it is only for gradually mode, should less then 100, and more then 1
 */
function scrollTo(ele, pos, options) {
  if (
    !(
      ele &&
      typeof ele.scrollTop === 'number' &&
      typeof ele.scrollHeight === 'number' &&
      typeof ele.scrollLeft === 'number' &&
      typeof ele.scrollWidth === 'number' &&
      typeof pos === 'number' &&
      pos >= 0
    )
  ) {
    return;
  }
  const eleInfo = {
    scrollTop: ele.scrollTop,
    scrollLeft: ele.scrollLeft,
    scrollHeight: ele.scrollHeight,
    scrollWidth: ele.scrollWidth,
    clientHeight: ele.clientHeight,
    clientWidth: ele.clientWidth
  };

  const opt = options && typeof options === 'object' ? options : {};
  opt.timingFunction = opt.timingFunction || 'linear';
  opt.duration = opt.duration > 16.7 ? parseInt(opt.duration) : 1000;
  opt.direction = opt.direction || 'vertical';

  if (!isScrollable(eleInfo, opt.direction, pos)) {
    return;
  }
  const maxScrollDist = getScrollDist(eleInfo, opt.direction);
  pos > maxScrollDist ? (pos = maxScrollDist) : '';

  if (opt.timingFunction === 'gradually') {
    scrollGradually(ele, eleInfo, pos, opt);
  } else if (opt.timingFunction === 'linear') {
    scrollLinear(ele, eleInfo, pos, opt);
  } else if (opt.timingFunction === 'instant') {
    scrollInstant(ele, pos, opt);
  }
}

function scrollGradually(ele, eleInfo, pos, opt) {
  let winFrameId = null;
  let scrollCurr =
    opt.direction === 'vertical' ? eleInfo.scrollTop : eleInfo.scrollLeft;
  let factor = 5;
  if (typeof opt.factor === 'number' && opt.factor > 1 && opt.factor < 100) {
    factor = opt.factor;
  } else {
    factor = calcFactor(Math.abs(pos - scrollCurr), opt.duration);
  }

  const step = function () {
    const distance = pos - scrollCurr;
    scrollCurr += distance / factor;
    if (Math.abs(distance) < 2) {
      scrollInstant(ele, pos, opt);
      if (winFrameId) {
        cancelAnimationFrame(winFrameId);
        winFrameId = null;
      }
    } else {
      scrollInstant(ele, scrollCurr, opt);
      winFrameId = requestAnimationFrame(step);
    }
  };
  step();
}

function scrollLinear(ele, eleInfo, pos, opt) {
  let winFrameId = null;
  let scrollCurr =
    opt.direction === 'vertical' ? eleInfo.scrollTop : eleInfo.scrollLeft;
  const stepTimes = opt.duration / (1000 / 60);
  const stepDist = (pos - scrollCurr) / stepTimes;
  let stepCnt = 0;

  const step = function () {
    scrollCurr += stepDist;
    stepCnt++;
    if (stepCnt >= stepTimes || Math.abs(pos - scrollCurr) <= stepDist + RUN) {
      scrollInstant(ele, pos, opt);
      if (winFrameId) {
        cancelAnimationFrame(winFrameId);
        winFrameId = null;
      }
    } else {
      scrollInstant(ele, scrollCurr, opt);
      winFrameId = requestAnimationFrame(step);
    }
  };
  step();
}

function scrollInstant(ele, pos, opt) {
  if (opt.direction === 'vertical') {
    ele.scrollTop = pos;
  } else {
    ele.scrollLeft = pos;
  }
}

/**
 * Check whether the element is scrollable
 * @param {Dom} eleInfo target element information
 * @param {String} direction scroll direction, the default value is 'vertical'
 */
function isScrollable(eleInfo, direction, pos) {
  direction = direction || 'vertical';
  if (direction === 'vertical') {
    return (
      eleInfo.scrollHeight > eleInfo.clientHeight && pos !== eleInfo.scrollTop
    );
  } else if (direction === 'horizontal') {
    return (
      eleInfo.scrollWidth > eleInfo.clientWidth && pos !== eleInfo.scrollLeft
    );
  }
}

function getScrollDist(eleInfo, direction) {
  direction = direction || 'vertical';
  if (direction === 'vertical') {
    return eleInfo.scrollHeight - eleInfo.clientHeight;
  } else if (direction === 'horizontal') {
    return eleInfo.scrollWidth - eleInfo.clientWidth;
  }
}

/**
 * Calculate the factor of Smooth moving, according to distance and duration
 * @param {Number} distance between target position and current scrollTop
 * @param {Number} duration the time from beginning to end of scrolling
 */
function calcFactor(distance, duration) {
  const stepTimes = duration / (1000 / 60);
  return 1 / (1 - Math.pow(2 / distance, 1 / stepTimes));
}

export default scrollTo;
