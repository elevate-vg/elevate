/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = [
   // {
   //    entry: '../../node_modules/prisma/build/index.js',
   //    target: 'node',
   //    externals: ['_http_common'], // in order to ignore all modules in node_modules folder
   //    module: {
   //       rules: [
   //          {
   //             test: /\.tsx?$/,
   //             use: 'ts-loader',
   //             exclude: /node_modules/,
   //          },
   //          {
   //             test: /\.mjs$/,
   //             include: /node_modules/,
   //             type: 'javascript/auto',
   //             // graphql module needs this
   //             resolve: {
   //                fullySpecified: false,
   //             },
   //          },
   //          {
   //             test: /\.js$/,
   //             exclude: /node_modules/,
   //             use: {
   //                loader: 'babel-loader',
   //             },
   //             // graphql module needs this
   //             // resolve: {
   //             //    fullySpecified: false,
   //             // },
   //          },
   //       ],
   //    },
   //    mode: 'production',
   //    optimization: {
   //       minimize: false,
   //    },
   //    output: {
   //       filename: 'prisma.js',
   //       path: path.resolve('/Users/simonwjackson/storage/code/elevate/apps/core'),
   //    },
   // },
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
   },
]
