const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './webpack/TransportWebHID.js',
  output: {
    filename: 'TransportWebHID.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    // Work around for Buffer is undefined:
    // https://github.com/webpack/changelog-v5/issues/10
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      'stream': require.resolve('stream-browserify'),
      'buffer': require.resolve('buffer'),
    },
  },
};
