import React, {useEffect, useMemo, useState} from 'react';
import {GridViewVault} from 'components/v1/GridViewVault';
import {ListViewVault} from 'components/v1/ListViewVault';
import {erc20Abi} from 'viem';
import {useReadContracts} from 'wagmi';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {useFetch} from '@builtbymom/web3/hooks/useFetch';
import {
	decodeAsBigInt,
	isNumber,
	isZeroAddress,
	toAddress,
	toBigInt,
	toNormalizedBN,
	zeroNormalizedBN
} from '@builtbymom/web3/utils';
import {useIntervalEffect} from '@react-hookz/web';
import {YVAULT_STAKING_ABI} from '@utils/abi/yVaultStaking.abi';
import {YVAULT_V3_ABI} from '@utils/abi/yVaultV3.abi';
import {getVaultAPY, toSafeChainID} from '@utils/helpers';
import {useYDaemonBaseURI} from '@yearn-finance/web-lib/hooks/useYDaemonBaseURI';
import {yDaemonVaultSchema} from '@yearn-finance/web-lib/utils/schemas/yDaemonVaultsSchemas';

import type {ReactElement} from 'react';
import type {TYDaemonPricesChain} from '@yearn-finance/web-lib/utils/schemas/yDaemonPricesSchema';
import type {TYDaemonVault} from '@yearn-finance/web-lib/utils/schemas/yDaemonVaultsSchemas';
import type {TVault, TVaultData, TVaultListItem} from '@utils/types';

