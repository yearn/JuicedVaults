import React, {useCallback, useState} from 'react';
import {erc20ABI, useContractRead} from 'wagmi';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {
	assert,
	assertAddress,
	cl,
	formatAmount,
	formatPercent,
	formatWithUnit,
	isZeroAddress,
	MAX_UINT_256,
	toAddress,
	toBigInt,
	toNormalizedBN
} from '@builtbymom/web3/utils';
import {handleInputChangeValue} from '@builtbymom/web3/utils/handlers';
import {approveERC20, defaultTxStatus} from '@builtbymom/web3/utils/wagmi';
import {IconBigChevron} from '@icons/IconBigChevron';
import {IconSpinner} from '@icons/IconSpinner';
import {claimRewards, exit, redeemV3Shares, stakeERC20} from '@utils/actions';
import {getVaultAPR} from '@utils/helpers';
import {Counter} from '@common/Counter';

import type {ChangeEvent, ReactElement} from 'react';
import type {TNormalizedBN} from '@builtbymom/web3/types';
import type {TVaultData} from '@utils/types';

function StakeSection(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	const {address, provider} = useWeb3();
	const [amount, set_amount] = useState<TNormalizedBN | undefined>(undefined);
	const [approveStatus, set_approveStatus] = useState(defaultTxStatus);
	const [depositStatus, set_depositStatus] = useState(defaultTxStatus);

	const onChangeInput = useCallback(
		(e: ChangeEvent<HTMLInputElement>): void => {
			set_amount(handleInputChangeValue(e.target.value, props.vault.decimals));
		},
		[props.vault.decimals]
	);

	const {data: hasAllowance, refetch: onRefreshAllowance} = useContractRead({
		abi: erc20ABI,
		chainId: props.vault.chainID,
		address: props.vault.vaultAddress,
		functionName: 'allowance',
		args: [toAddress(address), props.vault.stakingAddress],
		select(data) {
			if (isZeroAddress(address) || toBigInt(data) === 0n) {
				return false;
			}
			return toBigInt(data) >= toBigInt(amount?.raw);
		}
	});

	const onApprove = useCallback(async () => {
		if (approveStatus.pending) {
			return;
		}
		assert(provider, 'provider');
		assertAddress(props.vault.stakingAddress, 'props.vault.stakingAddress');
		assertAddress(props.vault.vaultAddress, 'props.vault.vaultAddress');

		const result = await approveERC20({
			connector: provider,
			chainID: props.vault.chainID,
			contractAddress: props.vault.vaultAddress,
			spenderAddress: props.vault.stakingAddress,
			amount: MAX_UINT_256,
			statusHandler: set_approveStatus
		});
		if (result.isSuccessful) {
			onRefreshAllowance();
			props.onRefreshVaultData();
		}
	}, [approveStatus.pending, provider, props, onRefreshAllowance]);

	const onDeposit = useCallback(async (): Promise<void> => {
		const result = await stakeERC20({
			connector: provider,
			chainID: props.vault.chainID,
			amount: toBigInt(amount?.raw),
			contractAddress: props.vault.stakingAddress,
			statusHandler: set_depositStatus
		});
		if (result.isSuccessful) {
			onRefreshAllowance();
			props.onRefreshVaultData();
			set_amount(undefined);
		}
	}, [provider, amount?.raw, props, onRefreshAllowance]);

	function renderApproveButton(): ReactElement {
		return (
			<button
				onClick={onApprove}
				disabled={
					!provider ||
					toBigInt(amount?.raw) === 0n ||
					toBigInt(amount?.raw) > toBigInt(props.vault.onChainData?.vaultBalanceOf?.raw || 0n)
				}
				className={cl(
					'h-10 w-28 min-w-28 rounded-lg border-2 text-base font-bold relative',
					'focus:ring-transparent focus:!border-neutral-600',
					'disabled:bg-neutral-300 bg-[#FEBC02]',
					'border-neutral-600',
					'disabled:cursor-not-allowed',
					'disabled:text-neutral-400 text-neutral-900'
				)}>
				<div
					className={cl(
						'absolute inset-0 flex items-center justify-center transition-opacity',
						approveStatus.pending ? 'opacity-100' : 'opacity-0'
					)}>
					<IconSpinner className={'text-neutral-900'} />
				</div>
				<p className={approveStatus.pending ? 'opacity-0' : 'opacity-100'}>{'Approve'}</p>
			</button>
		);
	}

	function renderStakeButton(): ReactElement {
		return (
			<button
				onClick={onDeposit}
				disabled={
					!provider ||
					toBigInt(amount?.raw) === 0n ||
					toBigInt(amount?.raw) > toBigInt(props.vault.onChainData?.vaultBalanceOf?.raw || 0n)
				}
				className={cl(
					'h-10 w-28 min-w-28 rounded-lg border-2 text-base font-bold relative',
					'focus:ring-transparent focus:!border-neutral-600',
					'disabled:bg-neutral-300 bg-[#FEBC02]',
					'border-neutral-600',
					'disabled:cursor-not-allowed',
					'disabled:text-neutral-400 text-neutral-900'
				)}>
				<div
					className={cl(
						'absolute inset-0 flex items-center justify-center transition-opacity',
						depositStatus.pending ? 'opacity-100' : 'opacity-0'
					)}>
					<IconSpinner className={'text-neutral-900'} />
				</div>
				<p className={depositStatus.pending ? 'opacity-0' : 'opacity-100'}>{'Stake'}</p>
			</button>
		);
	}

	return (
		<div className={'pt-6'}>
			<b className={'mb-2 block'}>{'Stake'}</b>
			<div className={'flex flex-col gap-2 md:flex-row'}>
				<input
					className={cl(
						'h-10 w-full overflow-x-scroll rounded-lg px-2 py-4 font-bold outline-none scrollbar-none',
						'border-2 border-neutral-900 bg-neutral-0 font-normal font-number'
					)}
					placeholder={'0.00'}
					type={'text'}
					autoComplete={'off'}
					value={amount?.normalized || ''}
					onChange={onChangeInput}
				/>
				{hasAllowance ? renderStakeButton() : renderApproveButton()}
			</div>
			<button
				suppressHydrationWarning
				disabled={
					!props.vault.onChainData?.vaultBalanceOf || props.vault.onChainData?.vaultBalanceOf.raw === 0n
				}
				onClick={() => set_amount(props.vault?.onChainData?.vaultBalanceOf || toNormalizedBN(0))}
				className={'mt-1 block pl-2 text-xs text-neutral-900'}>
				{`You have ${formatAmount(props.vault?.onChainData?.vaultBalanceOf?.normalized || 0, 4)} yv${props.vault.tokenSymbol}`}
			</button>
		</div>
	);
}

