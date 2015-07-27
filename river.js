var split = window.location.href.split("?");

if (window.location.protocol == "https:" || split.length < 2) {
	window.location = "https://github.com/william-alexander/river-web#usage";
}

var server = "http://" + decodeURIComponent(split[1]);
var songsURL = server + "/songs";
var songs = [];
var songElems = [];
var matches = [];
var controlElem = document.getElementById("control");
var audioElem = document.getElementById("audio");
var opusSourceElem = document.getElementById("opus");
var mp3SourceElem = document.getElementById("mp3");
var titleElem = document.getElementById("title");
var albumElem = document.getElementById("album");
var artistElem = document.getElementById("artist");
var searchElem = document.getElementById("search");
var songsElem = document.getElementById("songs");

function ajax(method, url, callback) {
	var req = new XMLHttpRequest();

	req.onreadystatechange = function() {
		if (req.readyState != 4 || req.status != 200) return;
		callback(req.responseText);
	}

	req.open(method, url);
	req.send();
}

audioElem.oncanplay = function() {
	controlElem.classList.remove("loading");
}

audioElem.onpause = function() {
	controlElem.classList.remove("playing");
	controlElem.classList.add("paused");
}
	
audioElem.onplaying = function() {
	controlElem.classList.remove("paused");
	controlElem.classList.add("playing");
}

controlElem.onclick = function() {
	if (controlElem.classList.contains("loading")) return;

	if (audioElem.paused) {
		audioElem.play();
	} else {
		audioElem.pause();
	}
}

function load(index) {
	controlElem.classList.remove("hidden");
	controlElem.classList.add("loading");
	var song = songs[index];
	var streamURLPrefix = songsURL + "/" + song.id + ".";
	document.title = song.title;
	titleElem.textContent = song.title;
	albumElem.textContent = song.album;
	artistElem.textContent = song.artist;
	opusSourceElem.src = streamURLPrefix + "opus";
	mp3SourceElem.src = streamURLPrefix + "mp3";

	audioElem.onended = function() {
		var nextIndex = index+1;
		if (nextIndex >= songs.length) return;
		load(nextIndex);
	}

	audioElem.load();
	audioElem.play();
}

ajax("GET", songsURL, function(responseText) {
	songs = JSON.parse(responseText);

	for (var i = 0; i < songs.length; ++i) {
		var titleElem = document.createElement("div");
		titleElem.classList.add("title", "tag");
		titleElem.textContent = songs[i].title;
		var artistElem = document.createElement("div");
		artistElem.classList.add("tag");
		artistElem.textContent = songs[i].artist
		var albumElem = document.createElement("div");
		albumElem.classList.add("tag");
		albumElem.textContent = songs[i].album;
		var songElem = document.createElement("div");
		songElem.classList.add("song");
		songElem.dataset.index = i;
		songElem.appendChild(titleElem);
		songElem.appendChild(artistElem);
		songElem.appendChild(albumElem);

		songElem.onclick = function(e) {
			load(parseInt(e.currentTarget.dataset.index));
		}

		songElems.push(songElem);
		songsElem.appendChild(songElem);
	}
});

function match(song, key, query) {
	return song[key].toLowerCase().indexOf(query) != -1;
}

var wasEmpty = true;
var scrollTop = 0;

searchElem.oninput = function(e) {
	var isEmpty = e.currentTarget.value == "";

	if (wasEmpty && isEmpty) {
		return;
	}

	if (isEmpty) {
		wasEmpty = true;
		songsElem.classList.remove("searching");
		songsElem.scrollTop = scrollTop;
		return;
	}

	if (wasEmpty) {
		wasEmpty = false;
		scrollTop = songsElem.scrollTop;
	}

	songsElem.scrollTop = 0;
	
	for (var i = 0; i < matches.length; ++i) {
		matches[i].classList.remove("match");
	}

	var query = e.currentTarget.value.toLowerCase()

	for (var i = 0; i < songElems.length; ++i) {
		var song = songs[i];

		if (match(song, "title", query) ||
			match(song, "artist", query) ||
			match(song, "album", query)) {
			songElems[i].classList.add("match");
			matches.push(songElems[i]);
		}
	}

	songsElem.classList.add("searching");
};
