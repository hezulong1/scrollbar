import buble from '@rollup/plugin-buble';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

export default {
  input: './docs/js/app.js',
  output: {
    file: `./docs/bundle.js`,
    format: 'iife',
    sourcemap: false,
  },
  plugins: [
    postcss({
      inject: false,
      extract: './docs/bundle.css',
      minimize: true,
      plugins: [autoprefixer()],
    }),
    json(),
    buble(),
  ],
};
