// Builds a convnet.js Vol encoding the current board, ko value, and
// ko value in the liberties format. Also performs edge encoding for
// a pad of 3
function buildLibertyEncoding(jboard, forPlayer, ko) {
    var data = new convnetjs.Vol(25, 25, 8, 0);
    // Set all squares in the edge channel to 1
    for (x = 0; x < 25; x++) {
        for (y = 0; y < 25; y++) {
            if (x < 3 || x >= 22 || y < 3 || y >= 22) {
                data.set(x, y, 7, 1);
            }
        }
    }

    // Now iterate through the non-edge squares and encode the liberties
    for (x = 3; x < 22; x++) {
        for (y = 3; y < 22; y++) {
            var coor = new JGO.Coordinate(x - 3, y - 3);
            var type = jboard.getType(coor);
            if (type != JGO.CLEAR) {
                var groups = jboard.getGroup(coor);
                var neighbors = groups.neighbors;
                var numLiberties = 0;
                for (var i = 0; i < neighbors.length; i++) {
                    if (jboard.getType(neighbors[i]) == JGO.CLEAR) {
                        numLiberties += 1
                        if (numLiberties == 3) {
                            break;
                        }
                    }
                }
                if (numLiberties == 0) {
                    throw "Liberties should never be zero!";
                }
                var depth = numLiberties - 1;
                if (type != forPlayer) {
                    depth += 3;
                }
                data.set(x, y, depth, 1);
            }
        }
    }

    // Finally set the ko value
    if (ko) {
        data.set(ko.i + 3, ko.j + 3, 6, 1);
    }

    return data;
};

// Logs a Go position encoding inside a convjs.Vol in the liberties format to
// the console in human readonable format, just for debugging
function logLibertyData(data) {
    var names = ["P1", "P2", "P3", "O1", "O2", "O3", "KO", "ED", "__"];
    var str = "";
    for (y = 0; y < 25; y++) {
        for (x = 0; x < 25; x++) {
            var setIndex = 8;
            for (i = 0; i < 8; i++) {
                var point = data.get(x, y, i);
                // Sanity check to ensure we have one value per coordinate
                if (point != 0 && point != 1) {
                    throw "Got point " + point;
                }
                if (point != 0 && setIndex != 8) {
                    throw "Got two points at position " + x + "," + y +
                    " points: " + i + " " + setIndex;
                }
                if (point == 1) {
                    setIndex = i;
                }
            }
            str += names[setIndex] + " ";
        }
        str += "\n";
    }
    console.log(str);
}


var firstNode = new JGO.Node(jboard, null,
    {
        ko_i: false, ko_j: false, i: false,
        blackCaptures: 0, whiteCaptures: 0,
        j: false, eval: false
    });
var nodes = [firstNode]; // Nodes reflecting the moves made so far
var onMove = 0; // which node within `nodes` we are displaying currently
var showAnalysis = false; // Are we showing the conv net's analysis or not?
var showHover = false;
var lastHover = false, lastX = -1, lastY = -1; // hover helper vars
var net = new convnetjs.Net();
net.fromJSON(json_net);
var jboard = new JGO.Board(19, 19);
var boardCanvas = false;
var jsetup = new JGO.Setup(jboard, JGO.BOARD.medium);
jsetup.setOptions({stars: {points: 5}});


function autoMove() {
    return document.getElementById("autoMoveCheckbox").checked;
}

function getCurrentPlayer() {
    return (onMove % 2 == 0) ? JGO.BLACK : JGO.WHITE;
}

function getCurrentKo() {
    var info = nodes[onMove].info;
    if (info.ko_i === false) {
        return false;
    } else {
        return new JGO.Coordinate(info.ko_i, info.ko_j);
    }
}

function getLastMove() {
    var info = nodes[onMove].info;
    if (info.i === false) {
        return false;
    } else {
        return new JGO.Coordinate(info.i, info.j);
    }
}

function showAnalysisClicked() {
    showAnalysis = document.getElementById("showAnalysis").checked;
    if (showAnalysis) {
        p = getConvPrediction();
        jboard.shades = p;
    } else {
        jboard.shades = false;
    }
    boardCanvas.draw(jboard, 0, 0, 19, 19);
}

function goToMove(increment) {
    if (increment > 0) {
        var target = Math.min(onMove + increment, nodes.length - 1);
        while (onMove < target) {
            onMove += 1
            nodes[onMove].apply();
        }
    } else {
        var target = Math.max(onMove + increment, 0);
        while (onMove > target) {
            nodes[onMove].revert();
            onMove -= 1;
        }
    }
    if (showAnalysis) {
        var p = getConvPrediction();
        jboard.shades = p;
        boardCanvas.draw(jboard, 0, 0, 19, 19);
    }
    var info = nodes[onMove].info;
    document.getElementById("move").innerHTML = onMove;
    document.getElementById("black_captures").innerHTML = info.blackCaptures;
    document.getElementById("white_captures").innerHTML = info.whiteCaptures;
}

