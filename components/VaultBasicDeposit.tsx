import React, {useCallback, useMemo, useState} from 'react';
import {toast} from 'react-hot-toast';
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
import {approveERC20, defaultTxStatus, getNetwork} from '@builtbymom/web3/utils/wagmi';
import {IconSpinner} from '@icons/IconSpinner';
import {depositERC20, redeemV3Shares} from '@utils/actions';
import {convertToYVToken, getVaultAPR, onInput, toSafeChainID} from '@utils/helpers';
import {erc20ABI} from '@wagmi/core';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ReactElement} from 'react';
import type {TNormalizedBN} from '@builtbymom/web3/types';
import type {TVaultData} from '@utils/types';

function DepositSection(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	const {address, provider} = useWeb3();
	const [amount, set_amount] = useState<TNormalizedBN | undefined>(undefined);
	const [approveStatus, set_approveStatus] = useState(defaultTxStatus);
	const [depositStatus, set_depositStatus] = useState(defaultTxStatus);

	const {data: hasAllowance, refetch: onRefreshAllowance} = useReadContract({
		abi: erc20ABI,
		chainId: props.vault.chainID,
		address: props.vault.tokenAddress,
		functionName: 'allowance',
		args: [toAddress(address), props.vault.vaultAddress],
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
		assertAddress(props.vault.vaultAddress, 'props.vault.vaultAddress');
		assertAddress(props.vault.tokenAddress, 'props.vault.tokenAddress');

		const result = await approveERC20({
			connector: provider,
			chainID: props.vault.chainID,
			contractAddress: props.vault.tokenAddress,
			spenderAddress: props.vault.vaultAddress,
			amount: MAX_UINT_256,
			statusHandler: set_approveStatus,
			shouldDisplaySuccessToast: false
		});
		if (result.isSuccessful) {
			onRefreshAllowance();
			props.onRefreshVaultData();
			toast.success(`Your ${props.vault.tokenSymbol} has been approved. Now it's time to deposit them.`);
		}
	}, [approveStatus.pending, provider, props, onRefreshAllowance]);

	const onDeposit = useCallback(async (): Promise<void> => {
		const result = await depositERC20({
			connector: provider,
			chainID: props.vault.chainID,
			amount: toBigInt(amount?.raw),
			contractAddress: props.vault.vaultAddress,
			statusHandler: set_depositStatus
		});
		if (result.isSuccessful) {
			onRefreshAllowance();
			props.onRefreshVaultData();
			set_amount(undefined);
			toast.success(
				`You successfully deposited ${amount?.normalized} ${props.vault.tokenSymbol}. Now stake them for more APR or more ${props.vault.rewardSymbol}`
			);
		}
	}, [provider, props, amount?.raw, amount?.normalized, onRefreshAllowance]);

	function renderApproveButton(): ReactElement {
		return (
			<button
				onClick={onApprove}
				disabled={
					!provider ||
					toBigInt(amount?.raw) === 0n ||
					toBigInt(amount?.raw) > toBigInt(props.vault.onChainData?.tokenBalanceOf?.raw || 0n)
				}
				className={cl(
					'h-10 w-28 min-w-28 rounded-lg border-2 text-base font-bold relative',
					'focus:ring-transparent focus:border-neutral-600',
					'disabled:bg-neutral-300 bg-carbon hover:bg-carbon/95 transition-colors',
					'border-neutral-600',
					'disabled:cursor-not-allowed border-neutral-600',
					'disabled:text-neutral-400 text-neutral-0'
				)}>
				<div
					className={cl(
						'absolute inset-0 flex items-center justify-center transition-opacity',
						approveStatus.pending ? 'opacity-100' : 'opacity-0'
					)}>
					<IconSpinner className={'text-neutral-0'} />
				</div>
				<p className={approveStatus.pending ? 'opacity-0' : 'opacity-100'}>{'Approve'}</p>
			</button>
		);
	}

	function renderDepositButton(): ReactElement {
		return (
			<button
				onClick={onDeposit}
				disabled={
					!provider ||
					toBigInt(amount?.raw) === 0n ||
					toBigInt(amount?.raw) > toBigInt(props.vault.onChainData?.tokenBalanceOf?.raw || 0n)
				}
				className={cl(
					'h-10 w-28 min-w-28 rounded-lg border-2 text-base font-bold relative',
					'focus:ring-transparent focus:!border-neutral-600',
					'disabled:bg-neutral-300 bg-carbon',
					'border-neutral-600',
					'disabled:cursor-not-allowed',
					'disabled:text-neutral-400 text-neutral-0'
				)}>
				<div
					className={cl(
						'absolute inset-0 flex items-center justify-center transition-opacity',
						depositStatus.pending ? 'opacity-100' : 'opacity-0'
					)}>
					<IconSpinner className={'text-neutral-0'} />
				</div>
				<p className={depositStatus.pending ? 'opacity-0' : 'opacity-100'}>{'Deposit'}</p>
			</button>
		);
	}

	return (
		<div className={'pt-6'}>
			<b className={'mb-2 block'}>{'Deposit'}</b>
			<div className={'flex flex-col gap-2 md:flex-row'}>
				<input
					className={cl(
						'h-10 w-full overflow-x-scroll rounded-lg px-2 py-4 font-bold outline-none scrollbar-none',
						'border-2 border-neutral-600 bg-transparent'
					)}
					placeholder={'0.00'}
					type={'number'}
					min={0}
					autoComplete={'off'}
					value={amount === undefined ? '' : amount.normalized}
					onChange={e =>
						set_amount(onInput(e, props.vault.decimals, props.vault.onChainData?.tokenBalanceOf))
					}
				/>
				{hasAllowance ? renderDepositButton() : renderApproveButton()}
			</div>
			<button
				suppressHydrationWarning
				disabled={
					!props.vault.onChainData?.tokenBalanceOf || props.vault.onChainData?.tokenBalanceOf.raw === 0n
				}
				onClick={() => set_amount(props.vault?.onChainData?.tokenBalanceOf || zeroNormalizedBN)}
				className={'mt-1 block pl-2 text-xs text-neutral-900'}>
				{`${formatAmount(props.vault?.onChainData?.tokenBalanceOf?.normalized || 0, 4)} ${props.vault.tokenSymbol} available to deposit`}
			</button>
		</div>
	);
}

