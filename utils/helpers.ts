import {formatPercent, handleInputChangeValue, toBigInt} from '@builtbymom/web3/utils';

import type {ChangeEvent} from 'react';
import type {TYDaemonVault} from '@yearn-finance/web-lib/utils/schemas/yDaemonVaultsSchemas';
import type {TNormalizedBN} from '@builtbymom/web3/types';

export function toSafeChainID(chainID: number): number {
	if (chainID === 1337) {
		return 1;
	}
	return chainID;
}

export function getVaultAPR(vault: TYDaemonVault | undefined): string {
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
