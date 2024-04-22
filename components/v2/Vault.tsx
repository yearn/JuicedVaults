import {useEffect, useMemo, useState} from 'react';
import {GridViewVault} from 'components/v2/GridViewVault';
import {ListViewVault} from 'components/v2/ListViewVault';
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
import {getVaultAPR, toSafeChainID} from '@utils/helpers';
import {erc20ABI} from '@wagmi/core';
import {useYDaemonBaseURI} from '@yearn-finance/web-lib/hooks/useYDaemonBaseURI';
import {yDaemonVaultSchema} from '@yearn-finance/web-lib/utils/schemas/yDaemonVaultsSchemas';

import type {ReactElement} from 'react';
import type {TYDaemonPricesChain} from '@yearn-finance/web-lib/utils/schemas/yDaemonPricesSchema';
import type {TYDaemonVault} from '@yearn-finance/web-lib/utils/schemas/yDaemonVaultsSchemas';
import type {TVault, TVaultData, TVaultListItem} from '@utils/types';

export function VaultV2(props: {
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
				abi: erc20ABI,
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

	const extraAPR = getVaultAPR(yDaemonVault);

	useEffect(() => {
		if (!onChainData) {
			return;
		}

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

		set_onChainVault({
			totalVaultSupply: toNormalizedBN(decodeAsBigInt(onChainData[0]), vault.decimals),
			vaultBalanceOf,
			tokenBalanceOf: isZeroAddress(address)
				? zeroNormalizedBN
				: toNormalizedBN(decodeAsBigInt(onChainData[2]), vault.decimals),
			totalStakingSupply: rewardContractTotalSupply,
			stakingBalanceOf,
			rewardEarned,
			autoCoumpoundingVaultSupply,
			autoCoumpoundingVaultBalance,
			weeklyStakingRewards: rewardsPerWeek,
			vaultPricePerShare,
			autoCompoundingVaultPricePerShare
		});

		const autoCompoundingDeposit =
			(vaultBalanceOf?.normalized || 0) *
			(vaultPricePerShare.normalized || 0) *
			(pricesForVault?.vaultToken.normalized || 0);

		const rewardsDeposit =
			(stakingBalanceOf?.normalized || 0) *
			(vaultPricePerShare.normalized || 0) *
			(pricesForVault?.vaultToken.normalized || 0);

		const autoCompoundTvl =
			(autoCoumpoundingVaultSupply?.normalized || 0) * (pricesForVault?.vaultToken.normalized || 0);
		const rewardTvl = (rewardContractTotalSupply?.normalized || 0) * (pricesForVault?.vaultToken.normalized || 0);

		const rewardValue = rewardsPerWeek * (pricesForVault?.rewardToken.normalized || 0);
		const rewardClaimable = rewardEarned.normalized * (pricesForVault?.rewardToken.normalized || 0);

		const apr = expectedAutoCompoundAPR + extraAPR;

		if (isNumber(apr)) {
			registerNewVault?.({
				vaultAddress: vault.vaultAddress,
				totalDeposit: autoCompoundingDeposit + rewardsDeposit,
				apr,
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
		registerNewVault,
		expectedAutoCompoundAPR,
		pricesForVault,
		extraAPR
	]);

	if (isListView) {
		return (
			<ListViewVault
				vault={vault}
				prices={pricesForVault}
				yDaemonData={yDaemonVault as TYDaemonVault}
				onChainData={onChainVault}
				expectedAutoCompoundAPR={expectedAutoCompoundAPR}
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
			expectedAutoCompoundAPR={expectedAutoCompoundAPR}
			onRefreshVaultData={onRefreshVaultData}
		/>
	);
}
