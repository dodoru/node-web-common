/*
* 统一 API 的异常响应报文
*   @tag            :str: 默认为 'PassportServer'
    @label          :str：错误类别, 默认为 'error'
    @errno          :int: 详细错误编码（自定义）, 默认40000
    @message        :str: 详细错误信息（自定义）
*/


class ApiError extends Error {
    constructor(err) {
        super();
        const _opts = {};
        if (typeof (err) === 'string') {
            _opts.message = err;
        }
        if (typeof (err) === 'object') {
            Object.assign(_opts, err)
        }
        this.tag = process.env.PROJECT_NAME || "API";
        this.label = _opts.label || _opts.name || 'ERROR';
        this.errno = _opts.errno || 40000;
        this.message = _opts.message || String(err);
    }

    toData() {
        const {tag, label, errno, message} = this;
        return {tag, label, errno, message}
    }

    toString() {
        return `[${this.tag} - ${this.label}] ${this.errno} - ${this.message}.`;
    }


    static initSqlError(error) {
        const errnoMap = {
            "ER_DUP_ENTRY": 40900,
        };
        return new ApiError({
            label: `${error.errno}(${error.code})`,
            errno: errnoMap[error.code] || 40099,
            message: `${error.sqlState}, ${error.message}`,
        });
    }

    static init(error) {
        if (error instanceof ApiError) {
            return error;
        }
        if (typeof (error) === 'string') {
            return new ApiError({message: error});
        }
        if (error.sqlState) {
            return this.initSqlError(error);
        } else {
            return new ApiError(error);
        }
    }

}


const errnoMappings = {
    40100: 'User Require Login',
    40300: 'User Unauthorized',
    40400: 'Source Not Found',
};

const abort = (errno) => {
    let message = errnoMappings[errno] || 'Unknown Error';
    throw new ApiError({errno, message});
};

module.exports = {
    ApiError: ApiError,
    errnoMappings: errnoMappings,
    abort: abort,
};
