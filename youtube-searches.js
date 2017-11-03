var cookiepass = require('cookie-pass')
var http = require('http')
var url = require('url')
var qs = require('querystring')
var request = require('request')
var fs = require('fs')

var YouTube = require('youtube-node')
var youTube = new YouTube();
youTube.setKey('AIzaSyBcErY9Vd0TTqje6q5iNVjwsWTUUTlYlKI')

var cfg = JSON.parse(fs.readFileSync('config.json', 'utf-8')) //Load our config file with username/password for Smoothwall Login

var LineByLineReader = require('line-by-line')

var requestData = qs.stringify({	//Parameters used in POST to login to Smoothwall box.  
    action: 'Login',
    vxuse: cfg.user, //Smoothwall admin Username
    vxpss: cfg.pass //Smoothwall admin password
})

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
            TSTYLE: 'csv_/User analysis//template1508709446_O9RPd.swr',
            startdate: cfg.start,
            starthour: '0',
            startminute: '00',
            enddate: cfg.end,
            endhour: '23',
            endminute: '55',
            '0option-user': ''
        },
        headers: {
            cookie: loginCookie //Pass the login cookie into our request for CSV file
        }
    };

    request(options, function(error, response, body) {
        var linesExceptFirst = body.split('\n').slice(1).join('\n')
        var linesExceptFirst = body.split('\n').slice(2).join('\n')

        if (error) throw new Error(error)
        fs.appendFile('youtube-searches.csv', linesExceptFirst, function(err, result) { //Put our report minus the first two lines into a csv file
            if (err) {
                console.error(err)
            }
            console.log('file written, now lets parse it')
            lr = new LineByLineReader('youtube-searches.csv')

            lr.on('error', function(err) {
                // 'err' contains error object
                if (err) {
                    console.error(err)
                }
            });

            lr.on('line', function(line) {
                // 'line' contains the current line without the trailing newline character.
                arr = line.split(',')
                //console.log(arr)

                if (!arr[2]) { //This line does not contain an IP Address or video id, so exclude it from our results
                } else {

                    var videoId = JSON.stringify(arr[4]);
                    youTube.search(videoId, 2, function(error, result) {
                        if (error) {
                            console.log(error)
                        } else {
                            video = result.items, null, 2
                            if (video[0]) {
                                console.log(arr[4] + ' ' + video[0].snippet.title)
                                fs.appendFile('youtube-results.json', '\n' + arr[4] + ' ' + video[0].snippet.title, (err) => {
                                    if (err) throw err
                                })
                            } else {
                                console.log('This must not be a video')
                            }
                        }
                    })
                }
            })

            lr.on('end', function() {
                // All lines are read, file is closed now.
            })
        })
    })

}).end(requestData)
