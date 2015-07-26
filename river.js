var server = "http://" + decodeURIComponent(window.location.href.split("?")[1]);
var songsURL = server + "/songs";
var controlElem = document.getElementById("control");
var audioElem = document.getElementById("audio");
var titleElem = document.getElementById("title");
var artistElem = document.getElementById("artist");
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

function load(target) {
	controlElem.classList.remove("hidden");
	controlElem.classList.add("loading");
	var streamURLPrefix = songsURL + "/" + target.dataset.id + ".";

	titleElem.textContent = target.dataset.title;
	artistElem.textContent = target.dataset.artist;
	var opusSourceElem = document.createElement("source");
	opusSourceElem.setAttribute("src", streamURLPrefix + "opus");
	var mp3SourceElem = document.createElement("source");
	mp3SourceElem.setAttribute("src", streamURLPrefix + ".mp3");
	var newAudioElem = document.createElement("audio");
	newAudioElem.id = "audio";
	newAudioElem.setAttribute("autoplay", "");
	newAudioElem.appendChild(opusSourceElem);
	newAudioElem.appendChild(mp3SourceElem);

	newAudioElem.oncanplay = function() {
		controlElem.classList.remove("loading");

		newAudioElem.onpause = function() {
			controlElem.classList.remove("playing");
			controlElem.classList.add("paused");
		}

		newAudioElem.onplay = function() {
			controlElem.classList.remove("paused");
			controlElem.classList.add("playing");
		}
	}

	controlElem.onclick = function() {
		if (audioElem.paused) {
			audioElem.play();
		} else {
			audioElem.pause();
		}
	}

	newAudioElem.onended = function() {
		load(target.nextSibling);
	}

	controlElem.replaceChild(newAudioElem, audioElem);
	audioElem = newAudioElem;
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
		songElem.dataset.title = songs[i].title;
		songElem.appendChild(titleElem);
		songElem.appendChild(artistElem);
		songElem.appendChild(albumElem);
		songElem.onclick = function(e) {
			load(e.currentTarget);
		}
		songsElem.appendChild(songElem);
	}
});