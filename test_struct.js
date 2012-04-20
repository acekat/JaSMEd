var struct = jasmed.module('struct');

var song = [
    [
        [4, 60],
        [4, 62],
        [4, 64],
        [4, 60]
    ],[
        [4, 64],
        [4, 65],
        [8, 67]
    ],[
        [3, 67],
        [1, 69],
        [2, 67],
        [2, 65],
        [4, 64],
        [4, 60]
    ],[
        [3, 60],
        [3, 55],
        [10,60]
    ]
], i, j, k;


var beat = struct.song.extend({
    title: "Jack by beat",
    tempo: 500,
    blocks: 27
});

var beatrack = beat.addTrack();

beat.addBlocks();

for(i = 0, k = 0 ; i < 3 ; i++) {
    var end = song[i].length*(i==1?1:2);
    for(j = 0 ; j < end ; j++) {
        beatrack.addNote(song[i][j%song[i].length][1], {
            block: Math.floor(k/4),
            layer: 4,
            start: k%4
        }, {
            block: Math.floor((k+=song[i][j%song[i].length][0])/4) - (k%4 ? 0 : 1),
            layer: 4,
            end: k%4 ? k%4 : 4
        });
    }
}

beatrack.addNote(song[3][0][1], {
    block: 20,
    layer: 4,
    start: 0
}, {
    block: 20,
    layer: 4,
    end: 3
});
beatrack.addNote(song[3][1][1], {
    block: 20,
    layer: 4,
    start: 3
}, {
    block: 21,
    layer: 2,
    end: 1
});
beatrack.addNote(song[3][2][1], {
    block: 21,
    layer: 2,
    start: 1
}, {
    block: 23,
    layer: 2,
    end: 2
});
beatrack.addNote(song[3][0][1], {
    block: 24,
    layer: 8,
    start: 0
}, {
    block: 24,
    layer: 8,
    end: 6
});
beatrack.addNote(song[3][1][1], {
    block: 24,
    layer: 8,
    start: 6
}, {
    block: 25,
    layer: 4,
    end: 2
});
beatrack.addNote(song[3][2][1], {
    block: 25,
    layer: 6,
    start: 3
}, {
    block: 27,
    layer: 1,
    end: 1
});

beat.addBlocks(4,8);

beatrack.addNote(song[1][0][1], {
    block: 8,
    layer: 1,
    start: 0
});
beatrack.addNote(song[1][1][1], {
    block: 9,
    layer: 1,
    start: 0
});
beatrack.addNote(song[1][2][1], {
    block: 10,
    layer: 1,
    start: 0
}, {
    block: 11,
    layer: 4,
    end: 4
});


var block = struct.song.extend();

var black = block.addTrack("Jako", 4);

for(i = 0, k = 0 ; i < 4 ; i++) {
    var end = song[i].length*2;
    for(j = 0 ; j < end ; j++) {
        black.addNote(song[i][j%song[i].length][1], {
            block: Math.floor(k/16),
            layer: 16,
            start: k%16
        }, {
            block: Math.floor((k+=song[i][j%song[i].length][0])/16) - (k%16?0:1),
            layer: 16,
            end: k%16 ? k%16 : 16
        });
    }
}
