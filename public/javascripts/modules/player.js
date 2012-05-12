// TODO loadBlock & loadLayer : layers = {} !=!=!=! [] !!!

(function(player) {

var utils = jasmed.module('utils');

var channelCount = 1,
    bufferSize = 4096,
    sampleRate = 44100,
    nSampleFade = 10,
    trackNum = 0,
    pause,
    device,
    compress,
    osc,
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
    samplenum;

player.init = function(song) {
    track = song.tracks[trackNum];
    blocklength = Math.round(song.tempo*sampleRate);
    blocks = song.blocks;
    compress = audioLib.Compressor(sampleRate);
    osc = {};
    for(var pitch in song.pitchs) {
        osc[pitch] = audioLib.Oscillator(sampleRate, utils.midiToHertz(pitch));
    }
    blocknum = -1;
    layers = {};
    loadBlock();
    pause = true;
    device = audioLib.AudioDevice(audioCallback, channelCount, bufferSize, sampleRate);
};
    
player.play = function(song) {
    pause = false;
};

player.stop = function() {
    pause = true;
    device.kill();
    compress = null;
    osc = null;
};

player.pause = function() {
    pause = true;
};

function audioCallback(buffer, channelCount) {
    if(pause) return;
    
    var sample, compBy, fade, layer, note, generator;
    
    for(var i = 0 ; i < buffer.length ; i += channelCount, samplenum++) {
        if(samplenum == blocklength) {
            if(!loadBlock()) return player.stop();
        }
        
        sample = 0;
        compBy = 0;
        
        for(var n in layers) {
            layer = layers[n];
            
            if(samplenum == layer.loadlimit) {
                loadLayer(n);
            }
            
            for(var j = 0 ; j < layer.notes.length ; j++) {
                note = layer.notes[j];
                generator = osc[note.pitch];
                
                if(++note.nsample < nSampleFade) {
                    fade = note.nsample/nSampleFade; 
                } else if(note.nsample > note.fadeout) {
                    fade = 1 - (note.nsample - note.fadeout)/nSampleFade;
                } else {
                    fade = 1;
                }
              
                generator.generate();
                sample += generator.getMix()*fade;
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
                fadeout: Math.ceil(chord[i].duration*blocklength/n)-nSampleFade
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

/**
 *  Module initialization method
 */
player.initialize = function() {
	//
};

})(jasmed.module('player'));
