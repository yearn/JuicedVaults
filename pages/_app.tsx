import React from 'react';
import {Toaster} from 'react-hot-toast';
import localFont from 'next/font/local';
import Head from 'next/head';
import {gnosis, mainnet, polygon} from 'viem/chains';
import {WalletContextApp} from '@builtbymom/web3/contexts/useWallet';
import {WithMom} from '@builtbymom/web3/contexts/WithMom';
import {localhost} from '@builtbymom/web3/utils/wagmi/networks';
import IconCheck from '@icons/IconCheck';
import IconCircleCross from '@icons/IconCircleCross';
import {Header} from '@common/Header';
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
			<Head>
				<script
					defer
					data-domain={'juiced.yearn.fi'}
					src={'/js/script.js'}
				/>
				<style
					jsx
					global>
					{`
						html {
							font-family: ${aeonik.style.fontFamily};
						}
					`}
				</style>
			</Head>
			<Meta />
			<WithMom
				supportedChains={[mainnet, polygon, gnosis, localhost]}
				tokenLists={[
					'https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/yearn.json',
					'https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/ajna.json'
				]}>
				<WalletContextApp>
					<div className={'${aeonik.variable} mx-auto flex size-full h-screen flex-col'}>
						<div className={'bg-orange'}>
							<Header />
						</div>
						<main className={'relative flex h-full flex-col justify-between'}>
							<Component {...props} />
							<footer className={'mx-auto mt-10 flex w-full max-w-6xl justify-center pb-5 text-center'}>
								<small className={'block w-full text-xs text-neutral-400 md:w-2/3 md:text-sm'}>
									{
										'These Vaults deposit into Ajna, a new protocol. Unlike real juice, these strategies are not 100% liquid. There may be times when you cannot withdraw all of your funds. Proceed with caution.'
									}
								</small>
							</footer>
						</main>
					</div>
				</WalletContextApp>
			</WithMom>
			<Toaster
				toastOptions={{
					duration: 5000,
					className: 'toast',
					success: {
						icon: <IconCheck className={'-mr-1 size-5 min-h-5 min-w-5 pt-1.5'} />,
						iconTheme: {
							primary: 'black',
							secondary: '#F1EBD9'
						}
					},
					error: {
						icon: <IconCircleCross className={'-mr-1 size-5 min-h-5 min-w-5 pt-1.5'} />,
						iconTheme: {
							primary: 'black',
							secondary: '#F1EBD9'
						}
					}
				}}
				position={'top-left'}
			/>
		</>
	);
}

export default MyApp;
