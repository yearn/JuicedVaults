import React, {Fragment} from 'react';
import localFont from 'next/font/local';
import {mainnet, polygon} from 'viem/chains';
import {WalletContextApp} from '@builtbymom/web3/contexts/useWallet';
import {WithMom} from '@builtbymom/web3/contexts/WithMom';
import {localhost} from '@yearn-finance/web-lib/utils/wagmi/networks';
import Meta from '@common/Meta';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

import '../style.css';

const aeonik = localFont({
	variable: '--font-aeonik',
	display: 'swap',
	src: [
		{
			path: '../public/fonts/AeonikFono-Regular.woff2',
			weight: '400',
			style: 'normal'
		},
		{
			path: '../public/fonts/AeonikFono-Bold.woff2',
			weight: '700',
			style: 'normal'
		}
	]
});

function MyApp({Component, ...props}: AppProps): ReactElement {
	return (
		<>
			<style
				jsx
				global>
				{`
					html {
						font-family: ${aeonik.style.fontFamily};
					}
				`}
			</style>
			<Meta />
			<WithMom
				supportedChains={[mainnet, polygon, localhost]}
				tokenLists={[
					'https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/yearn.json',
					'https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/ajna.json'
				]}>
				<WalletContextApp>
					<Fragment>
						<main className={`relative mx-auto mb-0 flex min-h-screen w-full flex-col ${aeonik.variable}`}>
							<Component {...props} />
						</main>
					</Fragment>
				</WalletContextApp>
			</WithMom>
		</>
	);
}

export default MyApp;
