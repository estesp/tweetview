
function makeDivs() {
  var width = $(window).width();
  var height = $(window).height();

  var div = $('<div id="htreport"></div>');
  $("#adminview").append(div);

  var div = $('<div id="servinfo"></div>');
  $("#adminview").append(div);
}

function setup() {
  makeDivs();
  // poll for stat updates to display
  (function poll() {
    setTimeout(function() {
      ajaxCall("/hashtags", "GET", function(data) {
        if (data != null) {
	  	  updateHashtags(data.hashtags);
        }
        //Setup the next poll recursively
	    poll();
      });
	  ajaxCall("/servinfo", "GET", function(data) {
		if (data != null) {
		  updateRedisInfo(data);
		}
	  })
    }, 1000);
  })();
}

function updateRedisInfo(servdata) {
  var div = $("#servinfo")
  div.html("<pre>"+servdata.server+"</pre>");
}

function updateHashtags(hashtagList) {
	hashtagList.forEach(function(tag) {
		ajaxCall("/htcount?hashtag="+tag, "GET", function(data) {
			if (data != null) {
			  updateHashtag(tag, data)
			}
		});
	});
}

function updateHashtag(tag, data) {
  var div = $("#"+tag);
  if (div.length == 0) {
	  addHashtag(tag);
  }
  div = $("#" + tag + "> .htcount")
  div.html(data.htcount)
}

function addHashtag(tag) {
  var parent = $("#htreport");
  var newtag = $("<div class='hashtag' id='"+tag+"'><div class='htname'>#"+tag+"</div><div class='htcount'></div></div>");
  parent.append(newtag);
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