function UnstakeSection(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	const {provider} = useWeb3();
	const [amount, set_amount] = useState<TNormalizedBN | undefined>(undefined);
	const [withdrawStatus, set_withdrawStatus] = useState(defaultTxStatus);

	const onChangeInput = useCallback(
		(e: ChangeEvent<HTMLInputElement>): void => {
			set_amount(handleInputChangeValue(e.target.value, props.vault.decimals));
		},
		[props.vault.decimals]
	);

	const onUnstake = useCallback(async (): Promise<void> => {
		const result = await redeemV3Shares({
			connector: provider,
			chainID: props.vault.chainID,
			amount: toBigInt(amount?.raw),
			contractAddress: props.vault.stakingAddress,
			statusHandler: set_withdrawStatus
		});
		if (result.isSuccessful) {
			props.onRefreshVaultData();
			set_amount(undefined);
		}
	}, [provider, amount?.raw, props]);

	return (
		<div className={'pt-6'}>
			<b className={'mb-2 block'}>{'Unstake'}</b>
			<div className={'flex flex-col gap-2 md:flex-row'}>
				<input
					className={cl(
						'h-10 w-full overflow-x-scroll rounded-lg px-2 py-4 font-bold outline-none scrollbar-none',
						'border-2 border-neutral-900 bg-neutral-0 font-normal font-number'
					)}
					placeholder={'0.00'}
					type={'text'}
					autoComplete={'off'}
					value={amount?.normalized || ''}
					onChange={onChangeInput}
				/>
				<button
					onClick={onUnstake}
					disabled={
						!provider ||
						toBigInt(amount?.raw) === 0n ||
						toBigInt(amount?.raw) > toBigInt(props.vault.onChainData?.stakingBalanceOf?.raw || 0n)
					}
					className={cl(
						'h-10 w-28 min-w-28 rounded-lg border-2 text-base font-bold relative',
						'focus:ring-transparent focus:!border-neutral-600',
						'disabled:bg-neutral-300 bg-[#FEBC02]',
						'border-neutral-600',
						'disabled:cursor-not-allowed',
						'disabled:text-neutral-400 text-neutral-900'
					)}>
					<div
						className={cl(
							'absolute inset-0 flex items-center justify-center transition-opacity',
							withdrawStatus.pending ? 'opacity-100' : 'opacity-0'
						)}>
						<IconSpinner className={'text-neutral-900'} />
					</div>
					<p className={withdrawStatus.pending ? 'opacity-0' : 'opacity-100'}>{'Unstake'}</p>
				</button>
			</div>
			<button
				suppressHydrationWarning
				disabled={
					!props.vault.onChainData?.stakingBalanceOf || props.vault.onChainData?.stakingBalanceOf.raw === 0n
				}
				onClick={() => set_amount(props.vault?.onChainData?.stakingBalanceOf || toNormalizedBN(0))}
				className={'mt-1 block pl-2 text-xs text-neutral-900'}>
				{`You have ${formatAmount(props.vault?.onChainData?.stakingBalanceOf?.normalized || 0, 4)} yv${props.vault.tokenSymbol} staked`}
			</button>
		</div>
	);
}

