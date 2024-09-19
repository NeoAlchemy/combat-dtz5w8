import Phaser, { Physics } from 'phaser';

// Import stylesheets
import './style.css';

/* ----------------------------------- START SCENE --------------------------------- */
class BootLevel extends Phaser.Scene {
  constructor() {
    super({ key: 'BootLevel' });
  }

  preload() {
    // CHANGE BASE URL!!!!
    this.add.text(20, 20, 'Boot Sequence Initiated.');
    this.load.baseURL =
      'https://neoalchemy.github.io/starting-boilerplate-phaser-zcqxxx/';
    this.load.bitmapFont({
      key: 'Oswald',
      textureURL: 'static/assets/font/OswaldLightRed.png',
      fontDataURL: 'static/assets/font/OswaldLightRed.xml',
    });
    this.load.image('logo', 'static/assets/logo.png');
    this.load.image('splashscreen', 'static/assets/splashscreen.png');
  }

  create() {
    this.scene.start('SplashLevel');
  }
}

/* ----------------------------------- START SCENE --------------------------------- */
class SplashLevel extends Phaser.Scene {
  constructor() {
    super({ key: 'SplashLevel' });
  }

  preload() {
    const splashScreen = this.add.image(200, 250, 'splashscreen');

    const logo = this.add.image(200, 100, 'logo');
    logo.setScale(0.3);
    this.logo = logo;

    const text1 = this.add.bitmapText(-300, 200, 'Oswald', 'NeoAlchemy', 32);
    this.companyLine1 = text1;
    const text2 = this.add.bitmapText(-300, 230, 'Oswald', 'Indie Games', 32);
    this.companyLine2 = text2;

    const loading = this.add.text(180, 300, ['Loading...'], {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: 'black',
      align: 'center',
    });

    /* START PRELOAD ITEMS */
    this.load.baseURL = 'https://neoalchemy.github.io/combat-dtz5w8/';
    this.load.image('blueTank', 'static/assets/blueTank.png');
    this.load.image('blueLaser', '/static/assets/blueTankLaser.png');
    this.load.image('redTank', 'static/assets/redTank-v2.png');
    this.load.image('redLaser', '/static/assets/redTankLaser.png');
    this.load.bitmapFont({
      key: 'VT323Blue',
      textureURL: 'static/assets/font/VT323Blue.png',
      fontDataURL: 'static/assets/font/VT323Blue.xml',
    });
    this.load.bitmapFont({
      key: 'VT323Red',
      textureURL: 'static/assets/font/VT323Red.png',
      fontDataURL: 'static/assets/font/VT323Red.xml',
    });
    this.load.plugin(
      'rexvirtualjoystickplugin',
      'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js',
      true
    );
    this.load.plugin(
      'rexbuttonplugin',
      'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbuttonplugin.min.js',
      true
    );
    /* END PRELOAD ITEMS */
  }
  private logo: Phaser.GameObjects.Image;
  private companyLine1: Phaser.GameObjects.BitmapText;
  private companyLine2: Phaser.GameObjects.BitmapText;

  create() {
    this.tweens.add({
      targets: this.logo, //your image that must spin
      rotation: 2 * Math.PI, //rotation value must be radian
      ease: 'Bounce',
      delay: 600,
      duration: 600, //duration is in milliseconds
    });

    this.tweens.add({
      targets: this.companyLine1, //your image that must spin
      x: '140',
      ease: 'Elastic',
      duration: 500, //duration is in milliseconds
    });
    this.tweens.add({
      targets: this.companyLine2, //your image that must spin
      x: '140',
      ease: 'Elastic',
      duration: 500, //duration is in milliseconds
    });

    setTimeout(() => {
      this.scene.start('MainLevel');
    }, 2000);
  }

  update() {}
}

