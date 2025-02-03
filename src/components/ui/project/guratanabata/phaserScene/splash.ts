import Phaser from 'phaser';

class Splash extends Phaser.Scene {
	public width!: number;

	public height!: number;

	public googleFonts!: import('./plugins/gfonts').default;

	public ui!: import('./plugins/ui').default;

	public bg!: any;

	public bamboo?: Phaser.GameObjects.Image;

	public gura?: Phaser.GameObjects.Video | Phaser.GameObjects.Sprite;

	public title!: Phaser.GameObjects.Image;

	public container: any;

	public back!: Phaser.GameObjects.Image;

	public rexUI!: import('phaser3-rex-plugins/templates/ui/ui-plugin.js').default;

	public started = false;

	init() {
		const { width, height } = this.game.canvas;
		this.width = width;
		this.height = height;

		this.cameras.main.setBackgroundColor('#010007');
	}

	async create() {
		this.back = this.add.image(5, 0, 'home')
			.setOrigin(0, 0)
			.setDepth(5)
			.setScale(0.75)
			.setInteractive({ pixelPerfect: true, cursor: 'pointer' })
			.once('pointerup', () => {
				(this.scene.get('default') as import('./index').default).exiting = true;
				this.game.scale.stopFullscreen();
				this.game.destroy(true);
				window.location.href = '/';
			});

		this.registry.get('setBackgroundImage')(!this.registry.get('useFallback') ? '/assets/guratanabata/bg.webp' : '/assets/guratanabata/fallback/bg.jpg');

		if (this.game.device.os.desktop) {
			this.bg = this.rexUI.add.sizer({
				orientation: 0,
				height: this.height,
				width: this.width,
				x: this.width / 2,
				y: this.height / 2,
				anchor: {
					x: '48%',
					y: '50%',
				},
			});

			Array(3).fill(0).forEach((_, i) => {
				this.bg.add(
					this.add.image(0, 0, 'bg')
						.setOrigin(0.5, 0.5)
						.setAlpha(0)
						.setScale(0.78),
					{
						align: ['left', 'center', 'right'][i],
					},
				);
			});

			this.bg.layout();
		} else {
			this.bg = {
				children: [
					this.add.image(this.width / 2, this.height / 2, 'bg')
						.setOrigin(0.5, 0.5)
						.setDisplaySize(this.width, this.height)
						.setAlpha(0)
						.setScale(0.7),
				],
			};
		}

		// @ts-ignore
		const match = window.location.pathname?.match(/\/projects\/(?<slug>[a-zA-Z0-9\-_]+)/i);
		this.title = this.add.image(this.width / 2, -550, `title${match?.groups?.slug === 'gura3mil' ? '3' : '4'}`)
			.setOrigin(0.5, 0)
			.setDepth(6)
			.setScale(0.95);
		this.bamboo = this.add.image(this.width / 2, this.height - 5, 'bamboo')
			.setOrigin(0.5, 1)
			.setDepth(1)
			.setScale(0.82);

		const pos: [number, number] = [this.width / 1.85, this.height + 2];
		if (!this.registry.get('canPlayWebm')) {
			this.gura = this.add.sprite(...pos, 'gura-frame1')
				.play('gura');
		} else {
			this.gura = this.add.video(...pos, 'gura')
				.play(true);
		}

		this.gura.setOrigin(1, 1)
			.setScale(0.3)
			.setDepth(1)
			.setTint(0x446b18, 0xffffff, 0x446b18, 0xf7f3a5);

		// @ts-expect-error
		this.container = this.add.rexContainerLite(0, 0, this.width, this.height)
			.addMultiple([this.bamboo, this.gura])
			.setAlpha(0);

		this.cameras.main.setZoom(1.2);
		this.tweens.createTimeline()
			.add({
				targets: this.cameras.main,
				ease: 'Sine.easeInOut',
				duration: 1500,
				zoom: 1,
			})
			.add({
				targets: [this.container, ...this.bg.children],
				ease: 'Sine.easeInOut',
				duration: 500,
				alpha: 1,
				offset: '-=1500',
			})
			.add({
				targets: this.title,
				ease: 'Sine.easeInOut',
				duration: 1500,
				y: '+=560',
				offset: '-=1000',
			})
			.once('complete', () => {
				this.tweens.add({
					targets: this.title,
					ease: 'Sine.easeInOut',
					duration: 1500,
					y: this.title.y + 20,
					yoyo: true,
					loop: -1,
				});
			})
			.play();

		this.input.on('pointerup', async () => {
			if (this.started) return false;
			this.started = true;

			const timeline = this.tweens.createTimeline()
				.add({
					targets: this.cameras.main,
					ease: 'Sine.easeInOut',
					duration: 2000,
					zoom: 1.8,
				})
				.add({
					targets: [this.container, ...this.bg.children],
					ease: 'Sine.easeInOut',
					duration: 2000,
					y: '-=250',
					offset: '-=2000',
				})
				.add({
					targets: this.container,
					ease: 'Sine.easeInOut',
					duration: 1000,
					alpha: 0,
					offset: '-=1000',
				})
				.add({
					targets: this.title,
					ease: 'Sine.easeInOut',
					duration: 2000,
					y: '-=300',
					scale: 0.8,
					offset: '-=2000',
				});

			return timeline.once('start', async () => {
				await this.ui.sleep();
				this.input.setDefaultCursor('auto');
				this.scene.bringToTop('main');
				this.scene.launch('main');
				this.tweens.add({
					targets: this.gura,
					ease: 'Sine.easeInOut',
					alpha: 0,
					duration: 1000,
				});
				await this.ui.sleep();
				this.scene.stop('splash').get('main').events.once('shutdown', () => { this.started = false; });
			}).play();
		});

		this.input.setDefaultCursor('pointer');
	}
}

export default Splash;
