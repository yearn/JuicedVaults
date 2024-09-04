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

export function getVaultAPY(vault: TYDaemonVault | undefined): number {
	const vaultAPYObject = vault?.apr;
	if (!vaultAPYObject) {
		return 0;
	}
	const spotAPY = Number(vaultAPYObject?.forwardAPR?.composite?.v3OracleCurrentAPR || 0);
	const weekAPY = Number(vaultAPYObject?.points?.weekAgo || 0);
	const monthAPY = Number(vaultAPYObject?.points?.monthAgo || 0);
	if (spotAPY > 0) {
		return spotAPY * 100;
	}
	if (monthAPY > 0) {
		return monthAPY * 100;
	}
	if (weekAPY > 0) {
		return weekAPY * 100;
	}
	return 0;
}

export function formatVaultAPY(vault: TYDaemonVault | undefined): string {
	const vaultAPYObject = vault?.apr;
	if (!vaultAPYObject) {
		return formatPercent(0);
	}
	const spotAPY = Number(vaultAPYObject?.forwardAPR?.composite?.v3OracleCurrentAPR || 0);
	const weekAPY = Number(vaultAPYObject?.points?.weekAgo || 0);
	const monthAPY = Number(vaultAPYObject?.points?.monthAgo || 0);
	if (spotAPY > 0) {
		return formatPercent(spotAPY * 100);
	}
	if (monthAPY > 0) {
		return formatPercent(monthAPY * 100);
	}
	if (weekAPY > 0) {
		return formatPercent(weekAPY * 100);
	}
	if (vaultAPYObject.type.includes('new')) {
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
