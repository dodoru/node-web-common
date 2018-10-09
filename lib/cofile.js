const fs = require('mz/fs');
const path = require('path');

const ensureDir = function (dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        return dir
    } else {
        const stats = fs.statSync(dir);
        if (stats.isDirectory()) {
            return dir;
        } else {
            throw new Error(`[TypeError] ${dir} is file, not a directory.`)
        }
    }
};

const listSubdir = function (dir) {
    if (fs.existsSync(dir)) {
        if (fs.statSync(dir).isDirectory()) {
            return fs.readdirSync(dir);
        } else {
            throw new Error(`[TypeError] ${dir} is file, not a directory.`);
        }
    }
    throw new Error(`[DirectoryNotExisted] ${dir} is not found.`);
};

const listFiles = function (dir) {
    const subdirs = listSubdir(dir);
    const files = [];
    subdirs.forEach(m => {
        const file = path.join(dir, m);
        if (fs.statSync(dir).isFile(file)) {
            files.push(file)
        }
    });
    return files
};

const saveFileAsync = async (text, filename, mode = 'w') => {
    if (mode === '--save' || mode === 's') {
        if (fs.existsSync(filename)) {
            return 0;
        }
    }
    const fp = await fs.open(filename, mode);
    await fs.write(fp, text);
    return 1;
};

const saveJSONAsync = async (json_data, filename, mode = 'w', replacer = null, space = 2) => {
    filename = filename.trim();
    if (!filename.endsWith('.json')) {
        filename = `${filename}.json`
    }
    const text = JSON.stringify(json_data, replacer, space);
    return await saveFileAsync(text, filename, mode);
};

const readJSON = function (filename, encoding = 'utf-8') {
    const text = fs.readFileSync(filename, encoding);
    return JSON.parse(text);
};

const readLines = function (file, annotator = '//', encoding = 'utf-8') {
    // @file: <string> utf-8 文件路径,
    // usage: 过滤无效的空行, 以及被注释符(annotator)声明无效的行。
    const text = fs.readFileSync(file, encoding);
    const lines = text.split('\n').map(line => line.trim());
    return lines.filter(m => {
        return Boolean(m) && m.indexOf(annotator) !== 0;
    })
};

module.exports = {
    _depends: {fs, path},
    ensureDir: ensureDir,
    readJSON: readJSON,
    readLines: readLines,
    listFiles: listFiles,
    listSubdir: listSubdir,
    saveFileAsync: saveFileAsync,
    saveJSONAsync: saveJSONAsync,
};
