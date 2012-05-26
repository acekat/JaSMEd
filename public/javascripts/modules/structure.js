(function(struct) {

/**
 *  DEPENDENCIES
 */
var utils = jasmed.module('utils');

/**
 *  INSTANCES
 */
var curSong, curTrack;
var demo; //where demo is stored (init once.. shouldn't change later)
// all this is a fucking ugly hack to make demo work... will all disappear soon

/**
 *  CONSTRUCTORS / CLASSES
 */

/** @class */
var Song = {
    title: "Untitled",
    tempo: 4, // in seconds per block
    tracks: [],
    blocks: 2,
    pitches: {},
    
    /**
     * Add a track to the song, initialized with {@link song#blocks} blocks with the specified layer.
     * @param {string} [name="Track {number}"]
     * @param {number} [layer]
     * @returns {track} The new track added.
     */
    addTrack: function(name, layer) {
        var newTrack = utils.inherits(Track, {
            name: name || "Track " + (this.tracks.length+1),
            songPitches: this.pitches
        });
        newTrack.addBlocks(this.blocks);
        if (layer) {
            newTrack.init(layer);
        }
        this.tracks.push(newTrack);
        return newTrack;
    },
    
    /**
     * Add blocks to each track of the song, at any position, or at the end if not specified.
     * @param {number} [n=1] The number of blocks to add.
     * @param {number} [pos=end] Number of the block before the new blocks, starting with 1.
     * @returns {number} The new number of blocks.
     * @example
     * mySong.addBlocks(2, 0); // add two blocks at the begining
     * mySong.addBlocks(1, 3); // add one block after the third block
     */
    addBlocks: function(n, pos) {
        var i, nTracks = this.tracks.length;
        for (i = 0 ; i < nTracks ; i++) {
            this.tracks[i].addBlocks(n, pos);
        }
        return (this.blocks += n || 1);
    }
};

/** @class */
var Track = {
    name: "New Track",
    instrument: "Piano",
    blocks: [],
    songPitches: {},
    
    /**
     * Add a note to the track.
     * @param {number} pitch The value of the note to add.
     * @param {{number} block,
     *         {number} layer,
     *         {number} start} start Block, layer and index of the first cell of the note.
     * @param {{number} block,
     *         {number} layer,
     *         {number} end} [end=start+1] Block, layer and index of the cell just after the note.
     * @returns {{number} layer,
     *           {number} duration} The layer and duration of the new note.
     */
    addNote: function(pitch, start, end) {
        this.songPitches[pitch]++ || (this.songPitches[pitch] = 1);
        
        var startBlk = this.blocks[start.block];
        
        if (!end)
            return startBlk.addNote(pitch, start.layer, start.start);

        var layer = start.layer,
            noteStart = start.start,
            noteEnd = end.end,
            pgcd;
        
				if (start.layer != end.layer) {
            layer = utils.ppcm(start.layer, end.layer);
            noteStart = start.start*layer/start.layer;
            noteEnd = end.end*layer/end.layer;
        }
        
        if ((pgcd = utils.pgcd(layer, utils.pgcd(noteEnd, noteStart))) != 1) {
            layer /= pgcd;
            noteStart /= pgcd;
            noteEnd /= pgcd;
        }
        
        if (start.block == end.block) {
            return startBlk.addNote(pitch, -layer, noteStart, noteEnd);
        } else {
            var tmpRes = this.blocks[end.block].addNote(pitch, layer, 0, noteEnd, 0);
            for(var i = end.block - 1 ; i > start.block ; i--) {
                tmpRes = this.blocks[i].addNote(pitch, layer, 0, layer, -tmpRes.duration);
            }
            return startBlk.addNote(pitch, layer, noteStart, layer, tmpRes.duration);
        }
    },
    
    /**
     * Add blocks to the track.
     * Should not be used.
     * @see song.addBlocks 
     */
    addBlocks: function(n, pos) {
        var i, nb = n||1, add = [];
        for (i = 0 ; i < nb ; i++) {
            add.push(utils.inherits(Block));
        }
        if (pos) {
            add = add.concat(this.blocks.slice(pos));
            this.blocks = this.blocks.slice(0,pos);
        }
        this.blocks = this.blocks.concat(add);
        return this.blocks.length;
    },
    
    /**
     * Initialize all the blocks of the track with the specified layer.
     * @param {number} layer
     */
    init: function(layer) {
        var i, n = this.blocks.length;
        for (i = 0 ; i < n ; i++) {
            this.blocks[i].initLayer(layer);
        }
    }
};

/** @class */
var Block = {
    lnFw: false,
    lnBw: false,
    layers: {},
    
    /**
     * Add a note to the block.
     * @param {number} pitch The value of the note to add.
     * @param {number} layer The layer in which add the note.
     * @param {number} start Index of the cell where the note starts.
     * @param {number} [end=start+1] Index of the cell just after the end of the note.
     * @param {number} [duration] Should note be used.
     * @returns {{number} layer,
     *           {number} duration} The layer and duration of the new note.
     */
    addNote: function(pitch, layer, start, end, duration) {
        var pgcd, i, ghost = duration !== undefined && duration <= 0;
        if (!end) {
            end = start+1;
        } else if(layer < 0) {
            layer = -layer;
        } else if(duration === undefined) {
            if((pgcd = utils.pgcd(layer, utils.pgcd(end, start))) != 1) {
                layer /= pgcd;
                start /= pgcd;
                end /= pgcd;
            }
        }

        duration = ghost ? -duration : duration||0;
        duration += end - start;
        var result = {
            layer: layer,
            duration: duration,
            start: start
        };
        
        if (!(layer in this.layers)) {
            this.initLayer(layer);
        }
        
        this.layers[layer][start].push(utils.inherits(Note, {
            pitch: pitch,
            duration: ghost ? -duration : duration
        }));
        for (i = start+1, duration-- ; i < end ; i++, duration--) {
            this.layers[layer][i].push(utils.inherits(Note, {
                pitch: pitch,
                duration: -duration
            }));
        }
        return result;
    },
    
    /**
     * Initialize a layer in the block.
     * @param {number} layer
     */
    initLayer: function(layer) {
        if (!this.hasOwnProperty('layers')) {
            this.layers = {};
        }
        this.layers[layer] = [];
        for (var i = 0 ; i < layer ; i++) {
            this.layers[layer][i] = [];
        }
    }
};

/** @class */
var Note = {
    pitch: 0,
    duration: 1
};

/**
 *  PUBLIC API
 */

struct.createSong = function(props) {
    return utils.inherits(Song, _.extend(props||{}, {tracks: [], pitches: {}}));
};

struct.initialize = function(seqName) {
	struct.publish('structInit', seqName);
	//console.log('struct published structInit', seqName);
};

/**
 *  SUBSCRIBES
 */

struct.subscribe("toolsExport", function(name) {
	struct.publish("structExport", {
		name : name,
		data : struct.selectedSong
	});
});


function importSong(song) {
	var curSong = {};
	curSong.__proto__ = Song;
	
	_.each(song.data, function(val, key) {
		if (key !== 'pitches')
			curSong[key] = val; //hack pour la ref

		if (key === 'tracks') {
			_.each(val, function(track) {
				track.__proto__ = Track;
				
				_.each(track.blocks, function(block) {
						block.__proto__ = Block;
				});
				curSong.pitches = track.songPitches; //hack pour la ref
			});
		}
	});
	
	return curSong;
}

struct.subscribe('structServerInit', function(song) {
	//console.log('structServerInit', song);
	
	curSong = (song) ? importSong(song) : struct.createSong();
	
	curTrack = curSong.tracks[0] || curSong.addTrack();

	struct.selectedSong = curSong;
	// console.log("selected", struct.selectedSong);
	
	// TO-DO: fix error on demo initialisation
	// demo = jasmed.module('demo').render();
	// console.log("demo", demo);
});

struct.subscribe('toolsNewBlock', function() {
    curSong.addBlocks();
    struct.publish('structNewBlock');
});

struct.subscribe('serverNewBlock', function() {
    curSong.addBlocks();
});

struct.subscribe('editorViewsSelection', function(selection) {
    selection.startCell.start = selection.startCell.cell - 1;
    selection.endCell.end = selection.endCell.cell;
    var result = curTrack.addNote(selection.pitch, selection.startCell, selection.endCell);
    selection.startCell.layer = selection.endCell.layer = result.layer;
    selection.startCell.start = result.start;
    selection.startCell.cell = result.start + 1;
    selection.endCell.end = selection.endCell.cell = (result.start + result.duration - 1)%result.layer + 1;
    struct.publish('structSelection', selection);
});

struct.subscribe('serverSelection', function(selection) {      //TODO alléger la modification des clients distants
    curTrack.addNote(selection.pitch, selection.startCell, selection.endCell);
});

struct.subscribe('playerViewTrack', function(track) {
	if (track === 'demo')
		struct.selectedSong = demo;
	else if (track === 'grid')
		struct.selectedSong = curSong;
});

})(jasmed.module('struct'));
