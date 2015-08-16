var formElem = document.getElementById("login");
var split = location.href.split("#");

if (split.length > 1 && formElem.elements.server.value === "") {
	formElem.elements.server.value = location.protocol +
		"//" +
		decodeURIComponent(split[1]);
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

var auth;

formElem.onsubmit = function() {
	auth = "Basic " + btoa(":"+formElem.elements.password.value);
	var xhr = new XMLHttpRequest();
	xhr.onload = onsongsload;
	xhr.open("GET", formElem.elements.server.value+"/songs");
	xhr.setRequestHeader("Authorization", auth);
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
	formElem.classList.remove("active");
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
	audioElem.classList.remove("active");
	document.title = titleOrPath(songs[index]);

	audioElem.onended = function() {
		var next = index + 1;
		if (next >= songs.length) return;
		load(next);
	};

	var xhr = new XMLHttpRequest();
	xhr.onload = onsongload;
	xhr.open("GET", formElem.elements.server.value+"/songs/"+songs[index].id+"."+ext);
	xhr.responseType = "blob";
	xhr.setRequestHeader("Authorization", auth);
	xhr.send();
}

function onsongclick() {
	load(parseInt(this.dataset.index));
}

function onsongload() {
	if (this.status !== 200) return;
	URL.revokeObjectURL(sourceElem.src);
	sourceElem.src = URL.createObjectURL(this.response);
	audioElem.load();
	audioElem.classList.add("active");
	audioElem.play();
}

function matchFold(a, b) {
	return a.toLowerCase().indexOf(b.toLowerCase()) !== -1;
}

document.getElementById("search").oninput = function() {
	var value = this.value;

	for (var i = 0; i < songs.length; ++i) {
		if ((matchFold(songs[i].title, value) ||
			matchFold(songs[i].artist, value) ||
			matchFold(songs[i].album, value))) {
			songElems[i].classList.remove("exclude");
		} else {
			songElems[i].classList.add("exclude");
		}
	}
};

reloadElem.onclick = function() {
	reloadElem.setAttribute("disabled", true);
	var xhr = new XMLHttpRequest();
	xhr.onload = onsongsload;
	xhr.open("PUT", formElem.elements.server.value+"/songs");
	xhr.setRequestHeader("Authorization", auth);
	xhr.send();
};
