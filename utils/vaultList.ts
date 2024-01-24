import {toAddress} from '@builtbymom/web3/utils';

import type {TVaultListItem} from './types';

export const VAULT_LIST: TVaultListItem[] = [
	{
		name: 'yvAjnaDAI',
		tokenSymbol: 'DAI',
		decimals: 18,
		chainID: 1337,
		vaultAddress: toAddress('0xe24BA27551aBE96Ca401D39761cA2319Ea14e3CB'), //yvDAI
		tokenAddress: toAddress('0x6B175474E89094C44Da98b954EedeAC495271d0F'), //DAI
		autoCompoundingAddress: toAddress('0x082a5743aAdf3d0Daf750EeF24652b36a68B1e9C'), //yvyvDAI
		stakingAddress: toAddress('0x54C6b2b293297e65b1d163C3E8dbc45338bfE443'), //stakedDAI
		rewardAddress: toAddress('0x9a96ec9B57Fb64FbC60B423d1f4da7691Bd35079') //Ajna
	}
	// {
	// 	name: 'yvAjnaUSDC',
	// 	tokenSymbol: 'USDC',
	// 	decimals: 6,
	// 	chainID: 137,
	// 	vaultAddress: toAddress('0xF54a15F6da443041Bb075959EA66EE47655DDFcA'), //yvUSDC
	// 	tokenAddress: toAddress('0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'), //USDC
	// 	stakingAddress: toAddress('0xF54a15F6da443041Bb075959EA66EE47655DDFcA'), //stakedUSDC

	// 	autoCompoundingAddress: toAddress('0'), //yvyvUSDC
	// 	rewardAddress: toAddress('0') //Ajna
	// }
];
