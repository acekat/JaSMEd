/** @namespace */
var jasmed = jasmed || {};

/**
 * Return the divisors of a number.
 * @param {number} n
 * @returns {number[]}
 */
jasmed.divisors = function(n) {
    var i, max = Math.floor(Math.sqrt(n)), result = [];
    for(i = 2 ; i <= max ; i++) {
        if(!n%i) {
            result.push(i, n/i);
        }
    }
    return result; // sort ?
};

/**
 * Return the pgcd of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
jasmed.pgcd = function(a, b) {
    return b === 0 ? a : jasmed.pgcd(b, a%b);
};

/**
 * Make a copy of the caller adding new properties.
 * Function to use as a copy constructor in a class.
 * @param {Object} [props] The properties to add.
 * @returns {Object} The new object created.
 */
jasmed.extend = function(props) {
    var prop, obj;
    obj = Object.create(this);
    for(prop in props) {
        if(props.hasOwnProperty(prop)) {
            obj[prop] = props[prop];
        }
    }
    return obj;
};

/** @class */
jasmed.song = {
    title: "Untitled",
    tempo: 30, // in block per minute
    tracks: [],
    blocks: 32,
    
    /**
     * Add a track to the song, initialized with {@link song#blocks} blocks with the specified layer.
     * @param {string} [name="Track {number}"]
     * @param {number} [layer]
     * @returns {track} The new track added.
     */
    addTrack: function(name, layer) {
        var newTrack = jasmed.track.extend({
            name: name || "Track " + (this.tracks.length()+1)
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
     * @param {number} [n] The number of blocks to add.
     * @param {number} [pos] Number of the block before the new blocks, starting with 1.
     * @returns {number} The new number of blocks.
     * @example
     * mySong.addBlocks(2, 0); // add two blocks before the first block
     * mySong.addBlocks(1, 3); // add one block after the third block
     */
    addBlocks: function(n, pos) {
        var i, nTracks = this.tracks.length;
        for(i = 0 ; i < nTracks ; i++) {
            this.tracks[i].addblocks(n, pos);
        }
        return (this.blocks += n || 1);
    },
    
    /** @see jasmed.extend */
    extend: jasmed.extend
};

/** @class */
jasmed.track = {
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
     * @returns {number} The number of effective notes added.
     */
    addNote: function(pitch, start, end) {
        var startBlk = this.blocks[start.block], link;
        
        if(!end) {
            return startBlk.addNote(pitch, start.layer, start.start);
        }
        
        if(start.block == end.block) {
            if(start.layer == end.layer) {
                return startBlk.addNote(pitch, start.layer, start.start, end.end);
            }
            
            var midLayer = jasmed.pgcd(start.layer, end.layer),
                div1 = start.layer/midLayer,
                mid1 = Math.ceil(start.start/div1),
                cut1 = mid1*div1,
                div2 = end.layer/midLayer,
                mid2 = Math.floor(end.end/div2),
                cut2 = mid2*div2;
            
            link = startBlk.addNote(pitch, start.layer, start.start, cut1);
            if(mid1 != mid2) {
                link = startBlk.addNote(pitch, midLayer, mid1, mid2, link);
            }
            return startBlk.addNote(pitch, end.layer, cut2, end.end, link);
        }
        
        link = startBlk.addNote(pitch, start.layer, start.start, start.layer);
        for(var i = start.block + 1 ; i < end.block ; i++) {
            link = this.blocks[i].addNote(pitch, 1, 0, 1, link);
        }
        return this.blocks[end.block].addNote(pitch, end.layer, 0, end.end, link);
    },
    
    /**
     * Add blocks to the track.
     * Should not be used.
     * @see jasmed.song.addBlocks 
     */
    addBlocks: function(n, pos) {
        var i, nb = n||1, add = [];
        for(i = 0 ; i < nb ; i++) {
            add.push(jasmed.block.extend({}));
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
    },
    
    /** @see jasmed.extend */
    extend: jasmed.extend
};

/** @class */
jasmed.block = {
    lnFw: false,
    lnBw: false,
    
    /**
     * Add a note to the block.
     * @param {number} pitch The value of the note to add.
     * @param {number} layer The layer in which add the note.
     * @param {number} start Index of the cell where the note starts.
     * @param {number} [end=start+1] Index of the cell just after the en of the note.
     * @param {number} [link=0] Should note be used.
     * @returns {number} The number of effective notes added.
     */
    addNote: function(pitch, layer, start, end, link) {
        var pgcd, i;
        if(!end) {
            end = start+1;
        } else if((pgcd = jasmed.pgcd(layer, jasmed.pgcd(end, start))) != 1) {
            layer /= pgcd;
            start /= pgcd;
            end /= pgcd;
        }
        
        if(!(layer in this)) {
            this.initLayer(layer);
        }
        
        for(i = start, link = link || 0 ; i < end ; i++, link++) {
            this[layer][i].push(jasmed.note.extend({
                linked: link,
                pitch: pitch
            }));
        }
        return link;
    },
    
    /**
     * Initialize a layer in the block.
     * @param {number} layer
     */
    initLayer: function(layer) {
        this[layer] = [];
        for(var i = 0 ; i < layer ; i++) {
            this[layer][i] = [];
        }
    },
    
    /** @see jasmed.extend */
    extend: jasmed.extend
};

/** @class */
jasmed.note = {
    pitch: 0,
    linked: 0,
    
    /** @see jasmed.extend */
    extend: jasmed.extend
};
