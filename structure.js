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
    
    addTrack: function(name) {
        this.tracks.push(jasmed.track.extend({
            name: name || "Track " + (this.tracks.length()+1)
        }));
    },
    
    extend: jasmed.extend
};

jasmed.track = {
    name: "New Track",
    instrument: "Piano",
    blocks: [],
    
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
    
    extend: jasmed.extend
};

jasmed.block = {
    addNote: function(note, layer, start, end) {
        var pgcd;
        if(end) {
            pgcd = jasmed.pgcd(end, start);
        }
        if((pgcd = jasmed.pgcd(layer, end ? jasmed.pgcd(end, start) : start)) != 1) {
            layer /= pgcd;
            start /= pgcd;
            end /= pgcd;
        }
        
        layer = layer.toString();
        if(!(layer in this)) {
            this[layer] = [];
        }
        
        for(var i = start, link = 0 ; i < end ; i++, link++) {
            this[layer][i] = note.extend({linked: link});
        }
    },

    extend: jasmed.extend
};

jasmed.note = {
    pitch: 0,
    linked: 0,
    extend: jasmed.extend
};

jasmed.newNote = function(pitch) {
    return jasmed.note.extend({pitch: pitch});
};