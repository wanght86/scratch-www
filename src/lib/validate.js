module.exports = {};
const api = require('./api');

module.exports.validateUsernameLocally = username => {
    if (!username || username === '') {
        return {valid: false, errMsgId: 'general.required'};
    } else if (username.length < 3) {
        return {valid: false, errMsgId: 'registration.validationUsernameMinLength'};
    } else if (username.length > 20) {
        return {valid: false, errMsgId: 'registration.validationUsernameMaxLength'};
    } else if (!/^[\w-]+$/i.test(username)) {
        return {valid: false, errMsgId: 'registration.validationUsernameRegexp'};
    }
    return {valid: true};
};

module.exports.validateUsernameRemotely = username => (
    new Promise(resolve => {
        api({
            uri: `/accounts/checkusername/${username}/`
        }, (err, body, res) => {
            if (err || res.statusCode !== 200) {
                resolve({valid: false, errMsgId: 'general.apiError'});
            }
            switch (body.msg) {
            case 'valid username':
                resolve({valid: true});
                break;
            case 'username exists':
                resolve({valid: false, errMsgId: 'registration.validationUsernameExists'});
                break;
            case 'bad username': // i.e., vulgar
                resolve({valid: false, errMsgId: 'registration.validationUsernameNotAllowed'});
                break;
            case 'invalid username':
            default:
                resolve({valid: false, errMsgId: 'registration.validationUsernameNotAllowed'});
            }
        });
    })
);

/**
 * Validate password value, optionally also considering username value
 * @param  {string} password     password value to validate
 * @param  {string} username     username value to compare
 * @return {object}              {valid: boolean, errMsgId: string}
 */
module.exports.validatePassword = (password, username) => {
    if (!password) {
        return {valid: false, errMsgId: 'general.required'};
    } else if (password.length < 6) {
        return {valid: false, errMsgId: 'registration.validationPasswordLength'};
    } else if (password === 'password') {
        return {valid: false, errMsgId: 'registration.validationPasswordNotEquals'};
    } else if (username && password === username) {
        return {valid: false, errMsgId: 'registration.validationPasswordNotUsername'};
    }
    return {valid: true};
};

module.exports.validatePasswordConfirm = (password, passwordConfirm) => {
    if (!passwordConfirm) {
        return {valid: false, errMsgId: 'general.required'};
    } else if (password !== passwordConfirm) {
        return {valid: false, errMsgId: 'registration.validationPasswordConfirmNotEquals'};
    }
    return {valid: true};
};
