import nodePolyfills from 'rollup-plugin-node-polyfills';
import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import rollupTypescript from 'rollup-plugin-typescript';

const plugins = [resolve(), nodePolyfills(), babel(), rollupTypescript()];

export default [
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      name: 'ReduxAnalyticsManager',
    },
    plugins,
  },
  {
    input: './src/index.ts',
    output: {
      dir: 'umd',
      format: 'umd',
      name: 'ReduxAnalyticsManager',
    },
    plugins,
  },
];
