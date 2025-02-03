import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import NoticeBannerWrapper from '@/components/ui/NoticeBannerWrapper';
import { Language } from '@/lib/i18n/languages';
import DarkModeProvider from '@/components/contexts/DarkModeProvider';
import skins from '@/styles/skins.module.css';
import Header from '@/components/ui/Header';
import fetchForm from '@/lib/fetchForm';

interface IProps {
	children: React.ReactNode;
	params: Promise<{
		id: string;
		lang: Language;
	}>
}

export default async function RootLayout({ params, children }: IProps) {
	const {
		id,
		lang,
	} = await params;

	const form = await fetchForm(id, lang);

	const descriptionSplit = (form?.description ?? '').split('\n');
	const description = [];

	for (let i = 0; i < descriptionSplit.length - 1; i++) {
		description.push(descriptionSplit[i]);
		description.push(<br />);
	}
	description.push(descriptionSplit[descriptionSplit.length - 1]);

	return (
		<body className={form ? skins[form.skin] ?? undefined : undefined}>
			<DarkModeProvider>
				<Navbar
					flags={[]}
					noticeBanner={
						<NoticeBannerWrapper lang={lang} />
					}
					locale={lang}
				/>
				{form && (
					<Header
						title={form.name}
						description={description}
						devprops={[]}
					/>
				)}
				<main>
					{children}
				</main>
				<Footer flags={[]} />
			</DarkModeProvider>
		</body>
	);
}
