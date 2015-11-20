// key: 3c9e3ede1496bde79d65c548e24c40a9
// secret: 0d42bdab0d329738

// Some beautiful pollution of the global namespace right here
var selectedMap = new Map(); // Holds current album data
var httpRequest = new XMLHttpRequest(); // The flickr http request
var httpResult;  // Storage for the http request result

// Initialization
document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    // Make input field handle enter key
    document.getElementById('js-search').onkeydown = function (e) {
      if (e.keyCode == 13) {
          doSearch();
      }
    }
  }
}

// Event handler for flickr.photos.search api
function searchHandler () {
  if (httpRequest.readyState == 4 && httpRequest.status == 200) {
    httpResult = JSON.parse(httpRequest.responseText);
    var el = document.getElementById('js-searchResult');
    el.innerHTML = "";
    if (httpResult.stat === "ok") {
      createPaginator();
      var photos = httpResult.photos.photo;
      for (i=0; i < photos.length; i++) {
        var url = buildFlickrImageUrl(photos[i], "s");
        var id = buildFlickrImageUrl(photos[i], "m");
        var checked = selectedMap.has(id) ? 'checked="checked"' : "";

        el.innerHTML +=
        '<div class="js-search-item"> \
          <input type="checkbox"' + checked + 'id="' + id + '"' + ' onChange="checkboxChange(this)" /> \
          <span></span> \
          <img class="js-flickr-icon" src="' + url +'"'  + '/>' + " Id: " + photos[i].id + '<br> \
          </div>';
      }

      createPaginator();
      createPaginatorInfo(httpResult.photos);
    }else {
      el.innerHTML = '<p>' + "Error: " + httpResult.message + '</p>';
    }
  }
}

function doSearch (){
  selectedMap.clear();
  doFlickrPageSearch(1);
}

// Search flicker for tag(s)
function doFlickrPageSearch (page) {
  var input = document.getElementById('js-search').value;
  var comma = encodeURIComponent(input);
  var flickr_url =
    'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=3c9e3ede1496bde79d65c548e24c40a9&tags=' +
    input +
    '&tag_mode=all' +
    '&per_page=25' +
    '&page=' + page +
    '&format=json&nojsoncallback=1';

  httpRequest.open('GET', flickr_url, true);
  httpRequest.onreadystatechange = searchHandler;
  httpRequest.send();
}

// Create Paginator buttons
function createPaginator () {
  var el = document.getElementById('js-searchResult');
  //el.innerHTML = "";
  el.innerHTML +=
  '<a class="page dark gradient margin-top-10" onclick=doPage("first")>first</a> \
    <a class="page dark gradient" onclick=doPage("-10")><<</a> \
    <a class= "page dark gradient" onclick=doPage("-1")><</a> \
    <a class= "page dark gradient" onclick=doPage("1")>></a> \
    <a class= "page dark gradient" onclick=doPage("10")>>></a> \
    <a class= "page dark gradient margin-bottom-6" onclick=doPage("last")>last</a>'
}

// Display info text at the bottom of search results
function createPaginatorInfo (photos) {
  var el = document.getElementById('js-searchResult');
  el.innerHTML += "<p>Page " + photos.page + " of " + photos.pages + "</p>";
}

// Handle input from paginator buttons
function doPage (e) {
  var page = httpResult.photos.page;
  if (e === "first") {
    page = 1;
  }
  else if (e === "last") {
    page = httpResult.photos.pages
  }
  else  {
    var newpage = parseInt(e) + httpResult.photos.page;
    if ( newpage > 0 && newpage <= httpResult.photos.pages) {
      page = newpage;
    }
  }

  doFlickrPageSearch(page);
}

// Add or remove images from album
function checkboxChange (e) {
  if (e.checked) { selectedMap.set(e.id, ""); }
  else { selectedMap.delete(e.id, ""); }
}

