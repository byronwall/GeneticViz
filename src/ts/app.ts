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

    private _renderDetails() {
        var svg = d3.select("svg");

        var pieceWidth = +svg.attr("width") / this.width;
        var pieceHeight = +svg.attr("height") / this.height;

        var d3Cols = svg.selectAll('g')
            .data(this.pieces)

        d3Cols.enter()
            .append('g')

        var d3Cell = d3Cols
            .selectAll('rect')
            .data((d) => { return d; })

        d3Cell
            .enter()
            .append('rect')

        //update
        d3Cell.attr('x', (d) => { return d.x * pieceWidth; })
            .attr('y', (d) => { return d.y * pieceHeight; })
            .attr('width', () => { return pieceWidth; })
            .attr('height', () => { return pieceHeight; })
            .attr('fill', (d) => { return (d.isSelected) ? "#f00" : "#aaa"; })
            .attr('stroke', '#fff')
            .on("click", (d) => {
                console.log(d);
                d.isSelected = true;
                this._renderDetails();
            });
    }

    render() {
        var square = 30,
            w = 600,
            h = 300;

        var svg = d3.select('body').append('svg').attr('width', w).attr('height', h);

        //believe this triple call ensures that an enter, enter, and update all happen
        //could possibly complicate the data joins up above to avoid this
        this._renderDetails();
        this._renderDetails();
        this._renderDetails();
    }
}

class Piece {
    //ref to Board
    //know location
    x: number;
    y: number;
    isSelected: boolean;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    //some functions to trigger on events
}

//create a new App
var app = new App();