export const YVAULT_STAKING_ABI = [
	{
		inputs: [
			{internalType: 'address', name: '_owner', type: 'address'},
			{internalType: 'address', name: '_stakingToken', type: 'address'}
		],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'constructor'
	},
	{
		anonymous: false,
		inputs: [
			{indexed: false, internalType: 'address', name: 'oldOwner', type: 'address'},
			{indexed: false, internalType: 'address', name: 'newOwner', type: 'address'}
		],
		name: 'OwnerChanged',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [{indexed: false, internalType: 'address', name: 'newOwner', type: 'address'}],
		name: 'OwnerNominated',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [{indexed: false, internalType: 'bool', name: 'isPaused', type: 'bool'}],
		name: 'PauseChanged',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{indexed: false, internalType: 'address', name: 'token', type: 'address'},
			{indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256'}
		],
		name: 'Recovered',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [{indexed: false, internalType: 'uint256', name: 'reward', type: 'uint256'}],
		name: 'RewardAdded',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{indexed: true, internalType: 'address', name: 'user', type: 'address'},
			{indexed: true, internalType: 'address', name: 'rewardsToken', type: 'address'},
			{indexed: false, internalType: 'uint256', name: 'reward', type: 'uint256'}
		],
		name: 'RewardPaid',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{indexed: false, internalType: 'address', name: 'token', type: 'address'},
			{indexed: false, internalType: 'uint256', name: 'newDuration', type: 'uint256'}
		],
		name: 'RewardsDurationUpdated',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{indexed: true, internalType: 'address', name: 'user', type: 'address'},
			{indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256'}
		],
		name: 'Staked',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{indexed: true, internalType: 'address', name: 'user', type: 'address'},
			{indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256'}
		],
		name: 'Withdrawn',
		type: 'event'
	},
	{
		constant: false,
		inputs: [],
		name: 'acceptOwnership',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: false,
		inputs: [
			{internalType: 'address', name: '_rewardsToken', type: 'address'},
			{internalType: 'address', name: '_rewardsDistributor', type: 'address'},
			{internalType: 'uint256', name: '_rewardsDuration', type: 'uint256'}
		],
		name: 'addReward',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: true,
		inputs: [{internalType: 'address', name: 'account', type: 'address'}],
		name: 'balanceOf',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: true,
		inputs: [
			{internalType: 'address', name: 'account', type: 'address'},
			{internalType: 'address', name: '_rewardsToken', type: 'address'}
		],
		name: 'earned',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: false,
		inputs: [],
		name: 'exit',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: false,
		inputs: [],
		name: 'getReward',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: true,
		inputs: [{internalType: 'address', name: '_rewardsToken', type: 'address'}],
		name: 'getRewardForDuration',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: true,
		inputs: [],
		name: 'lastPauseTime',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: true,
		inputs: [{internalType: 'address', name: '_rewardsToken', type: 'address'}],
		name: 'lastTimeRewardApplicable',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: false,
		inputs: [{internalType: 'address', name: '_owner', type: 'address'}],
		name: 'nominateNewOwner',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: true,
		inputs: [],
		name: 'nominatedOwner',
		outputs: [{internalType: 'address', name: '', type: 'address'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: false,
		inputs: [
			{internalType: 'address', name: '_rewardsToken', type: 'address'},
			{internalType: 'uint256', name: 'reward', type: 'uint256'}
		],
		name: 'notifyRewardAmount',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: true,
		inputs: [],
		name: 'owner',
		outputs: [{internalType: 'address', name: '', type: 'address'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: true,
		inputs: [],
		name: 'paused',
		outputs: [{internalType: 'bool', name: '', type: 'bool'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: false,
		inputs: [
			{internalType: 'address', name: 'tokenAddress', type: 'address'},
			{internalType: 'uint256', name: 'tokenAmount', type: 'uint256'}
		],
		name: 'recoverERC20',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: true,
		inputs: [{internalType: 'address', name: '', type: 'address'}],
		name: 'rewardData',
		outputs: [
			{internalType: 'address', name: 'rewardsDistributor', type: 'address'},
			{internalType: 'uint256', name: 'rewardsDuration', type: 'uint256'},
			{internalType: 'uint256', name: 'periodFinish', type: 'uint256'},
			{internalType: 'uint256', name: 'rewardRate', type: 'uint256'},
			{internalType: 'uint256', name: 'lastUpdateTime', type: 'uint256'},
			{internalType: 'uint256', name: 'rewardPerTokenStored', type: 'uint256'}
		],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: true,
		inputs: [{internalType: 'address', name: '_rewardsToken', type: 'address'}],
		name: 'rewardPerToken',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: true,
		inputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		name: 'rewardTokens',
		outputs: [{internalType: 'address', name: '', type: 'address'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: true,
		inputs: [
			{internalType: 'address', name: '', type: 'address'},
			{internalType: 'address', name: '', type: 'address'}
		],
		name: 'rewards',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: false,
		inputs: [{internalType: 'bool', name: '_paused', type: 'bool'}],
		name: 'setPaused',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: false,
		inputs: [
			{internalType: 'address', name: '_rewardsToken', type: 'address'},
			{internalType: 'address', name: '_rewardsDistributor', type: 'address'}
		],
		name: 'setRewardsDistributor',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: false,
		inputs: [
			{internalType: 'address', name: '_rewardsToken', type: 'address'},
			{internalType: 'uint256', name: '_rewardsDuration', type: 'uint256'}
		],
		name: 'setRewardsDuration',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: false,
		inputs: [{internalType: 'uint256', name: 'amount', type: 'uint256'}],
		name: 'stake',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: true,
		inputs: [],
		name: 'stakingToken',
		outputs: [{internalType: 'contract IERC20', name: '', type: 'address'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: true,
		inputs: [],
		name: 'totalSupply',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: true,
		inputs: [
			{internalType: 'address', name: '', type: 'address'},
			{internalType: 'address', name: '', type: 'address'}
		],
		name: 'userRewardPerTokenPaid',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: false,
		inputs: [{internalType: 'uint256', name: 'amount', type: 'uint256'}],
		name: 'withdraw',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const;