function makeMove(coord) {
    var player = getCurrentPlayer();
    var ko = getCurrentKo();
    var lastMove = getLastMove();
    var play = jboard.playMove(coord, player, ko);
    if (play.success) {
        if (onMove != nodes.length - 1) {
            nodes = nodes.slice(0, onMove + 1);
        }
        var previous = nodes[onMove].info;
        var blackCaptures = previous.blackCaptures;
        var whiteCaptures = previous.whiteCaptures;
        if (player == JGO.BLACK) {
            blackCaptures += play.captures.length;
        } else {
            whiteCaptures += play.captures.length;
        }

        var node = new JGO.Node(jboard, null,
            {
                i: coord.i, ko_i: false, ko_j: false,
                blackCaptures: blackCaptures, whiteCaptures: whiteCaptures,
                j: coord.j, eval: false
            });
        node.setType(coord, player);
        node.setType(play.captures, JGO.CLEAR); // clear opponent's stones
        if (lastMove)
            node.setMark(lastMove, JGO.MARK.NONE); // clear previous mark
        if (ko)
            node.setMark(ko, JGO.MARK.NONE); // clear previous ko mark

        node.setMark(coord, JGO.MARK.CIRCLE); // mark move

        lastMove = coord;

        if (play.ko) {
            // jgoboard has a bug with snapbacks meaning moves that capture more than one
            // one stone might get marked as KO, so we manually check it here.
            var next_player = (player == JGO.WHITE) ? JGO.BLACK : JGO.WHITE
            var ko_play = jboard.playMove(play.ko, next_player, false);
            if (ko_play.success) {
                if (ko_play.captures.length == 1) {
                    node.info["ko_i"] = play.ko.i;
                    node.info["ko_j"] = play.ko.j;
                    node.setMark(play.ko, JGO.MARK.CIRCLE);
                }
            }
        }

        onMove += 1;
        nodes.push(node);
        document.getElementById("move").innerHTML = onMove;
        document.getElementById("moves").innerHTML = nodes.length - 1;
        node.apply();
        if (showAnalysis) {
            jboard.shades = getConvPrediction();
            boardCanvas.draw(jboard, 0, 0, 19, 19);
        }
        document.getElementById("black_captures").innerHTML = blackCaptures;
        document.getElementById("white_captures").innerHTML = whiteCaptures;
        return true;
    } else {
        alert('Illegal move: ' + play.errorMsg);
        return false;
    }
}

/** Scale an array so the maximum value is 1 */
function scaleArray(arr) {
    var m = Math.max.apply(null, arr);
    for (var i = 0; i < arr.length; i++) {
        arr[i] /= m;
    }
}

/** Return the DCNN predictions with illegals moves masked for the current position
 the output is pre-normalized so the largest value is 1.0 */
function getConvPrediction() {
    cur = nodes[onMove];
    if (cur.info.convPredictions) {
        // We have already pre-computed this for our node
        return cur.info.convPredictions;
    }
    var ko = getCurrentKo();
    var player = getCurrentPlayer();
    var encoding = buildLibertyEncoding(jboard, player, ko);
    var p = net.forward(encoding).w;
    var maxv = encoding[0];
    var maxi = 0;
    for (var i = 1; i < p.length; i++) {
        var y = Math.floor(i / 19);
        var x = i % 19;
        var coord = new JGO.Coordinate(x, y);
        if (jboard.getType(coord) != JGO.CLEAR ||
            (x == ko.i && y == ko.j)) {
            p[i] = 0;
        }
    }
    scaleArray(p);

    // Cache our predictions
    nodes[onMove].info.convPredictions = p;
    return p;
}

/** Have the conv. net make a move */
function convMove() {
    var p = getConvPrediction();
    var maxi = 0;
    var maxv = -1;
    for (var i = 0; i < p.length; i++) {
        var y = Math.floor(i / 19);
        var x = i % 19;
        var coord = new JGO.Coordinate(x, y);
        if (p[i] > maxv) {
            maxv = p[i];
            maxi = i;
        }
    }
    var p_y = Math.floor(maxi / 19);
    var p_x = maxi % 19;
    coord = new JGO.Coordinate(p_x, p_y);
    makeMove(coord);
}

jsetup.create('board', function (canvas) {
    boardCanvas = canvas;
    canvas.addListener('click', function (coord, ev) {
        var player = getCurrentPlayer();
        var ko = getCurrentKo();
        var opponent = (player == JGO.BLACK) ? JGO.WHITE : JGO.BLACK;

        // clear hover away - it'll be replaced or then it will be an illegal move
        // in any case so no need to worry about putting it back afterwards
        if (lastHover)
            jboard.setType(new JGO.Coordinate(lastX, lastY), JGO.CLEAR);

        lastHover = false;

        var legalMove = makeMove(coord);
        if (legalMove && autoMove()) {
            convMove();
        }
    });

    canvas.addListener('mousemove', function (coord, ev) {
        var player = getCurrentPlayer();

        if (coord.i == -1 || coord.j == -1 || (coord.i == lastX && coord.j == lastY))
            return;

        if (lastHover) // clear previous hover if there was one
            jboard.setType(new JGO.Coordinate(lastX, lastY), JGO.CLEAR);

        lastX = coord.i;
        lastY = coord.j;

        if (jboard.getType(coord) == JGO.CLEAR && jboard.getMark(coord) == JGO.MARK.NONE) {
            jboard.setType(coord, player == JGO.WHITE ? JGO.DIM_WHITE : JGO.DIM_BLACK);
            lastHover = true;
        } else
            lastHover = false;
    });

    canvas.addListener('mouseout', function (ev) {
        if (lastHover)
            jboard.setType(new JGO.Coordinate(lastX, lastY), JGO.CLEAR);

        lastHover = false;
    });
});
