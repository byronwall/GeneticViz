import * as seed from "seedrandom";
import * as _ from "lodash";
import * as d3 from "d3";

import { Piece } from "./Piece"

export class Board {

    boardDef: BoardDef;

    //hold some pieces
    width: number;
    height: number;
    colors: number;
    seed: string;

    score: number = 0;

    timer: any;

    shouldRenderWithSolve: boolean;

    pieces: Array<Array<Piece>> = [];
    _pieces: Array<Piece> = [];

    constructor(boardDef: BoardDef) {
        Piece._id = 0;

        this.boardDef = boardDef;

        this.width = boardDef.columns;
        this.height = boardDef.rows;
        this.colors = boardDef.colors - 1;
        this.seed = boardDef.seed;

        let rng = seed(this.seed);

        //TODO pull this out, no refences to HTML in this class...
        this.shouldRenderWithSolve = (<HTMLInputElement>document.getElementById("render")).checked;

        //create the pieces
        for (var x of _.range(this.width)) {

            let column = [];
            this.pieces[x] = column;

            for (var y of _.range(this.height)) {
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
                //no more moves avialable... piece came around
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

        d3.select("#score").text(this.score);
    }

    render() {
        let square = 30;
        let w = 550;
        let h = 550;

        let dummy = [1];

        //should only create the node on first entry
        let svg = d3.select('#main-col').selectAll("svg")

        svg.selectAll("*").remove();

        svg
            .data(dummy).enter()
            .append('svg')
            .attr('width', w)
            .attr('height', h);

        //believe this triple call ensures that an enter, enter, and update all happen
        //could possibly complicate the data joins up above to avoid this
        this.refreshVisuals();
        this.refreshVisuals();
        this.refreshVisuals();
    }
}

export class BoardCompleted {
    //this will take care of holding a reference to the board
    //will hold the moves that were made
    //will track the score and allow for combining sets of moves

    boardDef: BoardDef;
    moves: Array<number>;
    score: number;

}

export class BoardDef {
    seed: string = "hello";
    rows: number = 20;
    columns: number = 20;
    colors: number = 4;

    constructor(rows, columns, colors, seed) {
        this.seed = seed;
        this.rows = rows;
        this.colors = colors;
        this.columns = columns;
    }

}

export class BoardPlayer {
    boardDef: BoardDef;
    attempts: Array<BoardCompleted>;

    activeBoard: BoardCompleted;

    constructor() {

    }

    render() {
        let div = d3.select("#results");

        _.sortBy(this.attempts, (d) => {
            return d.score;
        });

        let results = div.selectAll("a").data(this.attempts);

        //create the divs
        results.enter()
            .append("a")
            .attr("href", "#")
            .attr("class", "list-group-item list-group-item-action");

        //set up the click event to play the board
        results
            .text((d) => { return d.score; })
            .on("click", (d) => {
                console.log("clicked on", d);
                this.activeBoard = d;

                //go ahead and play the board
                let board = new Board(d.boardDef);
                board.shouldRenderWithSolve = true;
                board.render();
                board.playGame(d.moves);
            });
    }

    playSeveralBoards() {
        this.attempts = [];

        let playCount = 0;

        while (playCount++ <= 50) {
            let board = new Board(this.boardDef);

            let moves = board.getMovesAndPlayGame();

            let result = new BoardCompleted();
            result.boardDef = this.boardDef;
            result.moves = moves;
            result.score = board.score;

            this.attempts.push(result);

            this.render();
        }
    }
}