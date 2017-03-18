import * as _ from "lodash";
import * as d3 from "d3";

import {Board} from "./Board"

export class App {
    gameBoard: Board;
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
                this.playBoard();
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
        this.gameBoard = new Board(15, 15, 4);
        this.gameBoard.render();
    }

    playBoard() {
        //get the ids
        return this.gameBoard.getMovesAndPlayGame();
    }

    playSeveralBoards(){
        let playCount = 0;
        
        while(playCount++ <= 10){
            this.createNewBoard();
            let ids = this.playBoard();

            console.log("final moves", ids);
            console.log("score", this.gameBoard.score)
        }
    }
}

//create a new App
var app = new App();

//line up the variable for reference in console
window["app"] = app;