import '../less/app.less';
import Scrollbar from '../../src/main';

new Scrollbar({
  element  : document.body,
  useRender: false
}).create();

new Scrollbar({
  element: document.querySelector('.ex0 .content pre')
}).create();

new Scrollbar({
  element         : document.querySelector('.ex1 .list-container'),
  forceRenderTrack: false
}).create();

new Scrollbar({
  element   : document.querySelector('.ex2 .code'),
  horizontal: true,
  useShadow : true
}).create();

new Scrollbar({
  element: document.querySelector('.ex3 .box')
}).create();

new Scrollbar({
  element  : document.querySelector('.ex4 .manilla'),
  useShadow: true
}).create();

new Scrollbar(document.querySelector('.ex5 .sample')).create();

new Scrollbar({
  element: document.querySelector('.ex6 .sample')
}).create();
