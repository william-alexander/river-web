var split = window.location.href.split("?");

if (window.location.protocol == "https:" || split.length < 2) {
	window.location = "https://github.com/william-alexander/river-web#usage";
}

var server = "http://" + decodeURIComponent(split[1]);
var songsURL = server + "/songs";
var matches = [];
var controlElem = document.getElementById("control");
var audioElem = document.getElementById("audio");
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

function load(e) {
	controlElem.classList.remove("hidden");
	controlElem.classList.add("loading");
	var streamURLPrefix = songsURL + "/" + e.currentTarget.dataset.id + ".";
	document.title = e.currentTarget.dataset.artist + " - " + e.currentTarget.dataset.title;
	titleElem.textContent = e.currentTarget.dataset.title;
	albumElem.textContent = e.currentTarget.dataset.album;
	artistElem.textContent = e.currentTarget.dataset.artist;
	var opusSourceElem = document.createElement("source");
	opusSourceElem.setAttribute("src", streamURLPrefix + "opus");
	var mp3SourceElem = document.createElement("source");
	mp3SourceElem.setAttribute("src", streamURLPrefix + "mp3");
	var newAudioElem = document.createElement("audio");
	newAudioElem.id = "audio";
	newAudioElem.appendChild(opusSourceElem);
	newAudioElem.appendChild(mp3SourceElem);

	newAudioElem.oncanplay = function() {
		controlElem.classList.remove("loading");
	}

	newAudioElem.onpause = function() {
		controlElem.classList.remove("playing");
		controlElem.classList.add("paused");
	}

	newAudioElem.onplaying = function() {
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

	newAudioElem.onended = function() {
		load(e.currentTarget.nextSibling);
	}

	controlElem.replaceChild(newAudioElem, audioElem);
	audioElem = newAudioElem;
	audioElem.play();
}

ajax("GET", songsURL, function(responseText) {
	var songs = JSON.parse(responseText);

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
		songElem.dataset.id = songs[i].id;
		songElem.dataset.artist = songs[i].artist;
		songElem.dataset.album = songs[i].album;
		songElem.dataset.title = songs[i].title;
		songElem.appendChild(titleElem);
		songElem.appendChild(artistElem);
		songElem.appendChild(albumElem);
		songElem.onclick = load;
		songsElem.appendChild(songElem);
	}
});

function match(elem, key, query) {
	return elem.dataset[key].toLowerCase().indexOf(query) != -1;
}

searchElem.oninput = function(e) {
	songsElem.scrollTop = 0;

	for (var i = 0; i < matches.length; ++i) {
		matches[i].classList.remove("match");
	}

	if (e.currentTarget.value == "") {
		songsElem.classList.remove("searching");
		return;
	}

	var query = e.currentTarget.value.toLowerCase()

	matches = [].filter.call(songsElem.children, function(elem) {
		return match(elem, "title", query) ||
			match(elem, "artist", query) ||
			match(elem, "album", query);
	});

	for (var i = 0; i < matches.length; ++i) {
		matches[i].classList.add("match");
	}

	songsElem.classList.add("searching");
};
