import React from 'react';

import type {ReactElement} from 'react';

function IconGrid(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg
			{...props}
			xmlns={'http://www.w3.org/2000/svg'}
			viewBox={'0 0 512 512'}>
			<path
				className={'fill-neutral-900'}
				d={
					'M480 72c0-22.1-17.9-40-40-40H328c-22.1 0-40 17.9-40 40V184c0 22.1 17.9 40 40 40H440c22.1 0 40-17.9 40-40V72zM224 328c0-22.1-17.9-40-40-40H72c-22.1 0-40 17.9-40 40V440c0 22.1 17.9 40 40 40H184c22.1 0 40-17.9 40-40V328z'
				}
			/>
			<path
				className={'fill-neutral-900/40'}
				d={
					'M224 80c0-26.5-21.5-48-48-48H80C53.5 32 32 53.5 32 80v96c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48V80zM480 336c0-26.5-21.5-48-48-48H336c-26.5 0-48 21.5-48 48v96c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48V336z'
				}
			/>
		</svg>
	);
}

export {IconGrid};
