import type {TYDaemonVault} from '@yearn-finance/web-lib/utils/schemas/yDaemonVaultsSchemas';
import type {TAddress, TNormalizedBN} from '@builtbymom/web3/types';

export type TVaultListItem = {
	name: string;
	tokenSymbol: string;
	rewardSymbol: string;
	decimals: number;
	chainID: number;
	vaultAddress: TAddress;
	tokenAddress: TAddress;
	stakingAddress: TAddress;
	rewardAddress: TAddress;
	autoCompoundingAddress: TAddress;
	version: 1 | 2;
};

export type TPriceData = {
	underlyingToken: TNormalizedBN;
	vaultToken: TNormalizedBN;
	rewardToken: TNormalizedBN;
};

export type TVaultOnchainData = {
	totalVaultSupply: TNormalizedBN;
	vaultBalanceOf: TNormalizedBN;
	tokenBalanceOf: TNormalizedBN;
	totalStakingSupply: TNormalizedBN;
	stakingBalanceOf: TNormalizedBN;
	rewardEarned: TNormalizedBN;
	vaultPricePerShare: TNormalizedBN;
	autoCompoundingVaultPricePerShare: TNormalizedBN;

	autoCoumpoundingVaultSupply: TNormalizedBN;
	autoCoumpoundingVaultBalance: TNormalizedBN;
	weeklyStakingRewards: number;
	unlockedShares: TNormalizedBN;
};

export type TVaultData = TVaultListItem & {
	onChainData: TVaultOnchainData | undefined;
	prices: TPriceData | undefined;
	yDaemonData: TYDaemonVault;
	autoCompoundingAPR: number;
};

export type TVault = {
	totalDeposit: number;
	vaultAddress: TAddress;
	isFetched: boolean;
	apr: number;
	tvl: number;
	rewardValue: number;
	rewardClaimable: number;
};

export type TVaultUIProps = {
	vault: TVaultListItem;
	onChainData?: TVaultOnchainData;
	prices?: TPriceData;
	yDaemonData: TYDaemonVault;
	onRefreshVaultData: () => void;
	expectedAutoCompoundAPR: number;
};
