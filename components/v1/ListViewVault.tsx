import {type ReactElement, useMemo} from 'react';
import Link from 'next/link';
import {GridViewVault} from 'components/v1/GridViewVault';
import {cl, formatAmount, formatPercent, formatWithUnit} from '@builtbymom/web3/utils';
import {getNetwork} from '@builtbymom/web3/utils/wagmi';
import {getVaultAPR, toSafeChainID} from '@utils/helpers';
import {Counter} from '@common/Counter';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {TVaultUIProps} from '@utils/types';

export function ListViewVault(props: TVaultUIProps): ReactElement {
	const {vault, onChainData, prices, yDaemonData} = props;

	const depositedAndStaked = useMemo((): number => {
		const vaultValue =
			(onChainData?.vaultBalanceOf?.normalized || 0) * (onChainData?.vaultPricePerShare.normalized || 0);
		const rewardValue =
			(onChainData?.stakingBalanceOf?.normalized || 0) * (onChainData?.vaultPricePerShare.normalized || 0);
		const autocompoundingValue =
			(onChainData?.autoCoumpoundingVaultBalance?.normalized || 0) *
			(onChainData?.autoCompoundingVaultPricePerShare.normalized || 0) *
			(onChainData?.vaultPricePerShare.normalized || 0);

		return vaultValue + rewardValue + autocompoundingValue;
	}, [
		onChainData?.vaultBalanceOf?.normalized,
		onChainData?.stakingBalanceOf?.normalized,
		onChainData?.autoCoumpoundingVaultBalance?.normalized,
		onChainData?.vaultPricePerShare.normalized,
		onChainData?.autoCompoundingVaultPricePerShare.normalized
	]);

	const totalTAL = useMemo((): number => {
		return onChainData?.totalVaultSupply?.normalized || 0;
	}, [onChainData?.totalVaultSupply]);

	const expectedAutoCompoundAPR = useMemo((): number => {
		const weeklyRewards = Number(onChainData?.weeklyStakingRewards || 0);
		const priceOfRewardToken = Number(prices?.rewardToken?.normalized || 0);
		const vaultTotalSupply = Number(onChainData?.totalVaultSupply?.normalized || 0);
		const vaultTokenPrice = Number(prices?.vaultToken?.normalized || 0);
		const expectedAPR = ((weeklyRewards * priceOfRewardToken) / (vaultTotalSupply * vaultTokenPrice)) * 52 * 100;
		if (isNaN(expectedAPR)) {
			return 0;
		}
		return expectedAPR;
	}, [
		onChainData?.totalVaultSupply?.normalized,
		onChainData?.weeklyStakingRewards,
		prices?.rewardToken?.normalized,
		prices?.vaultToken?.normalized
	]);

	const extraAPR = getVaultAPR(yDaemonData);

	const apr = expectedAutoCompoundAPR + extraAPR;

	return (
		<>
			<div
				className={cl(
					'hidden lg:flex flex-col gap-2 rounded-lg border-2 border-neutral-900 bg-beige p-4',
					'lg:flex-row lg:h-[116px]'
				)}>
				<section className={'flex w-4/12 items-center justify-between'}>
					<div className={'flex items-center gap-4'}>
						<ImageWithFallback
							alt={vault.tokenSymbol}
							width={48}
							height={48}
							src={`${process.env.SMOL_ASSETS_URL}/token/${toSafeChainID(vault.chainID)}/${vault.tokenAddress}/logo-128.png`}
							className={'size-8'}
						/>
						<div className={'flex flex-col gap-1'}>
							<h2 className={'text-lg font-bold'}>{vault.name}</h2>
							<p className={'text-xs text-neutral-500'}>{`Deposit: ${vault.tokenSymbol}`}</p>
							<p className={'text-xs text-neutral-500'}>
								{'Network: '}
								{getNetwork(vault.chainID).name}
							</p>
						</div>
					</div>
				</section>

				<section
					className={cl(
						'grid grid-cols-2 gap-2 rounded-lg border-2 border-neutral-900 bg-yellow p-4',
						'w-4/12'
					)}>
					<div className={'col-span-2 grid grid-cols-6 justify-between gap-2 font-bold'}>
						<span
							suppressHydrationWarning
							className={'col-span-2 flex flex-col gap-2'}>
							{formatPercent(apr)}
						</span>
						<span
							suppressHydrationWarning
							className={'col-span-2 flex flex-col gap-2'}>
							{`${formatWithUnit(Number(onChainData?.weeklyStakingRewards || 0), 0, 0, {
								locales: ['en-US']
							})}/week`}
							<span
								suppressHydrationWarning
								className={'col-span-2 text-xs font-normal text-neutral-700'}>
								{`${props.vault.rewardSymbol}`}&nbsp;
							</span>
						</span>
						<span
							suppressHydrationWarning
							className={'col-span-2'}>
							{formatWithUnit(totalTAL * (prices?.underlyingToken?.normalized || 0), 2, 2, {
								locales: ['en-US']
							})}
						</span>
					</div>
				</section>

				<section
					className={cl(
						'grid rounded-lg grid-cols-5 justify-between gap-2 font-bold border-2 border-neutral-900 bg-beige p-4',
						'w-4/12'
					)}>
					<span
						suppressHydrationWarning
						className={'col-span-3 flex flex-col gap-2'}>
						<Counter
							value={depositedAndStaked}
							decimals={4}
						/>
						<span className={'text-xs font-normal text-neutral-500'}>{` ${vault.tokenSymbol}`}</span>
					</span>

					<span
						suppressHydrationWarning
						className={'col-span-2 flex flex-col gap-2'}>
						{onChainData?.rewardEarned?.raw === 0n ? (
							<p className={'font-number font-normal'}>{formatAmount(0)}</p>
						) : (
							<Counter
								value={onChainData?.rewardEarned?.normalized || 0}
								decimals={4}
							/>
						)}
						<span className={'text-xs font-normal text-neutral-500'}>{` ${vault.rewardSymbol}`}</span>
					</span>
				</section>

				<Link href={`/${vault.vaultAddress}`}>
					<button
						className={cl(
							'col-span-1 h-full aspect-square',
							'rounded-lg border-2 border-neutral-900 text-center',
							'bg-blue hover:bg-blueHover transition-colors font-bold text-sm lg:text-base',
							'focus:ring-transparent focus:!border-neutral-900 relative',
							'disabled:bg-neutral-300 disabled:cursor-not-allowed disabled:text-neutral-400'
						)}>
						{'Open'}
					</button>
				</Link>
			</div>
			<div className={'lg:hidden'}>
				<GridViewVault {...props} />
			</div>
		</>
	);
}
