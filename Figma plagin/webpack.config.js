const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineSourceWebpackPlugin = require('inline-source-webpack-plugin');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  
  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  
  entry: {
    code: './src/code.ts', // The plugin code
    ui: './src/ui.ts',     // Optional: if you want to separate UI logic
  },
  
  module: {
    rules: [
      // TypeScript loader
      { 
        test: /\.tsx?$/, 
        use: 'ts-loader', 
        exclude: /node_modules/ 
      },
      // Optional: for CSS if needed
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  
  // Webpack tries these extensions for you when importing
  resolve: { extensions: ['.ts', '.js'] },
  
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  
  // Generate an HTML file with the JavaScript inlined
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      chunks: ['ui'],
      inject: 'body',
      inlineSource: '.(js)$'
    }),
    new InlineSourceWebpackPlugin({
      compress: true,
      rootpath: './src',
      noAssetMatch: 'warn'
    })
  ],
}); 