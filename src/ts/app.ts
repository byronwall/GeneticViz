import * as _ from "lodash";
import * as d3 from "d3";

class App {
    gameBoard: Board;
    constructor() {
        //create a new Board
        this.gameBoard = new Board(4, 4, 2);
        this.gameBoard.render();
    }
}

class Board {
    //hold some pieces
    width: number;
    height: number;
    colors: number;

    pieces: Array<Array<Piece>>;

    constructor(width: number, height: number, colors = 3) {
        this.width = width;
        this.height = height;
        this.colors = colors;

        this.pieces = [];

        //create the pieces
        for (var x of _.range(width)) {

            let column = [];
            this.pieces[x] = column;

            for (var y of _.range(height)) {
                //create a piece, add to Array
                var color = _.random(this.colors)
                let piece = new Piece(x, y, color);
                column.push(piece);
            }
        }
    }

    private _removePiece(piece: Piece) {
        this.pieces[piece.x][piece.y] = null;
        console.log("remove: ", piece);
    }

    private _shiftDownAndLeft() {
        //this will take the board and shift pieces down through blanks
        let shiftLeft = 0;
        for (let x = 0; x < this.width; x++) {
            let shiftDown = 0;
            let wereAllBlank = true;
            for (let y = this.height - 1; y >= 0; y--) {
                let piece = this.pieces[x][y];
                if (piece == null) {
                    shiftDown++;
                    continue;
                }
                wereAllBlank = false;
                if (shiftDown > 0 || shiftLeft > 0) {
                    piece.x = x - shiftLeft
                    piece.y = y + shiftDown;
                    this.pieces[piece.x][piece.y] = piece;
                    this.pieces[x][y] = null;
                }
            }

            if (wereAllBlank) {
                shiftLeft++;
            }
        }
    }

    private _getPieces(): Array<Piece> {
        let nonNullPieces: Array<Piece> = [];
        for (var column of this.pieces) {
            for (var piece of column) {
                if (piece != null) {
                    nonNullPieces.push(piece);
                }
            }
        }
        return nonNullPieces;
    }

    removePiece(piece: Piece) {
        //search the neighbors of this piece for same color

        let neighbors = this._getNeighbors(piece);

        let neighborsTested: Array<Piece> = [];

        let didRemovalHappen = false;

        while (neighbors.length) {
            let neighborTest = neighbors.pop();
            if (neighborsTested.indexOf(neighborTest) > -1) continue;

            neighborsTested.push(neighborTest);

            if (neighborTest.color == piece.color) {
                didRemovalHappen = true;
                this._removePiece(neighborTest)

                for (var nextNeighbor of this._getNeighbors(neighborTest)) {
                    neighbors.push(nextNeighbor);
                }
            }
        }

        if (didRemovalHappen) {
            this._removePiece(piece);
        }

        this._shiftDownAndLeft();
    }

    private _getNeighbors(piece: Piece): Array<Piece> {
        //return the neighbors of this Piece

        let deltas = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];

        let neighbors: Array<Piece> = [];

        _.each(deltas, (delta) => {
            let xTest = piece.x + delta.dx;
            let yTest = piece.y + delta.dy;

            if (this._isValidPiece(xTest, yTest)) {
                neighbors.push(this.pieces[xTest][yTest]);
            }
        })

        return neighbors;

    }

    private _isValidPiece(x: number, y: number): boolean {
        return this._withinBounds(x, y) && this.pieces[x][y] != null;
    }

    private _withinBounds(x: number, y: number): boolean {
        return (x < this.width && y < this.height && x >= 0 && y >= 0);
    }

    private _renderDetails() {
        var svg = d3.select("svg");

        var pieceWidth = +svg.attr("width") / this.width;
        var pieceHeight = +svg.attr("height") / this.height;

        var color = d3.scaleOrdinal(d3.schemeCategory10);

        let data = this._getPieces();

        var d3Cell = svg.selectAll('rect')
            .data(data, (d: Piece, i) => { return "" + d.id })

        d3Cell.enter()
            .append('rect')
            .attr('width', () => { return pieceWidth; })
            .attr('height', () => { return pieceHeight; })

            .attr('fill', (d) => { return color(String(d.color)) })
            .on("click", (d) => {
                console.log(d);
                this.removePiece(d);
                this._renderDetails();
            });

        d3Cell.exit().remove();

        //update
        d3Cell
            .attr('x', (d) => { return d.x * pieceWidth; })
            .attr('y', (d) => { return d.y * pieceHeight; })
            .attr('stroke', (d) => { return (d.isSelected) ? "#000" : "#fff"; })
    }

    render() {
        let square = 30;
        let w = 600;
        let h = 600;

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
    color: number;
    id: number;

    static _id: number = 0;

    constructor(x: number, y: number, color: number) {
        this.x = x;
        this.y = y;
        this.color = color;

        this.id = Piece._id++;
    }
    //some functions to trigger on events
}

//create a new App
var app = new App();