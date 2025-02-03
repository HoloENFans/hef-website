import Phaser from 'phaser';
import SoundFade from 'phaser3-rex-plugins/plugins/soundfade';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
// @ts-expect-error Missing types
import ContainerLitePlugin from 'phaser3-rex-plugins/plugins/containerlite-plugin';
// @ts-expect-error Missing types
import BBCodeTextPlugin from 'phaser3-rex-plugins/plugins/bbcodetext-plugin';
// @ts-expect-error Missing types
import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin';
import { Plugin as NineSlicePlugin } from 'phaser3-nineslice';
// eslint-disable-next-line import/no-cycle
import { TanabataSubmission } from '@/components/ui/project/guratanabata/PhaserSubmissionWrapper';

import GoogleFontsPlugin from './plugins/gfonts';
import UIPl from './plugins/ui';

import Main from './main';
import Splash from './splash';
import FullPaper from './fullPaper';
import Info from './info';

class Index extends Phaser.Scene {
	public bgmPlaying = false;

	public bgm?: Phaser.Sound.WebAudioSound;

	public ui!: import('./plugins/ui').default;

	public info: any;

	public width!: number;

	public height!: number;

	public infoButton?: Phaser.GameObjects.Image;

	public bgmControl?: Phaser.GameObjects.Image;

	public milestoneToggle?: Phaser.GameObjects.Image;

	public showingInfo = false;

	public exiting = false;

	public progressBar!: Phaser.GameObjects.Rectangle;

	public progressText!: Phaser.GameObjects.Text;

	init() {
		// ! Temp commented out because of bug
		// if (!this.ui) return window.location.reload();

		const { width, height } = this.game.canvas;
		this.width = width;
		this.height = height;

		if (
			this.game.device.browser.safari
			|| this.game.device.browser.ie
			|| (this.game.device.os.iOS && this.game.device.os.iOSVersion < 14.4)
		) this.registry.set('useFallback', true);
		else this.registry.set('useFallback', false);

		if (this.game.device.video.webm && this.game.device.video.vp9) {
			this.registry.set('canPlayWebm', true);
		} else {
			this.registry.set('canPlayWebm', false);
		}

		this.input.on('pointerup', async () => {
			if (!this.game.device.os.desktop && !this.exiting) {
				this.ui.ensureOrientation();
			}
		});

		return true;
	}

	preload() {
		const loading = this.ui.text(this.width / 2, this.height / 2, 'Loading...', 32, undefined, {
			color: '#FEFEFE',
		}).setOrigin(0.5, 0.5);

		this.progressBar = this.add.rectangle(0, this.height, 0, 48, 0xfeffff)
			.setOrigin(0, 1)
			.setAlpha(0.8);
		this.progressText = this.ui.text(20, this.height - 5, '0%', 38)
			.setOrigin(1, 1) as Phaser.GameObjects.Text;

		this.load.on('progress', (p: number) => {
			this.progressBar.setSize(this.width * p, this.progressBar.height);
			this.progressText.setText(`${Math.floor(p * 100)}%`).setPosition(this.width * p - 5, this.progressText.y);
		});

		this.load.audio('bgm', '/assets/guratanabata/bgm.mp3');

		this.load.audio('paperslide1', '/assets/guratanabata/sfx/paperslide1.mp3');
		this.load.audio('paperslide2', '/assets/guratanabata/sfx/paperslide2.mp3');
		this.load.audio('paperslide3', '/assets/guratanabata/sfx/paperslide3.mp3');

		if (this.registry.get('canPlayWebm')) this.load.video('gura', '/assets/guratanabata/gura.webm', undefined, true, true);
		else {
			for (let i = 1; i <= 38; i++) {
				this.load.image(`gura-frame${i}`, `/assets/guratanabata/fallback/frames/final-${i.toString().padStart(4, '0')}.png`);
			}
		}

		const urls: Record<string, string> = {};
		(this.registry.get('submissions') ?? [])
			.filter((s: TanabataSubmission) => s.type === 'image')
			.forEach((s: TanabataSubmission) => {
				const key = `submission-image-${s.author}`;

				this.load.image(`${key}-thumb`, s.media!.thumbnail);
				this.load.image(key, s.media!.full);
				urls[key] = s.media!.url;
			});
		this.registry.set('submissionURLs', urls);

		if (!this.registry.get('useFallback')) this.loadDefault();
		else this.loadFallback();

		this.load.once('complete', () => loading.destroy());
	}