/* ----------------------------------- MAIN SCENE --------------------------------- */
class Wall extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, width, height, 0xf39f54);

    // Add the rectangle to the scene
    scene.add.existing(this);

    // Add physics to the wall (make it a static body)
    scene.physics.add.existing(this, true); // true makes it a static body

    // Cast the body as a static physics body and set immovable properties
    let body1 = this.body as Phaser.Physics.Arcade.StaticBody;
    body1.immovable = true; // Ensure the wall doesn't move when hit
    body1.onCollide = true;
  }
}

class LaserGroup extends Phaser.Physics.Arcade.Group {
  // https://www.codecaptain.io/blog/game-development/shooting-bullets-phaser-3-using-arcade-physics-groups/696

  constructor(scene, key) {
    // Call the super constructor, passing in a world and a scene
    super(scene.physics.world, scene);

    // Initialize the group
    this.createMultiple({
      classType: Laser, // This is the class we create just below
      frameQuantity: 30, // Create 30 instances in the pool
      active: false,
      visible: false,
      key: key,
    });
  }

  fireLaser(x, y, angle) {
    // Get the first available sprite in the group
    const laser = this.getFirstDead(false);
    if (laser) {
      laser.fire(x, y, angle);
    }
  }
}

class Laser extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
  }

  private distance: number = 0;
  private dx: number;
  private dy: number;
  private timerId: number;

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    const LASER_ALLOWED_DISTANCE = 150;

    if (this.distance > LASER_ALLOWED_DISTANCE) {
      this.setActive(false);
      this.setVisible(false);
      clearInterval(this.timerId);
      this.distance = 0;
      this.body.reset(-10, -10);
    }
  }

  fire(x, y, angle) {
    const LASER_SPEED = 10;

    this.setScale(2);
    this.setCollideWorldBounds(true);
    this.body.reset(x, y);

    let rads = angle * (Math.PI / 180);
    this.dx = LASER_SPEED * Math.cos(rads);
    this.dy = LASER_SPEED * Math.sin(rads);
    let initial_x = this.x;
    let initial_y = this.y;

    clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.x = this.x + this.dx;
      this.y = this.y + this.dy;
      let diff_x = this.x - initial_x;
      let diff_y = this.y - initial_y;
      this.distance = Math.sqrt(diff_x * diff_x + diff_y * diff_y);
    }, LASER_SPEED);

    this.setActive(true);
    this.setVisible(true);
  }
}

class MainLevel extends Phaser.Scene {
  constructor() {
    super({ key: 'MainLevel' });
  }

  preload() {}

