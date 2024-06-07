import { RefObject, useState } from 'react';
import { languages } from '@/lib/i18n/settings';
import ModalTab from './ModalTab';
import ModalTabGeneral from './ModalTabGeneral';
import ModalTabStory from './ModalTabStory';
import ModalTabReader from './ModalTabReader';
import { getNextOption } from '../utils/helper';
import { useMangaContext } from '../context/MangaContext';

interface Props {
	modalRef: RefObject<HTMLDialogElement>;
}

function ReaderModal({ modalRef }: Props) {
	const [selected, setSelected] = useState('General');
	const { readerLanguage, setReaderLanguage } = useMangaContext();
	return (
		<dialog id="info_modal" className="modal" ref={modalRef}>
			<div className="modal-box flex h-[90%] min-w-[50%] max-w-[70%] flex-col justify-between overflow-hidden">
				<div className="flex max-h-[87%] grow flex-col">
					<div className="tabs-lifted flex self-center">
						<ModalTab
							label="General"
							selected={selected}
							setSelected={setSelected}
						/>
						<ModalTab
							label="Story"
							selected={selected}
							setSelected={setSelected}
						/>
						<ModalTab
							label="Reader"
							selected={selected}
							setSelected={setSelected}
						/>
					</div>

					{selected === 'General' && <ModalTabGeneral />}
					{selected === 'Story' && <ModalTabStory />}
					{selected === 'Reader' && <ModalTabReader />}
				</div>
				<div className="modal-action justify-between">
					{/* eslint-disable */}
                    <button
                        className="btn"
                        onClick={() =>
                            setReaderLanguage(
                                getNextOption(readerLanguage, languages)
                            )
                        }
                    >
                        {readerLanguage.toLocaleUpperCase()}
                    </button>
                    <button
                        className="btn"
                        onClick={() =>
                            selected === "Reader"
                                ? modalRef.current?.close()
                                : setSelected(
                                      getNextOption(selected, [
                                          "General",
                                          "Story",
                                          "Reader",
                                      ])
                                  )
                        }
                    >
                        {selected === "Reader" ? "Close" : "Next"}
                    </button>
                    {/* // eslint-enable */}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button className="hover:cursor-default">close</button>
            </form>
        </dialog>
	);
}

export default ReaderModal;
