var cookiepass = require('cookie-pass')
var http = require('http')
var url = require('url')
var qs = require('querystring')
var request = require('request')
var fs = require('fs')


var YouTube = require('youtube-node')
var youTube = new YouTube();
youTube.setKey('AIzaSyBcErY9Vd0TTqje6q5iNVjwsWTUUTlYlKI')

let m;

var cfg = JSON.parse(fs.readFileSync('config.json', 'utf-8')) //Load our config file with username/password for Smoothwall Login

var LineByLineReader = require('line-by-line')

var requestData = qs.stringify({	//Parameters used in POST to login to Smoothwall box.  
    action: 'Login',
    vxuse: cfg.user, //Smoothwall admin Username
    vxpss: cfg.pass //Smoothwall admin password
})

function get_host(urls){
    
    if (!urls.match(/^[a-zA-Z]+:\/\//)) { //Check if our url has a protocol prefix.
        urls = 'http://' + urls //If url does not have a prefix, add http:// to the beginning
    }
    return urls.replace(/^((\w+:)?\/\/[^\/]+\/?).*$/,'$1');
}

var login = url.parse(cfg.loginUrl)
login.method = 'POST'
login.port = 81
login.headers = {
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': Buffer.byteLength(requestData)
}

//Login to our smoothwall box and store the login cookie as a variable
http.request(login, function onRes(res) {
    var mypage = url.parse(cfg.loginUrl)
    var loginCookie = cookiepass(res, login).pass(mypage)	//Pass our login

    var options = {
        method: 'GET',
        url: 'http://192.168.8.21:81/cgi-bin/reports/reports.cgi',
        qs: {
            TACTION: 'Preview',
            TSTYLE: 'csv_//template1432392342_3gKvD.swr',
            startdate: cfg.start,
            starthour: '0',
            startminute: '00',
            enddate: cfg.end,
            endhour: '23',
            endminute: '55',
            '0option-user': '',
            '0option-excludedomain': 'fqtag.com%0Aaltitudeplatform.com%0Agstatic.com%0Agoogleapis.com%0Aamazonaws.com%0Aicloud.com%0Aitunes.com%0Aapple.com%0Aexelator.com'
        },
        headers: {
            cookie: loginCookie //Pass the login cookie into our request for CSV file
        }
    };

    request(options, function(error, response, body) {

        if (error) throw new Error(error)
        fs.appendFile('all_blocked.csv', body, function(err, result) { //Put our report minus the first two lines into a csv file
            if (err) {
                console.error(err)
            }
            console.log('file written, now lets parse it')
            lr = new LineByLineReader('all_blocked.csv')

            lr.on('error', function(err) {
                // 'err' contains error object
                if (err) {
                    console.error(err)
                }
            });

            url = '';

            lr.on('line', function(line) {
                // 'line' contains the current line without the trailing newline character.
                arr = line.split(',')

                if (!arr[2]) { //This line does not contain an IP Address or video id, so exclude it from our results
                } else {
                    if(url === get_host(arr[4])) {
                        return
                    }
                        console.log('This is the url: ', get_host(arr[4]))
                        url = get_host(arr[4])
                }
            })

            lr.on('end', function() {
                // All lines are read, file is closed now.
            })
        })
    })

}).end(requestData)
