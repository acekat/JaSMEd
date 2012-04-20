(function(struct) {

var utils = jasmed.module('utils');

struct.createSong = function(props) {
    return utils.extend(struct.song, props);
};

/** @class */
struct.song = {
    title: "Untitled",
    tempo: 4000, // in miliseconds per block
    tracks: [],
    blocks: 32,
    
    /**
     * Add a track to the song, initialized with {@link song#blocks} blocks with the specified layer.
     * @param {string} [name="Track {number}"]
     * @param {number} [layer]
     * @returns {track} The new track added.
     */
    addTrack: function(name, layer) {
        if(!this.hasOwnProperty('tracks')) {
            this.tracks = [];
        }
        
        var newTrack = utils.extend(struct.track, {
            name: name || "Track " + (this.tracks.length+1)
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
struct.track = {
    name: "New Track",
    instrument: "Piano",
    blocks: [],
    
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
     *           {number} length} The layer and length of the new note.
     */
    addNote: function(pitch, start, end) {
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
                tmpRes = this.blocks[i].addNote(pitch, layer, 0, layer, -tmpRes.length);
            }
            return startBlk.addNote(pitch, layer, noteStart, layer, tmpRes.length);
        }
    },
    
    /**
     * Add blocks to the track.
     * Should not be used.
     * @see struct.song.addBlocks 
     */
    addBlocks: function(n, pos) {
        var i, nb = n||1, add = [];
        for(i = 0 ; i < nb ; i++) {
            add.push(utils.extend(struct.block));
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
struct.block = {
    lnFw: false,
    lnBw: false,
    layers: {},
    
    /**
     * Add a note to the block.
     * @param {number} pitch The value of the note to add.
     * @param {number} layer The layer in which add the note.
     * @param {number} start Index of the cell where the note starts.
     * @param {number} [end=start+1] Index of the cell just after the en of the note.
     * @param {number} [length] Should note be used.
     * @returns {{number} layer,
     *           {number} length} The layer and length of the new note.
     */
    addNote: function(pitch, layer, start, end, length) {
        var pgcd, i, ghost = length !== undefined && length <= 0;
        if(!end) {
            end = start+1;
        } else if(layer < 0) {
            layer = -layer;
        } else if(length === undefined) {
            if((pgcd = utils.pgcd(layer, utils.pgcd(end, start))) != 1) {
                layer /= pgcd;
                start /= pgcd;
                end /= pgcd;
            }
        }
        
        length = ghost ? -length : length||0;
        length += end - start;
        var result = {layer: layer,
                      length: length};
        
        if(!(layer in this.layers)) {
            this.initLayer(layer);
        }
        
        this.layers[layer][start].push(utils.extend(struct.note, {
            pitch: pitch,
            length: ghost ? -length : length
        }));
        for(i = start+1, length-- ; i < end ; i++, length--) {
            this.layers[layer][i].push(utils.extend(struct.note, {
                pitch: pitch,
                length: -length
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
struct.note = {
    pitch: 0,
    length: 1
};

})(jasmed.module('struct'));
