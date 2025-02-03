import Phaser from 'phaser';
// eslint-disable-next-line import/no-cycle
import { TanabataSubmission } from '@/components/ui/project/guratanabata/PhaserSubmissionWrapper';

// @ts-ignore
const match = window.location.pathname?.match(/\/projects\/(?<slug>[a-zA-Z0-9\-_]+)/i);
const MILLION = match?.groups?.slug === 'gura3mil' ? '3' : '4';

const BASE_WIDTH = 2280;
const BASE_HEIGHT = 1620;
const PAPERS = ['blue', 'purple', 'orange', 'white', 'red'];
const PAPER_POS_DESKTOP = [
	[545, 320],
	[975, 320],
	[1435, 212],
	[1955, 280],
	[2345, 280],
];

const PAPER_POS_NONDESKTOP = [
	[410, 320],
	[905, 320],
	[1435, 212],
	[2025, 280],
	[2478, 280],
];

const BG_KEYS = [
	'zoomed1',
	'zoomed2',
	'zoomed3',
];

const FOOTER_MESSAGE = `[shadow-sm]You've reached the bottom of the submissions! We hope you enjoyed reading the notes, and looking at the art.

${MILLION} Million subscribers is one heck of an achievement, and we're glad we could make you something to commemorate your achievement.[/shadow]`;

class Main extends Phaser.Scene {
	public width!: number;

	public height!: number;

	public pages?: never[];

	public sizer: any;

	public rexUI!: import('phaser3-rex-plugins/templates/ui/ui-plugin.js').default;

	public panel: any;

	public ui!: import('./plugins/ui').default;

	public counter: any;

	public back?: Phaser.GameObjects.Image;

	public tempData: any;

	public isShowingFull = false;

	public down!: Phaser.GameObjects.Image;

	public end = false;

	init(data: any) {
		const { width, height } = this.game.canvas;

		this.width = width;
		this.height = height;
		this.pages = [];
		this.data.set(data, null);

		this.scene.moveAbove('splash');
		this.input.setTopOnly(false);
	}

	async create() {
		this.end = false;
		const submissions = [...this.registry.get('submissions')];

		this.down = this.add.image(this.width - 50, this.height - 50, 'down')
			.setOrigin(1, 1)
			.setDepth(5)
			.setTintFill(0x41910f)
			.setAlpha(0);

		this.sizer = this.rexUI.add.sizer({
			orientation: 'y',
			space: {
				top: -(this.height / 2),
				bottom: this.height / 2,
				left: -(this.width / 2),
			},
		})
			.add(this.generatePage(submissions.shift()), {
				align: 'left',
			}).add(this.generatePage(submissions.shift()), {
				align: 'left',
			});

		this.panel = this.rexUI.add.scrollablePanel({
			x: 0,
			y: 0,
			width: this.width,
			height: this.height,
			anchor: {
				left: '0%',
				top: '0%',
			},
			panel: {
				child: this.sizer,
				/* This setting breaks the panel, no clue why.
				   Doesn't seem to change anything when it's commented out */
				// mask: false,
			},
			scroller: {
				slidingDeceleration: 7500,
			},
			clamplChildOY: true,
		})
			.layout()
			.setAlpha(0)
			.on('scroll', ({ t }: { t: number }) => {
				if (t === 1) {
					return this.tweens.add({
						targets: this.down,
						ease: 'Sine.easeInOut',
						duration: 300,
						alpha: 0,
					});
				}

				if (this.down.alpha === 0) {
					return this.tweens.add({
						targets: this.down,
						ease: 'Sine.easeInOut',
						duration: 300,
						alpha: 1,
					});
				}

				if (this.end) return true;
				if (t >= 0.8) {
					if (submissions.length === 0) {
						this.sizer.add(this.generateFooter(), {
							align: 'left',
							...(!this.game.device.os.desktop && ({
								padding: {
									top: -(this.height / 2),
									bottom: this.height / 2,
								},
							})),
						});
						this.panel.layout();
						this.end = true;
						return true;
					}

					this.sizer.add(this.generatePage(submissions.shift()), {
						align: 'left',
					});
					this.panel.layout();
				}

				return true;
			});

		this.back = this.add.image(5, 0, 'back')
			.setOrigin(0, 0)
			.setDepth(5)
			.setScale(0.75)
			.setAlpha(0)
			.setInteractive({ pixelPerfect: true, cursor: 'pointer' })
			.once('pointerup', () => this.close());

		// Fade in
		this.tweens.add({
			targets: [this.panel, this.back, this.down],
			alpha: {
				from: 0,
				to: 1,
			},
			ease: 'Sine.easeInOut',
			duration: 1000,
		}).once('complete', () => {
			this.cameras.main.setBackgroundColor('#010007');
			this.input.on('wheel', (_: any, __: any, ___: any, dy: number) => {
				const items = this.panel.getElement('panel').getElement('items').length;
				if (dy > 0) {
					this.panel.setT(Math.min(this.panel.t + (0.1 / items) * 1.1, 1));
				} else if (dy < 0) {
					this.panel.setT(Math.max(this.panel.t - (0.1 / items) * 1.1, 0));
				}
			});
		});

		// Down arrow animation
		this.tweens.createTimeline({ loop: -1, loopDelay: 500 })
			.add({
				targets: this.down,
				ease: 'Sine.easeInOut',
				y: this.down.y - 50,
				duration: 1000,
			}).add({
				targets: this.down,
				ease: 'Sine.easeOut',
				y: this.down.y,
				duration: 600,
			}).play();

		this.registry.get('setBackgroundImage')(!this.registry.get('useFallback') ? '/assets/guratanabata/zoomedin1.webp' : '/assets/guratanabata/fallback/zoomedin1.jpg');
	}

