var count = 0;
var tweetWidth = 550;

function makeDivs() {
  var width = $(window).width();
  var height = $(window).height();

  // mobile device? 
  if (width < tweetWidth * 2) {
    tweetWidth = width - 30;
    refresh = 10000;
    $('body').append($('<div class="tweet"></div>').css('margin-top', '5'));
  } 
  // otherwise do we have room for more than one tweet?
  else {
    var w = 100;
    var middle = parseInt(height, 10) / 2;
    while (w < (width - tweetWidth)) {
      var div = $('<div class="tweet"></div>');
      div.css("position", "absolute");
      div.css("left", w);
      div.css("width", tweetWidth);
      $("body").append(div);
      w += tweetWidth;
    }
  }
}

function waitForTwttr(callback) {
  if (twttr.widgets) {
    callback();
  } else {
    setTimeout(function() {
      waitForTwttr(callback);
    }, 100);
  }
}

function setup() {
  waitForTwttr(function() {
    makeDivs();
    // poll for next tweet to display
    (function poll() {
      setTimeout(function() {
        ajaxCall("/atweet", "GET", function(data) {
          if (data != null) {
			  	  addTweet(data);
				  }
          //Setup the next poll recursively
          poll();
        });
      }, 1500);
	  })();
  });
}

function addTweet(tweetInfo) {
	var tweetId = tweetInfo.tweetid;
	var hashtag = tweetInfo.hashtag;
  var divs = $(".tweet");
  var div = $(divs[count % divs.length]);
  var hashtagDiv = $("<div class='htheader'>#"+hashtag+"</div>")
  var tweet = $("<div></div>");
  div.prepend(tweet);
  twttr.widgets.createTweet(tweetId, tweet[0], {
    align: 'center', 
    theme: 'dark',
    width: tweetWidth
  })
  tweet.prepend(hashtagDiv)
  count += 1;
}

window.onload = setup();

function createXHR() {
	if (typeof XMLHttpRequest != 'undefined') {
		return new XMLHttpRequest();
	} else {
		try {
			return new ActiveXObject('Msxml2.XMLHTTP');
		} catch (e1) {
			try {
				return new ActiveXObject('Microsoft.XMLHTTP');
			} catch (e2) {
			}
		}
	}
	return null;
}

function ajaxCall(url, method, resultFn) {

	var xhr = createXHR();

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.responseText == "{}") {
				resultFn(null);
			} else {
				resultFn(JSON.parse(xhr.responseText));
			}
		}
	};

	xhr.open(method, url, true);
	xhr.send(null);
}
