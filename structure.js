var jasmed = jasmed || {};

jasmed.divisors = function(n) {
    var i, max = Math.floor(Math.sqrt(n)), result = [];
    for(i = 2 ; i <= max ; i++) {
        if(!n%i) {
            result.push(i, n/i);
        }
    }
    return result; // sort ?
};

jasmed.pgcd = function(a, b) {
    return b === 0 ? a : jasmed.pgcd(b, a%b);
};

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

jasmed.song = {
    title: "Untitled",
    tempo: 120,
    tracks: [],
    blocks: 32,
    
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
    
    addBlocks: function(n, pos) {
        var i, nTracks = this.tracks.length;
        for(i = 0 ; i < nTracks ; i++) {
            this.tracks[i].addblocks(n, pos);
        }
    },
    
    extend: jasmed.extend
};

jasmed.track = {
    name: "New Track",
    instrument: "Piano",
    blocks: [],
    
    addNote: function(pitch, start, end) {
        if(!end) {
            return this.blocks[start.block].addNote(pitch, start.layer, start.start);
        }
        
        if(start.block == end.block) {
            if(start.layer == end.layer) {
                return this.blocks[start.block].addNote(pitch, start.layer, start.start, end.end);
            }
            
            alert("Not yet implemented");
            // TODO link notes through different layers
        }
        
        var link = this.blocks[start.block].addNote(pitch, start.layer, start.start, start.layer);
        for(var i = start.block + 1 ; i < end.block ; i++) {
            link = this.blocks[i].addNote(pitch, 1, 0, 1, link);
        }
        return this.blocks[end.block].addNote(pitch, end.layer, 0, end.end, link);
    },
    
    addBlocks: function(n, pos) {
        var i, nb = n||1, add = [];
        for(i = 0 ; i < nb ; i++) {
            add.push(jasmed.block.extend({}));
        }
        if(pos){
            add = add.concat(this.blocks.slice(pos));
            this.blocks = this.blocks.slice(0,pos);
        }
        this.blocks = this.blocks.concat(add);
        
    },
    
    init: function(layer) {
        var i, n = this.blocks.length;
        for(i = 0 ; i < n ; i++) {
            this.blocks[i].initLayer(layer);
        }
    },
    
    extend: jasmed.extend
};

jasmed.block = {
    lnFw: false,
    lnBw: false,
    
    addNote: function(pitch, layer, start, end, link) {
        var pgcd, i;
        if(!end) {
            end = start+1;
        } else if((pgcd = jasmed.pgcd(layer, jasmed.pgcd(end, start))) != 1) {
            layer /= pgcd;
            start /= pgcd;
            end /= pgcd;
        }
        
        var strLayer = layer.toString();
        if(!(strLayer in this)) {
            this.initLayer(layer);
        }
        
        for(i = start, link = link || 0 ; i < end ; i++, link++) {
            this[strLayer][i].push(jasmed.note.extend({
                linked: link,
                pitch: pitch
            }));
        }
        return link;
    },
    
    initLayer: function(layer) {
        var strLayer = layer.toString();
        this[strLayer] = [];
        for(var i = 0 ; i < layer ; i++) {
            this[strLayer][i] = [];
        }
    },

    extend: jasmed.extend
};

jasmed.note = {
    pitch: 0,
    linked: 0,
    extend: jasmed.extend
};
