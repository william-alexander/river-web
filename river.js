var split = window.location.href.split("#");

if (split.length < 2) {
	alert("A River server must be specified.");
	window.location = "https://github.com/wwalexander/river-web#usage";
}

var server = location.protocol + "//" + decodeURIComponent(split[1]);
var songsURL = server + "/songs";
var songs = [];
var songElems = [];
var matches = [];
var passwordElem = document.getElementById("password");
var passwordSubmitElem = document.getElementById("password-submit");
var passwordInputElem = document.getElementById("password-input");
var searchElem = document.getElementById("search");
var reloadElem = document.getElementById("reload");
var songsElem = document.getElementById("songs");
var controlElem = document.getElementById("control");
var audioElem = document.getElementById("audio");
var opusSourceElem = document.getElementById("opus");
var mp3SourceElem = document.getElementById("mp3");
var titleElem = document.getElementById("title");
var albumElem = document.getElementById("album");
var artistElem = document.getElementById("artist");

var password = "";

function ajax(method, url, onsuccess, onerror) {
	var req = new XMLHttpRequest();

	req.onreadystatechange = function() {
		if (req.readyState != 4) return;

		if (req.status != 200) {
			onerror(req.status);
			return
		}

		onsuccess(req.responseText);
	};

	req.open(method, url);
	req.setRequestHeader("Authorization", "Basic "+btoa(":"+password));
	req.send();
}

passwordInputElem.oninput = function() {
	passwordSubmitElem.classList.remove("error");
}

passwordElem.onsubmit = function() {
	password = passwordInputElem.value;
	passwordSubmitElem.classList.add("waiting");

	ajax("GET", songsURL, function(responseText) {
		populate(responseText);
		passwordElem.classList.remove("active");
		passwordSubmitElem.classList.remove("waiting");
	}, function(error) {
		passwordSubmitElem.classList.remove("waiting");
		passwordSubmitElem.classList.add("error");
	});

	return false;
};

audioElem.oncanplay = function() {
	controlElem.classList.remove("waiting");
};

audioElem.onpause = function() {
	controlElem.classList.remove("playing");
	controlElem.classList.add("paused");
};
	
audioElem.onplaying = function() {
	controlElem.classList.remove("paused");
	controlElem.classList.add("playing");
};

controlElem.onclick = function() {
	if (controlElem.classList.contains("waiting")) return;

	if (audioElem.paused) {
		audioElem.play();
	} else {
		audioElem.pause();
	}
};

function displayTag(key, song) {
	if (key == "title") {
		return song.title == "" ? song.path : song.title;
	}

	var val = song[key];
	return val == "" ? "-" : val;
}

function load(index) {
	controlElem.classList.remove("hidden");
	controlElem.classList.add("waiting");
	var song = songs[index];
	var streamURLPrefix = songsURL + "/" + song.id + ".";
	document.title = song.title;
	titleElem.textContent = displayTag("title", song);
	artistElem.textContent = displayTag("artist", song);
	albumElem.textContent = displayTag("album", song);
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

function populate(songsJSON) {
	songs = JSON.parse(songsJSON);
	songElems = [];

	while (songsElem.firstChild) {
		songsElem.removeChild(songsElem.firstChild);
	}

	for (var i = 0; i < songs.length; ++i) {
		var titleElem = document.createElement("div");
		titleElem.classList.add("title", "tag");
		titleElem.textContent = displayTag("title", songs[i]);
		var artistElem = document.createElement("div");
		artistElem.classList.add("tag");
		artistElem.textContent = displayTag("artist", songs[i]);
		var albumElem = document.createElement("div");
		albumElem.classList.add("tag");
		albumElem.textContent = displayTag("album", songs[i]);
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
}

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
	
	var query = e.currentTarget.value.toLowerCase()

	for (var i = 0; i < songElems.length; ++i) {
		var song = songs[i];

		if (match(song, "title", query) ||
			match(song, "artist", query) ||
			match(song, "album", query)) {
			songElems[i].classList.add("match");
			matches.push(songElems[i]);
		} else {
			songElems[i].classList.remove("match");
		}
	}

	songsElem.classList.add("searching");
};

reloadElem.onclick = function() {
	if (reloadElem.classList.contains("waiting")) return;
	searchElem.value = "";
	searchElem.dispatchEvent(new Event("input"));
	reloadElem.classList.add("waiting");
	ajax("PUT", songsURL, function(responseText) {
		console.log("onclick");
		populate(responseText);
		reloadElem.classList.remove("waiting");
	}, function() {
		reloadElem.classList.remove("waiting");
	});
};
