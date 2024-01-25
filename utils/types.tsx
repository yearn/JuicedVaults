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
};

export type TPriceData = {
	underlyingToken: TNormalizedBN;
	vaultToken: TNormalizedBN;
	rewardToken: TNormalizedBN;
};

export type TVaultData = TVaultListItem & {
	onChainData:
		| {
				totalVaultSupply: TNormalizedBN;
				vaultBalanceOf: TNormalizedBN;
				tokenBalanceOf: TNormalizedBN;
				totalStakingSupply: TNormalizedBN;
				stakingBalanceOf: TNormalizedBN;
				rewardEarned: TNormalizedBN;

				autoCoumpoundingVaultSupply: TNormalizedBN;
				autoCoumpoundingVaultBalance: TNormalizedBN;
				stakingAPR: number;
		  }
		| undefined;
	prices: TPriceData | undefined;
	yDaemonData: TYDaemonVault;
	yDaemonAutoCompoundingData: TYDaemonVault | undefined;
};
