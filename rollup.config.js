import buble from '@rollup/plugin-buble';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import { uglify } from 'rollup-plugin-uglify';
import autoprefixer from 'autoprefixer';
import { GlobalName } from './src/const';

export default {
  input : './src/main.js',
  output: {
    file     : `./index.js`,
    name     : GlobalName,
    format   : 'umd',
    sourcemap: false
  },
  plugins: [
    postcss({
      inject  : false,
      extract : './style.css',
      minimize: true,
      plugins : [autoprefixer()]
    }),
    json(),
    buble()
    // uglify()
  ]
};
