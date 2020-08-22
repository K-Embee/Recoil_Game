class Enemy_Boss extends Enemy{
    constructor(game, x, y){
        super(game, x, y);
        this.tileIndex = 172;
        this.life = 10;
        this.maxSpeed = 3;
        this.friction = true;
        this.cooldown = 90;
        this.attackType = 0;
        this.actionTimer = -1;
        this.fireballTimer = -1;
        this.bossUI = new Array();

        this.game.boss = this;


        this.game.audio.music_f.pause();
        this.game.audio.music_loop.pause();
        this.game.audio.boss_f.play();

        this.createDummyUI();
    }

    update(){
        var player = this.game.player;
        if(player){
            var dist = VectorLen(VectorSub(player.loc, this.loc));
            if(dist < 112) { this.accel = VectorSetLen(VectorSub(player.loc, this.loc), -0.3); }
            if(this.cooldown == 0) {
                this.attackType = Math.floor(Math.random() * 5);
                this.doAttack(player, this.attackType);
            }
            if(this.actionTimer == 0){
                this.doTeleport();
            }
            if(this.fireballTimer != -1 && this.fireballTimer % 5 == 0){
                this.fireball();
            }
        }
        this.cooldown = Math.max(0, this.cooldown-1);
        if(this.life <= 3 && Math.random() < 0.5) { this.cooldown = Math.max(0, this.cooldown-1); } //Faster cocoldown on low health
        this.actionTimer = Math.max(-1, this.actionTimer-1);
        this.fireballTimer = Math.max(-1, this.fireballTimer-1);
        this.updateDummyUI();
        super.update();
    }

    doAttack(target, type){
        switch(type){
            //Teleport
            case 0:
            this.cooldown = 20;
                this.teleport();
            break;

            //Spawn fire on the player and elsewhere on the map
            case 1:
            this.cooldown = 45;

                for(let j = 0; j < 7 + Math.floor(Math.random()*7); j++){
                    var spawnLoc;
                    //Spawn one on the player
                    if (j == 0){
                    spawnLoc = [ (Math.floor(target.getCenterX()) - Math.floor(target.getCenterX())%16),
                                (Math.floor(target.getCenterY()) - Math.floor(target.getCenterY())%16)];
                    }
                    //And a bunch elsewhere
                    else{
                        spawnLoc = [Math.floor(Math.random()*14+9)*16, Math.floor(Math.random()*12+2)*16] //9,2 to 22,13
                    }
                    for(let i = 0; i <  9; i++) {
                        var row = (i%3)-1;
                        var col = Math.floor(i/3)-1;

                        if((row == -1 || row == 1) && (col == -1 || col == 1)) { continue; }

                        var target = new Dummy_Targeting(this.game, spawnLoc[0]+row*16, spawnLoc[1]+col*16, this);
                        target.tileIndex = 700;
                        target.bulletTile = 495;
                    }
                }
            break;

            //Spawn more enemies
            case 2:
            this.cooldown = 120;

                var enemyType = (Math.random() < 0.5) ? 0 : Math.floor(Math.random()*4) // 5/8 chance to be 0, 1/8 chance for each of 1, 2 and 3
                var spawner_anim = new Animation('alpha');
                var spawner_anim2 = new Animation('rotate');
                spawner_anim.setUpdate(function(){ this.frame++; this.alpha = this.frame/10; } );
                spawner_anim2.setUpdate(function(){ this.frame++; this.angle = this.frame*12; } );

                for(let i = 0; i < 2; i++) {
                    var spawner = new Dummy_Spawner(this.game, Math.floor(Math.random()*14+9)*16, Math.floor(Math.random()*12+2)*16, enemyType)
                    spawner.tileIndex = 607;
                    spawner.animations.push(spawner_anim)
                    spawner.animations.push(spawner_anim2)
                }
            break;

            //Shoot a fireball
            case 3:
            this.cooldown = 15;
                this.fireball()
            break;
            //Shoot all the fireballs
            case 4:
            this.cooldown = 70;
                this.fireballTimer = 51
            break;
        }
    }


    hurt(){
        this.teleport();
        super.hurt();
    }

    die(){
        this.game.boss = undefined;
        this.game.audio.boss_loop.pause();
        this.game.audio.boss_f.pause();
        this.game.audio.item.play();
        new Dummy_Endgame(this.game, -16, -16);
        super.die();
    }

    fireball(){
        var playerDir = VectorSetLen(VectorSub(this.loc, this.game.player.loc), -12);

        var ball = new Bullet(this.game, this.loc[0], this.loc[1], playerDir[0], playerDir[1], this);
        ball.tileIndex = 495;
        ball.frameTimer = -10;

        var rotate = new Animation('rotate');
        rotate.angle = -Math.atan2(playerDir[0], playerDir[1]) * 180 / Math.PI;
        ball.animations.push(rotate);
        this.game.audio.fire.fastSeek(0);
        this.game.audio.fire.play();
    }

    doTeleport(){
        this.loc = [Math.floor(Math.random()*14+9)*16, Math.floor(Math.random()*12+2)*16] //9,2 to 22,13
        while(this.game.checkCollision(this, this.game.player) == true){
            this.loc = [Math.floor(Math.random()*14+9)*16, Math.floor(Math.random()*12+2)*16] //Reroll if you're about to teleport into the player
        }
        this.game.audio.warp.play();
    }

    teleport(){
        this.actionTimer = 2
        var tele_anim = new Animation('scale');
        tele_anim.setUpdate(function(){
            this.frame++;
            if(this.frame == 2 || this.frame == 5){
                this.scaleX =2;
                this.scaleY = 1/2;
            }
            else if(this.frame == 3 || this.frame == 4){
                this.scaleY =2;
                this.scaleX = 1/2;
            }
            else{
                this.scaleX = 1;
                this.scaleY = 1;
            }
        })
        this.animations.push(tele_anim)

    }

    createDummyUI(owner){
        for(let i = 0; i < 10; i++){
            var hearts = new Object();
            this.owner = owner;
            hearts.tileIndex = 522;
            hearts.loc = [482, 16+16*i];

            var anim = new Animation('scale');
            var anim2 = new Animation('alpha');
            anim.scaleX = anim.scaleY = 1;
            anim2.alpha = 1;
            hearts.animations = [anim, anim2];


            this.bossUI.push(hearts);
        }
    }

    updateDummyUI(){
        for(let i = 0; i < 10; i++){
            if(this.life-1 < i){
                this.bossUI[i].tileIndex = 520;
                this.bossUI[i].animations[1].alpha = 0.7;
                this.bossUI[i].animations[0].scaleX = this.bossUI[i].animations[0].scaleY = 1.2;
            }
        }
    }

    //No bouncing
    collideEnemy(object){  }
    collidePlayer(object){  }
    collideBullet(object){
        this.hurt()
    }
}
