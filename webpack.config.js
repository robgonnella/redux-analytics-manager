const path = require('path');
const mode = process.env.NODE_ENV || 'production';

module.exports = {
  mode: mode,
  entry: [
    './src/index.ts',
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
    globalObject: "typeof self !== 'undefined' ? self : this"
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loaders: ['ts-loader'],
        exclude: [path.resolve(__dirname, 'node_modules')]
      },
    ],
  }
};
