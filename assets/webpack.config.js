const path = require('path');
const glob = require('glob');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, options) => {
  const devMode = options.mode !== 'production';

  return {
    optimization: {
      minimizer: [
        new TerserPlugin({ parallel: true}),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    entry: {
      'app': glob.sync('./vendor/**/*.js').concat(['./js/app.js']),
      'checkAnswer': glob.sync('./vendor/**/*.js').concat(['./js/checkAnswer.js']),
      'notification': glob.sync('./vendor/**/*.js').concat(['./js/notification.js']),
      'round1': glob.sync('./vendor/**/*.js').concat(['./js/round1.js']),
      'round2': glob.sync('./vendor/**/*.js').concat(['./js/round2.js']),
      'round3': glob.sync('./vendor/**/*.js').concat(['./js/round3.js']),
      'socket': glob.sync('./vendor/**/*.js').concat(['./js/socket.js']),
      'confetti': glob.sync('./vendor/**/*.js').concat(['./js/confetti.js']),

    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, '../priv/static/js'),
      publicPath: '/js/'
    },
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [ __filename ] // you may omit this when your CLI automatically adds it
      }
    },
    devtool: devMode ? 'eval-cheap-module-source-map' : undefined,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.[s]?css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.(jpg|png|gif)$/,
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            outputPath: "../static/images/",
            publicPath: "../images/"
          }
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: '../css/app.css' }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'static/', to: '../' }
        ]
      }),
    ]
  }
};
