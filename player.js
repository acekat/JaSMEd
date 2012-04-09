var device, 
osc, 
pianoTrack = [],
pianoSampler, 
songBuffer, 
tempo,
blockNumber,
samplePerBlocks,
channels = 2;

function initPlayer() {
    readSong(jasmed.song);
    device = Sink(audioCallback, channels);
}

function readSong(song) {
    blockNumber = song.blocks;
    samplesPerBlock = device.sampleRate * song.tempo;
    //songBuffer = new Float32Array(samplesPerBlock * song.blocks);

    for(var i=0; i < song.tracks.length; i++)
	readTrack(song.tracks[i]);
}

function readTrack(track) {
    setIntrument(track.instrument);
    
    for(var i=0; i < track.blocks.length; i++)
	readBlock(track.blocks[i]);
}

function readBlock(block) {

    block.forEach(function(layer, index){
	layer.forEach(function(note, index) {
	    readNote(note);
	});
    });
}

function readNote(note, delay) {
    osc.setParam('frequency', mtof(note.pitch));
    device.writeBufferAsync(songBuffer, delay);
}

function pause() {
   // device.resetBuffer(buffer);
    osc.setParam('frequency', );
}

function audioCallBack(buffer, channelCount) {
    var current, l=buffer.length, sample = 0, n;
    
    for(current = 0; current < l; current += channelCount){
	if(noteLength <= 0)
	    advanceStep();

	pianoSampler.generate();

	sample = pianoSampler.getMix();

	for (n=0; n<channelCount; n++)
	    buffer[current+n] = sample;

	noteLength -= 1;
    }
}

function ptof(pitch) {
    return 440. * exp(.057762265 * (pitch - 69.));
}

function advanceStep() {
    var step = pianoSequence[tick];
}

function setInstrument (name) {
    if(name == 'piano') {
	pianoSampler = audioLib.Sampler(device.sampleRate);    
	pianoRaw = atob(pianoRaw);
	pianoSampler.loadWav(pianoRaw, true);
    }
}

module.exports = {
    init: initPlayer,
    play: playSong
}