// BD 2026

// Built from default @ https://webpack.js.org/guides/getting-started and Ray Optics' webpack config

import path from "path";
//import { fileURLToPath } from "node:url";
import HtmlWebpackPlugin from "html-webpack-plugin"

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

//console.log("Dir name: ", __dirname)
//console.log(" name: ", __filename)

export default (env, argv) => {
    const isProduction = argv.mode === 'production';
  
    return {
        entry: {
            index: "./src/index.js",
        },
        // entry: "./src/index.js",
        output: {
            filename: "app/[name].js",
            path: path.resolve("dist"),
            assetModuleFilename: (pathData) => {
                // Borrowed from Ray Optics' webpack config
                const pathToFile = path.dirname(pathData.filename).split('/').slice(1).join('/');
                return `${pathToFile}/[name][ext]`
            },
            clean: true,
        },
        module: {
            rules: [
                {
                    test: /\.html$/,
                    use:['html-loader']
                },
                {
                    test: /\.(scss)$/,
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(png|svg|jpe?g|gif|woff2?|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: "Testing",
                template: "./src/index.html",
                filename: "app/index.html",
                path: "./dist"
            }),
        ],
        resolve: {
            modules: [
                path.resolve("dist"),
                "node_modules"
            ],
            extensions: [".js"]
        },
        mode: isProduction ? 'production' : 'development',
        cache: { type: "filesystem" },
        devServer: {
            static: {
                directory: "./dist",
                watch: false,
                publicPath: "/",
            },
            compress: false,//isProduction ? true : false,
            port: 9000,
            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                    runtimeErrors: true,
                },
            },
            hot: true,
        },
        devtool: isProduction ? 'source-map' : 'eval-source-map',
    };
};
