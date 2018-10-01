import builtins from 'rollup-plugin-node-builtins';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

export default
  [
    {
      // browser umd
      input: 'module/index.js',
      output: {
        dir: 'dist',
        file: 'index.js',
        format: 'umd',
        name: "ReduxAnalyticsManager"
      },
      plugins: [
        resolve({
          main: false,
          browser: true,
        }),
        builtins(),
        babel()
      ]
    }
  ];
