/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
   entry: './src/index.ts',
   target: 'node',
   externals: ['_http_common'], // in order to ignore all modules in node_modules folder
   plugins: [
      new CopyPlugin({
         patterns: [
            { from: './prisma/schema.prisma' },
            { from: '../../libs/electron/', to: './assets/electron/' },
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
         {
            test: /\.mjs$/,
            include: /node_modules/,
            type: 'javascript/auto',
            // graphql module needs this
            resolve: {
               fullySpecified: false,
            },
         },
      ],
   },
   resolve: {
      extensions: ['.tsx', '.ts', '.js', '.mjs'],
      alias: {
         plugins: path.resolve(__dirname, '../../plugins/'),
         libs: path.resolve(__dirname, '../../libs/'),
         themes: path.resolve(__dirname, '../../themes/'),
      },
   },
   mode: 'production',
   optimization: {
      minimize: false,
   },
   output: {
      filename: 'server.js',
      path: path.resolve(__dirname, '../../dist'),
   },
}
