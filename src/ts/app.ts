import * as _ from "lodash";
import * as d3 from "d3";

class App {
    gameBoard: Board;
    constructor() {
        //create a new Board
        this.gameBoard = new Board(10, 10);
        this.gameBoard.render();
    }
}

class Board {
    //hold some pieces
    width: number;
    height: number;

    pieces: Array<Array<Piece>>;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.pieces = [];

        //create the pieces
        for (var x of _.range(width)) {

            let row = [];
            this.pieces[x] = row;


            for (var y of _.range(height)) {
                //create a piece, add to Array
                let piece = new Piece(x, y);

                row.push(piece);
            }
        }

        console.log(this.pieces);

    }

    render() {
        var square = 30,
            w = 600,
            h = 300;

        // create the svg
        var svg = d3.select('#grid').append('svg')
            .attr("width", w)
            .attr("height", h);

        // calculate number of rows and columns
        var squaresRow = _.round(w / square);
        var squaresColumn = _.round(h / square);

        // loop over number of columns
        _.times(squaresColumn, function (n) {

            // create each set of rows
            var rows = svg.selectAll('rect' + ' .row-' + (n + 1))
                .data(d3.range(squaresRow))
                .enter().append('rect')
                .attr("width", square)
                .attr("height", square)
                .attr("x", function (d, i) {
                    return i * square;
                })
                .attr("y", n * square)
                .attr("fill", '#333')
                .attr("stroke", '#FDBB30')
        });
    }
}

class Piece {
    //ref to Board
    //know location
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    //some functions to trigger on events
}

//create a new App
var app = new App();