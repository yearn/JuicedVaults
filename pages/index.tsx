import React, {useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import {HeaderTitle} from 'components/HeaderTitle';
import {VaultBasicDeposit} from 'components/VaultBasicDeposit';
import {VaultChoiceWrapper} from 'components/VaultChoiceWrapper';
import {erc20ABI, useContractReads} from 'wagmi';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {useFetch} from '@builtbymom/web3/hooks/useFetch';
import {
	cl,
	decodeAsBigInt,
	isZeroAddress,
	toAddress,
	toBigInt,
	toNormalizedBN,
	truncateHex,
	zeroNormalizedBN
} from '@builtbymom/web3/utils';
import {useAccountModal} from '@rainbow-me/rainbowkit';
import {useIntervalEffect} from '@react-hookz/web';
import {YVAULT_STAKING_ABI} from '@utils/abi/yVaultStaking.abi';
import {YVAULT_V3_ABI} from '@utils/abi/yVaultV3.abi';
import {toSafeChainID} from '@utils/helpers';
import {VAULT_LIST} from '@utils/vaultList';
import {useYDaemonBaseURI} from '@yearn-finance/web-lib/hooks/useYDaemonBaseURI';
import {useYearnPrices} from '@yearn-finance/web-lib/hooks/useYearnPrices';
import {yDaemonVaultSchema} from '@yearn-finance/web-lib/utils/schemas/yDaemonVaultsSchemas';

import type {ReactElement} from 'react';
import type {TYDaemonPricesChain} from '@yearn-finance/web-lib/utils/schemas/yDaemonPricesSchema';
import type {TYDaemonVault} from '@yearn-finance/web-lib/utils/schemas/yDaemonVaultsSchemas';
import type {TVaultData, TVaultListItem} from '@utils/types';

function ConnectBox(): ReactElement {
	const {onConnect, address, ens} = useWeb3();
	const {openAccountModal} = useAccountModal();

	return (
		<div className={'z-10 -mt-28 mb-10 w-full md:mb-16 md:w-1/2 md:pr-4'}>
			<div className={'rounded-2xl border-2 border-neutral-900 bg-beige p-6'}>
				<b className={'mb-2 block text-xl text-neutral-900'}>{'Freshly squeezed and bursting with yield.'}</b>
				<p className={'mb-4 block whitespace-break-spaces text-base md:text-xl'}>
					{'Let Yearn auto compound your rewards or claim them for yourself. '}
				</p>
				<button
					suppressHydrationWarning
					onClick={address ? openAccountModal : onConnect}
					className={'h-10 rounded-lg border-2 border-neutral-900 bg-yellow px-5 text-base font-bold'}>
					{address && ens ? ens : address ? truncateHex(address, 6) : 'Connect Wallet'}
				</button>
			</div>
		</div>
	);
}

function VaultList(props: {vault: TVaultListItem; prices: TYDaemonPricesChain}): ReactElement {
	const {address} = useWeb3();
	const {yDaemonBaseUri} = useYDaemonBaseURI({chainID: toSafeChainID(props.vault.chainID)});
	const [onChainVault, set_onChainVault] = useState<TVaultData['onChainData']>(undefined);
	const [nonce, set_nonce] = useState<number>(0);

	useIntervalEffect(() => set_nonce(nonce + 1), 3500);

	const {data: yDaemonVault} = useFetch<TYDaemonVault>({
		endpoint: `${yDaemonBaseUri}/vaults/${props.vault.vaultAddress}`,
		schema: yDaemonVaultSchema
	});

	const {data: onChainData, refetch: onRefreshVaultData} = useContractReads({
		watch: true,
		enabled: nonce % 2 === 0,
		contracts: [
			//Primary vault info
			{
				abi: YVAULT_V3_ABI,
				chainId: props.vault.chainID,
				address: props.vault.vaultAddress,
				functionName: 'totalSupply'
			},
			{
				abi: YVAULT_V3_ABI,
				chainId: props.vault.chainID,
				address: props.vault.vaultAddress,
				functionName: 'balanceOf',
				args: [toAddress(address)]
			},
			//Underlying token info
			{
				abi: erc20ABI,
				chainId: props.vault.chainID,
				address: props.vault.tokenAddress,
				functionName: 'balanceOf',
				args: [toAddress(address)]
			},
			//Staking Accumulator Vault
			{
				abi: YVAULT_STAKING_ABI,
				chainId: props.vault.chainID,
				address: props.vault.stakingAddress,
				functionName: 'totalSupply'
			},
			{
				abi: YVAULT_STAKING_ABI,
				chainId: props.vault.chainID,
				address: props.vault.stakingAddress,
				functionName: 'balanceOf',
				args: [toAddress(address)]
			},
			{
				abi: YVAULT_STAKING_ABI,
				chainId: props.vault.chainID,
				address: props.vault.stakingAddress,
				functionName: 'earned',
				args: [toAddress(address), toAddress(props.vault.rewardAddress)]
			},
			{
				abi: YVAULT_STAKING_ABI,
				chainId: props.vault.chainID,
				address: props.vault.stakingAddress,
				functionName: 'rewardData',
				args: [toAddress(props.vault.rewardAddress)]
			},
			//Autocoumpounding Accumulator vault
			{
				abi: YVAULT_V3_ABI,
				chainId: props.vault.chainID,
				address: props.vault.autoCompoundingAddress,
				functionName: 'totalSupply'
			},
			{
				abi: YVAULT_V3_ABI,
				chainId: props.vault.chainID,
				address: props.vault.autoCompoundingAddress,
				functionName: 'balanceOf',
				args: [toAddress(address)]
			},
			// Price per share
			{
				abi: YVAULT_V3_ABI,
				chainId: props.vault.chainID,
				address: props.vault.vaultAddress,
				functionName: 'pricePerShare'
			},
			{
				abi: YVAULT_V3_ABI,
				chainId: props.vault.chainID,
				address: props.vault.autoCompoundingAddress,
				functionName: 'pricePerShare'
			}
		]
	});

	useEffect(() => {
		if (!onChainData) {
			return;
		}

		const rewardRate = toNormalizedBN(toBigInt(onChainData?.[6]?.result?.[3]), 18);
		const rewardDuration = toBigInt(onChainData?.[6]?.result?.[1]);
		const rewardsPerWeek = rewardRate.normalized * Number(rewardDuration);
		const rewardContractTotalSupply = toNormalizedBN(decodeAsBigInt(onChainData[3]), props.vault.decimals);
		const vaultPricePerShare = toNormalizedBN(toBigInt(onChainData?.[9]?.result), props.vault.decimals);
		const autoCompoundingVaultPricePerShare = toNormalizedBN(
			toBigInt(onChainData?.[10]?.result),
			props.vault.decimals
		);
		set_onChainVault({
			totalVaultSupply: toNormalizedBN(decodeAsBigInt(onChainData[0]), props.vault.decimals),
			vaultBalanceOf: isZeroAddress(address)
				? zeroNormalizedBN
				: toNormalizedBN(decodeAsBigInt(onChainData[1]), props.vault.decimals),
			tokenBalanceOf: isZeroAddress(address)
				? zeroNormalizedBN
				: toNormalizedBN(decodeAsBigInt(onChainData[2]), props.vault.decimals),
			totalStakingSupply: rewardContractTotalSupply,
			stakingBalanceOf: isZeroAddress(address)
				? zeroNormalizedBN
				: toNormalizedBN(decodeAsBigInt(onChainData[4]), props.vault.decimals),
			rewardEarned: isZeroAddress(address)
				? zeroNormalizedBN
				: toNormalizedBN(decodeAsBigInt(onChainData[5]), 18),
			autoCoumpoundingVaultSupply: toNormalizedBN(decodeAsBigInt(onChainData[7]), props.vault.decimals),
			autoCoumpoundingVaultBalance: isZeroAddress(address)
				? zeroNormalizedBN
				: toNormalizedBN(decodeAsBigInt(onChainData[8]), props.vault.decimals),
			weeklyStakingRewards: rewardsPerWeek,
			vaultPricePerShare,
			autoCompoundingVaultPricePerShare
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		address,
		onChainData,
		props.vault.rewardAddress,
		props.vault.vaultAddress,
		props.vault.decimals,
		props.prices?.[props.vault.chainID]
	]);

	const pricesForVault = useMemo(() => {
		const prices = props.prices?.[toSafeChainID(props.vault.chainID)];
		if (!prices) {
			return undefined;
		}
		return {
			underlyingToken: toNormalizedBN(prices?.[props.vault.tokenAddress] || 0, 6),
			vaultToken: toNormalizedBN(prices?.[props.vault.vaultAddress] || 0, 6),
			rewardToken: toNormalizedBN(prices?.[props.vault.rewardAddress] || 0, 6)
		};
	}, [
		props.prices,
		props.vault.chainID,
		props.vault.rewardAddress,
		props.vault.tokenAddress,
		props.vault.vaultAddress
	]);

	const expectedAutoCompoundAPR = useMemo((): number => {
		const weeklyRewards = Number(onChainVault?.weeklyStakingRewards || 0);
		const priceOfRewardToken = Number(pricesForVault?.rewardToken?.normalized || 0);
		const vaultTotalSupply = Number(onChainVault?.totalVaultSupply?.normalized || 0);
		const vaultTokenPrice = Number(pricesForVault?.vaultToken?.normalized || 0);
		const expectedAPR = ((weeklyRewards * priceOfRewardToken) / (vaultTotalSupply * vaultTokenPrice)) * 52 * 100;
		if (isNaN(expectedAPR)) {
			return 0;
		}
		return expectedAPR;
	}, [
		onChainVault?.totalVaultSupply?.normalized,
		onChainVault?.weeklyStakingRewards,
		pricesForVault?.rewardToken?.normalized,
		pricesForVault?.vaultToken?.normalized
	]);

	return (
		<div className={'mb-16'}>
			<div className={'flex w-full rounded-2xl bg-neutral-800 pb-3 pr-1'}>
				<div
					className={cl(
						'-mt-2 -ml-2 rounded-2xl border-2 border-neutral-900 bg-beige',
						'grid grid-cols-1 gap-x-0 md:grid-cols-2 md:gap-x-6 w-full h-full'
					)}>
					<VaultBasicDeposit
						vault={{
							...props.vault,
							prices: pricesForVault,
							onChainData: onChainVault,
							yDaemonData: yDaemonVault as TYDaemonVault,
							autoCompoundingAPR: 0
						}}
						onRefreshVaultData={onRefreshVaultData}
					/>
					<VaultChoiceWrapper
						vault={{
							...props.vault,
							prices: pricesForVault,
							onChainData: onChainVault,
							yDaemonData: yDaemonVault as TYDaemonVault,
							autoCompoundingAPR: expectedAutoCompoundAPR
						}}
						onRefreshVaultData={onRefreshVaultData}
					/>
				</div>
			</div>
		</div>
	);
}

function Home(): ReactElement {
	const prices = useYearnPrices();

	return (
		<div>
			<div className={'relative size-full max-h-96 min-h-96 md:max-h-[471px] md:min-h-[471px]'}>
				<Image
					priority
					loading={'eager'}
					quality={95}
					width={1136}
					height={320}
					src={'/hero.svg'}
					alt={'Hero'}
					className={
						'absolute inset-0 max-h-96 min-h-96 w-full object-cover object-center md:max-h-[471px] md:min-h-[471px]'
					}
				/>
				<div className={'mx-auto grid w-full max-w-6xl pt-10 md:pt-24'}>
					<HeaderTitle className={'relative z-20 w-full md:w-[628px]'} />
				</div>
			</div>
			<div className={'h-0.5 w-full bg-neutral-900'} />
			<section className={'mx-auto grid w-full max-w-6xl'}>
				<ConnectBox />
				{VAULT_LIST.map(vault => (
					<VaultList
						key={vault.name}
						prices={prices}
						vault={vault}
					/>
				))}
			</section>
		</div>
	);
}

export default function Wrapper(): ReactElement {
	return <Home />;
}
