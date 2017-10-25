#!/usr/bin/env node

var fs = require('fs')
var YouTube = require('youtube-node')
var path = require('path')
var config = require('./config.json')
var request = require("request")

var youTube = new YouTube(); //Module used to interact with youtube api

youTube.setKey('AIzaSyBcErY9Vd0TTqje6q5iNVjwsWTUUTlYlKI');

var LineByLineReader = require('line-by-line') //Module to perform line by line actions on our csv file

var options = { method: 'GET',
  url: 'http://192.168.8.21:81/cgi-bin/reports/reports.cgi',
  qs: 
   { TACTION: 'Preview',
     TSTYLE: 'csv_/User analysis//template1508709446_O9RPd.swr',
     startdate: '2017/10/24',
     starthour: '0',
     startminute: '00',
     enddate: '2017/10/25',
     endhour: '23',
     endminute: '55',
     '0option-user': '' },
  headers: 
   { cookie: config.loginCookie } };


		request(options, function (error, response, body) {
		var linesExceptFirst = body.split('\n').slice(1).join('\n');
		var linesExceptFirst = body.split('\n').slice(2).join('\n');

  		if (error) throw new Error(error);
  		fs.appendFile('test.csv', linesExceptFirst, function (err, result) {
  			if(err) {
  				console.error(err)
  			}
  			console.log('file written, now lets parse it')
  			lr = new LineByLineReader('test.csv');
  			
  			lr.on('error', function (err) {
				// 'err' contains error object
				if (err) {
					console.error(err)
				}
			});


		 lr.on('line', function (line) {
		// 'line' contains the current line without the trailing newline character.
		arr = line.split(',')
		console.log(arr);


		if (!arr[2]) {	//This line does not contain an IP Address or video id, so exclude it from our results
			// console.log('Does not exist');
		} else {
			// console.log('IP Address: ' + arr[2] + ' Video ID: ' + arr[4]);


			var videoId = JSON.stringify(arr[4]);
				youTube.search(videoId, 2, function(error, result) {
			  if (error) {
			    console.log(error);
			  }
			  else {
			  	video = result.items, null, 2;
			  		// console.log(JSON.stringify(video));
			  		// console.log(Object.keys(video[0]))

			  		if (video[0]) {
			  					if(arr.indexOf('Web search phrases') >= 0) {
									console.log('skip this line')
								}
			  			console.log(arr[2] + ' ' + video[0].snippet.title)
						fs.appendFile('results.json', '\n' + arr[2] + ' ' + video[0].snippet.title, (err) => {  
						    if (err) throw err;
						    console.log('The lyrics were updated!');
						});		  		}
			  		else {
			  			console.log('This must not be a video')
			  		}
			  }
			});



		}
	});

lr.on('end', function () {

	// All lines are read, file is closed now.
});




  		});
	});
	
	
		

		
	




	

		







	

