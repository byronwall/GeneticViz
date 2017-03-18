import * as seed from "seedrandom";
import * as _ from "lodash";
import * as d3 from "d3";

import { Piece } from "./Piece"

export class Board {
    //hold some pieces
    width: number;
    height: number;
    colors: number;

    score: number = 0;

    timer: any;

    shouldRenderWithSolve: boolean;

    pieces: Array<Array<Piece>> = [];
    _pieces: Array<Piece> = [];

    constructor(width: number, height: number, colors = 3) {
        Piece._id = 0;

        this.width = width;
        this.height = height;
        this.colors = colors - 1;

        let seedInput = (<HTMLInputElement>document.getElementById("seed")).value;
        let rng = seed(seedInput);

        this.shouldRenderWithSolve = (<HTMLInputElement>document.getElementById("render")).checked;

        //create the pieces
        for (var x of _.range(width)) {

            let column = [];
            this.pieces[x] = column;

            for (var y of _.range(height)) {
                //create a piece, add to Array
                var color = Math.floor(rng.quick() * this.colors);
                let piece = new Piece(x, y, color);
                column.push(piece);

                this._pieces[piece.id] = piece;
            }
        }
    }

    getMovesAndPlayGame() {
        let ids = this._getIds();
        ids = _.shuffle(ids);
        let finalMoves = this.playGame(ids);

        return finalMoves;
    }

    playGame(moves: Array<number>) {
        //this will play through the moves and remove them one at a time.
        //if a piece cannot be remove, it will go to the render
        let finalMoves: Array<number> = [];

        //this tracks if a valid move happened
        let wasMoveMade = true;

        //this indicates which was the last non-move to come through
        //if it comes all the way back, no moves left
        let markerMoveToQuit: Array<number> = [];

        let counter = 0;

        while (moves.length) {
            let move = moves.shift();

            if (counter++ > 1000) {
                break;
            }

            if (markerMoveToQuit.indexOf(move) > -1) {
                console.log("no more moves, stopping")
                break;
            }

            let result = this.removeID(move);

            //removed some stuff... do the delay
            if (result == 2) {
                finalMoves.push(move);
                wasMoveMade = true;

                if (this.shouldRenderWithSolve) {
                    this.timer = setTimeout(() => {
                        this.refreshVisuals();
                        this.playGame(moves);
                    }, 250);

                    return;
                }
            }
            //no removal, try again
            if (result == 0) {
                //add the spot back in if the move
                moves.push(move);
                markerMoveToQuit.push(move);
            }
            //esle is null, just go around
        }

        this.refreshVisuals();

        return finalMoves;
    }

    removeID(move: number) {
        //this is an ID for the piece to remove

        //pull the piece from the Array
        if (this._pieces[move] != null) {
            return (this.removePiece(this._pieces[move])) ? 2 : 0;
        }

        //true here will tell the step above to remove from the list, was alreayd rmeove from board
        return 1;
    }

    private _getIds(): Array<number> {
        let ids: Array<number> = [];
        for (var piece of this._pieces) {
            if (piece != null) {
                ids.push(piece.id);
            }

        }

        return ids;
    }

    private _removePiece(piece: Piece) {
        this.pieces[piece.x][piece.y] = null;
        this._pieces[piece.id] = null;
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

    removePiece(piece: Piece): boolean {
        //search the neighbors of this piece for same color

        let neighbors = this._getNeighbors(piece);

        let neighborsTested: Array<Piece> = [piece];

        let didRemovalHappen = false;

        let removedPieces = 0;

        while (neighbors.length) {
            let neighborTest = neighbors.pop();
            if (neighborsTested.indexOf(neighborTest) > -1) continue;

            neighborsTested.push(neighborTest);

            if (neighborTest.color == piece.color) {
                didRemovalHappen = true;
                this._removePiece(neighborTest)
                removedPieces++;

                for (var nextNeighbor of this._getNeighbors(neighborTest)) {
                    neighbors.push(nextNeighbor);
                }
            }
        }

        if (didRemovalHappen) {
            this._removePiece(piece);
            removedPieces++;
            this.score += Math.pow(removedPieces, 2);
            this._shiftDownAndLeft();
        }

        return didRemovalHappen;
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

    public refreshVisuals() {
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
                this.refreshVisuals();
            });

        d3Cell.exit().remove();

        //update
        d3Cell.transition()
            .attr('x', (d) => { return d.x * pieceWidth; })
            .attr('y', (d) => { return d.y * pieceHeight; })
            .attr('stroke', (d) => { return (d.isSelected) ? "#000" : "#fff"; })

        d3.select("#score").text(this.score);
    }

    render() {
        let square = 30;
        let w = 550;
        let h = 550;

        let dummy = [1];

        var svg = d3.select('body').selectAll("svg").data(dummy).enter().append('svg').attr('width', w).attr('height', h);

        //believe this triple call ensures that an enter, enter, and update all happen
        //could possibly complicate the data joins up above to avoid this
        this.refreshVisuals();
        this.refreshVisuals();
        this.refreshVisuals();
    }
}
