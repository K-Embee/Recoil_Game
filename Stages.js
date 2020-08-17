//Level class w/ geometry
class Arena{
    constructor(game, id){
        this.game = game;
        this.loaded = false;
    }

    load(id){
        if(this.loaded == true) { return; } //Don't load the stage again if we did it once already





        switch(id){
        case 0:
            //Maps are 512*288 pixels by default, or 32*18 16x16 tiles
            //Tile map reference (incomplete)
            /*
                0 = Transparent
                48 = Tree
                248 = Water
            */
            this.tileMap = [248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248];
            //Collision map reference (so far)
            /*
                0 = Floor
                1 = Wall
                2 = (TODO: Hazard)
                3 = Gap
            */
            this.collisionMap =  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3];

            this.movables = [new Portal(this.game, 13, 18, 1, 4, 1,[-1,0]),
                            new Enemy(this.game, 256, 256)]; //TODO: set the initial of an arena bar the player, to be loaded/saved on arena entrance/exit
            break;

        case 1:
        //Maps are 512*288 pixels by default, or 32*18 16x16 tiles
        //Tile map reference (incomplete)
        /*
            0 = Transparent
            48 = Tree
            248 = Water
        */
        this.tileMap = [248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248];
        //Collision map reference (so far)
        /*
            0 = Floor
            1 = Wall
            2 = (TODO: Hazard)
            3 = Gap
        */
        this.collisionMap =  [3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3];

        this.movables = [new Portal(this.game,13,-1, 0, 4, 1,[-1,17])]; //TODO: set the initial of an arena bar the player, to be loaded/saved on arena entrance/exit
        break;

        case 99:
        //Maps are 512*288 pixels by default, or 32*18 16x16 tiles
        //Tile map reference (incomplete)
        /*
            0 = Transparent
            48 = Tree
            248 = Water
        */
        this.tileMap = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                        ,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
        //Collision map reference (so far)
        /*
            0 = Floor
            1 = Wall
            2 = (TODO: Hazard)
            3 = Gap
        */
        this.collisionMap =  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
                            ,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];

        this.movables = [new Enemy_Demon(this.game,374,256),
                        new Enemy_Demon(this.game, 420, 256),
                        new Enemy_Knight(this.game, 290, 256)];
        break;








        }
        this.loaded = true;
    }
}
