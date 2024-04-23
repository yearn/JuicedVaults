import {type ReactElement, useMemo} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {HeaderTitle} from 'components/HeaderTitle';
import {VaultV1} from 'components/v1/Vault';
import {VaultV2} from 'components/v2/Vault';
import {cl, toAddress} from '@builtbymom/web3/utils';
import {IconBack} from '@icons/IconBack';
import {VAULT_LIST} from '@utils/vaultList';
import {useFetchYearnPrices} from '@yearn-finance/web-lib/hooks/useFetchYearnPrices';

import type {TVaultListItem} from '@utils/types';

function VaultByAddress(props: {pageProps: {address: string}}): ReactElement {
	const prices = useFetchYearnPrices();

	const selectedVault = useMemo((): TVaultListItem | undefined => {
		return VAULT_LIST.find(vault => toAddress(vault.vaultAddress) === toAddress(props.pageProps.address));
	}, [props.pageProps.address]);

	if (!selectedVault) {
		return (
			<section className={'mx-auto mt-10 grid w-full max-w-6xl'}>
				<div className={'rounded-lg border-4 border-neutral-900 bg-beige'}>
					<div className={'py-6'}>
						<h1 className={'font-monument text-center text-3xl font-bold md:text-7xl'}>{'NOT FOUND!'}</h1>
					</div>
					<div className={'border-y-4 border-neutral-800'}>
						<Image
							alt={'Juice'}
							className={'w-full'}
							src={'/hero.svg'}
							width={1200}
							height={400}
						/>
					</div>
					<div className={'px-4 py-6 md:px-8'}>
						<div className={'pl-0 md:pl-2'}>
							<h2 className={'font-monument text-lg font-bold md:text-2xl'}>
								{'Juice is not ready yet!'}
							</h2>
							<p className={'w-full text-base md:w-4/5 md:text-lg'}>
								{
									'This vault is not ready yet. Please check back later or go to the vaults page to see the available vaults.'
								}
							</p>
						</div>
						<div className={'mt-4 flex flex-col gap-2 md:flex-row'}>
							<Link href={'/'}>
								<button
									className={cl(
										'h-12 w-full md:w-[200px] rounded-lg border-2 border-neutral-900 text-center',
										'bg-yellow hover:bg-yellowHover transition-colors'
									)}>
									<b className={'text-nowrap'}>{'Go to vaults'}</b>
								</button>
							</Link>
						</div>
					</div>
				</div>
			</section>
		);
	}

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
					<HeaderTitle className={'relative z-10 w-full md:h-[460px] md:w-[628px]'} />
				</div>
			</div>
			<Link
				href={'/'}
				className={'my-4 flex items-center'}>
				<IconBack className={'size-16 text-neutral-600'} />
				<h3 className={'text-lg font-semibold text-neutral-600'}>{'Back to all Vaults'}</h3>
			</Link>
			<div className={'mx-auto w-full max-w-6xl'}>
				{selectedVault.version === 1 ? (
					<VaultV1
						key={selectedVault.stakingAddress}
						prices={prices}
						vault={selectedVault}
						isListView={false}
					/>
				) : (
					<VaultV2
						key={selectedVault.stakingAddress}
						prices={prices}
						vault={selectedVault}
						isListView={false}
					/>
				)}
			</div>
		</div>
	);
}

VaultByAddress.getInitialProps = async ({query}: {query: {address: string}}) => {
	return {address: query.address};
};

export default VaultByAddress;
