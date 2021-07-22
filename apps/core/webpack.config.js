/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = [
   (env) => {
      // TODO: Detect env to determine what to pack
      // const mode = env.mode === 'prod' ? 'prod' : 'dev'
      // const branch = env.branch ? env.branch : 'develop'
      return {
         // name: 'server',
         entry: './src/index.ts',
         target: 'node',
         externals: ['_http_common'], // in order to ignore all modules in node_modules folder
         plugins: [
            new CopyPlugin({
               patterns: [
                  { from: './prisma/schema.prisma' },
                  { from: '../../libs/electron/', to: './assets/electron/' },
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
               // Prisma: set location of prisma native binaries
               {
                  test: /node_modules\/.prisma\/client\/index.js$/,
                  loader: 'string-replace-loader',
                  options: {
                     search: / +?"value": ?".+\/node_modules\/@prisma\/client",?/gm,
                     replace: '"value":"./bin/prisma",',
                  },
               },
            ],
         },
         resolve: {
            extensions: ['.tsx', '.ts', '.js', '.mjs'],
            alias: {
               plugins: resolve(__dirname, '../../plugins/'),
               libs: resolve(__dirname, '../../libs/'),
               themes: resolve(__dirname, '../../themes/'),
            },
         },
         mode: 'production',
         optimization: {
            minimize: true,
         },
         output: {
            filename: 'server.js',
            path: resolve(__dirname, '../../dist'),
         },
      }
   },
]
