import React, {useCallback, useMemo, useState} from 'react';
import toast from 'react-hot-toast';
import {erc20Abi} from 'viem';
import {useReadContract} from 'wagmi';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {
	assert,
	assertAddress,
	cl,
	formatAmount,
	formatWithUnit,
	isZeroAddress,
	MAX_UINT_256,
	toAddress,
	toBigInt,
	toNormalizedBN,
	zeroNormalizedBN
} from '@builtbymom/web3/utils';
import {approveERC20, defaultTxStatus} from '@builtbymom/web3/utils/wagmi';
import {IconGold} from '@icons/IconGold';
import {IconSpinner} from '@icons/IconSpinner';
import {claimRewards, exit, unstakeSome, zapIn} from '@utils/actions';
import {convertToYVToken, formatVaultAPR, onInput} from '@utils/helpers';
import {Counter} from '@common/Counter';

import type {ReactElement} from 'react';
import type {TNormalizedBN} from '@builtbymom/web3/types';
import type {TVaultData} from '@utils/types';

function StakeSection(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	const {address, provider} = useWeb3();
	const [amount, set_amount] = useState<TNormalizedBN | undefined>(undefined);
	// FIXME: decide if needed
	// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
	const [_isMax, set_isMax] = useState(false);
	const [approveStatus, set_approveStatus] = useState(defaultTxStatus);
	const [depositStatus, set_depositStatus] = useState(defaultTxStatus);

	const {data: hasAllowance, refetch: onRefreshAllowance} = useReadContract({
		abi: erc20Abi,
		chainId: props.vault.chainID,
		address: props.vault.tokenAddress,
		functionName: 'allowance',
		args: [toAddress(address), toAddress(process.env.ZAP_ADDRESS)],
		query: {
			select(data) {
				if (isZeroAddress(address) || toBigInt(data) === 0n) {
					return false;
				}
				return toBigInt(data) >= toBigInt(amount?.raw);
			}
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
			contractAddress: props.vault.tokenAddress,
			spenderAddress: toAddress(process.env.ZAP_ADDRESS),
			amount: MAX_UINT_256,
			statusHandler: set_approveStatus,
			shouldDisplaySuccessToast: false
		});
		if (result.isSuccessful) {
			onRefreshAllowance();
			props.onRefreshVaultData();
			toast.success(
				`You've approved your ${props.vault.tokenSymbol} to stake. Now just click stake and you're good to go.`
			);
		}
	}, [approveStatus.pending, provider, props, onRefreshAllowance]);

	const onDeposit = useCallback(async (): Promise<void> => {
		const result = await zapIn({
			connector: provider,
			chainID: props.vault.chainID,
			amount: toBigInt(amount?.raw),
			vaultAddress: props.vault.vaultAddress,
			contractAddress: toAddress(process.env.ZAP_ADDRESS),
			shouldDisplaySuccessToast: false,
			statusHandler: set_depositStatus
		});
		if (result.isSuccessful) {
			onRefreshAllowance();
			props.onRefreshVaultData();
			set_amount(undefined);
			toast.success(`You are now staking ${amount?.normalized} ${props.vault.tokenSymbol}. Enjoy your rewards!`);
		}
	}, [amount?.raw, amount?.normalized, provider, props, onRefreshAllowance]);

	function renderApproveButton(): ReactElement {
		return (
			<button
				onClick={onApprove}
				disabled={
					!provider ||
					toBigInt(amount?.raw) === 0n ||
					toBigInt(amount?.raw) > toBigInt(props.vault?.onChainData?.tokenBalanceOf?.raw || 0n)
				}
				className={cl(
					'h-10 w-28 min-w-28 rounded-lg border-2 text-base font-bold relative',
					'focus:ring-transparent focus:!border-neutral-600',
					'disabled:bg-neutral-300 bg-orange',
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
					toBigInt(amount?.raw) > toBigInt(props.vault?.onChainData?.tokenBalanceOf?.raw || 0n)
				}
				className={cl(
					'h-10 w-28 min-w-28 rounded-lg border-2 text-base font-bold relative',
					'focus:ring-transparent focus:!border-neutral-600',
					'disabled:bg-neutral-300 bg-orange',
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
				<p className={depositStatus.pending ? 'opacity-0' : 'opacity-100'}>{'Deposit'}</p>
			</button>
		);
	}

	return (
		<div>
			<b className={'mb-2 block'}>{'Deposit'}</b>
			<div className={'flex flex-col gap-2 md:flex-row'}>
				<input
					className={cl(
						'h-10 w-full overflow-x-scroll rounded-lg px-2 py-4 font-bold outline-none scrollbar-none',
						'border-2 border-neutral-900 bg-beige font-normal font-number'
					)}
					placeholder={'0.00'}
					type={'number'}
					min={0}
					autoComplete={'off'}
					value={amount === undefined ? '' : amount.normalized}
					onChange={e => {
						set_isMax(false);
						set_amount(onInput(e, props.vault.decimals, props.vault?.onChainData?.tokenBalanceOf));
					}}
				/>
				{hasAllowance ? renderStakeButton() : renderApproveButton()}
			</div>
			<button
				suppressHydrationWarning
				disabled={
					!props.vault?.onChainData?.tokenBalanceOf || props.vault?.onChainData?.tokenBalanceOf.raw === 0n
				}
				onClick={() => {
					set_amount(props.vault?.onChainData?.tokenBalanceOf || zeroNormalizedBN);
					set_isMax(true);
				}}
				className={'mt-1 block pl-2 text-xs text-neutral-900'}>
				{`You have ${formatAmount(props.vault?.onChainData?.tokenBalanceOf?.normalized || 0, 4)} ${props.vault.tokenSymbol}`}
			</button>
		</div>
	);
}

function UnstakeSection(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	const {provider} = useWeb3();
	const [amount, set_amount] = useState<TNormalizedBN | undefined>(undefined);
	const [isMax, set_isMax] = useState(false);
	const [withdrawStatus, set_withdrawStatus] = useState(defaultTxStatus);
	const actualBalanceInTokenForStaking = useMemo((): TNormalizedBN => {
		return toNormalizedBN(
			((props.vault?.onChainData?.stakingBalanceOf?.raw || 0n) *
				(props?.vault?.onChainData?.vaultPricePerShare.raw || 0n)) /
				toBigInt(10 ** props.vault.decimals),
			props.vault.decimals
		);
	}, [
		props.vault?.onChainData?.stakingBalanceOf?.raw,
		props.vault?.onChainData?.vaultPricePerShare.raw,
		props.vault.decimals
	]);

	const onUnstake = useCallback(async (): Promise<void> => {
		let actualValue = convertToYVToken(
			amount?.raw || 0n,
			props.vault.decimals,
			toBigInt(props.vault.onChainData?.vaultPricePerShare.raw)
		);
		if (isMax) {
			actualValue = props.vault.onChainData?.stakingBalanceOf || zeroNormalizedBN;
		}
		const result = await unstakeSome({
			connector: provider,
			chainID: props.vault.chainID,
			amount: toBigInt(actualValue?.raw),
			contractAddress: props.vault.stakingAddress,
			statusHandler: set_withdrawStatus
		});
		if (result.isSuccessful) {
			props.onRefreshVaultData();
			set_amount(undefined);
			toast.success('You successfully unstaked.');
		}
	}, [amount?.raw, isMax, provider, props]);

	return (
		<div>
			<b className={'mb-2 block'}>{'Withdraw'}</b>
			<div className={'flex flex-col gap-2 md:flex-row'}>
				<input
					className={cl(
						'h-10 w-full overflow-x-scroll rounded-lg px-2 py-4 font-bold outline-none scrollbar-none',
						'border-2 border-neutral-900 bg-beige font-normal font-number'
					)}
					placeholder={'0.00'}
					type={'number'}
					min={0}
					autoComplete={'off'}
					value={amount === undefined ? '' : amount.normalized}
					onChange={e => {
						set_amount(onInput(e, props.vault.decimals, actualBalanceInTokenForStaking));
						set_isMax(false);
					}}
				/>
				<button
					onClick={onUnstake}
					disabled={
						!provider ||
						toBigInt(amount?.raw) === 0n ||
						toBigInt(amount?.raw) > toBigInt(actualBalanceInTokenForStaking?.raw || 0n)
					}
					className={cl(
						'h-10 w-28 min-w-28 rounded-lg border-2 text-base font-bold relative',
						'focus:ring-transparent focus:!border-neutral-600',
						'disabled:bg-neutral-300 bg-orange',
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
					<p className={withdrawStatus.pending ? 'opacity-0' : 'opacity-100'}>{'Withdraw'}</p>
				</button>
			</div>
			<button
				suppressHydrationWarning
				disabled={
					!props.vault.onChainData?.stakingBalanceOf || props.vault.onChainData?.stakingBalanceOf.raw === 0n
				}
				onClick={() => {
					set_amount(actualBalanceInTokenForStaking || zeroNormalizedBN);
					set_isMax(true);
				}}
				className={'mt-1 block pl-2 text-xs text-neutral-900'}>
				{`You have ${formatAmount(actualBalanceInTokenForStaking?.normalized || 0, 4)} ${props.vault.tokenSymbol}`}
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
			toast.success(
				`You successfully claimed ${formatAmount(props?.vault?.onChainData?.rewardEarned?.normalized || 0, 4)} ${props.vault.rewardSymbol} tokens!`
			);
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
			toast.success(
				`You successfully exited the vault and claimed ${formatAmount(props?.vault?.onChainData?.rewardEarned?.normalized || 0, 4)} ${props.vault.rewardSymbol} tokens!`
			);
		}
	}, [provider, props]);

	return (
		<div>
			<b className={'mb-2 block'}>{'Claim rewards'}</b>
			<div className={'flex flex-col gap-2 md:flex-row'}>
				<div
					className={cl(
						'h-10 w-full overflow-x-scroll rounded-lg px-2 outline-none scrollbar-none',
						'leading-10 overflow-hidden',
						'border-2 border-neutral-900 bg-beige font-number font-normal tabular-nums'
					)}>
					{props?.vault?.onChainData?.rewardEarned?.raw === 0n ? (
						<p className={'font-number font-normal text-neutral-400'}>{formatAmount(0)}</p>
					) : (
						<Counter
							value={props?.vault?.onChainData?.rewardEarned?.normalized || 0}
							decimals={props?.vault?.decimals || 18}
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
							'disabled:bg-neutral-300 bg-orange',
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
							'disabled:bg-neutral-300 bg-orange',
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
				{`${formatAmount(props.vault?.onChainData?.rewardEarned?.normalized || 0, 4)} ${props.vault.rewardSymbol} earned`}
			</p>
		</div>
	);
}

function DesktopStats(props: {vault: TVaultData}): ReactElement {
	const depositedAndStaked = useMemo((): number => {
		const rewardValue =
			(props.vault?.onChainData?.stakingBalanceOf?.normalized || 0) *
			(props?.vault?.onChainData?.vaultPricePerShare.normalized || 0);

		return rewardValue;
	}, [
		props.vault?.onChainData?.stakingBalanceOf?.normalized,
		props?.vault?.onChainData?.vaultPricePerShare.normalized
	]);

	return (
		<div className={'hidden grid-cols-2 gap-4 pt-0.5 md:grid'}>
			<div className={'rounded-lg border-2 border-neutral-900 bg-beige p-4 leading-4'}>
				<b
					suppressHydrationWarning
					className={'block pb-2 text-neutral-900'}>
					{'Rewards: '}
					{formatVaultAPR(props?.vault?.yDaemonData)}
					{' APR +'}
				</b>
				<b
					suppressHydrationWarning
					className={'block break-all text-3xl text-neutral-900'}>
					{`${formatWithUnit(Number(props.vault.onChainData?.weeklyStakingRewards || 0), 0, 0, {
						locales: ['en-US']
					})}/week`}
				</b>
			</div>
			<div className={'rounded-lg border-2 border-neutral-900 bg-beige p-4 leading-4'}>
				<b className={'block pb-2 text-neutral-900'}>{'TVL'}</b>
				<b
					className={'block text-3xl text-neutral-900'}
					suppressHydrationWarning>
					{formatWithUnit(
						(props?.vault?.onChainData?.totalStakingSupply?.normalized || 0) *
							(props.vault.prices?.vaultToken?.normalized || 0),
						2,
						2,
						{locales: ['en-US']}
					)}
				</b>
			</div>
			<div
				className={cl(
					'col-span-2 flex items-center justify-between rounded-lg border-2',
					'leading-4 border-neutral-900 bg-beige p-4'
				)}>
				<b className={'block '}>{'Your deposit'}</b>
				<b
					className={'block '}
					suppressHydrationWarning>
					{`${formatAmount(depositedAndStaked, 4)} ${props.vault.tokenSymbol}`}
				</b>
			</div>
		</div>
	);
}

function MobileStats(props: {vault: TVaultData}): ReactElement {
	return (
		<div className={'grid md:hidden'}>
			<div className={'rounded-lg border-2 border-neutral-900 bg-beige p-4'}>
				<div className={'flex items-center justify-between'}>
					<p
						suppressHydrationWarning
						className={'block text-sm text-neutral-900'}>
						{`Extra ${props.vault.rewardSymbol}: `}
						{formatVaultAPR(props?.vault?.yDaemonData)}
						{' +'}
					</p>
					<b
						className={'block text-neutral-900'}
						suppressHydrationWarning>
						{`${formatWithUnit(Number(props.vault.onChainData?.weeklyStakingRewards || 0), 0, 0, {
							locales: ['en-US']
						})}/week`}
					</b>
				</div>
				<div className={'flex items-center justify-between'}>
					<p className={'block text-sm text-neutral-900'}>{'TVL'}</p>
					<b
						className={'block text-neutral-900'}
						suppressHydrationWarning>
						{formatWithUnit(
							(props?.vault?.onChainData?.totalStakingSupply?.normalized || 0) *
								(props.vault.prices?.vaultToken?.normalized || 0),
							2,
							2,
							{locales: ['en-US']}
						)}
					</b>
				</div>

				<div className={'mt-2 flex items-center justify-between border-t border-neutral-900 pt-2'}>
					<p className={'block text-sm text-neutral-900'}>{'Your deposit'}</p>
					<b
						className={'block text-neutral-900'}
						suppressHydrationWarning>
						{`${formatAmount(props.vault.onChainData?.stakingBalanceOf?.normalized || 0, 4)} ${props.vault.tokenSymbol}`}
					</b>
				</div>
			</div>
		</div>
	);
}

export function StakerWithReward(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	return (
		<div className={'flex flex-1 flex-col gap-4 rounded-lg border-2 border-neutral-900 bg-yellow px-4 py-6'}>
			<header className={'flex items-center gap-4'}>
				<div
					className={cl(
						'flex size-12 items-center justify-center rounded-full',
						'bg-beige border-2 border-neutral-900'
					)}>
					<IconGold className={'size-8'} />
				</div>
				<h3 className={'text-lg font-bold uppercase'}>{'Manual claim'}</h3>
			</header>
			<main className={'flex flex-col gap-6'}>
				<DesktopStats {...props} />
				<MobileStats {...props} />
				<StakeSection {...props} />
				<UnstakeSection {...props} />
				<ClaimSection {...props} />
			</main>
		</div>
	);
}
