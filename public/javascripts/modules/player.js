// TODO loadBlock & loadLayer : layers = {} !=!=!=! [] !!!

(function(player) {

/**
 *  DEPENDENCIES
 */
var utils = jasmed.module('utils');

/**
 *  PARAMS
 */
var channelCount = 2, // :) no more krakz yeah!
    bufferSize = 4096, // why ???
    sampleRate = 44100,
    nSampleFade = 10,
    trackNum = 0,
    pause,
    device,
    tempo,
    compress,
    instrument,
    track,
    layers, /*= {
        numero du layer: {
            loadlimit: numero du sample dans le bloc auquel il faudra changer de note,
            notes: [{
                nsample: numero du sample dans la note,
                pitch: pitch de la note,
                fadeout: numero du sample dans la note auquel le fadeout doit démarrer
            }],
            notelength: durée en samples d'une note du layer (floor),
            reste: nombre de samples manquant au notes par rapport au block (reste de la division euclidienne),
            count: index de la note suivante
        }
    }*/
    blocklength,
    blocknum,
    blocks,
    samplenum,
    stopped,
    curWaveForm = 'sine';

/**
 *  FUNCTIONS
 */
function audioCallback(buffer, channelCount) {
    if(pause) return;
    
    var sample, compBy, fade, layer, note, generator;
    
    for(var i = 0 ; i < buffer.length ; i += channelCount, samplenum++) {
        if(samplenum == blocklength) {
            if(!loadBlock()) return stop();
        }
        
        sample = 0;
        compBy = 0;
        
        for(var n in layers) {
            layer = layers[n];
            
            if(samplenum == layer.loadlimit) {
                loadLayer(n);
            }
            
	    var sustainTime = Math.floor(tempo / n) - 150; //150 = attack + delay + release

            for(var j = 0 ; j < layer.notes.length ; j++) {
                note = layer.notes[j];
                generator = instrument[note.pitch];
                
		generator.envelope.sustainTime = sustainTime;
		if(++note.nsample == layer.notelength)
		    generator.envelope.state = 0;

                generator.osc.generate();
		generator.envelope.generate();
                sample += generator.osc.getMix() * generator.envelope.getMix();
                compBy++;
            }
        }
        
        compress.setParam('scale', compBy);
        
        for(var k = 0 ; k < channelCount ; k++) {
            buffer[i+k] = compress.pushSample(sample);
        }
    }
}

function loadLayer(n) {
    var layer = layers[n],
        exlength = layer.notes.length;
    
    layer.loadlimit = samplenum + layer.notelength;
    if(layer.reste) {
        layer.reste--;
        layer.loadlimit++;
    }
    
    var chord = track.blocks[blocknum].layers[n][layer.count++];
    
    for(var i = 0 ; i < chord.length ; i++) {
        if(chord[i].duration > 0) {
            layer.notes.push({
                pitch: chord[i].pitch,
                nsample: 0,
            });
        } else if(chord[i].duration < 0) {
            for(var j = 0 ; j < exlength ; j++) {
                if(layer.notes[j].pitch == chord[i].pitch) {
                    layer.notes.push(layer.notes.splice(j,1)[0]);
                    exlength--;
                }
            }
        }
    }
    layer.notes.splice(0,exlength);
}

function loadBlock() {
    if(++blocknum == blocks) {
        return false;
    }
    
    var toRead = track.blocks[blocknum].layers, exLayers = layers;
    
    samplenum = 0;
    layers = {};
    for(var n in exLayers) {
        if(n in toRead) {
            layers[n] = exLayers[n];
        }
    }
    for(n in toRead) {
        if(!(n in layers)) {
            layers[n] = {
                notes: [],
                notelength: Math.floor(blocklength/n)
            };
        }
        layers[n].count = 0;
        layers[n].reste = blocklength%n;
        loadLayer(n);
    }
    return true;
}

function init(song) {
    track = song.tracks[trackNum];
    blocklength = Math.round(song.tempo*sampleRate);
    tempo = song.tempo * 1000;
    blocks = song.blocks;
    compress = audioLib.Compressor(sampleRate, 0, 0.5);
    instrument = {};
    for(var pitch in song.pitches) {
        instrument[pitch] = { 
	    osc : audioLib.Oscillator(sampleRate, utils.midiToHertz(pitch)),
	    envelope : audioLib.ADSREnvelope(sampleRate, 40, 20, 0.5, 90, 0, null)
	};
	instrument[pitch].osc.waveShape = curWaveForm;
	instrument[pitch].envelope.triggerGate(true);
    }
    blocknum = -1;
    layers = {};
    loadBlock();
    pause = true;
    stopped = false;
    device = audioLib.AudioDevice(audioCallback, channelCount, bufferSize, sampleRate);
};

/**
 *  CONTROLS
 */
function play() {
    pause = false;
};

function pause() {
    pause = true;
};

function stop() {
	//otherwise tries to kill device which is already killed :D
	if (stopped)
		return;
		
    pause = true;
    device.kill();
    compress = null;
    instrument = null;
    stopped = true;
};

/**
 *  SUBSCRIBES
 */
player.subscribe('playerViewPlay', function() {
	//struct.selectedSong is the instance to be played.. allways..
	init(jasmed.module('struct').selectedSong);
	play();
});

player.subscribe('playerViewPause', function() {
	pause();
});

player.subscribe('playerViewStop', function() {
	stop();
});

player.subscribe('instrumentViewSwitchWaveForm', function(wave) {
	curWaveForm = wave;
});

})(jasmed.module('player'));
