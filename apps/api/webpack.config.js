/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
   entry: './src/index.ts',
   target: 'node',
   externalsPresets: { node: true },
   externals: ['_http_common', nodeExternals()], // in order to ignore all modules in node_modules folder
   plugins: [
      new CopyPlugin({
         patterns: [
            { from: './prisma/schema.prisma' },
            { from: '../../node_modules/prisma/query-engine-windows.exe' },
            { from: '../../node_modules/prisma/query-engine-darwin' },
         ],
      }),
   ],
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
   mode: 'production',
   output: {
      filename: 'server.js',
      path: path.resolve(__dirname, '../../dist'),
   },
}
