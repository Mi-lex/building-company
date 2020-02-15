const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BUILD_FOLDER = 'docs'

const config = {
    entry: {
        app: [
            './src/js/main.js',
            './src/sass/style.scss'
        ]
    },

    output: {
        path: path.resolve(__dirname, `./${BUILD_FOLDER}`),
        filename: '[name].js'
    },

    module: {
        rules: [
            { 
                test: /\.html$/, 
                loader: 'html-loader',
                options: {
                    interpolate: true
                }
            },
            {
                test: /\.js$/,
                exclude: [
                    path.resolve(__dirname, './node_modules'),
                    path.resolve(__dirname, './src/js/static'),
                ],
                loader: "babel-loader"
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, "./src/js/static"),
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: './static/[name].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader', 'postcss-loader']
                })
            },
            {
                test: /\.s[ac]ss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        'postcss-loader',
                        'sass-loader'
                    ]
                })
            },
            {
                test: /\.eot|ttf|woff2?$/,
                loader: 'file-loader',
                options: {
                    name: './fonts/[name].[ext]'
                }
            },
            {
                test: /\.(png|jpe?g|gif|ico)$/,
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: './img/[name].[ext]'
                        }
                    },
                ],
            },
        ]
    },
	devServer: {
		historyApiFallback: true,
		contentBase: path.resolve(__dirname, BUILD_FOLDER),
	},
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            Popper: ['popper.js', 'default'],  
        }),
        new ExtractTextPlugin("[name].css"),
        new HtmlWebpackPlugin({
            template: './src/html/main.html.js'
        }),
    ],

    optimization: {
        minimizer: []
    }
};

module.exports = (env, argv) => {

    if (argv.mode === 'production') {
        /**
         * Change rule for images
         * this is not the best approach
         * just don't want make another
         * config due to only one rule
         */
        // the index of imgs rule is one that before last
        const indexOfImgRules = config.module.rules.length - 1;

        config.module.rules[indexOfImgRules] = {
            test: /\.(png|jpe?g|gif|ico)$/,
            loaders: [
                {
                    loader: 'file-loader',
                    options: {
                        name: './img/[name].[ext]'
                    }
                },
                {
                    loader: 'image-webpack-loader',
                    options: {
                      mozjpeg: {
                        progressive: true,
                        quality: 80
                      },
                      optipng: {
                        enabled: false,
                      },
                      pngquant: {
                        quality: '80-90',
                        speed: 2
                      },
                    }
                  },
            ],
        }

        // Plagins
        config.plugins.unshift(
            new CleanWebpackPlugin([BUILD_FOLDER],
                {
                    root: __dirname,
                    verbose: true,
                    dry: false
                }
            )
        )
        config.plugins.push(
            new webpack.LoaderOptionsPlugin({
                minimize: true,
            })
        );
        // Minimizing
        config.optimization.minimizer = [
            new UglifyJsPlugin()
        ]
    }

    return config;
};