import * as _ from "lodash";
import * as d3 from "d3";
import * as seed from "seedrandom";

import { Board, BoardPlayer, BoardDef } from "./Board"
import { GeneticManager, GeneticRunDef } from "./Genetic";

export class App {
    gameBoard: Board;
    player: BoardPlayer;

    private _boardDef = new BoardDef(20, 20, 3, "hello");

    constructor() {
        this._wireUpEvents();

        //create a new Board
        this.createNewBoard();
    }

    static GetRng(seedStr: string){
        return seed(seedStr);
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

        d3.select("#btn-do-ga")
            .on("click", () => {
                console.log("will do GA...");
                
                this._updateFromText();

                let ga_rounds = document.getElementById("ga-rounds")["value"];
                let ga_size = document.getElementById("ga-popsize")["value"];
                
                let ga_def = new  GeneticRunDef(ga_rounds, ga_size);

                let ga = new GeneticManager(this._boardDef, ga_def);
                ga.doGeneticOps();

                this.gameBoard = new Board(this._boardDef);

                console.log("done playing");
                return false;
            })
    }

    private _updateFromText(){
        let rows = document.getElementById("rows")["value"];
        let seedStr = document.getElementById("seed")["value"];
        let columns = document.getElementById("columns")["value"];
        let colors = document.getElementById("colors")["value"];

        this._boardDef = new BoardDef(rows, columns, colors, seedStr);
    }

    createNewBoard() {
        this._updateFromText();

        this.gameBoard = new Board(this._boardDef);
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