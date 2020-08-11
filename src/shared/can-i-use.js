export const useCSSPointerEvents = /* #PURE */ (function () {
  const domNode = document.createElement('scrollable-element');
  domNode.style.cssText = 'pointer-events:auto';
  return domNode.style.pointerEvents === 'auto';
})();

export const supportPassive = /* #PURE */ (function () {
  let _passive = false;
  try {
    const opts = {};
    Object.defineProperty(opts, 'passive', {
      // eslint-disable-next-line getter-return
      get() {
        _passive = true;
      }
    });
    window.addEventListener('test-passive', null, opts);
  } catch (e) {
    _passive = false;
  }
  return _passive;
})();