// Display album
function doAlbum () {
  var ni = document.getElementById('js-searchResult');
  ni.innerHTML = '';
  selectedMap.forEach( function (value, key, map) {
    var keyHack = key.substr(0, key.lastIndexOf('_m.jpg')) + "_b.jpg";
    ni.innerHTML += '<img src="' + key + '" onClick=\'popup("popUpDiv",' + '"' + keyHack  + '")\'/>';
  });
}

// Returns url for flickr image
function buildFlickrImageUrl (model, size) {
  if (!String.format) { // Add simple string format capabilities..
    String.format = function(format) {
      var args = Array.prototype.slice.call(arguments, 1);
      return format.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
      });
    };
  }

  return String.format("https://farm{0}.staticflickr.com/{1}/{2}_{3}_" + size + ".jpg", model.farm, model.server, model.id, model.secret);
}

// Stolen from "http://webdesignandsuch.com/2009/12/how-to-create-a-popup-with-css-and-javascript/"
// Toggles visibility of dom element
function toggle (div_id) {
	var el = document.getElementById(div_id);
	if ( el.style.display == 'none' ) {	el.style.display = 'block';}
	else {el.style.display = 'none';}
}

// Modified from "http://webdesignandsuch.com/2009/12/how-to-create-a-popup-with-css-and-javascript/"
// Calculates the size of for overlay popup used to dim the view when showing image
function blanket_size (popUpDivVar, width) {
	if (typeof window.innerWidth != 'undefined') {
		viewportheight = window.innerHeight;
	} else {
		viewportheight = document.documentElement.clientHeight;
	}
	if ((viewportheight > document.body.parentNode.scrollHeight) && (viewportheight > document.body.parentNode.clientHeight)) {
		blanket_height = viewportheight;
	} else {
		if (document.body.parentNode.clientHeight > document.body.parentNode.scrollHeight) {
			blanket_height = document.body.parentNode.clientHeight;
		} else {
			blanket_height = document.body.parentNode.scrollHeight;
		}
	}
	var blanket = document.getElementById('blanket');
	blanket.style.height = blanket_height + 'px';
	var popUpDiv = document.getElementById(popUpDivVar);
	popUpDiv_height=blanket_height/2-width/2;
	popUpDiv.style.top = popUpDiv_height + 'px';
}

// Modified from "http://webdesignandsuch.com/2009/12/how-to-create-a-popup-with-css-and-javascript/"
// Calculates the postition where to show popup with image (centered)
function window_pos (popUpDivVar, height) {
	if (typeof window.innerWidth != 'undefined') {
		viewportwidth = window.innerHeight;
	} else {
		viewportwidth = document.documentElement.clientHeight;
	}
	if ((viewportwidth > document.body.parentNode.scrollWidth) && (viewportwidth > document.body.parentNode.clientWidth)) {
		window_width = viewportwidth;
	} else {
		if (document.body.parentNode.clientWidth > document.body.parentNode.scrollWidth) {
			window_width = document.body.parentNode.clientWidth;
		} else {
			window_width = document.body.parentNode.scrollWidth;
		}
	}
	var popUpDiv = document.getElementById(popUpDivVar);
	window_width=(window_width)/2-height/2;
	popUpDiv.style.left = window_width + 'px';
}

// Show flickr image as popup
function popup (windowname, image) {
  if (image) {
    // We need to know image size before we render popup
    getMeta(windowname, image)
  }
  else {
    // Closing popup
    doPopup(windowname, image);
  }
}

// Show actual image popup
function doPopup (windowname, image, widht, height) {
	blanket_size(windowname, height);
	window_pos(windowname, widht);

  if(image) {
    document.getElementById('popUpDiv').style.background = 'url(' + image + ') no-repeat';
    document.getElementById('popUpDiv').style.width = widht + "px";
    document.getElementById('popUpDiv').style.height =height + "px";
  }

	toggle('blanket');
	toggle(windowname);
}

// load metadata from image
function getMeta (windowname, image){
    var img = new Image();
    img.addEventListener("load", function(){
        doPopup(windowname, image, this.naturalWidth, this.naturalHeight);
    });
    img.src = image;
}
