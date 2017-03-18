export class Piece {
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
