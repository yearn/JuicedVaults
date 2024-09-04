import {VaultBasicDeposit} from 'components/v1/VaultBasicDeposit';
import {VaultChoiceWrapper} from 'components/v1/VaultChoiceWrapper';
import {cl} from '@builtbymom/web3/utils';

import type {ReactElement} from 'react';
import type {TVaultUIProps} from '@utils/types';

export function GridViewVault(props: TVaultUIProps): ReactElement {
	const {vault, prices, onChainData, yDaemonData, onRefreshVaultData, expectedAutoCompoundAPY} = props;

	return (
		<div className={'flex flex-col gap-8 rounded-lg border-4 border-neutral-900 p-4 lg:px-8 lg:py-6'}>
			<div className={'flex gap-4'}>
				<div
					className={cl(
						'grid grid-cols-1 gap-y-6 gap-x-0 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-0 w-full h-full'
					)}>
					<VaultBasicDeposit
						vault={{
							...vault,
							prices,
							onChainData,
							yDaemonData,
							autoCompoundingAPY: 0
						}}
						onRefreshVaultData={onRefreshVaultData}
					/>
					<VaultChoiceWrapper
						vault={{
							...vault,
							prices,
							onChainData,
							yDaemonData,
							autoCompoundingAPY: expectedAutoCompoundAPY
						}}
						onRefreshVaultData={onRefreshVaultData}
					/>
				</div>
			</div>
		</div>
	);
}
