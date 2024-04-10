import {useMemo} from 'react';
import {useChains} from 'wagmi';

function useBlockExplorer(chainId: number): string | undefined {
	const chains = useChains();

	const explorer = useMemo(
		() => chains.find(chain => chain.id === chainId)?.blockExplorers?.default.url,
		[chains, chainId]
	);

	return explorer;
}

export {useBlockExplorer};
