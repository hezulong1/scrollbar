export default class {
  constructor(from, to, startTime, duration) {
    this.from = from;
    this.to = to;
    this.duration = duration;
    this._startTime = startTime;
    this.animationFrameDisposable = null;
    this._initAnimations();
  }
  _initAnimations() {
    this.scrollLeft = this._initAnimation(
      this.from.scrollLeft,
      this.to.scrollLeft,
      this.to.width
    );
    this.scrollTop = this._initAnimation(
      this.from.scrollTop,
      this.to.scrollTop,
      this.to.height
    );
  }
  _initAnimation(from, to, viewportSize) {
    var delta = Math.abs(from - to);
    if (delta > 2.5 * viewportSize) {
      var stop1 = void 0;
      var stop2 = void 0;
      if (from < to) {
        // scroll to 75% of the viewportSize
        stop1 = from + 0.75 * viewportSize;
        stop2 = to - 0.75 * viewportSize;
      } else {
        stop1 = from - 0.75 * viewportSize;
        stop2 = to + 0.75 * viewportSize;
      }
      return createComposed(
        createEaseOutCubic(from, stop1),
        createEaseOutCubic(stop2, to),
        0.33
      );
    }
    return createEaseOutCubic(from, to);
  }
}

function createEaseOutCubic(from, to) {
  var delta = to - from;
  return function (completion) {
    return from + delta * easeOutCubic(completion);
  };
}
function createComposed(a, b, cut) {
  return function (completion) {
    if (completion < cut) {
      return a(completion / cut);
    }
    return b((completion - cut) / (1 - cut));
  };
}

function easeInCubic(t) {
  return Math.pow(t, 3);
}

function easeOutCubic(t) {
  return 1 - easeInCubic(1 - t); // Math.pow(t - 1, 3) + 1 === 1 - Math.pow(1 - t, 3)
}
