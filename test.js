const pbkdf2 = require('./lib/pbkdf2');

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


test_bkdf2();