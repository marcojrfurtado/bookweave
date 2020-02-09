const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
        use: [
          {
              loader: "babel-loader",
              options: {
                  presets: [
                      "@babel/preset-env",
                      "@babel/preset-react"
                  ],
                  plugins: [
                      "@babel/plugin-syntax-dynamic-import",
                      "@babel/plugin-proposal-class-properties",
                      "@babel/transform-runtime"
                  ]
              }
            }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      inlineSource: '.js$'
    }),
    new HtmlWebpackInlineSourcePlugin()
  ]
};
