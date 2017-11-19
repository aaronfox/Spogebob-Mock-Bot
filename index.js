var Twit = require('twit');
var config = require('./config.js');
var fs = require('fs-extra');

var Twitter = new Twit(config);
console.log('test');

var express = require('express');
var app     = express();

app.set('port', (process.env.PORT || 5000));

//For avoiding Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});

// Tweets a tweet
function tweetStatus(msg) {
    var tweet = {
        status: msg
    }
    
    Twitter.post('statuses/update', tweet, tweeted);
    
    function tweeted(err, data, res) {
        if (err) {
            console.log("Oh noes! Here's the error, champ: ");
            console.log(err);
        }
        else {
            console.log("Success! Tweeted that awful message of yours.");
        };
    }
}

//tweetStatus('I\'m Sponebob, and I\'m here to mock you.');


// STREAMING STUFF HERE

//var stream = Twit.stream('statuses/sample')


var mock = function() {
  var params = {
    q: '#Dog, #Horse',
    lang: 'en'    
  };
    Twitter.get('search/tweets', params, function(err, data) {
      // if there no errors
        if (!err) {
          // grab ID of tweet to mock
            var tweetsToMock = data.statuses;
//            console.log(tweetsToMock[0].text);
            mockTweet = tweetsToMock[0].text;
            var string = '';
            for(var i = 0; i < mockTweet.length; i++)
                {
                    var randNum = Math.random() * 2;
//                    console.log(randNum);
                    if(randNum > 1)
                        {
                            string = string + mockTweet[i].toLowerCase();
                        }
                    else{
                            string = string + mockTweet[i].toUpperCase();
                    }
                }
            console.log("string == " + string);
            var atName = tweetsToMock[0].user.screen_name;
//            console.log(tweetsToMock[0].user.screen_name);
            sendMockAndImage(string, atName);
        }
        // if unable to Search a tweet
        else {
          console.log('Something went wrong while SEARCHING...');
            console.log('err == ' + err);
        }
    });
};

mock();

// POST A TWEET WITH MEDIA

//
// post a tweet with media
//
var b64content = fs.readFileSync('spongebob_mock.jpg', { encoding: 'base64' })

function sendMockAndImage(mockTweet, atName) {
// first we must post the media to Twitter
    var mockStatus = '@' + atName + ' ' + mockTweet;
Twitter.post('media/upload', { media_data: b64content }, function (err, data, response) {
  // now we can assign alt text to the media, for use by screen readers and
  // other text-based presentations and interpreters
  var mediaIdStr = data.media_id_string
  var altText = "Spongebob mocking you"
  var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

  Twitter.post('media/metadata/create', meta_params, function (err, data, response) {
    if (!err) {
      // now we can reference the media and post a tweet (media will attach to the tweet)
      var params = { status: mockStatus, media_ids: [mediaIdStr] }

      Twitter.post('statuses/update', params, function (err, data, response) {
        console.log(data)
      })
    }
  })
})
}