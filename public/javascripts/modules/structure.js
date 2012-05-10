(function(struct) {

var utils = jasmed.module('utils');

struct.createSong = function(props) {
    return utils.inherits(song, _.extend(props||{}, {tracks: [], pitchs: {}}));
};

/** @class */
var song = {
    title: "Untitled",
    tempo: 4, // in seconds per block
    tracks: [],
    blocks: 32,
    pitchs: {},
    
    /**
     * Add a track to the song, initialized with {@link song#blocks} blocks with the specified layer.
     * @param {string} [name="Track {number}"]
     * @param {number} [layer]
     * @returns {track} The new track added.
     */
    addTrack: function(name, layer) {
        var newTrack = utils.inherits(track, {
            name: name || "Track " + (this.tracks.length+1),
            songPitchs: this.pitchs
        });
        newTrack.addBlocks(this.blocks);
        if(layer) {
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
        for(i = 0 ; i < nTracks ; i++) {
            this.tracks[i].addBlocks(n, pos);
        }
        return (this.blocks += n || 1);
    }
};

/** @class */
var track = {
    name: "New Track",
    instrument: "Piano",
    blocks: [],
    songPitchs: {},
    
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
        this.songPitchs[pitch]++ || (this.songPitchs[pitch] = 1);
        
        var startBlk = this.blocks[start.block];
        
        if(!end) {
            return startBlk.addNote(pitch, start.layer, start.start);
        }
        
        var layer = start.layer,
            noteStart = start.start,
            noteEnd = end.end,
            pgcd;
        if(start.layer != end.layer) {
            layer = utils.ppcm(start.layer, end.layer);
            noteStart = start.start*layer/start.layer;
            noteEnd = end.end*layer/end.layer;
        }
        if((pgcd = utils.pgcd(layer, utils.pgcd(noteEnd, noteStart))) != 1) {
            layer /= pgcd;
            noteStart /= pgcd;
            noteEnd /= pgcd;
        }

        
        if(start.block == end.block) {
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
        for(i = 0 ; i < nb ; i++) {
            add.push(utils.inherits(block));
        }
        if(pos) {
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
        for(i = 0 ; i < n ; i++) {
            this.blocks[i].initLayer(layer);
        }
    }
};

/** @class */
var block = {
    lnFw: false,
    lnBw: false,
    layers: {},
    
    /**
     * Add a note to the block.
     * @param {number} pitch The value of the note to add.
     * @param {number} layer The layer in which add the note.
     * @param {number} start Index of the cell where the note starts.
     * @param {number} [end=start+1] Index of the cell just after the en of the note.
     * @param {number} [duration] Should note be used.
     * @returns {{number} layer,
     *           {number} duration} The layer and duration of the new note.
     */
    addNote: function(pitch, layer, start, end, duration) {
        var pgcd, i, ghost = duration !== undefined && duration <= 0;
        if(!end) {
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
        var result = {layer: layer,
                      duration: duration};
        
        if(!(layer in this.layers)) {
            this.initLayer(layer);
        }
        
        this.layers[layer][start].push(utils.inherits(note, {
            pitch: pitch,
            duration: ghost ? -duration : duration
        }));
        for(i = start+1, duration-- ; i < end ; i++, duration--) {
            this.layers[layer][i].push(utils.inherits(note, {
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
        if(!this.hasOwnProperty('layers')) {
            this.layers = {};
        }
        this.layers[layer] = [];
        for(var i = 0 ; i < layer ; i++) {
            this.layers[layer][i] = [];
        }
    }
};

/** @class */
var note = {
    pitch: 0,
    duration: 1
};


var curSong, curTrack;


struct.initialize = function() {
    struct.publish('initialization');
};

struct.subscribe('initializationRes', function(song) {
    curSong = song || struct.createSong();
    curTrack =  curSong.addTrack();
});

struct.subscribe('newBlock', function() {
    curSong.addBlocks();
    struct.publish('newBlockRes');
});

struct.subscribe('newBlockBroad', function() {
    curSong.addBlocks();
});

struct.subscribe('toggleSelection', function(selection) {
    var result = curTrack.addNote(selection.pitch, selection.startNote, selection.endNote);
    selection.startNote.layer = selection.endNote.layer = result.layer;
    struct.publish('toggleSelectionRes', selection);
});

struct.subscribe('toggleSelectionBroad', function(selection) {
    curTrack.addNote(selection.pitch, selection.startNote, selection.endNote);
});

})(jasmed.module('struct'));