	create() {
		// @ts-ignore
		const match = window.location.pathname?.match(/\/projects\/(?<slug>[a-zA-Z0-9\-_]+)/i);

		this.progressBar.destroy();
		this.progressText.destroy();
		this.addScenes();

		const formatted = this.ui.convertTo2D(this.ui.shuffle(this.registry.get('submissions') ?? []), 5);
		this.registry.set('submissions', formatted);

		if (!this.registry.get('canPlayWebm')) {
			this.anims.create({
				key: 'gura',
				frames: Array(38).fill(0).map((_, i) => ({ key: `gura-frame${i + 1}` })),
				frameRate: 12,
				repeat: -1,
			});
		}

		this.infoButton = this.add.image(10, this.height, 'info')
			.setOrigin(0, 1)
			.setDepth(5)
			.setScale(0.8)
			.setInteractive({ pixelPerfect: true, cursor: 'pointer' })
			.on('pointerup', () => this.toggleInfo());

		this.bgmControl = this.add.image(this.infoButton.width - 10, this.height, 'play')
			.setOrigin(0, 1)
			.setDepth(5)
			.setScale(0.8)
			.setInteractive({ pixelPerfect: true, cursor: 'pointer' })
			.on('pointerup', () => this.toggleBGM());

		this.milestoneToggle = this.add.image(this.width - 5, this.height, `toggle${match?.groups?.slug === 'gura3mil' ? '4' : '3'}`)
			.setOrigin(1, 1)
			.setDepth(5)
			.setScale(0.8)
			.setInteractive({ pixelPerfect: true, cursor: 'pointer' })
			.once('pointerup', () => this.toggleMilestone());

		this.scene.launch('splash');

		this.scene.get('splash').input.on('pointerup', () => this.fadeOutMilestone());

		this.sound.once('unlocked', () => {
			try {
				// @ts-expect-error
				this.bgm = SoundFade.fadeIn(this, 'bgm', 500, 0.2, 0).setLoop(true);
				this.toggleBGM();
				// eslint-disable-next-line no-empty
			} catch {}
		});
	}

	toggleBGM() {
		const ctrl = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
		if (ctrl.isDown) {
			window.open('https://bit.ly/guraTanabata', '_blank', 'noopener noreferrer');
			return ctrl.destroy();
		}

		this.bgmPlaying = !this.bgmPlaying;

		if (this.bgmPlaying) {
			this.bgmControl?.setTexture('pause');
			this.bgm?.resume();
		} else {
			this.bgmControl?.setTexture('play');
			this.bgm?.pause();
		}

		return true;
	}

	toggleInfo() {
		if (this.showingInfo) return (this.scene.get('info') as import('./info').default).close();
		this.showingInfo = true;

		return this.scene.launch('info').get('info').events.once('shutdown', () => { this.showingInfo = false; });
	}

	toggleMilestone() {
		if (this.showingInfo) return;
		if (this.exiting) return;

		this.exiting = true;
		this.game.destroy(true);

		this.game.events.once('destroy', () => {
			// @ts-ignore
			const match = window.location.pathname?.match(/\/projects\/(?<slug>[a-zA-Z0-9\-_]+)/i);

			// NOTE: This uses location.pathname because we need a full reload, for
			// whatever reason, Phaser doesn't like to play nice with SPAs.
			if (match?.groups?.slug === 'gura3mil') {
				// eslint-disable-next-line no-restricted-globals
				location.pathname = '/projects/gura4mil';
			} else {
				// eslint-disable-next-line no-restricted-globals
				location.pathname = '/projects/gura3mil';
			}
		});
	}

	fadeOutMilestone() {
		this.tweens.createTimeline().add({
			targets: this.milestoneToggle,
			ease: 'Sine.easeInOut',
			alpha: 0,
			duration: 1000,
		}).play();

		this.scene.get('main').events.once('shutdown', () => this.fadeInMilestone());
	}

	fadeInMilestone() {
		this.tweens.createTimeline().add({
			targets: this.milestoneToggle,
			ease: 'Sine.easeInOut',
			alpha: 1,
			duration: 1000,
		}).play();

		this.scene.get('splash').input.once('pointerup', () => this.fadeOutMilestone());
	}

