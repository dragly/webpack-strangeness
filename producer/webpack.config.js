const path = require('path');
const webpack = require('webpack');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      library: 'blah',
      libraryTarget: 'umd',
  },
  plugins: [
    new WasmPackPlugin({
      crateDirectory: ".",
    }),
  ],
  mode: 'development',
};
