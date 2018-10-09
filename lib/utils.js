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

const hashArrayItems = function (array, key) {
    let ds = {};
    for (let m of array) {
        let v = m[key];
        ds[v] = m;
    }
    return ds;
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
    strfmt: strfmt,
    webUrl: webUrl,
    trimForm: trimForm,
    hashArrayItems: hashArrayItems,
    validSubset: validSubset,
    splitArray: splitArray,
    sleepAsync: sleepAsync,
    retryAsync: retryAsync,
    batchAsync: batchAsync,
};