	loadDefault() {
		this.load.image('info', '/assets/guratanabata/info.webp');
		this.load.image('pause', '/assets/guratanabata/pause.webp');
		this.load.image('play', '/assets/guratanabata/play.webp');
		this.load.image('close', '/assets/guratanabata/close.webp');
		this.load.image('title3', '/assets/guratanabata/title3.webp');
		this.load.image('title4', '/assets/guratanabata/title4.webp');
		this.load.image('toggle3', '/assets/guratanabata/toggle3.webp');
		this.load.image('toggle4', '/assets/guratanabata/toggle4.webp');
		this.load.image('back', '/assets/guratanabata/back.webp');
		this.load.image('home', '/assets/guratanabata/home.webp');
		this.load.image('down', '/assets/guratanabata/down.webp');

		this.load.image('zoomed1', '/assets/guratanabata/zoomedin1.webp');
		this.load.image('zoomed2', '/assets/guratanabata/zoomedin2.webp');
		this.load.image('zoomed3', '/assets/guratanabata/zoomedin3.webp');

		this.load.image('bg', '/assets/guratanabata/bg.webp');
		this.load.image('infoBG', '/assets/guratanabata/infoBackground.webp');
		this.load.image('footer', '/assets/guratanabata/footer.webp');

		this.load.image('blue', '/assets/guratanabata/papers/blue.webp');
		this.load.image('orange', '/assets/guratanabata/papers/orange.webp');
		this.load.image('purple', '/assets/guratanabata/papers/purple.webp');
		this.load.image('red', '/assets/guratanabata/papers/red.webp');
		this.load.image('white', '/assets/guratanabata/papers/white.webp');

		this.load.image('bamboo', '/assets/guratanabata/bamboo5.webp');
	}

	loadFallback() {
		this.load.image('info', '/assets/guratanabata/fallback/info.png');
		this.load.image('pause', '/assets/guratanabata/fallback/pause.png');
		this.load.image('play', '/assets/guratanabata/fallback/play.png');
		this.load.image('close', '/assets/guratanabata/fallback/close.png');
		this.load.image('title3', '/assets/guratanabata/fallback/title3.png');
		this.load.image('title4', '/assets/guratanabata/fallback/title4.png');
		this.load.image('toggle3', '/assets/guratanabata/fallback/toggle3.png');
		this.load.image('toggle4', '/assets/guratanabata/fallback/toggle4.png');
		this.load.image('back', '/assets/guratanabata/fallback/back.png');
		this.load.image('home', '/assets/guratanabata/fallback/home.png');
		this.load.image('down', '/assets/guratanabata/fallback/down.png');

		this.load.image('zoomed1', '/assets/guratanabata/fallback/zoomedin1.jpg');
		this.load.image('zoomed2', '/assets/guratanabata/fallback/zoomedin2.jpg');
		this.load.image('zoomed3', '/assets/guratanabata/fallback/zoomedin3.jpg');

		this.load.image('bg', '/assets/guratanabata/fallback/bg.jpg');
		this.load.image('infoBG', '/assets/guratanabata/fallback/infoBackground.png');
		this.load.image('footer', '/assets/guratanabata/fallback/footer.jpg');

		this.load.image('blue', '/assets/guratanabata/fallback/papers/blue.png');
		this.load.image('orange', '/assets/guratanabata/fallback/papers/orange.png');
		this.load.image('purple', '/assets/guratanabata/fallback/papers/purple.png');
		this.load.image('red', '/assets/guratanabata/fallback/papers/red.png');
		this.load.image('white', '/assets/guratanabata/fallback/papers/white.png');

		this.load.image('bamboo', '/assets/guratanabata/fallback/bamboo5.png');
	}

	addScenes() {
		this.scene.add('main', Main);
		this.scene.add('splash', Splash);
		this.scene.add('fullPaper', FullPaper);
		this.scene.add('info', Info);
		this.scene.bringToTop(this);
	}
}

export default Index;
export const plugins = {
	global: [
		{
			key: 'GoogleFontsPlugin',
			plugin: GoogleFontsPlugin,
			start: true,
		},
		{
			key: 'rexAwaitLoader',
			plugin: AwaitLoaderPlugin,
			start: true,
		},
		{
			key: 'rexContainerLitePlugin',
			plugin: ContainerLitePlugin,
			start: true,
		},
		{
			key: 'rexBBCodeTextPlugin',
			plugin: BBCodeTextPlugin,
			start: true,
		},
		NineSlicePlugin.DefaultCfg,
	],
	scene: [
		{
			key: 'UI',
			plugin: UIPl,
			mapping: 'ui',
		},
		{
			key: 'rexUI',
			plugin: RexUIPlugin,
			mapping: 'rexUI',
		},
	],
};
