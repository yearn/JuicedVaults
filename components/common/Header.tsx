import React from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {cl, truncateHex} from '@builtbymom/web3/utils';
import {IconMenu} from '@icons/IconMenu';
import {useAccountModal} from '@rainbow-me/rainbowkit';
import {Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTrigger} from '@common/Drawer';

import type {ReactElement} from 'react';

function Header(): ReactElement {
	const pathname = usePathname();
	const {onConnect, onDesactivate, address, ens, clusters} = useWeb3();
	const {openAccountModal} = useAccountModal();

	const ensOrClusters = address && (ens || clusters?.name);
	const tabs = [
		{href: 'https://juiced.app', label: 'About', target: '_blank'},
		{href: '/', label: 'Vaults'},
		{href: 'https://juiced.app/pools', label: 'Pools', target: '_blank'},
		{href: 'https://juiced.app/incentivize', label: 'Incentivize', target: '_blank'},
		{href: 'https://docs.juiced.app', label: 'Docs', target: '_blank'},
		{href: 'https://twitter.com/ajnafi', label: 'Twitter', target: '_blank'}
	];

	return (
		<header className={'mx-auto grid w-full max-w-6xl'}>
			<div className={'z-10 my-4 hidden w-full justify-between px-10 md:flex'}>
				<div className={'flex gap-x-6'}>
					{tabs.map(({href, label, target}) => (
						<Link
							key={href}
							href={href}
							target={target}>
							<p
								title={label}
								className={cl(
									'hover-fix text-center',
									href.startsWith('/') || pathname === href
										? 'font-bold text-neutral-900'
										: 'text-[#552E08] transition-all hover:text-neutral-900 hover:font-bold'
								)}>
								{label}
							</p>
						</Link>
					))}
				</div>
				<div className={''}>
					<button
						suppressHydrationWarning
						onClick={address ? openAccountModal : onConnect}
						className={'text-base font-bold'}>
						{ensOrClusters ? ensOrClusters : address ? truncateHex(address, 6) : 'Connect Wallet'}
					</button>
				</div>
			</div>
			<div className={'z-10 my-4 flex w-full justify-between px-2 md:hidden'}>
				<Drawer direction={'left'}>
					<DrawerTrigger>
						<IconMenu className={'size-6'} />
					</DrawerTrigger>
					<DrawerContent className={'bg-orange'}>
						<DrawerHeader>
							<button
								suppressHydrationWarning
								onClick={address ? onDesactivate : onConnect}
								className={
									'h-10 rounded-lg border-2 border-neutral-900 bg-yellow px-5 text-base font-bold'
								}>
								{ensOrClusters ? ensOrClusters : address ? truncateHex(address, 6) : 'Connect Wallet'}
							</button>
							<div className={'mt-6 grid gap-4 text-left'}>
								{tabs.map(({href, label, target}) => (
									<Link
										key={href}
										href={href}
										target={target}>
										<DrawerClose>
											<p
												className={cl(
													'text-left',
													pathname === href ? 'font-bold text-neutral-900' : 'text-[#552E08]'
												)}>
												{label}
											</p>
										</DrawerClose>
									</Link>
								))}
							</div>
						</DrawerHeader>
						<DrawerFooter>
							<DrawerClose>
								<button className={'text-xs text-neutral-900/60'}>{'Close'}</button>
							</DrawerClose>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
				<div className={''}>
					<button
						suppressHydrationWarning
						onClick={address ? openAccountModal : onConnect}
						className={'text-base font-bold'}>
						{ensOrClusters ? ensOrClusters : address ? truncateHex(address, 6) : 'Connect Wallet'}
					</button>
				</div>
			</div>
		</header>
	);
}

export {Header};
