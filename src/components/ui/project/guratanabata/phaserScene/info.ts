import Phaser from 'phaser';

// @ts-ignore
const match = window.location.pathname?.match(/\/projects\/(?<slug>[a-zA-Z0-9\-_]+)/i);

const COLORS = {
	link: '#163fc9',
};
const INFO_TEXT = `Tanabata is a Japanese festival; usually held in July or August. In present-day Japan, people generally celebrate this day by writing wishes on small pieces of paper, and hanging them on bamboo (along with various other decorations). As Gura is reaching her 3 million subscriber milestone in July, near the time of Tanabata, we're using this occasion to collect chumbuds' wishes and congratulatory messages for Gura!
${match?.groups?.slug === 'gura3mil' ? `
[size=42]> Please note that the submissions will only become viewable when Gura's sub count reaches 3 Million. Until then enjoy this nice background and BGM, and scroll down in this window for credits and a link to download the BGM.[/size]` : ''}

[size=72]Credits[/size]

BGM - Guratanabata by Jesterdist. 
Free download at [area=bgm] [color=${COLORS.link}]https://bit.ly/guraTanabata[/color] [/area]
(Gura you can use this BGM if you want. It's loopable!)

[size=42]> You also could open the link above by clicking the toggle BGM icon while holding the CTRL key[/size]

[size=64]Project Artworks[/size]
Layouts, Backgrounds, Assets - Caudy the Corgi
Napping Gura - DuDuL

[size=64]Programmers[/size]
Edqe14
K4rakara

[size=64]Coordinator[/size]
Sephi

[size=64]Submissions[/size]
Chumbuds everywhere`;

export default class Info extends Phaser.Scene {
	public width!: number;

	public height!: number;

	public bg!: Phaser.GameObjects.Image;

	public closeArea!: Phaser.GameObjects.Rectangle;

	public textArea!: any;

	public ui!: import('./plugins/ui').default;

	public container: any;

	public finished = false;

	public overlay!: Phaser.GameObjects.Graphics;

	public lockClose = false;

	public rexUI!: import('phaser3-rex-plugins/templates/ui/ui-plugin.js').default;

	public down!: Phaser.GameObjects.Image;

	init() {
		const { width, height } = this.game.canvas;
		this.width = width;
		this.height = height;
		this.input.setDefaultCursor('auto');
		this.input.setTopOnly(false);
	}

	create() {
		this.closeArea = this.add.rectangle(0, 0, this.width, this.height, 0x0e0e0e, 0.4)
			.setOrigin(0, 0)
			.setAlpha(0)
			.setInteractive()
			.on('pointerup', () => this.close());

		this.tweens.add({
			targets: this.closeArea,
			ease: 'Sine.easeInOut',
			alpha: 1,
			duration: 500,
		});

		this.bg = this.add.image(this.width / 2, this.height * 2, 'infoBG')
			.setOrigin(0.5, 1)
			.setScale(0.75)
			.setInteractive({ pixelPerfect: true })
			.on('pointerup', () => { this.lockClose = true; });

		const text = this.ui.text(0, 0, '', 48, undefined, {
			align: 'left',
		}, true)
			.setDepth(10)
			.setInteractive()
			.on('areaup', (key: string) => this.areaHandler(key));

		this.textArea = this.rexUI.add.textArea({
			anchor: {
				centerX: '50%',
				centerY: this.game.device.os.desktop ? '63%' : '57%',
			},
			width: this.bg.displayWidth - 800,
			height: 450,
			text,
			space: {
				text: {
					bottom: 100,
				},
			},
			content: INFO_TEXT,
		}).setAlpha(0).layout();

		const textBounds = this.textArea.getBounds();
		const height = 180;
		this.overlay = this.add.graphics({
			x: textBounds.left - 10,
			y: textBounds.bottom - height,
		})
			.fillGradientStyle(0, 0, 0x070202, 0x070202, 0, 0, 0.2, 0.2)
			.fillRect(0, 0, this.textArea.width + 10, height)
			.setAlpha(0);

		this.down = this.add.image(this.width / 2, this.height - 180, 'down')
			.setOrigin(0.5, 0)
			.setScale(0.75)
			.setTint(0)
			.setAlpha(0);

		// @ts-expect-error
		this.container = this.add.rexContainerLite(
			0,
			0,
			this.width,
			this.height,
			[this.bg, this.textArea, this.overlay, this.down],
		);

		this.container.tweenChild({
			targets: this.bg,
			ease: 'Sine.easeInOut',
			y: this.height,
			duration: 500,
		}).once('complete', () => {
			this.container.tweenChild({
				targets: [this.textArea, this.overlay, this.down],
				ease: 'Sine.easeInOut',
				alpha: 1,
				duration: 150,
			}).once('complete', () => {
				this.finished = true;
			});
		});

		this.input.on('wheel', (_: any, __: any, ___: any, dy: number) => {
			if (dy > 0) {
				this.textArea.setT(Math.min(this.textArea.t + 0.15, 1));
			} else if (dy < 0) {
				this.textArea.setT(Math.max(this.textArea.t - 0.15, 0));
			}
		});
	}

	close() {
		if (this.lockClose) {
			this.lockClose = false;
			return;
		}
		if (!this.finished) return;

		this.tweens.add({
			targets: this.closeArea,
			ease: 'Sine.easeInOut',
			alpha: 0,
			duration: 500,
		});

		this.container.tweenChild({
			targets: [this.textArea, this.overlay, this.down],
			ease: 'Sine.easeInOut',
			alpha: 0,
			duration: 100,
		}).once('complete', () => {
			this.container.tweenChild({
				targets: this.bg,
				ease: 'Sine.easeInOut',
				y: this.height * 2,
				duration: 400,
			}).once('complete', () => {
				this.finished = false;
				this.input.setDefaultCursor('auto');
				this.scene.stop();
			});
		});
	}

	// eslint-disable-next-line class-methods-use-this
	areaHandler(key: string) {
		this.lockClose = true;

		switch (key) {
			case 'bgm': {
				window.open('https://bit.ly/guraTanabata', '_blank', 'noopener noreferrer');
				break;
			}

			default: break;
		}
	}
}
