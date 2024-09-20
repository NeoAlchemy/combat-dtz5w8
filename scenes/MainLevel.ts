import Phaser from 'phaser';

class AITank extends Phaser.Physics.Arcade.Sprite {
  private TANK_SPEED: number = 50;
  private TURRET_SPEED: number = 50;
  private MAX_RAY_LENGTH: any = 35;
  private cooldown: boolean;
  private raycaster: any;

  constructor(scene, x, y, texture, walls) {
    super(scene, x, y, texture);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);

    const rexRaycasterPlugin = scene.plugins.get('rexraycasterplugin');
    const raycaster = rexRaycasterPlugin.add({
      maxRayLength: this.MAX_RAY_LENGTH,
    });
    this.raycaster = raycaster;
    this.raycaster.addObstacle(walls);
  }

  _moveForward() {
    var angleRad = Phaser.Math.DegToRad(this.angle);
    this.setVelocity(
      this.TANK_SPEED * Math.cos(angleRad),
      this.TANK_SPEED * Math.sin(angleRad)
    );
  }

  _moveBackwards() {
    var angleRad = Phaser.Math.DegToRad(this.angle);
    this.setVelocity(
      -this.TANK_SPEED * Math.cos(angleRad),
      -this.TANK_SPEED * Math.sin(angleRad)
    );
  }

  _stop() {
    this.setVelocity(0);
  }

  _turnLeft() {
    this.setAngularVelocity(-this.TURRET_SPEED); // Rotate left
  }

  _turnRight() {
    this.setAngularVelocity(this.TURRET_SPEED); // Rotate left
  }

  update() {
    if (!this.cooldown) {
      this.cooldown = true;
      let result = this.raycaster.rayToward(
        this.x,
        this.y,
        Phaser.Math.DegToRad(this.angle)
      );
      if (result && result.hit) {
        this._turnLeft();
        this._stop();
      } else {
        this._moveForward();
      }

      this.scene.time.delayedCall(1000, () => {
        this.cooldown = false;
      });
    }

    //this.scene.physics.accelerateTo(this);
  }
}

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

export class MainLevel extends Phaser.Scene {
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

    // sprites
    const blueTank = new AITank(this, 50, 225, 'blueTank', this.walls);
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

    // joystick
    const rexVirtualJoyStickPlugin: any = this.plugins.get(
      'rexvirtualjoystickplugin'
    );
    const turretJoyStick = rexVirtualJoyStickPlugin.add(this, {
      x: 50,
      y: 450,
      radius: 50,
      base: this.add.circle(0, 0, 50, 0x888888),
      thumb: this.add.circle(0, 0, 30, 0xcccccc),
      dir: 'left&right',
    });
    this.turretJoystick = turretJoyStick;

    const movementJoyStick = rexVirtualJoyStickPlugin.add(this, {
      x: 350,
      y: 450,
      radius: 50,
      base: this.add.circle(0, 0, 50, 0x888888),
      thumb: this.add.circle(0, 0, 30, 0xcccccc),
      dir: 'up&down',
    });
    this.moveJoystick = movementJoyStick;

    const rexButtonPlugin: any = this.plugins.get('rexbuttonplugin');
    const button = rexButtonPlugin.add(this.add.circle(200, 450, 50, 0x3300ff));
    this.button = button;

    // keys
    const cursorKeys = this.input.keyboard.createCursorKeys();
    this.cursorKeys = cursorKeys;
  }

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: any;
  private turretJoystick: any;
  private moveJoystick: any;
  private button: any;
  private redTank: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private blueTank: AITank;
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
    const TURRET_SPEED = 100;

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
    if (this.cursorKeys.left.isDown || this.turretJoystick.left) {
      this.redTank.setAngularVelocity(-TURRET_SPEED); // Rotate left
    } else if (this.cursorKeys.right.isDown || this.turretJoystick.right) {
      this.redTank.setAngularVelocity(TURRET_SPEED);
    } else {
      this.redTank.setAngularVelocity(0);
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

    this.blueTank.update();

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

    this.physics.collide(
      this.redTank,
      this.blueTank,
      this.tankCollision,
      null,
      this
    );
  }

  blueTankHit(tank, laser) {
    if (!this.blueTankHitCooldown) {
      this.blueTankHitCooldown = true;
      this.redScore++; //increase red score
      this.redScoreText.setText(String(this.redScore)); //increase blue's scores

      this._tankHit(tank);

      this._resetLaser(laser);

      this.time.delayedCall(1000, () => {
        this.blueTankHitCooldown = false;
      });
    }
  }

  redTankHit(tank, laser) {
    if (!this.redTankHitCooldown) {
      this.redTankHitCooldown = true;

      this.blueScore++;
      this.blueScoreText.setText(String(this.blueScore)); //increase blue's scores

      this._tankHit(tank);

      this._resetLaser(laser);

      this.time.delayedCall(1000, () => {
        this.redTankHitCooldown = false;
      });
    }
  }

  laserHitWall(wall, laser) {
    this._resetLaser(laser);
  }

  tankHitWall(tank, wall) {
    this._stopTank(tank);
  }

  tankCollision(tank1, tank2) {
    this._stopTank(tank1);
    this._stopTank(tank2);
  }

  _stopTank(tank) {
    tank.setVelocity(0, 0);
  }

  _resetLaser(laser) {
    // Deactivate the laser and make it invisible
    laser.setActive(false);
    laser.setVisible(false);
    clearInterval(laser.timerId); // Stop the laser's movement
    laser.distance = 0;
    laser.body.reset(-10, -10); // Move it offscreen
  }

  _tankHit(tank) {
    const MOVE_BACK = 20;
    this.tweens.add({
      targets: tank, //your image that must spin
      rotation: 5 * Math.PI, //rotation value must be radian
      ease: 'linear',
      delay: 100,
      duration: 600, //duration is in milliseconds
    });

    // Save the current position to check collision later
    const oldX = tank.x;
    const oldY = tank.y;

    const angleRad = Phaser.Math.DegToRad(tank.angle); // Convert angle to radians

    // Calculate the new position based on the angle
    const moveBackX = MOVE_BACK * Math.cos(angleRad);
    const moveBackY = MOVE_BACK * Math.sin(angleRad);

    tank.setVelocity(moveBackX, moveBackY);
    this.time.delayedCall(100, () => {
      tank.setVelocity(0); // Stop the tank after moving
    });

    // Collision check - if it collides, move it back to the old position
    this.physics.world.collide(tank, this.walls, () => {
      tank.setPosition(oldX, oldY); // Reset the tank's position if there's a collision
      tank.setVelocity(0); // Stop the velocity after collision
    });
  }
}
