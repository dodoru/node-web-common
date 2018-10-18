const child_process = require('child_process');
const crypto = require('crypto');

const execAsync = (command) => {
    return new Promise(function (resolve, reject) {
        child_process.exec(command, (stdout, stderr, error) => {
            console.log('[cmd]', command);
            console.log(`[stdout] ${stdout}`);
            console.log(`[stderr] ${stderr}`);
            if (error) {
                console.log('[ERROR]', error);
                reject(error);
            } else {
                resolve({stdout, stderr})
            }
        });
    });
};


const md5sum = function (text) {
    const md5 = crypto.createHash('md5');
    return md5.update(text).digest('hex');
};

const randomString = function (length = 16) {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
};

const strfmt = (fmt, scope = {}) => {
    with (scope) {
        return eval(fmt)
    }
};

const webUrl = (options) => {
    const portMap = {
        http: 80,
        https: 443,
    };
    let {scheme, host, port} = options;
    if (portMap[scheme] === port) {
        return `${scheme}://${host}`
    } else {
        return `${scheme}://${host}:${port}`
    }
};

const briefObj = (obj) => {
    const keys = Object.keys(obj).filter(m => Boolean(!m.startsWith('_')));
    const data = {};
    for (let k of keys) {
        let v = obj[k];
        if (!v instanceof Function && value) {
            data[k] = v;
        }
    }
    return data;
};

const trimForm = function (form, nullable = false) {
    let ds = {};
    for (let k in form) {
        let v = form[k];
        if (typeof (v) === "string") {
            v = v.trim();
            if (v || nullable) {
                ds[k] = v;
            }
        } else {
            ds[k] = v;
        }
    }
    return ds;
};

const argsOption = function (args, separator = '=') {
    const options = {};
    for (let arg of args) {
        const [k, v] = arg.split(separator);
        if (v) {
            options[k] = v;
        }
    }
    return options;
};

const splitTrim = function (text, separator = '\t') {
    const paras = text.split(separator).map(m => m.trim());
    return paras.filter(m => m);
const splitObject = function (obj, fields) {
    const data = {};
    const extra = {};
    for (let key in obj) {
        let value = obj[key];
        if (value !== undefined) {
            const field = fields[key];
            if (field) {
                const fmt = fields.fmt;
                if (fmt instanceof Function) {
                    value = fmt(value)
                }
                data[key] = value;
            } else {
                extra[key] = value;
            }
        }
    }
    return {data, extra}
};
};

const hashArrayItems = function (array, key) {
    let ds = {};
    for (let m of array) {
        let v = m[key];
        ds[v] = m;
    }
    return ds;
};

const groupArrayItems = function (array, key) {
    const mapping = {};
    for (let item of array) {
        let index = item[key];
        let pool = mapping[index];
        if (pool) {
            pool.push(item);
        } else {
            mapping[index] = [item]
        }
    }
    return mapping;
};

const validSubset = function (sub_array, array) {
    const ms = new Set(array);
    for (let d of sub_array) {
        if (!ms.has(d)) {
            return false
        }
    }
    return true;
};

const splitArray = function (array, size) {
    const ds = [];
    let cell = [];
    for (let item of array) {
        cell.push(item);
        if (cell.length === size) {
            ds.push(cell);
            cell = [];
        }
    }

    if (cell.length > 0) {
        ds.push(cell);
    }
    return ds;
};


const sleepAsync = (delay) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, delay);
    });
};

const retryAsync = async (asyncfunc, delay_ms = 1000, retry_count = 3) => {
    for (let i = 0; i < retry_count; i++) {
        try {
            return await asyncfunc();
        } catch (e) {
            console.error(e.message, asyncfunc);
            await sleepAsync(delay_ms);
        }
    }
};

const batchAsync = async (ary, asyncfunc, ...args) => {
    const result = {};
    const errors = [];
    const promises = ary.map((m) => asyncfunc(m, ...args)
        .then(res => result[m] = res)
        .catch(err => {
            console.error(err, asyncfunc.name, m, ...args);
            const err_obj = {
                key: m,
                error: err,
            };
            errors.push(err_obj);
        })
    );
    await Promise.all(promises);
    return {result, errors};
};

module.exports = {
    execAsync: execAsync,
    md5sum: md5sum,
    randomString: randomString,
    strfmt: strfmt,
    webUrl: webUrl,
    briefObj: briefObj,
    trimForm: trimForm,
    splitTrim: splitTrim,
    argsOption: argsOption,
    splitObject: splitObject,
    hashArrayItems: hashArrayItems,
    groupArrayItems: groupArrayItems,
    validSubset: validSubset,
    splitArray: splitArray,
    sleepAsync: sleepAsync,
    retryAsync: retryAsync,
    batchAsync: batchAsync,
};
