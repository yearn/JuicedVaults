import type {ReactElement, SVGProps} from 'react';

export function IconBack(props: SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg
			{...props}
			width={'20'}
			height={'20'}
			viewBox={'0 0 20 20'}
			fill={'none'}
			xmlns={'http://www.w3.org/2000/svg'}>
			<path
				d={'M11.6673 6.66699L8.33398 10.0003L11.6673 13.3337'}
				stroke={'currentColor'}
				stroke-width={'1.5'}
				stroke-linecap={'round'}
				stroke-linejoin={'round'}
			/>
		</svg>
	);
}
