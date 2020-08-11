import buble from '@rollup/plugin-buble';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import { uglify } from 'rollup-plugin-uglify';
import autoprefixer from 'autoprefixer';
import { GlobalName } from './src/const';
import livereload from 'rollup-plugin-livereload';

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require('child_process').spawn(
        'npm',
        ['run', 'start', '--', '--dev'],
        {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true
        }
      );

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

export default {
  input: './src/main.js',
  output: {
    file: `./index.js`,
    name: GlobalName,
    format: 'umd',
    sourcemap: false
  },
  plugins: [
    postcss({
      inject: false,
      extract: './style.css',
      minimize: true,
      plugins: [autoprefixer()]
    }),
    json(),
    buble(),
    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),
    !production && livereload('docs'),
    production && uglify()
  ]
};
