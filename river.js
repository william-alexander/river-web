var queries = location.search.substring(1).split("&");
var loginElem = document.getElementById("login");

for (var i = 0; i < queries.length; ++i) {
	var pair = queries[i].split("=");

	switch (pair[0]) {
		case "server":
			loginElem.elements.server.value = pair[1];
			break;
		case "port":
			loginElem.elements.port.value = parseInt(decodeURIComponent(pair[1]));
			break;
		case "protocol":
			loginElem.elements.protocol.value = pair[1];
			break;
	}
}

var audioElem = document.getElementById("audio");
var opusSourceElem = document.getElementById("opus");
var mp3SourceElem = document.getElementById("mp3");
var sourceElem;
var ext;

if (audioElem.canPlayType(opusSourceElem.type) !== "") {
	sourceElem = opusSourceElem;
	ext = "opus";
} else if (audioElem.canPlayType(mp3SourceElem.type) !== "") {
	sourceElem = mp3SourceElem;
	ext = "mp3";
} else {
	alert("No supported audio types");
}

var loginFieldsetElem = document.getElementById("login-fieldset");
var auth;
var url;

loginElem.onsubmit = function() {
	url = new URL(loginElem.elements.protocol.value + "://" + loginElem.elements.server.value);
	url.port = parseInt(loginElem.elements.port.value)
	url.password = loginElem.elements.password.value;
	url.pathname = "/songs";
	auth = "Basic " + btoa(":"+loginElem.elements.password.value);
	var xhr = new XMLHttpRequest();
	xhr.onload = onsongsload;
	xhr.open("GET", url.toString());
	xhr.setRequestHeader("Authorization", auth);

	xhr.onerror = function () {
		loginFieldsetElem.removeAttribute("disabled");
	}

	loginFieldsetElem.setAttribute("disabled", "true");
	xhr.send();
	return false;
};

function titleOrPath(song) {
	return song.title === "" ? song.path : song.title;
}

function tagOrDash(tag) {
	return tag === "" ? "-" : tag;
}

var songsElem = document.getElementById("songs");
var reloadElem = document.getElementById("reload");
var songElems;
var songs;

function onsongsload() {
	if (this.status != 200) return;
	reloadElem.removeAttribute("disabled");
	loginElem.classList.remove("active");
	songs = JSON.parse(this.responseText);
	songElems = [];

	for (var i = 0; i < songs.length; ++i) {
		var titleElem = document.createElement("div");
		titleElem.textContent = titleOrPath(songs[i]);
		titleElem.classList.add("tag");
		titleElem.classList.add("title");
		var artistElem = document.createElement("div");
		artistElem.textContent = tagOrDash(songs[i].artist);
		artistElem.classList.add("tag");
		var albumElem = document.createElement("div");
		albumElem.textContent = tagOrDash(songs[i].album);
		albumElem.classList.add("tag");
		var songElem = document.createElement("div");
		songElem.classList.add("song");
		songElem.dataset.index = i;
		songElem.onclick = onsongclick;
		songElem.appendChild(titleElem);
		songElem.appendChild(artistElem);
		songElem.appendChild(albumElem);
		songsElem.appendChild(songElem);
		songElems.push(songElem);
	}
}

function load(index) {
	document.title = titleOrPath(songs[index]);

	audioElem.onended = function() {
		var next = index + 1;
		if (next >= songs.length) return;
		load(next);
	};

	sourceElem.src = url.toString() + "/" + songs[index].id + "." + ext;
	audioElem.load();
	audioElem.classList.add("active");
	audioElem.play();
}

function onsongclick() {
	load(parseInt(this.dataset.index));
}

function matchFold(a, b) {
	return a.toLowerCase().indexOf(b.toLowerCase()) !== -1;
}

var scrollTop;
var empty = true;
var timer;

document.getElementById("search").oninput = function () {
	clearTimeout(timer);
	var value = this.value;
	
	timer = setTimeout(function () {
		if (empty && value !== "") {
			scrollTop = songsElem.scrollTop;
			empty = false;
		}

		songsElem.scrollTop = 0;

		for (var i = 0; i < songs.length; ++i) {
			if ((matchFold(songs[i].title, value) ||
				matchFold(songs[i].artist, value) ||
				matchFold(songs[i].album, value))) {
				songElems[i].classList.remove("exclude");
			} else {
				songElems[i].classList.add("exclude");
			}
		}

		if (!empty && value === "") {
			songsElem.scrollTop = scrollTop;
			empty = true;
		}
	}, 200);
};

reloadElem.onclick = function() {
	reloadElem.setAttribute("disabled", true);
	var xhr = new XMLHttpRequest();
	xhr.onload = onsongsload;

	xhr.onerror = function() {
		reloadElem.removeAttribute("disabled");
	};

	console.log()
	xhr.open("PUT", url.toString());
	xhr.setRequestHeader("Authorization", auth);

	while (songsElem.firstChild) {
		songsElem.removeChild(songsElem.firstChild);
	}

	xhr.send();
};