var request = require("request");
var Cookie = require('request-cookies').Cookie
var fs = require('fs')
var cfg = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

console.log(cfg)

function getCookie() {
    var options = {
        method: 'POST',
        url: cfg.loginUrl,
        headers: {
            'postman-token': '8d86bc96-5ac2-b50a-9b46-8794c9da8b42',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded'
        },
        form: {
            vxuse: cfg.user,
            vxpss: cfg.pass,
            action: 'Login',
            ref: 'cgi-bin/login.cgi'
        }
    };

    request(options, function(error, response, body, callback) {
        var rawcookies = response.headers['set-cookie']
        for (var i in rawcookies) {
            var cookie = new Cookie(rawcookies[i]);
            console.log(cookie.key + '=' + cookie.value + '; path=/;'); //This is our login cookie for smoothwall
            cfg["loginCookie"] = (cookie.key + '=' + cookie.value + '; path=/;')
            fs.writeFileSync('./config.json', JSON.stringify(cfg, null, 2), 'utf-8')
            console.log(cfg)
        }
        if (error) throw new Error(error);

    });
}

getCookie();