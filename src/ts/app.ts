import * as _ from "lodash";
import * as d3 from "d3";

import { Board, BoardPlayer, BoardDef } from "./Board"

export class App {
    gameBoard: Board;
    player: BoardPlayer;

    constructor() {
        this._wireUpEvents();

        //create a new Board
        this.createNewBoard();
    }

    private _wireUpEvents() {
        d3.select("#btn-new-board")
            .on("click", () => {
                this.createNewBoard();
                return false;
            })

        d3.select("#btn-play-board")
            .on("click", () => {

                let activeBoard = this.player.activeBoard;
                if (activeBoard) {
                    //load play the moves from there
                    this.gameBoard = new Board(this.player.boardDef);
                    this.gameBoard.shouldRenderWithSolve = true;
                    this.gameBoard.playGame(activeBoard.moves);
                }
                else {
                    this.playBoard();
                }
                return false;
            })

        d3.select("#btn-stop-board")
            .on("click", () => {
                clearTimeout(this.gameBoard.timer);
                console.log("stopping the game...");
                return false;
            })

        d3.select("#btn-solve-board")
            .on("click", () => {
                console.log("will solve several...");
                this.playSeveralBoards();
                console.log("done playing");
                return false;
            })

        d3.select("#render")
            .on("change", () => {
                this.gameBoard.shouldRenderWithSolve = (<HTMLInputElement>document.getElementById("render")).checked;
                console.log("check change...");
                return false;
            })

        d3.select("#seed").text("hello")
    }

    createNewBoard() {
        let def = new BoardDef(15, 15, 4, "hello");
        this.gameBoard = new Board(def);
        this.gameBoard.render();
    }

    playBoard() {
        //get the ids
        return this.gameBoard.getMovesAndPlayGame();
    }

    playSeveralBoards() {

        this.player = new BoardPlayer();
        let boardDef = new BoardDef(20, 20, 4, "hello");

        this.player.boardDef = boardDef;

        this.player.playSeveralBoards();

        this.player.render();
        this.player.render();
        this.player.render();

    }
}

//create a new App
var app = new App();

//line up the variable for reference in console
window["app"] = app;