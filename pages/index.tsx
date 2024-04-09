import React, {useCallback, useMemo, useState} from 'react';
import Image from 'next/image';
import {HeaderTitle} from 'components/HeaderTitle';
import {SearchBar, type TQuery} from 'components/SearchBar';
import {VaultV1} from 'components/v1/Vault';
import {VaultV2} from 'components/v2/Vault';
import {cl} from '@builtbymom/web3/utils';
import {IconSpinner} from '@icons/IconSpinner';
import {VAULT_LIST} from '@utils/vaultList';
import {useFetchYearnPrices} from '@yearn-finance/web-lib/hooks/useFetchYearnPrices';

import type {ReactElement} from 'react';
import type {TDict} from '@builtbymom/web3/types';
import type {TVault, TVaultListItem} from '@utils/types';

function Home(): ReactElement {
	const [queryArguments, set_queryArguments] = useState<TQuery>({});
	const [vaultsData, set_vaultsData] = useState<TDict<TVault>>({});

	const prices = useFetchYearnPrices();

	const registerNewVault = useCallback((vault: TVault): void => {
		set_vaultsData(prevState => {
			return {...prevState, [vault.vaultAddress]: vault};
		});
	}, []);

	const isAllPoolsLoaded =
		Object.keys(vaultsData).length === VAULT_LIST.length &&
		Object.values(vaultsData).every(vault => vault.isFetched);

	const vaultsList = useMemo((): TVaultListItem[] => {
		if (!isAllPoolsLoaded) {
			return VAULT_LIST;
		}

		const clonedVaults = [...VAULT_LIST];

		if (!queryArguments.initialized) {
			return [];
		}
		if (queryArguments.search) {
			return clonedVaults.filter(
				vault =>
					vault.name.toLocaleLowerCase().includes(queryArguments.search as string) ||
					vault.rewardSymbol.toLocaleLowerCase().includes(queryArguments.search as string) ||
					vault.vaultAddress.toLocaleLowerCase().includes(queryArguments.search as string)
			);
		}
		if (queryArguments.filter === 'incentive') {
			return clonedVaults.sort((a, b) => {
				const vaultAData = vaultsData[a.vaultAddress];
				const vaultBData = vaultsData[b.vaultAddress];

				return vaultBData.rewardsValue - vaultAData.rewardsValue;
			});
		}

		if (queryArguments.filter === 'apr') {
			return clonedVaults.sort((a, b) => {
				const vaultAData = vaultsData[a.vaultAddress];
				const vaultBData = vaultsData[b.vaultAddress];

				return vaultBData.apr - vaultAData.apr;
			});
		}

		if (queryArguments.filter === 'tvl') {
			return clonedVaults.sort((a, b) => {
				const vaultAData = vaultsData[a.vaultAddress];
				const vaultBData = vaultsData[b.vaultAddress];

				return vaultBData.tvl - vaultAData.tvl;
			});
		}

		/**************************************************************************
		 ** Default filter is queryArguments.filter === 'deposited'
		 *************************************************************************/
		return clonedVaults.sort((a, b) => {
			const vaultAData = vaultsData[a.vaultAddress];
			const vaultBData = vaultsData[b.vaultAddress];

			const aDeposited = vaultAData.autoCompoundingDeposit + vaultAData.rewardsDeposit || 0;
			const bDeposited = vaultBData.autoCompoundingDeposit + vaultBData.rewardsDeposit || 0;

			return bDeposited - aDeposited || vaultBData.apr - vaultAData.apr;
		});
	}, [queryArguments, vaultsData, isAllPoolsLoaded]);

	return (
		<div>
			<div className={'relative size-full max-h-96 min-h-96 md:max-h-[471px] md:min-h-[471px]'}>
				<Image
					priority
					loading={'eager'}
					quality={95}
					width={1136}
					height={396}
					src={'/hero.svg'}
					alt={'Hero'}
					className={
						'absolute inset-0 max-h-96 min-h-96 w-full border-y-4 border-neutral-900 object-cover object-center md:max-h-[471px] md:min-h-[471px]'
					}
				/>
				<div className={'mx-auto w-full max-w-6xl items-center'}>
					<HeaderTitle className={'relative z-20 w-full md:h-[460px] md:w-[628px]'} />
				</div>
			</div>

			<main className={'mx-auto grid w-full max-w-6xl gap-4'}>
				<div className={'z-10 -mt-12 w-full rounded-lg border-4 border-neutral-900 bg-beige md:pr-4'}>
					<SearchBar
						queryArguments={queryArguments}
						onChange={set_queryArguments}
					/>
				</div>

				{!isAllPoolsLoaded && (
					<div className={'mt-16 flex justify-center'}>
						<IconSpinner className={'text-neutral-900'} />
					</div>
				)}

				<div className={cl('grid w-full gap-4', !isAllPoolsLoaded ? 'hidden' : '')}>
					{vaultsList.map(vault =>
						vault.version === 1 ? (
							<VaultV1
								key={vault.name}
								prices={prices}
								vault={vault}
								registerNewVault={registerNewVault}
							/>
						) : (
							<VaultV2
								key={vault.name}
								prices={prices}
								vault={vault}
								registerNewVault={registerNewVault}
							/>
						)
					)}
				</div>
			</main>
		</div>
	);
}

export default function Wrapper(): ReactElement {
	return <Home />;
}