	generatePage(messages?: TanabataSubmission[]) {
		if (!messages) return false;

		let bg: any;
		let paperPos: number[][];

		const bgKey = BG_KEYS[Math.floor(Math.random() * BG_KEYS.length)];
		if (this.game.device.os.desktop) {
			paperPos = PAPER_POS_DESKTOP;
			bg = this.rexUI.add.sizer({
				orientation: 0,
				height: this.height,
				width: this.width,
				x: this.width / 2,
				y: this.height / 2,
				anchor: {
					x: '50%',
					y: '50%',
				},
			});

			Array(3).fill(0).forEach((_, i) => {
				bg.add(
					this.add.image(0, 0, bgKey)
						.setOrigin(0, 0)
						.setDisplaySize(2150, this.height),
					{
						align: ['left', 'center', 'right'][i],
					},
				);
			});

			bg.layout();
		} else {
			paperPos = PAPER_POS_NONDESKTOP;
			bg = this.add.image(0, 0, bgKey)
				.setOrigin(0, 0)
				.setDisplaySize(this.width, this.height);
		}

		// @ts-expect-error
		const placed = this.add.rexContainerLite(0, 0, this.width, this.height);
		const papers = this.ui.shuffle(PAPERS);
		paperPos.forEach((c, i) => {
			const message = messages[i];
			if (message === undefined || message === null) return;

			const x = c[0] * ((this.width / BASE_WIDTH) * 0.7895);
			const y = c[1] * ((this.height / BASE_HEIGHT) * 0.9);
			const paper = papers[i];

			const image = this.add.image(x, y, paper)
				.setScale(0.7)
				.setOrigin(0.5, 0)
				.setInteractive({ pixelPerfect: true, cursor: 'pointer' })
				.on('pointerup', () => this.showPaper(paper, message));
			const author = this.ui.text(
				x,
				y + image.displayHeight - 50,
				message.author as string,
				32,
				170,
			).setOrigin(0.5, 0.5);
			const objects = [image, author];

			if (message.type === 'text') {
				const text = this.ui.text(x, y + 120, message.message as string, 32, 170, {
					maxLines: 15,
				}).setOrigin(0.5, 0);
				objects.push(text);
			} else if (message.type === 'image') {
				const img = this.add.image(x, y + 100, `submission-image-${message.author}-thumb`)
					.setScale(0.45)
					.setOrigin(0.5, 0);
				objects.push(img);
			}

			// @ts-expect-error
			const cont = this.add.rexContainerLite(x, y, image.width, image.height, objects)
				.setOrigin(0.5, 0)
				.setDepth(10);

			const timeline = this.tweens.createTimeline({
				loop: -1,
				loopDelay: Phaser.Math.Between(20, 100),
				delay: Phaser.Math.Between(50, 100),
			}).add({
				rotation: Phaser.Math.FloatBetween(0.15, 0.25),
				targets: cont,
				ease: 'Sine.easeInOut',
				duration: 1000,
			}).add({
				rotation: Phaser.Math.FloatBetween(0.05, 0.1),
				targets: cont,
				ease: 'Sine.easeInOut',
				duration: 800,
			}).add({
				rotation: Phaser.Math.FloatBetween(0.15, 0.2),
				targets: cont,
				ease: 'Sine.easeInOut',
				duration: 1000,
			})
				.add({
					rotation: Phaser.Math.FloatBetween(0.05, 0.1) * -1,
					targets: cont,
					ease: 'Sine.easeInOut',
					duration: 800,
				})
				.add({
					rotation: 0,
					targets: cont,
					ease: 'Sine.easeInOut',
					duration: 700,
				});

			placed.add(cont);

			timeline.data.forEach((t) => t.on('update', (_: any, __: any, ___: any, current: any) => placed.setChildRotation(cont, current)));
			timeline.play();
		});

		// @ts-expect-error
		const container = this.add.rexContainerLite(
			0,
			0,
			this.width,
			this.height,
			[bg, placed],
		);

		return container;
	}

