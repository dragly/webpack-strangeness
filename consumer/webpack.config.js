const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.wasm' ],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin(),
  ],
  mode: 'development',
  devServer: {
    writeToDisk: true,
  },
};
