/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
   entry: './src/index.ts',
   externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
   module: {
      rules: [
         {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
         },
      ],
   },
   resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
         plugins: path.resolve(__dirname, '../../plugins/'),
         libs: path.resolve(__dirname, '../../libs/'),
         themes: path.resolve(__dirname, '../../themes/'),
      },
   },
   target: 'node',
   mode: 'production',
   output: {
      filename: 'server.js',
      path: path.resolve(__dirname, '../../dist'),
   },
}
