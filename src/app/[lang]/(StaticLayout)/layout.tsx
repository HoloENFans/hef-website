import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import NoticeBannerWrapper from '@/components/ui/NoticeBannerWrapper';
import { Language } from '@/lib/i18n/languages';
import DarkModeProvider from '@/components/contexts/DarkModeProvider';

interface IProps {
	children: React.ReactNode;
	params: Promise<{
		lang: Language;
	}>
}

export default async function RootLayout({ params, children }: IProps) {
	const {
		lang,
	} = await params;

	return (
		<body>
			<DarkModeProvider>
				<Navbar
					flags={[]}
					noticeBanner={
						<NoticeBannerWrapper lang={lang} />
					}
					locale={lang}
				/>
				<main>
					{children}
				</main>
				<Footer flags={[]} />
			</DarkModeProvider>
		</body>
	);
}
