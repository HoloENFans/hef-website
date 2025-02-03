import { Texture, TextStyle, Assets } from 'pixi.js';
import { useEffect, useState } from 'react';

interface GenericCreditNode {
	type: string;
}

interface ContainerNode extends GenericCreditNode {
	type: 'container';
	x?: number;
	y?: number;
	children: CreditNode[];
}

interface TextNode extends GenericCreditNode {
	type: 'text';
	text: string;
	fontWeight?: string;
	fontSize?: number;
	fill?: string;
	x: number;
	y: number;
	url?: string;
}

interface PersonNode extends GenericCreditNode {
	type: 'person';
	x: number;
	avatar: string;
	name: string;
	nameX?: number;
	socials?: {
		x: number;
		icon: string;
		url: string;
	}[];
}

interface LineNode extends GenericCreditNode {
	type: 'line';
	x: number;
	y: number;
	startX: number;
	endX: number;
}

export type CreditNode = ContainerNode | TextNode | PersonNode | LineNode;

function Avatar({ src }: { src: string }) {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		setReady(false);
	}, [src]);

	useEffect(() => {
		if (!ready) {
			(async () => {
				await Assets.load(src);

				setReady(true);
			})();
		}
	}, [ready]);

	if (!ready) return null;

	return (
		<pixiSprite
			texture={Texture.from(src)}
			width={128}
			height={128}
		/>
	);
}

function SocialLink({
	url, icon, x, textColor,
}: { url: string, icon: string, x: number, textColor: number }) {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		setReady(false);
	}, [icon]);

	useEffect(() => {
		if (!ready) {
			(async () => {
				await Assets.load(icon);

				setReady(true);
			})();
		}
	}, [ready]);

	if (!ready) return null;

	return (
		<pixiSprite
			key={url}
			texture={Texture.from(icon)}
			tint={textColor}
			width={18}
			height={18}
			y={140}
			x={x}
			eventMode="static"
			cursor="pointer"
			onPointerUp={() => window.open(url, '_blank', 'noopener')}
		/>
	);
}

// eslint-disable-next-line max-len
export default function CreditsRenderer({ nodes, textColor, linkColor }: { nodes: CreditNode[], textColor: number, linkColor: number }) {
	return nodes.map((node) => {
		switch (node.type) {
			case 'container': {
				return (
					<pixiContainer
						key={`container-${node.x}:${node.y}`}
						x={node.x}
						y={node.y}
					>
						<CreditsRenderer
							nodes={node.children}
							textColor={textColor}
							linkColor={linkColor}
						/>
					</pixiContainer>
				);
			}
			case 'text': {
				const textStyle: any = { fill: textColor };

				if (node.fontSize) textStyle.fontSize = node.fontSize;
				if (node.fontWeight) textStyle.fontWeight = node.fontWeight;

				return (
					<pixiText
						key={`text-${node.x}:${node.y}`}
						text={node.text}
						style={textStyle as TextStyle}
						x={node.x}
						y={node.y}
						anchor={{ x: 0.5, y: 0 }}
						scale={1}
						eventMode={node.url ? 'static' : undefined}
						cursor={node.url && 'pointer'}
						onPointerUp={node.url ? () => window.open(node.url, '_blank', 'noopener') : undefined}
					/>
				);
			}
			case 'line': {
				return (
					<pixiContainer
						key={`line-${node.x}:${node.y}`}
						x={node.x}
						y={node.y}
						anchor={{ x: 0.5, y: 0 }}
					>
						<pixiGraphics
							draw={(g) => {
								g
									.moveTo(node.startX, 0)
									.lineTo(node.endX, 0)
									.stroke({ width: 2, color: textColor, alpha: 0.8 });
							}}
						/>
					</pixiContainer>
				);
			}
			case 'person': {
				return (
					<pixiContainer
						key={`person-${node.x}-${node.name}`}
						x={node.x}
						y={0}
					>
						<Avatar
							src={node.avatar}
						/>
						<pixiText
							text={node.name}
							style={{
								fill: textColor,
								fontWeight: 'bold',
								fontSize: 16,
							} as TextStyle}
							x={node.nameX ?? 52}
							y={140}
							anchor={{ x: 0.5, y: 0 }}
							scale={1}
						/>
						{node.socials && node.socials.map((social) => (
							<SocialLink
								key={social.url}
								url={social.url}
								icon={social.icon}
								x={social.x}
								textColor={textColor}
							/>
						))}
					</pixiContainer>
				);
			}
			default:
				return null;
		}
	});
}
