var __cookie = require('./cookie.js');

module.exports = (function () {

    function tokenName(name) {
        name = name || this.currentToken;

        if (name) {
            return name;
        }

        if (this.other.call(this)) {
            return this.options.tokenOtherName;
        }

        return this.options.tokenDefaultName;
    }

    function isLocalStorageSupported() {
        try {
            if (!window.localStorage || !window.sessionStorage) {
                throw 'exception';
            }

            localStorage.setItem('storage_test', 1);
            localStorage.removeItem('storage_test');
            
            return true;
        } catch (e) {
            return false;
        }
    }

    function isCookieSupported() {
        return true;
    }

    function processToken(action, name, token) {
        var i, ii,
            args = [tokenName.call(this, name)];

        if (token) {
            args.push(token);
        }

        for (i = 0, ii = this.options.tokenStore.length; i < ii; i++) {
            if (this.options.tokenStore[i] === 'localStorage' && isLocalStorageSupported()) {
                return localStorage[action + 'Item'](args[0], args[1]);
            }

            else if (this.options.tokenStore[i] === 'cookie' && isCookieSupported()) {
                return __cookie[action].apply(this, args);
            }
        }
    }
    
        function processToken(action, name, token) {
        var i, ii,
            args = [tokenName.call(this, name)];

        if (token) {
            args.push(token);
        }
        // Fork modification Start
        if (action === 'set' || action === 'remove') {
            nativeStorage(action, args[0], args[1])
        }
        // Fork modification End
 
        for (i = 0, ii = this.options.tokenStore.length; i < ii; i++) {
            if (this.options.tokenStore[i] === 'localStorage' && isLocalStorageSupported()) {
                return localStorage[action + 'Item'](args[0], args[1]);
            }

            else if (this.options.tokenStore[i] === 'cookie' && isCookieSupported()) {
                return __cookie[action].apply(this, args);
            }
        }
    }

    // Fork modification Start
    // This is for nativeStorage storage used for phonegap app where localStorage is not relable, the NativeStorage is bind manully in the entry file when plugin is ready in the deviceready event.
    function nativeStorage(action, name, token) {
        action === 'set' ? nativeStorageSet(name, token) : ''; return
        action === 'remove' ? nativeStorageRemove(name) : ''; return
    }

    function nativeStorageSet(name, token) {
        if (window.NativeStorage) {
            window.NativeStorage.setItem(
                name,
                token,
                function (value) {
                    window.NativeStorage.getItem(
                        name,
                        function (value) {
                            console.log('Check if value set successfully by return got value: ', value)
                        },
                        function (err) {
                            console.log('Check failed just set name:' + name + ' with value: ' + token)
                        }
                    )
                },
                function (err) {
                    console.log('NativeStorage failed to set key: ' + name + ' to value: ' + token)
                }
            );
        }
    }

    function nativeStorageRemove(name) {
        if (window.NativeStorage) {
            window.NativeStorage.remove(name);
        }
    }
    // Fork modification End
    
    return {
        get: function (name) {
            return processToken.call(this, 'get', name);
        },

        set: function (name, token) {
            return processToken.call(this, 'set', name, token);
        },

        remove: function (name) {
            return processToken.call(this, 'remove', name);
        },

        expiring: function () {
            return false;
        }
    }

})();