function WithdrawSection(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	const {provider} = useWeb3();
	const [amount, set_amount] = useState<TNormalizedBN | undefined>(undefined);
	const [isMax, set_isMax] = useState(false);
	const [withdrawStatus, set_withdrawStatus] = useState(defaultTxStatus);
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

	const onWithdraw = useCallback(async (): Promise<void> => {
		let actualValue = convertToYVToken(
			amount?.raw || 0n,
			props.vault.decimals,
			toBigInt(props.vault.onChainData?.vaultPricePerShare.raw)
		);
		if (isMax) {
			actualValue = props.vault.onChainData?.vaultBalanceOf || zeroNormalizedBN;
		}
		const result = await redeemV3Shares({
			connector: provider,
			chainID: props.vault.chainID,
			amount: toBigInt(actualValue?.raw),
			contractAddress: props.vault.vaultAddress,
			statusHandler: set_withdrawStatus
		});
		if (result.isSuccessful) {
			props.onRefreshVaultData();
			set_amount(undefined);
			toast.success(`You successfully withdrew your ${props.vault.tokenSymbol}.`);
		}
	}, [amount?.raw, isMax, provider, props]);

	return (
		<div className={'pt-6'}>
			<b className={'mb-2 block'}>{'Withdraw'}</b>
			<div className={'flex flex-col gap-2 md:flex-row'}>
				<input
					className={cl(
						'h-10 w-full overflow-x-scroll rounded-lg px-2 py-4 font-bold outline-none scrollbar-none',
						'border-2 border-neutral-600 bg-transparent'
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
				<button
					onClick={onWithdraw}
					disabled={
						!provider ||
						toBigInt(amount?.raw) === 0n ||
						toBigInt(amount?.raw) > toBigInt(actualBalanceInToken?.raw || 0n)
					}
					className={cl(
						'h-10 w-28 min-w-28 rounded-lg border-2 text-base font-bold relative',
						'focus:ring-transparent focus:!border-neutral-600',
						'disabled:bg-neutral-300 bg-carbon hover:bg-carbon/95 transition-colors',
						'border-neutral-600',
						'disabled:cursor-not-allowed',
						'disabled:text-neutral-400 text-neutral-0'
					)}>
					<div
						className={cl(
							'absolute inset-0 flex items-center justify-center transition-opacity',
							withdrawStatus.pending ? 'opacity-100' : 'opacity-0'
						)}>
						<IconSpinner className={'text-neutral-0'} />
					</div>
					<p className={withdrawStatus.pending ? 'opacity-0' : 'opacity-100'}>{'Withdraw'}</p>
				</button>
			</div>
			<button
				suppressHydrationWarning
				disabled={!actualBalanceInToken || actualBalanceInToken.raw === 0n}
				onClick={() => {
					set_amount(actualBalanceInToken || zeroNormalizedBN);
					set_isMax(true);
				}}
				className={'mt-1 block pl-2 text-xs text-neutral-900'}>
				{`${formatAmount(actualBalanceInToken?.normalized || 0, 4)} ${props.vault.tokenSymbol} available to withdraw`}
			</button>
		</div>
	);
}

export function DesktopStats(props: {vault: TVaultData}): ReactElement {
	const depositedAndStaked = useMemo((): number => {
		const vaultValue =
			(props.vault?.onChainData?.vaultBalanceOf?.normalized || 0) *
			(props?.vault?.onChainData?.vaultPricePerShare.normalized || 0);
		const rewardValue =
			(props.vault?.onChainData?.stakingBalanceOf?.normalized || 0) *
			(props?.vault?.onChainData?.vaultPricePerShare.normalized || 0);
		const autocompoundingValue =
			(props.vault?.onChainData?.autoCoumpoundingVaultBalance?.normalized || 0) *
			(props?.vault?.onChainData?.autoCompoundingVaultPricePerShare.normalized || 0) *
			(props?.vault?.onChainData?.vaultPricePerShare.normalized || 0);

		return vaultValue + rewardValue + autocompoundingValue;
	}, [
		props.vault?.onChainData?.vaultBalanceOf?.normalized,
		props.vault?.onChainData?.stakingBalanceOf?.normalized,
		props.vault?.onChainData?.autoCoumpoundingVaultBalance?.normalized,
		props?.vault?.onChainData?.vaultPricePerShare.normalized,
		props?.vault?.onChainData?.autoCompoundingVaultPricePerShare.normalized
	]);

	const totalTAL = useMemo((): number => {
		return props.vault?.onChainData?.totalVaultSupply?.normalized || 0;
	}, [props.vault?.onChainData?.totalVaultSupply]);

	return (
		<div className={'hidden grid-cols-2 gap-4 pt-0.5 md:grid'}>
			<div className={'rounded-lg border-2 border-neutral-900 bg-carbon p-4 leading-4'}>
				<b className={'block pb-2 text-beige'}>{'APR'}</b>
				<b
					suppressHydrationWarning
					className={'block text-3xl text-beige'}>
					{getVaultAPR(props?.vault?.yDaemonData)}
				</b>
			</div>
			<div className={'rounded-lg border-2 border-neutral-900 bg-carbon p-4 leading-4'}>
				<b className={'block pb-2 text-beige'}>{'TVL'}</b>
				<b
					className={'block text-3xl text-beige'}
					suppressHydrationWarning>
					{formatWithUnit(totalTAL * (props.vault.prices?.underlyingToken?.normalized || 0), 2, 2, {
						locales: ['en-US']
					})}
				</b>
			</div>
			<div
				className={cl(
					'col-span-2 flex items-center justify-between rounded-lg border-2',
					'leading-4 border-neutral-900 bg-carbon p-4'
				)}>
				<b className={'block text-beige'}>{'Your deposit'}</b>
				<b
					className={'block text-beige'}
					suppressHydrationWarning>
					{`${formatAmount(depositedAndStaked, 4)} ${props.vault.tokenSymbol}`}
				</b>
			</div>
		</div>
	);
}

export function MobileStats(props: {vault: TVaultData}): ReactElement {
	const depositedAndStaked = useMemo((): number => {
		return (
			(props.vault?.onChainData?.vaultBalanceOf?.normalized || 0) +
			(props.vault?.onChainData?.stakingBalanceOf?.normalized || 0) +
			(props.vault?.onChainData?.autoCoumpoundingVaultBalance?.normalized || 0)
		);
	}, [
		props.vault?.onChainData?.vaultBalanceOf?.normalized,
		props.vault?.onChainData?.stakingBalanceOf?.normalized,
		props.vault?.onChainData?.autoCoumpoundingVaultBalance?.normalized
	]);

	return (
		<div className={'grid md:hidden'}>
			<div className={'rounded-lg border-2 border-neutral-900 bg-carbon p-4'}>
				<div className={'flex items-center justify-between'}>
					<p className={'block text-sm text-beige'}>{'APR'}</p>
					<b
						className={'block text-beige'}
						suppressHydrationWarning>
						{getVaultAPR(props?.vault?.yDaemonData)}
					</b>
				</div>
				<div className={'flex items-center justify-between'}>
					<p className={'block text-sm text-beige'}>{'TVL'}</p>
					<b
						className={'block text-beige'}
						suppressHydrationWarning>
						{formatWithUnit(
							(props?.vault?.onChainData?.totalVaultSupply?.normalized || 0) *
								(props.vault.prices?.underlyingToken?.normalized || 0),
							2,
							2,
							{locales: ['en-US']}
						)}
					</b>
				</div>

				<div className={'mt-2 flex items-center justify-between border-t border-neutral-0/40 pt-2'}>
					<p className={'block text-sm text-beige'}>{'Deposited'}</p>
					<b
						className={'block text-beige'}
						suppressHydrationWarning>
						{`${formatAmount(depositedAndStaked, 4)} ${props.vault.tokenSymbol}`}
					</b>
				</div>
			</div>
		</div>
	);
}

export function VaultBasicDeposit(props: {vault: TVaultData; onRefreshVaultData: () => void}): ReactElement {
	const blockExplorer = getNetwork(props.vault.chainID).blockExplorers?.etherscan?.url;

	return (
		<div className={'relative flex flex-col p-4 md:p-8'}>
			<div className={'flex flex-row items-center space-x-4 pb-6 pt-4 md:pb-[42px]'}>
				<ImageWithFallback
					alt={props.vault.tokenSymbol}
					width={48}
					height={48}
					src={`${process.env.SMOL_ASSETS_URL}/token/${toSafeChainID(props.vault.chainID)}/${props.vault.tokenAddress}/logo-128.png`}
					className={'size-8'}
				/>
				<b className={'block whitespace-break-spaces text-lg text-neutral-900 md:text-xl'}>
					{`Deposit ${props.vault.tokenSymbol} and then stake for `}
					<span className={'text-blue'}>{'more APR'}</span>
					{' or '}
					<span className={'text-orange'}>{`more ${props.vault.rewardSymbol}`}</span>
					{'.'}
				</b>
			</div>

			<DesktopStats {...props} />
			<MobileStats {...props} />
			<DepositSection {...props} />
			<WithdrawSection {...props} />

			<div className={'mt-auto hidden md:block'}>
				<b className={'block pb-2 text-xs'}>
					{'Network: '}
					{getNetwork(props.vault.chainID).name}
				</b>
				<p className={'text-xs text-neutral-600'}>
					<span className={'text-neutral-600'}>{'Contract: '}</span>
					<a
						className={'cursor-alias hover:underline'}
						href={`${blockExplorer}/address/${props.vault.vaultAddress}`}
						target={'_blank'}
						rel={'noreferrer'}>
						{props.vault.vaultAddress}
					</a>
				</p>
			</div>
		</div>
	);
}