function ClaimSection(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	const {provider} = useWeb3();
	const [claimStatus, set_claimStatus] = useState(defaultTxStatus);
	const [exitStatus, set_exitStatus] = useState(defaultTxStatus);

	const onClaim = useCallback(async (): Promise<void> => {
		const result = await claimRewards({
			connector: provider,
			chainID: props.vault.chainID,
			contractAddress: props.vault.stakingAddress,
			statusHandler: set_claimStatus
		});
		if (result.isSuccessful) {
			props.onRefreshVaultData();
		}
	}, [provider, props]);

	const onClaimAndExit = useCallback(async (): Promise<void> => {
		const result = await exit({
			connector: provider,
			chainID: props.vault.chainID,
			contractAddress: props.vault.stakingAddress,
			statusHandler: set_exitStatus
		});
		if (result.isSuccessful) {
			props.onRefreshVaultData();
		}
	}, [provider, props]);

	return (
		<div className={'pt-6'}>
			<b className={'mb-2 block'}>{'Claim rewards'}</b>
			<div className={'flex flex-col gap-2 md:flex-row'}>
				<div
					className={cl(
						'h-10 w-full overflow-x-scroll rounded-lg px-2 outline-none scrollbar-none',
						'leading-10',
						'border-2 border-neutral-900 bg-neutral-0 font-number font-normal'
					)}>
					{props?.vault?.onChainData?.rewardEarned?.raw === 0n ? (
						<p className={'font-number font-normal text-neutral-400'}>{formatAmount(0)}</p>
					) : (
						<Counter
							value={props?.vault?.onChainData?.rewardEarned?.normalized || 0}
							decimals={18}
						/>
					)}
				</div>

				<div className={'flex gap-2'}>
					<button
						onClick={onClaimAndExit}
						disabled={
							!provider ||
							toBigInt(props?.vault?.onChainData?.rewardEarned?.raw) === 0n ||
							toBigInt(props?.vault?.onChainData?.rewardEarned?.raw) >
								toBigInt(props.vault.onChainData?.rewardEarned?.raw || 0n)
						}
						className={cl(
							'h-10 min-w-[128px] rounded-lg border-2 text-base font-bold relative',
							'focus:ring-transparent focus:!border-neutral-600',
							'disabled:bg-neutral-300 bg-[#FEBC02]',
							'border-neutral-600',
							'disabled:cursor-not-allowed',
							'disabled:text-neutral-400 text-neutral-900'
						)}>
						<div
							className={cl(
								'absolute inset-0 flex items-center justify-center transition-opacity',
								exitStatus.pending ? 'opacity-100' : 'opacity-0'
							)}>
							<IconSpinner className={'text-neutral-900'} />
						</div>
						<p className={exitStatus.pending ? 'opacity-0' : 'opacity-100 '}>{'Claim & Exit'}</p>
					</button>

					<button
						onClick={onClaim}
						disabled={
							!provider ||
							toBigInt(props?.vault?.onChainData?.rewardEarned?.raw) === 0n ||
							toBigInt(props?.vault?.onChainData?.rewardEarned?.raw) >
								toBigInt(props.vault.onChainData?.rewardEarned?.raw || 0n)
						}
						className={cl(
							'h-10 w-28 min-w-28 rounded-lg border-2 text-base font-bold relative',
							'focus:ring-transparent focus:!border-neutral-600',
							'disabled:bg-neutral-300 bg-[#FEBC02]',
							'border-neutral-600',
							'disabled:cursor-not-allowed',
							'disabled:text-neutral-400 text-neutral-900'
						)}>
						<div
							className={cl(
								'absolute inset-0 flex items-center justify-center transition-opacity',
								claimStatus.pending ? 'opacity-100' : 'opacity-0'
							)}>
							<IconSpinner className={'text-neutral-900'} />
						</div>
						<p className={claimStatus.pending ? 'opacity-0' : 'opacity-100'}>{'Claim'}</p>
					</button>
				</div>
			</div>
			<p
				suppressHydrationWarning
				className={'mt-1 block pl-2 text-xs text-neutral-900'}>
				{`You earned ${formatAmount(props.vault?.onChainData?.rewardEarned?.normalized || 0, 4)} AJNA`}
			</p>
		</div>
	);
}