export function VaultV1(props: {
	vault: TVaultListItem;
	prices: TYDaemonPricesChain;
	registerNewVault?: (pool: TVault) => void;
	isListView: boolean;
}): ReactElement {
	const {vault, registerNewVault, prices, isListView} = props;

	const {address} = useWeb3();
	const {yDaemonBaseUri} = useYDaemonBaseURI({chainID: toSafeChainID(vault.chainID)});
	const [onChainVault, set_onChainVault] = useState<TVaultData['onChainData']>(undefined);
	const [nonce, set_nonce] = useState<number>(0);

	useIntervalEffect(() => set_nonce(nonce + 1), 3500);

	const {data: yDaemonVault} = useFetch<TYDaemonVault>({
		endpoint: `${yDaemonBaseUri}/vaults/${vault.vaultAddress}`,
		schema: yDaemonVaultSchema
	});

	const {data: onChainData, refetch: onRefreshVaultData} = useReadContracts({
		query: {enabled: nonce % 2 === 0},
		contracts: [
			//Primary vault info
			{
				abi: YVAULT_V3_ABI,
				chainId: vault.chainID,
				address: vault.vaultAddress,
				functionName: 'totalSupply'
			},
			{
				abi: YVAULT_V3_ABI,
				chainId: vault.chainID,
				address: vault.vaultAddress,
				functionName: 'balanceOf',
				args: [toAddress(address)]
			},
			//Underlying token info
			{
				abi: erc20Abi,
				chainId: vault.chainID,
				address: vault.tokenAddress,
				functionName: 'balanceOf',
				args: [toAddress(address)]
			},
			//Staking Accumulator Vault
			{
				abi: YVAULT_STAKING_ABI,
				chainId: vault.chainID,
				address: vault.stakingAddress,
				functionName: 'totalSupply'
			},
			{
				abi: YVAULT_STAKING_ABI,
				chainId: vault.chainID,
				address: vault.stakingAddress,
				functionName: 'balanceOf',
				args: [toAddress(address)]
			},
			{
				abi: YVAULT_STAKING_ABI,
				chainId: vault.chainID,
				address: vault.stakingAddress,
				functionName: 'earned',
				args: [toAddress(address), toAddress(vault.rewardAddress)]
			},
			{
				abi: YVAULT_STAKING_ABI,
				chainId: vault.chainID,
				address: vault.stakingAddress,
				functionName: 'rewardData',
				args: [toAddress(vault.rewardAddress)]
			},
			//Autocoumpounding Accumulator vault
			{
				abi: YVAULT_V3_ABI,
				chainId: vault.chainID,
				address: vault.autoCompoundingAddress,
				functionName: 'totalSupply'
			},
			{
				abi: YVAULT_V3_ABI,
				chainId: vault.chainID,
				address: vault.autoCompoundingAddress,
				functionName: 'balanceOf',
				args: [toAddress(address)]
			},
			// Price per share
			{
				abi: YVAULT_V3_ABI,
				chainId: vault.chainID,
				address: vault.vaultAddress,
				functionName: 'pricePerShare'
			},
			{
				abi: YVAULT_V3_ABI,
				chainId: vault.chainID,
				address: vault.autoCompoundingAddress,
				functionName: 'pricePerShare'
			},
			{
				abi: YVAULT_V3_ABI,
				chainId: vault.chainID,
				address: vault.vaultAddress,
				functionName: 'unlockedShares'
			}
		]
	});

	const pricesForVault = useMemo(() => {
		const chainPrices = prices?.[toSafeChainID(vault.chainID)];
		if (!prices) {
			return undefined;
		}

		return {
			underlyingToken: toNormalizedBN(chainPrices?.[vault.tokenAddress] || 0, 6),
			vaultToken: toNormalizedBN(chainPrices?.[vault.vaultAddress] || 0, 6),
			rewardToken: toNormalizedBN(chainPrices?.[vault.rewardAddress] || 0, 6)
		};
	}, [prices, vault.chainID, vault.rewardAddress, vault.tokenAddress, vault.vaultAddress]);

	const expectedAutoCompoundAPY = useMemo((): number => {
		const weeklyRewards = Number(onChainVault?.weeklyStakingRewards || 0);
		const priceOfRewardToken = Number(pricesForVault?.rewardToken?.normalized || 0);
		const vaultTotalSupply = Number(onChainVault?.totalVaultSupply?.normalized || 0);
		const vaultTokenPrice = Number(pricesForVault?.vaultToken?.normalized || 0);
		const expectedAPY = ((weeklyRewards * priceOfRewardToken) / (vaultTotalSupply * vaultTokenPrice)) * 52 * 100;
		if (isNaN(expectedAPY)) {
			return 0;
		}
		return expectedAPY;
	}, [
		onChainVault?.totalVaultSupply?.normalized,
		onChainVault?.weeklyStakingRewards,
		pricesForVault?.rewardToken?.normalized,
		pricesForVault?.vaultToken?.normalized
	]);

	const extraAPY = getVaultAPY(yDaemonVault);

	useEffect(() => {
		if (!onChainData) {
			return;
		}

		const periodFinish = toBigInt(onChainData?.[6]?.result?.[2]);
		const rewardRate = toNormalizedBN(toBigInt(onChainData?.[6]?.result?.[3]), 18);
		const rewardDuration = toBigInt(onChainData?.[6]?.result?.[1]);
		const rewardsPerWeek = rewardRate.normalized * Number(rewardDuration);
		const rewardContractTotalSupply = toNormalizedBN(decodeAsBigInt(onChainData[3]), vault.decimals);
		const vaultPricePerShare = toNormalizedBN(toBigInt(onChainData?.[9]?.result), vault.decimals);
		const autoCompoundingVaultPricePerShare = toNormalizedBN(toBigInt(onChainData?.[10]?.result), vault.decimals);
		const autoCoumpoundingVaultBalance = isZeroAddress(address)
			? zeroNormalizedBN
			: toNormalizedBN(decodeAsBigInt(onChainData[8]), vault.decimals);
		const stakingBalanceOf = isZeroAddress(address)
			? zeroNormalizedBN
			: toNormalizedBN(decodeAsBigInt(onChainData[4]), vault.decimals);
		const autoCoumpoundingVaultSupply = toNormalizedBN(decodeAsBigInt(onChainData[7]), vault.decimals);
		const vaultBalanceOf = isZeroAddress(address)
			? zeroNormalizedBN
			: toNormalizedBN(decodeAsBigInt(onChainData[1]), vault.decimals);
		const rewardEarned = isZeroAddress(address)
			? zeroNormalizedBN
			: toNormalizedBN(decodeAsBigInt(onChainData[5]), 18);
		const isFinished = periodFinish < Date.now() / 1000;

		set_onChainVault({
			totalVaultSupply: toNormalizedBN(decodeAsBigInt(onChainData[0]), vault.decimals),
			vaultBalanceOf,
			tokenBalanceOf: isZeroAddress(address)
				? zeroNormalizedBN
				: toNormalizedBN(decodeAsBigInt(onChainData[2]), vault.decimals),
			totalStakingSupply: rewardContractTotalSupply,
			stakingBalanceOf: isZeroAddress(address)
				? zeroNormalizedBN
				: toNormalizedBN(decodeAsBigInt(onChainData[4]), vault.decimals),
			rewardEarned,
			autoCoumpoundingVaultSupply,
			autoCoumpoundingVaultBalance,
			weeklyStakingRewards: isFinished ? 0 : rewardsPerWeek,
			vaultPricePerShare,
			autoCompoundingVaultPricePerShare,
			unlockedShares: toNormalizedBN(decodeAsBigInt(onChainData[11]), vault.decimals)
		});

		const autoCompoundingDeposit =
			(autoCoumpoundingVaultBalance?.normalized || 0) *
			(autoCompoundingVaultPricePerShare.normalized || 0) *
			(vaultPricePerShare.normalized || 0);

		const rewardsDeposit = (stakingBalanceOf?.normalized || 0) * (vaultPricePerShare.normalized || 0);

		const vaultDeposit = (vaultBalanceOf?.normalized || 0) * (vaultPricePerShare.normalized || 0);

		const autoCompoundTvl =
			(autoCoumpoundingVaultSupply?.normalized || 0) * (pricesForVault?.vaultToken.normalized || 0);
		const rewardTvl = (rewardContractTotalSupply?.normalized || 0) * (pricesForVault?.vaultToken.normalized || 0);

		const rewardValue = rewardsPerWeek * (pricesForVault?.rewardToken.normalized || 0);
		const rewardClaimable = rewardEarned.normalized * (pricesForVault?.rewardToken.normalized || 0);

		const APY = expectedAutoCompoundAPY + extraAPY;
		if (isNumber(APY)) {
			registerNewVault?.({
				vaultAddress: vault.vaultAddress,
				totalDeposit: vaultDeposit + rewardsDeposit + autoCompoundingDeposit,
				APY,
				tvl: autoCompoundTvl + rewardTvl,
				rewardValue,
				rewardClaimable,
				isFetched: true
			});
		}
	}, [
		address,
		onChainData,
		vault.rewardAddress,
		vault.vaultAddress,
		vault.decimals,
		prices?.[vault.chainID],
		expectedAutoCompoundAPY,
		registerNewVault,
		pricesForVault,
		extraAPY
	]);

	if (isListView) {
		return (
			<ListViewVault
				vault={vault}
				prices={pricesForVault}
				yDaemonData={yDaemonVault as TYDaemonVault}
				onChainData={onChainVault}
				expectedAutoCompoundAPY={expectedAutoCompoundAPY}
				onRefreshVaultData={onRefreshVaultData}
			/>
		);
	}
	return (
		<GridViewVault
			vault={vault}
			prices={pricesForVault}
			yDaemonData={yDaemonVault as TYDaemonVault}
			onChainData={onChainVault}
			expectedAutoCompoundAPY={expectedAutoCompoundAPY}
			onRefreshVaultData={onRefreshVaultData}
		/>
	);
}
