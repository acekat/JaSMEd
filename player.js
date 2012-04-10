/** @namespace */
var device 
	,	osc
	, pianoTrack = []
	,	pianoSampler
	,	songBuffer
	,	tempo,blockNumber
	,	samplePerBlocks
	,	generators
	,	channels = 2;

/**
* Init and launch the song
* @param {jasmed} a structure to play
*/
function player(jasmed) {
	readSong(jasmed.song);
	device = Sink(audioCallback, channels);
}

/**
* Set info and allocate a Generator per Track(->Instrument)
* @param {jasmed.song} a song's structure to read 
*/
function readSong(song) {
	blockNumber = song.blocks;
	samplesPerBlock = device.sampleRate * song.tempo;
	//songBuffer = new Float32Array(samplesPerBlock * song.blocks);

	song.tracks.forEach(function(track, index) {
		setInstrument(track);
	});
}

function readTrack(track) {
	for (var i = 0; i < track.blocks.length; i++)
		readBlock(track.blocks[i]);
}

function readBlock(block) {
	block.forEach(function(layer, index) {
		layer.forEach(function(note, index) {
			readNote(note);
		});
	});
}

function readNote(note, delay) {
	osc.setParam('frequency', mtof(note.pitch));
	device.writeBufferAsync(songBuffer, delay);
}

function audioCallBack(buffer, channelCount) {
	/* Method to stop playing, add with the pause button :
	$(button).click(function () { playing = !playing; } */
	if (playing) {

		var current, l = buffer.length, sample = 0, n;

		for (current = 0; current < l; current += channelCount) {
			if (noteLength <= 0)
				advanceStep();

			//test each track(allocate Generator) to play
			generators.forEach(function(instrument, index) {
				value = readTrack(instrument);

				if (value == 1) {
					instrument.generate();
					sample += instrument.getMix();
				}
			}

			for (n = 0; n < channelCount; n++)
				buffer[current+n] = sample;

			noteLength -= 1;
		}
	}
}

function ptof(pitch) {
	return 440. * exp(.057762265 * (pitch - 69.));
}

function advanceStep() {
	//iterate notes through the score, and find the first one to play

	var step = pianoSequence[tick];
}

function setInstrument (name) {
	//allocate dynamically Generators in a Array

	if(name == 'piano') {
		pianoSampler = audioLib.Sampler(device.sampleRate);    
		pianoRaw = atob(pianoRaw);
		pianoSampler.loadWav(pianoRaw, true);
	}
}

function pause() {
	// device.resetBuffer(buffer);
	// device.kill();
}

module.exports = {
	player: player
}