	showPaper(paper: string, submission: TanabataSubmission) {
		if (this.isShowingFull) return;
		this.isShowingFull = true;

		this.scene.launch('fullPaper', {
			paper, submission,
		}).get('fullPaper').events.once('shutdown', () => {
			this.isShowingFull = false;
		});
	}

	generateFooter() {
		let bg: any;

		const bgKey = 'footer';
		if (this.game.device.os.desktop) {
			bg = this.rexUI.add.sizer({
				orientation: 0,
				height: this.height * 2,
				width: this.width,
				x: this.width / 2,
				y: this.height / 2,
				anchor: {
					x: '50%',
					y: '50%',
				},
			});

			Array(3).fill(0).forEach((_, i) => {
				bg.add(
					this.add.image(0, 0, bgKey)
						.setOrigin(0, 0)
						.setDisplaySize(2150, this.height * 2),
					{
						align: ['left', 'center', 'right'][i],
					},
				);
			});

			bg.layout();
		} else {
			bg = this.add.image(0, 0, bgKey)
				.setOrigin(0, 0);
			bg.setDisplaySize(this.width, this.height * 2);
		}

		const textY = this.game.device.os.desktop ? 120 : 500;
		const text = this.ui.text(this.width / 2, textY, FOOTER_MESSAGE, 52, this.width - 400, {
			color: '#fefefe',
			shadow: {
				offsetY: 2,
				color: '#0e0e0e',
				blur: 15,
			},
		}, true).setOrigin(0.5, 0);

		const textBigPos: [number, number] = this.game.device.os.desktop
			? [this.width / 1.58, this.height / 1.4]
			: [this.width / 1.6, this.height * 1.2];
		const textBigSize = this.game.device.os.desktop ? 120 : 100;
		const textBigWrapWidth = this.game.device.os.desktop ? 1500 : 1200;
		const textBig = this.ui.text(...textBigPos, `[shadow-sm]Happy ${MILLION} Million, Same-chan, and here's to the next milestone.[/shadow]`, textBigSize, textBigWrapWidth, {
			color: '#fefefe',
			shadow: {
				offsetY: 2,
				color: '#0e0e0e',
				blur: 15,
			},
			align: 'right',
		}, true).setOrigin(0.5, 0);

		let gura;
		const pos: [number, number] = [this.width / 1.72, this.height * 1.72];
		if (!this.registry.get('canPlayWebm')) {
			gura = this.add.sprite(...pos, 'gura-frame1')
				.play('gura');
		} else {
			gura = this.add.video(...pos, 'gura')
				.play(true);
		}

		gura.setOrigin(1, 1)
			.setDepth(1)
			.setTint(0x446b18, 0xffffff, 0x446b18, 0xf7f3a5);

		if (!this.game.device.os.desktop) {
			gura.setScale(0.9).setPosition(gura.x + 80, gura.y + 560);
		}

		// @ts-expect-error
		const container = this.add.rexContainerLite(
			0,
			0,
			this.width,
			this.height * 2,
			[bg, gura, text, textBig],
		);

		return container;
	}

	close() {
		// Thats an image url for a 1x1 black pixel in png.1
		this.registry.get('setBackgroundImage')('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVQI12NgYGAAAAAEAAEnNCcKAAAAAElFTkSuQmCC');
		this.tweens.add({
			targets: [this.panel, this.counter, this.back],
			alpha: {
				from: 1,
				to: 0,
			},
			ease: 'Sine.easeInOut',
			duration: 500,
		}).once('complete', () => this.scene.start('splash'));
	}
}

export default Main;
