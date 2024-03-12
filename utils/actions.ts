import {assert, assertAddress} from '@builtbymom/web3/utils';
import {handleTx, toWagmiProvider} from '@builtbymom/web3/utils/wagmi/provider';
import {ZAP_ABI} from '@utils/abi/zap.abi';

import {YVAULT_STAKING_ABI} from './abi/yVaultStaking.abi';
import {YVAULT_V3_ABI} from './abi/yVaultV3.abi';

import type {TAddress} from '@builtbymom/web3/types';
import type {TTxResponse} from '@builtbymom/web3/utils/wagmi';
import type {TWriteTransaction} from '@builtbymom/web3/utils/wagmi/provider';

/* 🔵 - Yearn Finance **********************************************************
 ** redeemV3Shares is a _WRITE_ function that withdraws a share of underlying
 ** collateral from a v3 vault.
 **
 ** @app - Vaults
 ** @param amount - The amount of ETH to withdraw.
 ******************************************************************************/
type TRedeemV3Shares = TWriteTransaction & {
	amount: bigint;
};
export async function redeemV3Shares(props: TRedeemV3Shares): Promise<TTxResponse> {
	assert(props.amount > 0n, 'Amount is 0');
	assertAddress(props.contractAddress);
	const wagmiProvider = await toWagmiProvider(props.connector);
	assertAddress(wagmiProvider.address, 'wagmiProvider.address');

	return await handleTx(
		{...props, shouldDisplayErrorToast: true, shouldDisplaySuccessToast: false},
		{
			address: props.contractAddress,
			abi: YVAULT_V3_ABI,
			functionName: 'redeem',
			args: [props.amount, wagmiProvider.address, wagmiProvider.address, 1n], // 1n is 0.01% max_loss in BPS
			confirmation: 1
		}
	);
}

/* 🔵 - Yearn Finance **********************************************************
 ** depositERC20 is a _WRITE_ function that deposits an ERC20 token into a
 ** vault.
 **
 ** @app - Vaults
 ** @param amount - The amount of ERC20 to deposit.
 ******************************************************************************/
type TDepositERC20Args = TWriteTransaction & {
	amount: bigint;
};
export async function depositERC20(props: TDepositERC20Args): Promise<TTxResponse> {
	assertAddress(props.contractAddress);
	assert(props.amount > 0n, 'Amount is 0');
	assert(props.connector, 'No connector');

	const wagmiProvider = await toWagmiProvider(props.connector);

	console.log(
		'wtf',
		{...props, shouldDisplayErrorToast: true, shouldDisplaySuccessToast: false},
		{
			address: props.contractAddress,
			abi: YVAULT_V3_ABI,
			functionName: 'deposit',
			args: [props.amount, wagmiProvider.address],
			confirmation: 1
		}
	);
	return await handleTx(
		{...props, shouldDisplayErrorToast: true, shouldDisplaySuccessToast: false},
		{
			address: props.contractAddress,
			abi: YVAULT_V3_ABI,
			functionName: 'deposit',
			args: [props.amount, wagmiProvider.address],
			confirmation: 1
		}
	);
}

/* 🔵 - Yearn Finance **********************************************************
 ** stakeERC20 is a _WRITE_ function that deposits an ERC20 token into a
 ** staking contract.
 **
 ** @app - Vaults
 ** @param amount - The amount of ERC20 to stake.
 ******************************************************************************/
type TStakeERC20Args = TWriteTransaction & {
	amount: bigint;
};
export async function stakeERC20(props: TStakeERC20Args): Promise<TTxResponse> {
	assertAddress(props.contractAddress);
	assert(props.amount > 0n, 'Amount is 0');
	assert(props.connector, 'No connector');

	return await handleTx(
		{...props, shouldDisplayErrorToast: true, shouldDisplaySuccessToast: false},
		{
			address: props.contractAddress,
			abi: YVAULT_STAKING_ABI,
			functionName: 'stake',
			args: [props.amount],
			confirmation: 1
		}
	);
}

/* 🔵 - Yearn Finance **********************************************************
 ** exit is a _WRITE_ function that withdraw all staked ERC20 tokens from a
 ** staking contract, and claims any rewards.
 **
 ** @app - Vaults
 ******************************************************************************/
type TExit = TWriteTransaction;
export async function exit(props: TExit): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assertAddress(props.contractAddress, 'contractAddress');

	return await handleTx(
		{...props, shouldDisplayErrorToast: true, shouldDisplaySuccessToast: false},
		{
			address: props.contractAddress,
			abi: YVAULT_STAKING_ABI,
			functionName: 'exit',
			confirmation: 1
		}
	);
}

/* 🔵 - Yearn Finance **********************************************************
 ** unstakeSome is a _WRITE_ function that withdraw some staked ERC20 tokens
 ** from a staking contract.
 **
 ** @app - Vaults
 ******************************************************************************/
type TUnstake = TWriteTransaction & {
	amount: bigint;
};
export async function unstakeSome(props: TUnstake): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assert(props.amount > 0n, 'Amount is 0');
	assertAddress(props.contractAddress, 'contractAddress');

	return await handleTx(
		{...props, shouldDisplayErrorToast: true, shouldDisplaySuccessToast: false},
		{
			address: props.contractAddress,
			abi: YVAULT_STAKING_ABI,
			functionName: 'withdraw',
			args: [props.amount],
			confirmation: 1
		}
	);
}

/* 🔵 - Yearn Finance **********************************************************
 ** claimRewards is a _WRITE_ function that claims any rewards from a staking
 ** contract.
 **
 ** @app - Vaults
 ******************************************************************************/
type TClaimRewards = TWriteTransaction;
export async function claimRewards(props: TClaimRewards): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assertAddress(props.contractAddress, 'contractAddress');

	return await handleTx(
		{...props, shouldDisplayErrorToast: true, shouldDisplaySuccessToast: false},
		{
			address: props.contractAddress,
			abi: YVAULT_STAKING_ABI,
			functionName: 'getReward',
			confirmation: 1
		}
	);
}

/* 🔵 - Yearn Finance **********************************************************
 ** ZapIn is a _WRITE_ function that allows a user to deposit a token into an
 ** earning position directly.
 **
 ** @app - Vaults
 ******************************************************************************/
type TZapIn = TWriteTransaction & {
	amount: bigint;
	vaultAddress: TAddress;
};
export async function zapIn(props: TZapIn): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assertAddress(props.contractAddress, 'contractAddress');
	assertAddress(props.vaultAddress, 'vaultAddress');
	assert(props.amount > 0n, 'Amount is 0');

	return await handleTx(props, {
		address: props.contractAddress,
		abi: ZAP_ABI,
		functionName: 'zapIn',
		confirmation: 1,
		args: [props.vaultAddress, props.amount]
	});
}

/* 🔵 - Yearn Finance **********************************************************
 ** ZapIn is a _WRITE_ function that allows a user to deposit a token into an
 ** earning position directly.
 **
 ** @app - Vaults
 ******************************************************************************/
type TZapOut = TWriteTransaction & {
	amount: bigint;
	vaultAddress: TAddress;
	exit: boolean;
};
export async function zapOut(props: TZapOut): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assertAddress(props.contractAddress, 'contractAddress');
	assertAddress(props.vaultAddress, 'vaultAddress');
	assert(props.amount > 0n, 'Amount is 0');

	return await handleTx(props, {
		address: props.contractAddress,
		abi: ZAP_ABI,
		functionName: 'zapOut',
		confirmation: 1,
		args: [props.vaultAddress, props.amount, props.exit]
	});
}
