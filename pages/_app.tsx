import React, {Fragment} from 'react';
import localFont from 'next/font/local';
import Head from 'next/head';
import {NextSeo} from 'next-seo';
import {mainnet, polygon} from 'viem/chains';
import {WalletContextApp} from '@builtbymom/web3/contexts/useWallet';
import {WithMom} from '@builtbymom/web3/contexts/WithMom';
import {localhost} from '@yearn-finance/web-lib/utils/wagmi/networks';

import meta from '../public/manifest.json';

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
				<style
					jsx
					global>
					{`
						html {
							font-family: ${aeonik.style.fontFamily};
						}
					`}
				</style>
				<title>{meta.name}</title>
				<meta
					httpEquiv={'X-UA-Compatible'}
					content={'IE=edge'}
				/>
				<meta
					name={'viewport'}
					content={
						'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover'
					}
				/>
				<meta
					name={'description'}
					content={meta.name}
				/>
				<meta
					name={'msapplication-TileColor'}
					content={meta.title_color}
				/>
				<meta
					name={'theme-color'}
					content={meta.theme_color}
				/>

				<meta
					name={'application-name'}
					content={meta.name}
				/>
				<meta
					name={'apple-mobile-web-app-title'}
					content={meta.name}
				/>
				<meta
					name={'apple-mobile-web-app-capable'}
					content={'yes'}
				/>
				<meta
					name={'apple-mobile-web-app-status-bar-style'}
					content={'default'}
				/>
				<meta
					name={'format-detection'}
					content={'telephone=no'}
				/>
				<meta
					name={'mobile-web-app-capable'}
					content={'yes'}
				/>
				<meta
					name={'msapplication-config'}
					content={'/favicons/browserconfig.xml'}
				/>
				<meta
					name={'msapplication-tap-highlight'}
					content={'no'}
				/>

				<link
					rel={'manifest'}
					href={'/manifest.json'}
				/>
				<link
					rel={'mask-icon'}
					href={'/favicons/safari-pinned-tab.svg'}
					color={meta.theme_color}
				/>
				<link
					rel={'shortcut icon'}
					type={'image/x-icon'}
					href={'/favicons/favicon.ico'}
				/>
				<link
					rel={'icon'}
					type={'image/png'}
					sizes={'32x32'}
					href={'/favicons/favicon-32x32.png'}
				/>
				<link
					rel={'icon'}
					type={'image/png'}
					sizes={'16x16'}
					href={'/favicons/favicon-16x16.png'}
				/>
				<link
					rel={'icon'}
					type={'image/png'}
					sizes={'512x512'}
					href={'/favicons/favicon-512x512.png'}
				/>
				<link
					rel={'icon'}
					type={'image/png'}
					sizes={'192x192'}
					href={'/favicons/android-icon-192x192.png'}
				/>
				<link
					rel={'icon'}
					type={'image/png'}
					sizes={'144x144'}
					href={'/favicons/android-icon-144x144.png'}
				/>
				<link
					rel={'apple-touch-icon'}
					href={'/favicons/apple-icon.png'}
				/>
				<link
					rel={'apple-touch-icon'}
					sizes={'152x152'}
					href={'/favicons/apple-icon-152x152.png'}
				/>
				<link
					rel={'apple-touch-icon'}
					sizes={'180x180'}
					href={'/favicons/apple-icon-180x180.png'}
				/>
				<link
					rel={'apple-touch-icon'}
					sizes={'167x167'}
					href={'/favicons/apple-icon-167x167.png'}
				/>
				<meta
					name={'robots'}
					content={'index,nofollow'}
				/>
				<meta
					name={'googlebot'}
					content={'index,nofollow'}
				/>
				<meta charSet={'utf-8'} />
				<NextSeo
					title={meta.name}
					defaultTitle={meta.name}
					description={meta.description}
					openGraph={{
						type: 'website',
						locale: meta.locale,
						url: meta.uri,
						site_name: meta.name,
						title: meta.name,
						description: meta.description,
						images: [
							{
								url: meta.og,
								width: 1500,
								height: 500,
								alt: meta.name
							}
						]
					}}
					twitter={{
						handle: meta.twitter,
						site: meta.twitter,
						cardType: 'summary_large_image'
					}}
				/>
			</Head>
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
