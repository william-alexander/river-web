var formElem = document.getElementById("form");
formElem.elements.server.value = location.protocol + "//";
var split = location.href.split("#");

if (split.length > 1) {
	formElem.elements.server.value += decodeURIComponent(split[1]);
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
}

var songsElem = document.getElementById("songs");
var songs;

function onsongsload() {
	if (this.status != 200) return;
	formElem.classList.remove("active");
	songs = JSON.parse(this.responseText);

	for (var i = 0; i < songs.length; ++i) {
		var songElem = document.createElement("div");
		songElem.classList.add("song");

		songElem.textContent = (songs[i].title == "" ?
				songs[i].path :
				songs[i].title) +
			" - " +
			songs[i].artist +
			" - " +
			songs[i].album;

		songElem.dataset.index = i;
		songElem.onclick = onsongclick;
		songsElem.appendChild(songElem);
	}
}

function titleOrPath(song) {
	return song.title == "" ? song.path : song.title;
}

function load(index) {
	document.title = titleOrPath(songs[index]);

	audioElem.onended = function() {
		var next = index + 1;
		if (next >= songs.length) return;
		load(next);
	}

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
	if (this.status != 200) return;
	URL.revokeObjectURL(sourceElem.src);
	sourceElem.src = URL.createObjectURL(this.response);

	audioElem.load();
	audioElem.play();
}
