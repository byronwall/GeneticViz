import * as d3 from 'd3';

import { Board, BoardCompleted, BoardDef } from "./Board";
import * as _ from "lodash";
import { App } from "./app";
import * as seed from "seedrandom"

export class GeneticRunDef {
    initialSize = 100;
    rounds = 10;

    constructor(rounds: number, initialSize: number) {
        this.initialSize = initialSize;
        this.rounds = rounds;
    }
}

export class GeneticManager {
    //will store the populations and manage the operations
    population: Array<BoardCompleted> = [];
    boardDef: BoardDef;
    private gaDef: GeneticRunDef;
    private rng: seed.prng;
    private solve_seed = "testing";

    constructor(boardDef: BoardDef, gaDef: GeneticRunDef) {
        this.rng = App.GetRng(this.solve_seed);

        this.boardDef = boardDef;
        this.gaDef = gaDef;
    }

    createInitialPop() {
        //make the random ones
        let popSize = 0;
        while (popSize++ <= this.gaDef.initialSize) {
            let moves = this.boardDef.getRandomMoves();
            let result = new BoardCompleted(this.boardDef, moves);

            this.population.push(result);
        }
    }

    doGeneticOps() {
        this.createInitialPop();
        this.render();

        let generation = 0;
        while (generation++ <= this.gaDef.rounds) {
            this.doGeneticRound();

        }
        this.render();
    }

    doGeneticRound() {
        let keepRatio = 0.5;
        let crossRatio = 0.7;
        let mutateRatio = 0.01;
        let randomRatio = 0.2;

        //filter the population, sort and slice
        this.population = _.sortBy(this.population, (item) => {
            return -item.score;
        });

        //only keep the best options
        this.population = this.population.slice(0, Math.floor(keepRatio * this.gaDef.initialSize));

        let randomCount = Math.floor(randomRatio * this.gaDef.initialSize);;
        while (randomCount-- >= 0) {
            let randoResult = new BoardCompleted(this.boardDef, this.boardDef.getRandomMoves());
            this.population.push();
        }

        //do the crossovers
        let crossCount = Math.floor(crossRatio * this.gaDef.initialSize);
        while (crossCount-- >= 0) {
            //pick a random one
            let index1 = Math.floor(this.rng.quick() * this.population.length)
            let item1 = this.population[index1];
            let moves1 = item1.finalMove;
            let cross1 = Math.floor(this.rng.quick() * moves1.length);

            let index2 = Math.floor(this.rng.quick() * this.population.length);
            let item2 = this.population[index2];
            let moves2 = item2.finalMove;
            let cross2 = Math.floor(this.rng.quick() * moves2.length);

            //pick another random one

            let newMoves1 = _.concat(moves1.slice(0, cross1), moves2.slice(cross2), this.boardDef.getRandomMoves());
            let newMoves2 = _.concat(moves2.slice(0, cross2), moves1.slice(cross1), this.boardDef.getRandomMoves());

            //pick the crossover spot for 1

            let result1 = new BoardCompleted(this.boardDef, newMoves1);
            let result2 = new BoardCompleted(this.boardDef, newMoves2);

            console.log("cross iter", item1, item2, moves1, cross1, moves2, cross2, newMoves1, newMoves2, result1, result2);

            //keep those if the score is better
            if (result1.score > Math.max(item1.score, item2.score)) {
                this.population.push(result1);
            }

            if (result2.score > Math.max(item1.score, item2.score)) {
                this.population.push(result2);
            }
        }
    }
    render() {
        let div = d3.select("#results");

        this.population = _.sortBy(this.population, (d) => {
            return -d.score;
        });

        let results = div.selectAll("a")
            .data(this.population, (d: BoardCompleted) => {
                return "" + d.id;
            });

        results.exit().remove();

        //create the divs
        results.enter()
            .append("a")
            .attr("href", "#")
            .attr("class", "list-group-item list-group-item-action")
            .text((d) => { return d.score; })
            .on("click", (d) => {
                console.log("clicked on", d);

                //go ahead and play the board
                let board = new Board(d.boardDef);
                board.shouldRenderWithSolve = true;
                board.render();
                board.playGame(d.finalMove);

                return false;
            });
    }
}