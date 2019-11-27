#!/usr/bin/env node

const fs = require('fs'),
    path = require('path'),
    chalk = require('chalk'),
    fontSpider = require('font-spider'),
    program = require('commander');

const defaultFileTypes = 'js|jsx|ts|tsx',
    defaultFontName = 'MyFont',
    defaultFontPath = `./font/`,
    defaultSrcPath = './src',
    defaultInclude = 'chinese|number|english|symbol';

program
    .version(require('../package.json').version)
    .option('-s, --src [source]', '源码文件夹的路径', defaultSrcPath)
    .option('-f, --fontName [font name]', '字体名称', defaultFontName)
    .option('--fontPath [font path]', '字体路径', defaultFontPath)
    .option('--searchRange [search range]', '默认检索所有中文，数字，英文和特殊字符，可自行指定搜索类型，用|连接', defaultInclude)
    .option('-t, --filetypes [file types]', '接受的文件后缀,用|连接', defaultFileTypes)
    .parse(process.argv);

const {
    src = defaultSrcPath,
        filetypes = defaultFileTypes,
        fontPath = defaultFontPath,
        fontName = defaultFontName,
        searchRange = defaultInclude
} = program

const tempFilePath = path.resolve('./') + '\/fsw.html';

const fileExtReg = new RegExp(`^\.${filetypes}`, 'i')

doJob(src)

const regMap = {
    'chinese': /[^\x00-\x7F]/g,
    'number': /[0-9]/g,
    'english': /[A-Za-z]/g,
    'symbol': /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]+/img,
}
/**
 * filter Chinese characters
 * @param {string} str 
 */
function getWordsChr(str) {
    const searchType = searchRange.split('|');
    const result = searchType.map(regKey => {

        if (defaultInclude.indexOf(regKey) === -1) {
            console.log('存在不支持的搜索字符类型 ->>>>> ', regKey);
            return '';
        } else {
            const reg = regMap[regKey];
            let strWithoutSpace = str.replace(/\s+/g, '');
            const matched = strWithoutSpace.match(reg);
            return Array.isArray(matched) ? matched.filter((ch, pos) => matched.indexOf(ch) === pos).join('') : ''
        }
    });

    // 去重
    const strOfResult = result.join('').replace(/\s+/g, '');

    return [...new Set(strOfResult.split(''))].join('');
}

/**
 * Walk through all files in `dir`
 * @param {string} dir 
 */
function walk(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (error, files) => {
            if (error) {
                return reject(error);
            }
            Promise.all(files.map((file) => {
                    return new Promise((resolve, reject) => {
                        const filepath = path.join(dir, file);
                        fs.stat(filepath, (error, stats) => {
                            if (error) {
                                return reject(error);
                            }
                            if (stats.isDirectory()) {
                                walk(filepath).then(resolve);
                            } else if (stats.isFile()) {
                                // resolve(filepath);
                                const ext = path.extname(filepath)
                                if (fileExtReg.test(ext)) {
                                    fs.readFile(filepath, {
                                        encoding: 'utf8'
                                    }, (err, content) => {
                                        if (err || typeof content !== 'string') {
                                            console.error(err)
                                            reject(err)
                                            return
                                        }
                                        resolve(getWordsChr(content))
                                    })
                                } else {
                                    resolve('')
                                }
                            }
                        });
                    });
                }))
                .then(
                    /**
                     * @param {string[]} foldersContents
                     */
                    (foldersContents) => {
                        resolve(foldersContents
                            .reduce((all, folderContents) => all + folderContents, '')
                        );
                    });
        });
    });
}

/**
 * Generate a fake html file for font-spider to walk through
 * @param {string} allChinese 
 */
function generateFakeHtml(allChinese, callback) {
    const font = path.join(fontPath, fontName)
    const template = `<html><head><style>@font-face {
        font-family: '${fontName}';
        src: url('${font}.eot');
        src:
          url('${font}.eot?#font-spider') format('embedded-opentype'),
          url('${font}.woff2') format('woff2'),
          url('${font}.woff') format('woff'),
          url('${font}.ttf') format('truetype'),
          url('${font}.svg') format('svg');
        font-weight: normal;
        font-style: normal;
      } .chinese { font-family: '${fontName}'; }</style>
      </head><body><div class="chinese">${allChinese}`
    fs.writeFile(tempFilePath, template,
        err => {
            if (err) {
                console.error(err)
                return
            }

            log('html file generated!')

            log('交给字蛛生成字体，源字体位于', font + '.ttf')
            callback()
        })
}

/**
 * entry 
 * @param {string} _dir 
 */
function doJob(_dir) {
    const dir = path.resolve(_dir)
    walk(dir).then(
        /**
         * @param {string} content
         */
        content => {
            log(`在你的源码中我们找到了${content.length}个字符`, content)

            if (content.length) {
                generateFakeHtml(content, runFontSpider)
            }
        }
    );
}

/**
 * @param {string} title
 * @param {string} [message] 
 */
function log(title, message) {
    console.log(chalk.white.bgGreen(title), '\n' + (message || ''))
}

/**
 * 
 * @param {string} htmlFile
 */
function runFontSpider(htmlFile = tempFilePath) {
    fontSpider.spider(htmlFile, {
        silent: false
    }).then(function(webFonts) {
        return fontSpider.compressor(webFonts, {
            backup: true
        });
    }).then(function(webFonts) {
        console.log(webFonts)
    })
}