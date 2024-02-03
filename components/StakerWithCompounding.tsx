import React, {useCallback, useMemo, useState} from 'react';
import toast from 'react-hot-toast';
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
import {approveERC20, defaultTxStatus} from '@builtbymom/web3/utils/wagmi';
import {IconBigChevron} from '@icons/IconBigChevron';
import {IconSpinner} from '@icons/IconSpinner';
import {depositERC20, redeemV3Shares} from '@utils/actions';
import {convertToYVToken, convertToYVYVToken, getVaultAPR, onInput} from '@utils/helpers';

import type {ReactElement} from 'react';
import type {TNormalizedBN} from '@builtbymom/web3/types';
import type {TVaultData} from '@utils/types';

function StakeSection(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	const {address, provider} = useWeb3();
	const [amount, set_amount] = useState<TNormalizedBN | undefined>(undefined);
	const [isMax, set_isMax] = useState(false);
	const [approveStatus, set_approveStatus] = useState(defaultTxStatus);
	const [depositStatus, set_depositStatus] = useState(defaultTxStatus);

	const actualBalanceInToken = useMemo((): TNormalizedBN => {
		return toNormalizedBN(
			((props.vault?.onChainData?.vaultBalanceOf?.raw || 0n) *
				(props?.vault?.onChainData?.vaultPricePerShare.raw || 0n)) /
				toBigInt(10 ** props.vault.decimals),
			props.vault.decimals
		);
	}, [
		props.vault?.onChainData?.vaultBalanceOf?.raw,
		props.vault?.onChainData?.vaultPricePerShare.raw,
		props.vault.decimals
	]);

	const {data: hasAllowance, refetch: onRefreshAllowance} = useContractRead({
		abi: erc20ABI,
		chainId: props.vault.chainID,
		address: props.vault.vaultAddress,
		functionName: 'allowance',
		args: [toAddress(address), props.vault.autoCompoundingAddress],
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
		assertAddress(props.vault.autoCompoundingAddress, 'props.vault.autoCompoundingAddress');
		assertAddress(props.vault.vaultAddress, 'props.vault.vaultAddress');

		const result = await approveERC20({
			connector: provider,
			chainID: props.vault.chainID,
			contractAddress: props.vault.vaultAddress,
			spenderAddress: props.vault.autoCompoundingAddress,
			amount: MAX_UINT_256,
			statusHandler: set_approveStatus,
			shouldDisplaySuccessToast: false
		});
		if (result.isSuccessful) {
			onRefreshAllowance();
			props.onRefreshVaultData();
			toast.success(
				`Your ${props.vault.tokenSymbol} has been approved. Now click stake and start earning more APR.`
			);
		}
	}, [approveStatus.pending, provider, props, onRefreshAllowance]);

	const onDeposit = useCallback(async (): Promise<void> => {
		let actualValue = convertToYVToken(
			amount?.raw || 0n,
			props.vault.decimals,
			toBigInt(props.vault.onChainData?.vaultPricePerShare.raw)
		);
		if (isMax) {
			actualValue = props.vault.onChainData?.vaultBalanceOf || toNormalizedBN(0);
		}
		const result = await depositERC20({
			connector: provider,
			chainID: props.vault.chainID,
			amount: toBigInt(actualValue?.raw),
			contractAddress: props.vault.autoCompoundingAddress,
			statusHandler: set_depositStatus
		});
		if (result.isSuccessful) {
			onRefreshAllowance();
			props.onRefreshVaultData();
			set_amount(undefined);
			toast.success(
				`You staked ${amount?.normalized} ${props.vault.tokenSymbol} and are now earning juiced APR.`
			);
		}
	}, [amount?.raw, amount?.normalized, isMax, provider, props, onRefreshAllowance]);

	function renderApproveButton(): ReactElement {
		return (
			<button
				onClick={onApprove}
				disabled={
					!provider ||
					toBigInt(amount?.raw) === 0n ||
					toBigInt(amount?.raw) > toBigInt(actualBalanceInToken?.raw || 0n)
				}
				className={cl(
					'h-10 w-28 min-w-28 rounded-lg border-2 text-base font-bold relative',
					'focus:ring-transparent focus:!border-neutral-600',
					'disabled:bg-neutral-300 bg-pink hover:bg-pinkHover transition-colors',
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
					toBigInt(amount?.raw) > toBigInt(actualBalanceInToken?.raw || 0n)
				}
				className={cl(
					'h-10 w-28 min-w-28 rounded-lg border-2 text-base font-bold relative',
					'focus:ring-transparent focus:!border-neutral-600',
					'disabled:bg-neutral-300 bg-pink hover:bg-pinkHover transition-colors',
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
					type={'number'}
					min={0}
					autoComplete={'off'}
					value={amount === undefined ? '' : amount.normalized}
					onChange={e => {
						set_amount(onInput(e, props.vault.decimals, actualBalanceInToken));
						set_isMax(false);
					}}
				/>
				{hasAllowance ? renderStakeButton() : renderApproveButton()}
			</div>
			<button
				suppressHydrationWarning
				disabled={!actualBalanceInToken || actualBalanceInToken.raw === 0n}
				onClick={() => {
					set_amount(actualBalanceInToken || toNormalizedBN(0));
					set_isMax(true);
				}}
				className={'mt-1 block pl-2 text-xs text-neutral-900'}>
				{`${formatAmount(actualBalanceInToken?.normalized || 0, 4)} ${props.vault.tokenSymbol} available to stake`}
			</button>
		</div>
	);
}

function UnstakeSection(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	const {provider} = useWeb3();
	const [amount, set_amount] = useState<TNormalizedBN | undefined>(undefined);
	const [isMax, set_isMax] = useState(false);
	const [withdrawStatus, set_withdrawStatus] = useState(defaultTxStatus);

	const actualBalanceInToken = useMemo((): TNormalizedBN => {
		return toNormalizedBN(
			((props.vault?.onChainData?.autoCoumpoundingVaultBalance?.raw || 0n) *
				(props?.vault?.onChainData?.autoCompoundingVaultPricePerShare.raw || 0n) *
				(props?.vault?.onChainData?.vaultPricePerShare.raw || 0n)) /
				toBigInt(10 ** props.vault.decimals) /
				toBigInt(10 ** props.vault.decimals),
			props.vault.decimals
		);
	}, [
		props.vault?.onChainData?.autoCoumpoundingVaultBalance?.raw,
		props.vault?.onChainData?.autoCompoundingVaultPricePerShare.raw,
		props.vault?.onChainData?.vaultPricePerShare.raw,
		props.vault.decimals
	]);

	const onUnstake = useCallback(async (): Promise<void> => {
		let actualValue = convertToYVYVToken(
			amount?.raw || 0n,
			props.vault.decimals,
			toBigInt(props.vault.onChainData?.autoCompoundingVaultPricePerShare.raw),
			toBigInt(props.vault.onChainData?.vaultPricePerShare.raw)
		);

		if (isMax) {
			actualValue = props.vault.onChainData?.autoCoumpoundingVaultBalance || toNormalizedBN(0);
		}

		const result = await redeemV3Shares({
			connector: provider,
			chainID: props.vault.chainID,
			amount: toBigInt(actualValue?.raw),
			contractAddress: props.vault.autoCompoundingAddress,
			statusHandler: set_withdrawStatus
		});
		if (result.isSuccessful) {
			props.onRefreshVaultData();
			set_amount(undefined);
			toast.success(`${props.vault.tokenSymbol} successfully unstaked.`);
		}
	}, [amount?.raw, isMax, provider, props]);

	return (
		<div className={'pb-2 pt-6 md:pb-[92px]'}>
			<b className={'mb-2 block'}>{'Unstake'}</b>
			<div className={'flex flex-col gap-2 md:flex-row'}>
				<input
					className={cl(
						'h-10 w-full overflow-x-scroll rounded-lg px-2 py-4 font-bold outline-none scrollbar-none',
						'border-2 border-neutral-900 bg-neutral-0 font-normal font-number'
					)}
					placeholder={'0.00'}
					type={'number'}
					min={0}
					autoComplete={'off'}
					value={amount === undefined ? '' : amount.normalized}
					onChange={e => {
						set_isMax(false);
						set_amount(onInput(e, props.vault.decimals, actualBalanceInToken));
					}}
				/>
				<button
					onClick={onUnstake}
					disabled={
						!provider ||
						toBigInt(amount?.raw) === 0n ||
						toBigInt(amount?.raw) > toBigInt(actualBalanceInToken?.raw || 0n)
					}
					className={cl(
						'h-10 w-28 min-w-28 rounded-lg border-2 text-base font-bold relative',
						'focus:ring-transparent focus:!border-neutral-600',
						'disabled:bg-neutral-300 bg-pink hover:bg-pinkHover transition-colors',
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
				disabled={!actualBalanceInToken || actualBalanceInToken.raw === 0n}
				onClick={() => {
					set_isMax(true);
					set_amount(actualBalanceInToken || toNormalizedBN(0));
				}}
				className={'mt-1 block pl-2 text-xs text-neutral-900'}>
				{`${formatAmount(actualBalanceInToken?.normalized || 0, 4)} ${props.vault.tokenSymbol} available to unstake`}
			</button>
		</div>
	);
}

function DesktopStats(props: {vault: TVaultData}): ReactElement {
	const hasVaultTokens =
		props.vault.onChainData?.vaultBalanceOf?.raw !== 0n ||
		props.vault.onChainData?.stakingBalanceOf?.raw !== 0n ||
		props.vault.onChainData?.autoCoumpoundingVaultBalance?.raw !== 0n;

	const depositedAndStaked = useMemo((): number => {
		const autocompoundingValue =
			(props.vault?.onChainData?.autoCoumpoundingVaultBalance?.normalized || 0) *
			(props?.vault?.onChainData?.autoCompoundingVaultPricePerShare.normalized || 0) *
			(props?.vault?.onChainData?.vaultPricePerShare.normalized || 0);

		return autocompoundingValue;
	}, [
		props.vault?.onChainData?.autoCoumpoundingVaultBalance?.normalized,
		props?.vault?.onChainData?.vaultPricePerShare.normalized,
		props?.vault?.onChainData?.autoCompoundingVaultPricePerShare.normalized
	]);

	return (
		<div className={'hidden grid-cols-2 gap-4 pt-0.5 md:grid'}>
			<div className={'rounded-lg border-2 border-neutral-900 bg-pink p-4 leading-4'}>
				<b
					suppressHydrationWarning
					className={'block pb-2 text-neutral-900'}>
					{'Extra APR: '}
					{getVaultAPR(props?.vault?.yDaemonData)}
					{' +'}
				</b>
				<b
					suppressHydrationWarning
					className={'block text-3xl text-neutral-900'}>
					{formatPercent(props.vault.autoCompoundingAPR, 2)}
				</b>
			</div>
			<div className={'rounded-lg border-2 border-neutral-900 bg-pink p-4 leading-4'}>
				<b className={'block pb-2 text-neutral-900'}>{'TVL'}</b>
				<b
					className={'block text-3xl text-neutral-900'}
					suppressHydrationWarning>
					{formatWithUnit(
						(props?.vault?.onChainData?.autoCoumpoundingVaultSupply?.normalized || 0) *
							(props.vault.prices?.vaultToken?.normalized || 0),
						2,
						2,
						{locales: ['en-US']}
					)}
				</b>
			</div>
			{hasVaultTokens ? (
				<div
					className={cl(
						'col-span-2 flex items-center justify-between rounded-lg',
						'leading-4 border-2 border-neutral-900 bg-pink p-4'
					)}>
					<b className={'block text-neutral-900'}>{'You staked'}</b>
					<b
						className={'block text-neutral-900'}
						suppressHydrationWarning>
						{`${formatAmount(depositedAndStaked, 4)} ${props.vault.tokenSymbol}`}
					</b>
				</div>
			) : (
				<div
					className={cl('col-span-2 rounded-lg grid gap-5 mb-36', 'border-2 border-neutral-900 bg-pink p-4')}>
					<IconBigChevron className={'text-blue'} />
					<p
						className={'block text-xl text-neutral-900'}
						suppressHydrationWarning>
						{`Deposit on the left and *poof* you can juice your tokens with extra APR or extra ${props.vault.rewardSymbol}.`}
					</p>
				</div>
			)}
		</div>
	);
}

function MobileStats(props: {vault: TVaultData}): ReactElement {
	const depositedAndStaked = useMemo((): number => {
		const autocompoundingValue =
			(props.vault?.onChainData?.autoCoumpoundingVaultBalance?.normalized || 0) *
			(props?.vault?.onChainData?.autoCompoundingVaultPricePerShare.normalized || 0) *
			(props?.vault?.onChainData?.vaultPricePerShare.normalized || 0);

		return autocompoundingValue;
	}, [
		props.vault?.onChainData?.autoCoumpoundingVaultBalance?.normalized,
		props?.vault?.onChainData?.vaultPricePerShare.normalized,
		props?.vault?.onChainData?.autoCompoundingVaultPricePerShare.normalized
	]);

	return (
		<div className={'grid md:hidden'}>
			<div className={'rounded-lg border-2 border-neutral-900 bg-pink p-4'}>
				<div className={'flex items-center justify-between'}>
					<p
						suppressHydrationWarning
						className={'block text-sm text-neutral-900'}>
						{'Extra APR: '}
						{getVaultAPR(props?.vault?.yDaemonData)}
						{' +'}
					</p>
					<b
						className={'block text-neutral-900'}
						suppressHydrationWarning>
						{formatPercent(props.vault.autoCompoundingAPR, 2)}
					</b>
				</div>
				<div className={'flex items-center justify-between'}>
					<p className={'block text-sm text-neutral-900'}>{'TVL'}</p>
					<b
						className={'block text-neutral-900'}
						suppressHydrationWarning>
						{`${formatAmount(depositedAndStaked, 4)} ${props.vault.tokenSymbol}`}
					</b>
				</div>

				<div className={'mt-2 flex items-center justify-between border-t border-neutral-0/40 pt-2'}>
					<p className={'block text-sm text-neutral-900'}>{'You staked'}</p>
					<b
						className={'block text-neutral-900'}
						suppressHydrationWarning>
						{`${formatAmount(props.vault.onChainData?.autoCoumpoundingVaultBalance?.normalized || 0, 4)} ${props.vault.tokenSymbol}`}
					</b>
				</div>
			</div>
		</div>
	);
}

export function StakerWithCompounding(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	const hasVaultTokens =
		props.vault.onChainData?.vaultBalanceOf?.raw !== 0n ||
		props.vault.onChainData?.stakingBalanceOf?.raw !== 0n ||
		props.vault.onChainData?.autoCoumpoundingVaultBalance?.raw !== 0n;

	return (
		<div className={'p-2 pt-[30px] md:p-8'}>
			<DesktopStats {...props} />
			<MobileStats {...props} />

			{hasVaultTokens ? (
				<>
					<StakeSection {...props} />
					<UnstakeSection {...props} />
				</>
			) : null}
		</div>
	);
}
