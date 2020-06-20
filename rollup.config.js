import builtins from 'rollup-plugin-node-builtins';
import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import rollupTypescript from 'rollup-plugin-typescript';

const plugins = [resolve(), builtins(), babel(), rollupTypescript()];

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
