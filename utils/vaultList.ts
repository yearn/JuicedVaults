import {toAddress} from '@builtbymom/web3/utils';

import type {TVaultListItem} from './types';

export const VAULT_LIST: TVaultListItem[] = [
	{
		name: 'yvAjnaDAI',
		tokenSymbol: 'DAI',
		rewardSymbol: 'AJNA',
		decimals: 18,
		chainID: 1,
		vaultAddress: toAddress('0xe24BA27551aBE96Ca401D39761cA2319Ea14e3CB'), //yvDAI
		tokenAddress: toAddress('0x6B175474E89094C44Da98b954EedeAC495271d0F'), //DAI
		autoCompoundingAddress: toAddress('0x082a5743aAdf3d0Daf750EeF24652b36a68B1e9C'), //yvyvDAI
		stakingAddress: toAddress('0x54C6b2b293297e65b1d163C3E8dbc45338bfE443'), //stakedDAI
		rewardAddress: toAddress('0x9a96ec9B57Fb64FbC60B423d1f4da7691Bd35079') //Ajna
	}
	// {
	// 	name: 'yvAjnaUSDC',
	// 	tokenSymbol: 'USDC',
	// 	rewardSymbol: 'MATIC',
	// 	decimals: 6,
	// 	chainID: 137,
	// 	vaultAddress: toAddress('0xF54a15F6da443041Bb075959EA66EE47655DDFcA'), //yvUSDC
	// 	tokenAddress: toAddress('0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'), //USDC
	// 	autoCompoundingAddress: toAddress('0x4987d1856F93DFf29e08aa605A805FaF43dC3103'), //yvyvUSDC
	// 	stakingAddress: toAddress('0x602920E7e0a335137E02DF139CdF8D1381DAdBfD'), //stakedUSDC
	// 	rewardAddress: toAddress('0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270') //wMATIC
	// }
];
