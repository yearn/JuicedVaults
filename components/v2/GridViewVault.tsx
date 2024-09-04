import {StakerWithCompounding} from 'components/v2/StakerWithCompounding';
import {StakerWithReward} from 'components/v2/StakerWithReward';
import {useBlockExplorer} from 'hooks/useBlockExplorer';
import {getNetwork} from '@builtbymom/web3/utils/wagmi';
import {toSafeChainID} from '@utils/helpers';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ReactElement} from 'react';
import type {TVaultUIProps} from '@utils/types';

export function GridViewVault(props: TVaultUIProps): ReactElement {
	const {vault, prices, onChainData, yDaemonData, onRefreshVaultData, expectedAutoCompoundAPY} = props;

	const blockExplorer = useBlockExplorer(vault.chainID);

	return (
		<div className={'flex flex-col gap-8 rounded-lg border-4 border-neutral-900 p-4 md:px-8 md:py-6'}>
			<div className={'flex gap-4'}>
				<ImageWithFallback
					alt={vault.tokenSymbol}
					width={56}
					height={56}
					src={`${process.env.SMOL_ASSETS_URL}/token/${toSafeChainID(vault.chainID)}/${vault.tokenAddress}/logo-128.png`}
					className={'size-8'}
				/>
				<div>
					<h3 className={'text-xl font-bold'}>{vault.tokenSymbol}</h3>
					<p>
						{'Choose '}
						<b className={'text-blue'}>{'Auto Compounding'}</b>
						{' to enjoy boosted APY, or '}
						<b className={'text-yellowHover'}>{'Manual Claim'}</b>{' '}
						{'if you want to claim your tokens yourself.'}
					</p>
				</div>
			</div>
			<section className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
				<StakerWithCompounding
					vault={{
						...vault,
						prices: prices,
						onChainData,
						yDaemonData,
						autoCompoundingAPY: expectedAutoCompoundAPY
					}}
					onRefreshVaultData={onRefreshVaultData}
				/>
				<StakerWithReward
					vault={{
						...vault,
						prices,
						onChainData,
						yDaemonData,
						autoCompoundingAPY: expectedAutoCompoundAPY
					}}
					onRefreshVaultData={onRefreshVaultData}
				/>
			</section>
			<footer className={'hidden flex-col justify-end gap-2 text-neutral-600 md:flex md:flex-row md:gap-6'}>
				<p className={'text-xs'}>
					{'Network: '}
					{getNetwork(vault.chainID).name}
				</p>
				<p className={'text-xs '}>
					<span>{'Contract: '}</span>
					<a
						className={'cursor-alias hover:underline'}
						href={`${blockExplorer}/address/${vault.vaultAddress}`}
						target={'_blank'}
						rel={'noreferrer'}>
						{vault.vaultAddress}
					</a>
				</p>
			</footer>
		</div>
	);
}
