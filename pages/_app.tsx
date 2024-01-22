import React, {Fragment} from 'react';
import {Inter} from 'next/font/google';
import Image from 'next/image';
import {TokenListContextApp} from 'contexts/useTokenList';
import {WalletContextApp} from 'contexts/useWallet';
import {mainnet} from 'wagmi';
import {WithYearn} from '@yearn-finance/web-lib/contexts/WithYearn';
import {localhost} from '@yearn-finance/web-lib/utils/wagmi/networks';
import {NetworkSelector, WalletSelector} from '@common/HeaderElements';
import Meta from '@common/Meta';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

import '../style.css';

const inter = Inter({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--inter-font'
});

function Header(): ReactElement {
	return (
		<div
			id={'head'}
			className={'fixed inset-x-0 top-0 z-50 w-full border-b border-primary-100'}>
			<div
				id={'head'}
				className={'bg-primary-50/95 px-10'}>
				<div className={'mx-auto flex flex-row justify-between p-4'}>
					<div className={'flex items-center justify-start'}>
						<div className={'flex items-center justify-center rounded-full'}>
							<Image
								alt={''}
								width={40}
								height={40}
								src={'/logo.png'}
								className={'h-10 w-10 rounded-full'}
							/>
						</div>
					</div>
					<div className={'flex items-center justify-end'}>
						<NetworkSelector networks={[]} />
						<WalletSelector />
					</div>
				</div>
			</div>
		</div>
	);
}

function MyApp({Component, ...props}: AppProps): ReactElement {
	return (
		<>
			<style
				jsx
				global>
				{`
					html {
						font-family: ${inter.style.fontFamily};
					}
				`}
			</style>
			<Meta />
			<WithYearn supportedChains={[mainnet, localhost]}>
				<TokenListContextApp>
					<WalletContextApp>
						<Fragment>
							<Header />
							<main
								className={`relative mx-auto mb-0 flex min-h-screen w-full flex-col pt-20 ${inter.variable}`}>
								<Component {...props} />
							</main>
						</Fragment>
					</WalletContextApp>
				</TokenListContextApp>
			</WithYearn>
		</>
	);
}

export default MyApp;
