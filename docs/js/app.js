import '../less/app.less';
import Scrollbar from '../../src/main';

new Scrollbar({
  element  : document.body,
  useRender: false
}).create();

new Scrollbar(document.querySelector('.ex0 .content')).create();

new Scrollbar(document.querySelector('.ex1 .list-container')).create();

new Scrollbar({
  element   : document.querySelector('.ex2 .code'),
  horizontal: true
}).create();

new Scrollbar({
  element: document.querySelector('.ex3 .box')
}).create();

new Scrollbar({
  element: document.querySelector('.ex4 .manilla')
}).create();

new Scrollbar(document.querySelector('.ex5 .sample')).create();

new Scrollbar({
  element         : document.querySelector('.ex6 .sample'),
  forceRenderTrack: false
}).create();
