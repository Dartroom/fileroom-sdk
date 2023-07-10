const path = require('path');

const webTarget = {
  target: 'web',
  entry: './src/index.ts',
  devtool: 'source-map',
  watchOptions: {
    ignored: /node_modules/,
    poll: true,
  },

  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: {
          loader: 'swc-loader',
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/browser'),
    globalObject: 'this',
    library: {
      name: 'Fileroom',
      type: 'umd',
    },
  },
  /*
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 4000,
  },
  */
};

/*
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 4000,
  },
  */

module.exports = [webTarget];
