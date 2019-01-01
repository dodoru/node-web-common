/*
* 统一 API 的异常响应报文
    @message        :str: message of ApiError Response
    @errno          :int: ErrorNumber, default is 40000
                        ; suggest custom ApiError.ErrnoMap
    @status         :int: statusCode of ApiError Response, default is 400
                        ; if $errno is in ApiError.errnoMap, usually equal to `parseInt(status / 100)`
*/

const defaultErrnoMap = {
    40000: 'Invalid Data',
    40100: 'User Require Login',
    40300: 'User Unauthorized',
    40400: 'Source Not Found',
    40099: 'Mysql Execute Error',
    40900: 'You should not insert a duplicated item to database'
};

class ApiError extends Error {
    constructor(options) {
        super();
        const _opts = {
            errno: 40000,
            message: 'InvalidData',
            status: 400,
        };
        if (typeof (options) === 'object') {
            Object.assign(_opts, options);
        } else {
            _opts.message += `, ${options}`
        }
        this.errno = _opts.errno;
        this.message = _opts.message;
        this.status = _opts.status;
        // options: detail, params, trackError
        this.detail = _opts.detail || '';
        this.params = _opts.params || {};
        if (_opts.trackError instanceof Error) {
            this.trackError = _opts.trackError
        } else {
            this.trackError = null;
        }
    }

    static set errnoMap(errnoMessageMapping) {
        const m = ApiError._errnoMap || defaultErrnoMap;
        ApiError._errnoMap = Object.assign({}, m, errnoMessageMapping)
    }

    static get errnoMap() {
        return ApiError._errnoMap || defaultErrnoMap;
    }

    responseData() {
        const {status, errno, message} = this;
        return {status, errno, message}
    }

    toString() {
        return `[${this.errno}] ${this.message} - ${this.detail}`;
    }
}

const stateCode = (code) => {
    let errno = 40000;
    let status = 400;
    let message = ApiError.errnoMap[code];
    if (message) {
        errno = code;
        status = parseInt(code / 100);
    } else {
        message = 'Unknown Error'
        // console.log(`Errno[${code}] is undefined in ApiError.errnoMap `)
    }
    return {errno, message, status}
}

const initSqlError = (error) => {
    const sqlcodeMap = {
        "ER_DUP_ENTRY": 40900,
    };
    const m = new ApiError({
        errno: sqlcodeMap[error.code] || 40099,
        message: error.sqlState || 'Mysql Execute Error',
        detail: `MYSQL-ERROR: ${error.errno}(${error.code}), ${error.message}`,
    });
    m.trackError = error
    return m;
}

const abort = (errnoOrMessage) => {
    let err;
    let _type = typeof (errnoOrMessage);
    if (errnoOrMessage instanceof ApiError) {
        throw errnoOrMessage
    }
    switch (_type) {
        case 'number':
            err = stateCode(errnoOrMessage)
            break;
        case 'string':
            err = {message: errnoOrMessage}
            break
        case 'object':
            if (err.sqlState) {
                throw initSqlError(err);
            } else {
                err = errnoOrMessage
            }
            break
        default:
            err = {message: JSON.stringify(errnoOrMessage)}
    }
    throw new ApiError(err);
};

const trackAbort = (errno, trackError) => {
    const err = new ApiError({errno: errno})
    err.trackError = trackError
    throw err;
}

module.exports = {
    defaultErrnoMap: defaultErrnoMap,
    ApiError: ApiError,
    abort: abort,
    trackAbort: trackAbort,
};
