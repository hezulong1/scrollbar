import buble from '@rollup/plugin-buble';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import { uglify } from 'rollup-plugin-uglify';
import autoprefixer from 'autoprefixer';

export default {
  input : './website/js/app.js',
  output: {
    file     : `./website/bundle.js`,
    format   : 'iife',
    sourcemap: false
  },
  plugins: [
    postcss({
      inject  : false,
      extract : './website/bundle.css',
      minimize: true,
      plugins : [autoprefixer()]
    }),
    json(),
    buble(),
    uglify()
  ]
};