  create() {
    // setup arena
    const gameBorder = this.add.graphics();
    gameBorder.lineStyle(10, 0xf39f54, 1);
    gameBorder.strokeRect(5, 60, 390, 335);
    this.gameBorder = gameBorder;
    this.physics.add.existing(this.gameBorder);
    this.physics.world.setBounds(5, 60, 390, 335);
    this.cameras.main.setBackgroundColor('#B2BF50');

    // sprites
    const blueTank = this.physics.add.sprite(50, 225, 'blueTank');
    blueTank.setCollideWorldBounds(true);
    this.blueTank = blueTank;

    const blueLaserMag = new LaserGroup(this, 'blueLaser');
    this.blueLaserMag = blueLaserMag;

    const redTank = this.physics.add.sprite(350, 225, 'redTank');
    redTank.setCollideWorldBounds(true);
    redTank.angle = 180;
    this.redTank = redTank;

    const redLaserMag = new LaserGroup(this, 'redLaser');
    this.redLaserMag = redLaserMag;

    const redScoreText = this.add.bitmapText(
      350,
      5,
      'VT323Red',
      String(this.redScore),
      50
    );
    this.redScoreText = redScoreText;

    const blueScoreText = this.add.bitmapText(
      50,
      5,
      'VT323Blue',
      String(this.blueScore),
      50
    );
    this.blueScoreText = blueScoreText;

    // walls
    this.walls.push(new Wall(this, 100, 225, 10, 100));
    this.walls.push(new Wall(this, 90, 180, 20, 10));
    this.walls.push(new Wall(this, 90, 270, 20, 10));

    this.walls.push(new Wall(this, 300, 225, 10, 100));
    this.walls.push(new Wall(this, 310, 180, 20, 10));
    this.walls.push(new Wall(this, 310, 270, 20, 10));

    this.walls.push(new Wall(this, 200, 225, 30, 30));

    this.walls.push(new Wall(this, 200, 150, 100, 10));
    this.walls.push(new Wall(this, 200, 300, 100, 10));

    // joystick
    const turretJoyStick = this.plugins
      .get('rexvirtualjoystickplugin')
      .add(this, {
        x: 50,
        y: 450,
        radius: 50,
        base: this.add.circle(0, 0, 50, 0x888888),
        thumb: this.add.circle(0, 0, 30, 0xcccccc),
        dir: 'left&right',
      });
    this.turretJoystick = turretJoyStick;

    const movementJoyStick = this.plugins
      .get('rexvirtualjoystickplugin')
      .add(this, {
        x: 350,
        y: 450,
        radius: 50,
        base: this.add.circle(0, 0, 50, 0x888888),
        thumb: this.add.circle(0, 0, 30, 0xcccccc),
        dir: 'up&down',
      });
    this.moveJoystick = movementJoyStick;

    const button = this.plugins
      .get('rexbuttonplugin')
      .add(this.add.circle(200, 450, 50, 0x3300ff));
    this.button = button;

    // keys
    const cursorKeys = this.input.keyboard.createCursorKeys();
    this.cursorKeys = cursorKeys;

    const wasdKeys = this.input.keyboard.addKeys({
      up: 'W',
      left: 'A',
      down: 'S',
      right: 'D',
      shoot: 'CAPS_LOCK',
    });
    this.wasdKeys = wasdKeys;
  }

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: any;
  private turretJoystick: any;
  private moveJoystick: any;
  private button: any;
  private redTank: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private blueTank: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private blueLaserMag: LaserGroup;
  private redLaserMag: LaserGroup;
  private redScore: number = 0;
  private blueScore: number = 0;
  private gameBorder: Phaser.GameObjects.Graphics;
  private redScoreText: Phaser.GameObjects.BitmapText;
  private blueScoreText: Phaser.GameObjects.BitmapText;
  private blueTankHitCooldown: boolean;
  private redTankHitCooldown: boolean;
  private walls: Array<Phaser.GameObjects.GameObject> = [];

  update() {
    const TANK_SPEED = 50;

    if (this.cursorKeys.up.isDown || this.moveJoystick.up) {
      var angleRad = Phaser.Math.DegToRad(this.redTank.angle);
      this.redTank.setVelocity(
        TANK_SPEED * Math.cos(angleRad),
        TANK_SPEED * Math.sin(angleRad)
      );
    } else if (this.cursorKeys.down.isDown || this.moveJoystick.down) {
      var angleRad = Phaser.Math.DegToRad(this.redTank.angle);
      this.redTank.setVelocity(
        -TANK_SPEED * Math.cos(angleRad),
        -TANK_SPEED * Math.sin(angleRad)
      );
    } else {
      this.redTank.setVelocity(0, 0);
    }
    if (this.cursorKeys.left.isDown) {
      this.redTank.angle -= 5;
    }
    if (this.turretJoystick.left) {
      this.redTank.angle -= 1;
    }
    if (this.cursorKeys.right.isDown) {
      this.redTank.angle += 5;
    }
    if (this.turretJoystick.right) {
      this.redTank.angle += 1;
    }
    if (this.cursorKeys.space.isDown) {
      this.redLaserMag.fireLaser(
        this.redTank.x,
        this.redTank.y,
        this.redTank.angle
      );
      this.cursorKeys.space.reset();
    }

    this.button.on('click', (button, gameObject, pointer, event) => {
      this.redLaserMag.fireLaser(
        this.redTank.x,
        this.redTank.y,
        this.redTank.angle
      );
    });

    if (this.wasdKeys.up.isDown) {
      var angleRad = Phaser.Math.DegToRad(this.blueTank.angle);
      this.blueTank.setVelocity(
        TANK_SPEED * Math.cos(angleRad),
        TANK_SPEED * Math.sin(angleRad)
      );
    } else if (this.wasdKeys.down.isDown) {
      var angleRad = Phaser.Math.DegToRad(this.blueTank.angle);
      this.blueTank.setVelocity(
        -TANK_SPEED * Math.cos(angleRad),
        -TANK_SPEED * Math.sin(angleRad)
      );
    } else {
      this.blueTank.setVelocity(0, 0);
    }

    if (this.wasdKeys.left.isDown) {
      this.blueTank.angle += 5;
    }
    if (this.wasdKeys.right.isDown) {
      this.blueTank.angle -= 5;
    }
    if (this.cursorKeys.shift.isDown) {
      this.blueLaserMag.fireLaser(
        this.blueTank.x,
        this.blueTank.y,
        this.blueTank.angle
      );
      this.cursorKeys.shift.reset();
    }

    // COLLISION CHECKS

    this.physics.collide(
      this.redLaserMag,
      this.blueTank,
      this.blueTankHit,
      null,
      this
    );

    this.physics.collide(
      this.blueLaserMag,
      this.redTank,
      this.redTankHit,
      null,
      this
    );

    this.physics.collide(
      this.blueLaserMag,
      this.walls,
      this.laserHitWall,
      null,
      this
    );

    this.physics.collide(
      this.redLaserMag,
      this.walls,
      this.laserHitWall,
      null,
      this
    );

    this.physics.collide(
      this.blueTank,
      this.walls,
      this.tankHitWall,
      null,
      this
    );

    this.physics.collide(
      this.redTank,
      this.walls,
      this.tankHitWall,
      null,
      this
    );
  }

