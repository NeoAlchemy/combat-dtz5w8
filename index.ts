import Phaser from 'phaser';

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
    const splashScreen = this.add.image(200, 200, 'splashscreen');

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
    console.log('fire');
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
    }
  }

  fire(x, y, angle) {
    const LASER_SPEED = 10;
    this.setScale(2);

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
    const border = this.add.rectangle(200, 200, 400, 400, 0x000000, 0xff);
    border.setStrokeStyle(10, 0xf39f54);
    this.cameras.main.setBackgroundColor('#B2BF50');

    // sprites
    const blueTank = this.physics.add.sprite(50, 200, 'blueTank');
    this.blueTank = blueTank;

    const blueLaserMag = new LaserGroup(this, 'blueLaser');
    this.blueLaserMag = blueLaserMag;

    const redTank = this.physics.add.sprite(350, 200, 'redTank');
    redTank.angle = 180;
    this.redTank = redTank;

    const redLaserMag = new LaserGroup(this, 'redLaser');
    this.redLaserMag = redLaserMag;

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
  private redTank: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private blueTank: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private blueLaserMag: LaserGroup;
  private redLaserMag: LaserGroup;

  update() {
    const TANK_SPEED = 1;

    if (this.cursorKeys.up.isDown) {
      var angleRad = this.redTank.angle * (Math.PI / 180);
      this.redTank.x = this.redTank.x - TANK_SPEED * Math.cos(angleRad);
      this.redTank.y = this.redTank.y - TANK_SPEED * Math.sin(angleRad);
    }
    if (this.cursorKeys.down.isDown) {
      var angleRad = this.redTank.angle * (Math.PI / 180);
      this.redTank.x = this.redTank.x + TANK_SPEED * Math.cos(angleRad);
      this.redTank.y = this.redTank.y + TANK_SPEED * Math.sin(angleRad);
    }
    if (this.cursorKeys.left.isDown) {
      this.redTank.angle -= 5;
    }
    if (this.cursorKeys.right.isDown) {
      this.redTank.angle += 5;
    }
    if (this.cursorKeys.space.isDown) {
      this.redLaserMag.fireLaser(
        this.redTank.x,
        this.redTank.y,
        this.redTank.angle
      );
      this.cursorKeys.space.reset();
    }

    if (this.wasdKeys.up.isDown) {
      var angleRad = this.blueTank.angle * (Math.PI / 180);
      this.blueTank.x = this.blueTank.x + TANK_SPEED * Math.cos(angleRad);
      this.blueTank.y = this.blueTank.y + TANK_SPEED * Math.sin(angleRad);
    }
    if (this.wasdKeys.down.isDown) {
      var angleRad = this.blueTank.angle * (Math.PI / 180);
      this.blueTank.x = this.blueTank.x - TANK_SPEED * Math.cos(angleRad);
      this.blueTank.y = this.redTank.y - TANK_SPEED * Math.sin(angleRad);
    }
    if (this.wasdKeys.left.isDown) {
      this.blueTank.angle -= 5;
    }
    if (this.wasdKeys.right.isDown) {
      this.blueTank.angle += 5;
    }
    if (this.cursorKeys.shift.isDown) {
      this.blueLaserMag.fireLaser(
        this.blueTank.x,
        this.blueTank.y,
        this.blueTank.angle
      );
      this.cursorKeys.shift.reset();
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                                RUN GAME.                                   */
/* -------------------------------------------------------------------------- */

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 400,
  backgroundColor: '0x000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: [BootLevel, SplashLevel, MainLevel],
};

const game = new Phaser.Game(config);
