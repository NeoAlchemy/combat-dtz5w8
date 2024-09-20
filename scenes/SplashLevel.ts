import Phaser from 'phaser';

export class SplashLevel extends Phaser.Scene {
  constructor() {
    super({ key: 'SplashLevel' });
  }

  preload() {
    const splashScreen = this.add.image(200, 250, 'splashscreen');
    this.cameras.main.setBackgroundColor(0xf3d371);
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
    this.load.plugin(
      'rexraycasterplugin',
      'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexraycasterplugin.min.js',
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