export function StakerWithReward(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	const hasVaultTokens =
		props.vault.onChainData?.vaultBalanceOf?.raw !== 0n || props.vault.onChainData?.stakingBalanceOf?.raw !== 0n;

	return (
		<div className={'p-2 pt-[30px] md:p-8'}>
			<div className={'hidden grid-cols-2 gap-4 pt-0.5 md:grid'}>
				<div className={'rounded-lg border-2 border-neutral-900 bg-[#FEBC02] p-4 leading-4'}>
					<b
						suppressHydrationWarning
						className={'block pb-2 text-neutral-900'}>
						{'Extra Ajna: '}
						{getVaultAPR(props?.vault?.yDaemonData)}
						{' +'}
					</b>
					<b
						suppressHydrationWarning
						className={'block text-3xl text-neutral-900'}>
						{`${formatWithUnit(Number(props.vault.onChainData?.stakingAPR || 0), 0)}/week`}
					</b>
				</div>
				<div className={'rounded-lg border-2 border-neutral-900 bg-[#FEBC02] p-4 leading-4'}>
					<b className={'block pb-2 text-neutral-900'}>{'TVL'}</b>
					<b
						className={'block text-3xl text-neutral-900'}
						suppressHydrationWarning>
						{formatAmount(
							(props?.vault?.onChainData?.totalStakingSupply?.normalized || 0) *
								(props.vault.prices?.vaultToken?.normalized || 0)
						)}
					</b>
				</div>
				{hasVaultTokens ? (
					<div
						className={cl(
							'col-span-2 flex items-center justify-between rounded-lg border-2',
							'leading-4 border-neutral-900 bg-[#FEBC02] p-4'
						)}>
						<b className={'block text-neutral-900'}>{'You staked'}</b>
						<b
							className={'block text-neutral-900'}
							suppressHydrationWarning>
							{`${formatAmount(props.vault.onChainData?.stakingBalanceOf?.normalized || 0, 4)} yv${props.vault.tokenSymbol}`}
						</b>
					</div>
				) : (
					<div
						className={cl(
							'col-span-2 rounded-lg grid gap-5 mb-36',
							'border-2 border-neutral-900 bg-[#FEBC02] p-4'
						)}>
						<IconBigChevron className={'text-[#FF7D01]'} />
						<p
							className={'block text-xl text-neutral-900'}
							suppressHydrationWarning>
							{'Deposit on the left and *poof* you can juice your tokens with extra APR or extra AJNA.'}
						</p>
					</div>
				)}
			</div>

			<div className={'grid md:hidden'}>
				<div className={'rounded-lg border-2 border-neutral-900 bg-[#FEBC02] p-4'}>
					<div className={'flex items-center justify-between'}>
						<p className={'block text-sm text-neutral-900'}>{'APR'}</p>
						<b
							className={'block text-neutral-900'}
							suppressHydrationWarning>
							{formatPercent(props.vault.onChainData?.stakingAPR || 0)}
						</b>
					</div>
					<div className={'flex items-center justify-between'}>
						<p className={'block text-sm text-neutral-900'}>{'TVL'}</p>
						<b
							className={'block text-neutral-900'}
							suppressHydrationWarning>
							{formatAmount(
								(props?.vault?.onChainData?.totalStakingSupply?.normalized || 0) *
									(props.vault.prices?.vaultToken?.normalized || 0)
							)}
						</b>
					</div>

					<div className={'mt-2 flex items-center justify-between border-t border-neutral-0/40 pt-2'}>
						<p className={'block text-sm text-neutral-900'}>{'Deposited'}</p>
						<b
							className={'block text-neutral-900'}
							suppressHydrationWarning>
							{`${formatAmount(props.vault.onChainData?.stakingBalanceOf?.normalized || 0)} yv${props.vault.tokenSymbol}`}
						</b>
					</div>
				</div>
			</div>

			{hasVaultTokens ? (
				<>
					<StakeSection {...props} />
					<UnstakeSection {...props} />
					<ClaimSection {...props} />
				</>
			) : null}
		</div>
	);
}
