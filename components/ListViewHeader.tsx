import {cl} from '@builtbymom/web3/utils';
import {IconGrid} from '@icons/IconGrid';
import {IconList} from '@icons/IconList';

import type {ReactElement} from 'react';

export function ListViewHeader({
	isListView,
	updateListView
}: {
	isListView: boolean;
	updateListView: (value: boolean) => void;
}): ReactElement {
	return (
		<div
			className={cl(
				'hidden lg:flex flex-row gap-4 px-10',
				isListView ? 'col-span-1' : 'col-span-1 lg:col-span-2'
			)}>
			<div
				className={cl(
					'w-4/12 items-center justify-between',
					isListView ? '' : 'invisible pointer-events-none'
				)}>
				<b className={'text-xs'}>{'Vault'}</b>
			</div>
			<div className={cl('grid w-4/12 grid-cols-6 gap-2', isListView ? '' : 'invisible pointer-events-none')}>
				<button
					onClick={() => document.getElementById('trigger-filterAPY')?.click()}
					className={'col-span-2 text-left text-xs'}>
					{'APY'}
				</button>
				<button
					onClick={() => document.getElementById('trigger-filterIncentive')?.click()}
					className={'col-span-2 text-left text-xs'}>
					{'Incentives'}
				</button>
				<button
					onClick={() => document.getElementById('trigger-filterTVL')?.click()}
					className={'col-span-2 text-left text-xs'}>
					{'TVL'}
				</button>
			</div>
			<div
				className={cl('grid w-4/12 grid-cols-5 gap-2 pl-4', isListView ? '' : 'invisible pointer-events-none')}>
				<button
					onClick={() => document.getElementById('trigger-filterDeposited')?.click()}
					className={'col-span-3 text-left text-xs'}>
					{'Your deposit'}
				</button>
				<button
					onClick={() => document.getElementById('trigger-filterClaimable')?.click()}
					className={'col-span-2 text-left text-xs'}>
					{'Claimable'}
				</button>
			</div>
			<div className={'relative flex w-20 flex-row justify-end gap-4 text-right'}>
				<IconGrid
					className={cl(
						'size-4 cursor-pointer text-neutral-900 absolute transition-opacity',
						isListView ? 'pointer-events-auto' : 'opacity-0 pointer-events-none'
					)}
					onClick={() => updateListView(!isListView)}
				/>
				<IconList
					className={cl(
						'size-4 cursor-pointer text-neutral-900 absolute transition-opacity',
						isListView ? 'opacity-0 pointer-events-none' : 'pointer-events-auto'
					)}
					onClick={() => updateListView(!isListView)}
				/>
			</div>
		</div>
	);
}
