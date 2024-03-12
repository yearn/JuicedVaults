import {formatPercent, handleInputChangeValue, toBigInt, toNormalizedBN} from '@builtbymom/web3/utils';

import type {ChangeEvent} from 'react';
import type {TYDaemonVault} from '@yearn-finance/web-lib/utils/schemas/yDaemonVaultsSchemas';
import type {TNormalizedBN} from '@builtbymom/web3/types';

export function toSafeChainID(chainID: number): number {
	if (chainID === 1337) {
		return 1;
	}
	return chainID;
}

export function getVaultAPR(vault: TYDaemonVault | undefined): number {
	const vaultAPRObject = vault?.apr;
	if (!vaultAPRObject) {
		return 0;
	}
	const spotAPR = Number(vaultAPRObject?.forwardAPR?.composite?.v3OracleCurrentAPR || 0);
	const weekAPR = Number(vaultAPRObject?.points?.weekAgo || 0);
	const monthAPR = Number(vaultAPRObject?.points?.monthAgo || 0);
	if (spotAPR > 0) {
		return spotAPR * 100;
	}
	if (monthAPR > 0) {
		return monthAPR * 100;
	}
	if (weekAPR > 0) {
		return weekAPR * 100;
	}
	return 0;
}

export function formatVaultAPR(vault: TYDaemonVault | undefined): string {
	const vaultAPRObject = vault?.apr;
	if (!vaultAPRObject) {
		return formatPercent(0);
	}
	const spotAPR = Number(vaultAPRObject?.forwardAPR?.composite?.v3OracleCurrentAPR || 0);
	const weekAPR = Number(vaultAPRObject?.points?.weekAgo || 0);
	const monthAPR = Number(vaultAPRObject?.points?.monthAgo || 0);
	if (spotAPR > 0) {
		return formatPercent(spotAPR * 100);
	}
	if (monthAPR > 0) {
		return formatPercent(monthAPR * 100);
	}
	if (weekAPR > 0) {
		return formatPercent(weekAPR * 100);
	}
	if (vaultAPRObject.type.includes('new')) {
		return 'new';
	}
	return formatPercent(0);
}

export function onInput(
	e: ChangeEvent<HTMLInputElement>,
	decimals: number,
	balance: TNormalizedBN | undefined
): TNormalizedBN | undefined {
	if (e.target.value === '') {
		return undefined;
	}
	const expectedNewValue = handleInputChangeValue(e.target.value, decimals);
	if (expectedNewValue.raw > toBigInt(balance?.raw)) {
		return balance;
	}
	return handleInputChangeValue(e.target.value, decimals);
}

export function convertToYVToken(value: bigint, decimals: number, pps: bigint): TNormalizedBN {
	return toNormalizedBN((value * toBigInt(10 ** decimals)) / pps, decimals);
}

export function convertToYVYVToken(value: bigint, decimals: number, pps: bigint, underPps: bigint): TNormalizedBN {
	return toNormalizedBN((value * toBigInt(10 ** decimals) * toBigInt(10 ** decimals)) / pps / underPps, decimals);
}
