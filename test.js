const lib = require('./lib');
const pbkdf2 = lib.pbkdf2;

// used for testing
function test_bkdf2() {
    console.time('hash');
    pbkdf2.encryptAsync('12345678901234567890').then(function (hash) {
        console.log('hashframe', hash.toString("base64"));
        console.timeEnd('hash');
        return pbkdf2.validateAsync('12345678901234567890', hash);
    }).then(function (correct) {
        if (correct) {
            console.log('password is correct');
        } else {
            console.log('password is wrong');
        }
    }).catch(function (err) {
        console.log('error: ', err);
    });
}

function test_cofile() {
    const pwd = lib.cofile.parseFilePath();
    console.log(pwd);
    console.log(process.cwd())
    // console.log(process)
}

function test_logging() {
    const logger = lib.logging.Logger('info');
    logger.info('test logger');
    lib.logging.bindConsole(logger);

    console.log('log-data');
    console.error('error-test');
    console.info('info-test');
    console.debug('debug-test');
    console.trace('trace-test');
    console.warn('warn-test');
}


test_bkdf2();
test_cofile();
test_logging();