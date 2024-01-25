import React, {useState} from 'react';
import {cl} from '@builtbymom/web3/utils';
import {IconGold} from '@icons/IconGold';
import {IconRecycle} from '@icons/IconRecycle';

import {StakerWithCompounding} from './StakerWithCompounding';
import {StakerWithReward} from './StakerWithReward';

import type {ReactElement} from 'react';
import type {TVaultData} from '@utils/types';

export function VaultChoiceWrapper(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	const [selectedTab, set_selectedTab] = useState<number>(0);

	return (
		<div className={'p-4 md:p-6'}>
			<div
				className={cl(
					'relative border-2 rounded-2xl border-neutral-900 overflow-hidden',
					selectedTab === 0 ? 'bg-blue' : 'bg-orange'
				)}>
				<div className={'grid grid-cols-2'}>
					<button
						onClick={() => set_selectedTab(0)}
						className={cl(
							'flex space-x-2 items-center',
							'w-full rounded-2xl rounded-tl-none rounded-bl-none rounded-tr-none border-b-2 border-r-2 p-2 md:px-8 py-4 text-left',
							selectedTab === 0 ? 'border-transparent' : 'bg-blue border-neutral-900'
						)}>
						<div
							className={cl(
								'hidden md:flex size-12 items-center justify-center rounded-full',
								'bg-pink border-2 border-neutral-900'
							)}>
							<IconRecycle className={'size-8'} />
						</div>
						<b className={'text-base text-neutral-900 md:text-xl'}>{'Extra APR'}</b>
					</button>
					<button
						onClick={() => set_selectedTab(1)}
						className={cl(
							'flex space-x-2 items-center',
							'w-full rounded-2xl rounded-br-none rounded-tl-none rounded-tr-none border-b-2 border-l-2 p-2 md:px-8 py-4 text-left',
							selectedTab === 1 ? 'border-transparent' : 'bg-orange border-neutral-900'
						)}>
						<div
							className={
								'hidden size-12 items-center justify-center rounded-full border-2 border-neutral-900 bg-yellow md:flex'
							}>
							<IconGold className={'size-8'} />
						</div>
						<b className={'text-base text-neutral-900 md:text-xl'}>{`Extra ${props.vault.rewardSymbol}`}</b>
					</button>
				</div>

				{selectedTab === 0 ? <StakerWithCompounding {...props} /> : null}
				{selectedTab === 1 ? <StakerWithReward {...props} /> : null}
			</div>
		</div>
	);
}
