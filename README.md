# FSW (font-spider-walker) ![font-spider-walker NPM version](https://img.shields.io/npm/v/font-spider-walker.svg?style=flat-square)](https://www.npmjs.com/package/font-spider-walker)

遍历你的代码目录，借助于 font-spider 动态生成你所需要的中文字体



## 用法

```
$ npm i -g font-spider-walker

$ fsw --help 

Usage: fsw [options]

  Options:

    -V, --version                 output the version number
    -s, --src [source]            源码文件夹的路径 (default: ./src)
    -f, --fontName [font name]    字体名称 (default: MyFont)
    --fontPath [font path]        字体路径 (default: ./font/)
    -t, --filetypes [file types]  接受的文件后缀,用|连接 (default: js|jsx|ts|tsx)
    -h, --help                    output usage information
```



比如在你项目的根目录下

```
----your project
|-------src
|-------build 
|-------fontDir
|-------------MyFont123.ttf               # 字体源文件


$ fsw --fontPath ./fontDir --fontName MyFont123 --filetypes js

----your project
|-------src
|-------build 
|-------fontDir
|-------------.font-spider/MyFont123.ttf   # 字体源文件
|-------------MyFont123.ttf
|-------------MyFont123.woff
|-------------MyFont123.svg
```



## Why 

[字蛛 font-spider](http://font-spider.org/) 

> 字蛛通过分析本地 CSS 与 HTML 文件获取 WebFont 中没有使用的字符，并将这些字符数据从字体中删除以实现压缩，同时生成跨浏览器使用的格式。 

现在很多项目的文案会写在 JavaScript 代码中，字蛛爬取不到

[字蛛+ font-spider-plus](https://github.com/allanguys/font-spider-plus)

> font-spider-plus（字蛛+）是一个智能 WebFont 压缩工具，它能自动分析出本地页面和线上页面使用的 WebFont 并进行按需压缩。

Allan 的这个项目更进一步，通过无头浏览器来爬取当前页面上的文字来动态生成精简版的 webfont. 

但是字蛛+ 依赖 Chrome Puppeteer 无头浏览器，需要安装近两百兆的 Chrome，比较容易失败（比如我在公司内网环境，还需要绕过公司代理），对于我的需求有些「杀鸡用牛刀」了。FSW (font-spider-walker) 这个项目通过本地分析源代码来动态生成 webfont. 