  blueTankHit() {
    if (!this.blueTankHitCooldown) {
      this.blueTankHitCooldown = true;
      this.redScore++; //increase red score
      this.redScoreText.setText(String(this.redScore)); //increase blue's scores

      const MOVE_BACK = 20;
      this.tweens.add({
        targets: this.blueTank, //your image that must spin
        rotation: 4 * Math.PI, //rotation value must be radian
        ease: 'linear',
        delay: 100,
        duration: 600, //duration is in milliseconds
      });
      var angleRad = this.blueTank.angle * (Math.PI / 180);
      this.blueTank.x = this.blueTank.x - MOVE_BACK * Math.cos(angleRad);
      this.blueTank.y = this.blueTank.y - MOVE_BACK * Math.sin(angleRad);
      this.time.delayedCall(1000, () => {
        this.blueTankHitCooldown = false;
      });
    }
  }

  redTankHit() {
    if (!this.redTankHitCooldown) {
      this.redTankHitCooldown = true;

      this.blueScore++;
      this.blueScoreText.setText(String(this.blueScore)); //increase blue's scores

      const MOVE_BACK = 20;
      this.tweens.add({
        targets: this.redTank, //your image that must spin
        rotation: 5 * Math.PI, //rotation value must be radian
        ease: 'linear',
        delay: 100,
        duration: 600, //duration is in milliseconds
      });
      var angleRad = this.redTank.angle * (Math.PI / 180);
      this.redTank.x = this.redTank.x - MOVE_BACK * Math.cos(angleRad);
      this.redTank.y = this.redTank.y - MOVE_BACK * Math.sin(angleRad);
      this.time.delayedCall(1000, () => {
        this.redTankHitCooldown = false;
      });
    }
  }

  laserHitWall(wall, laser) {
    // Deactivate the laser and make it invisible
    laser.setActive(false);
    laser.setVisible(false);
    clearInterval(laser.timerId); // Stop the laser's movement
    laser.distance = 0;
    laser.body.reset(-10, -10); // Move it offscreen
  }

  tankHitWall(tank, wall) {
    tank.setVelocity(0, 0);
  }
}

/* -------------------------------------------------------------------------- */
/*                                RUN GAME.                                   */
/* -------------------------------------------------------------------------- */

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 500,
  backgroundColor: '0xF3D371',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: [BootLevel, SplashLevel, MainLevel],
};

const game = new Phaser.Game(config);
