var fs = require('fs');
var YouTube = require('youtube-node');
var http = require('http')


var youTube = new YouTube();

youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU');

var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('report3.csv');




	lr.on('error', function (err) {
	// 'err' contains error object
	});



	lr.on('line', function (line) {
		// 'line' contains the current line without the trailing newline character.
		arr = line.split(',')
		console.log(arr[3]);
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

