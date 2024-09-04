import React, {useCallback, useEffect} from 'react';
import {useSearchParams} from 'next/navigation';
import {useRouter} from 'next/router';
import {cl} from '@builtbymom/web3/utils';

import type {ChangeEvent, Dispatch, FormEvent, ReactElement, SetStateAction} from 'react';

type TPossibleFilters = 'incentive' | 'tvl' | 'deposited' | 'claimable' | 'apy' | undefined;
export type TQuery = {
	filter?: TPossibleFilters;
	search?: string;
	initialized?: boolean;
};
function SearchBar({
	queryArguments,
	onChange
}: {
	queryArguments: TQuery;
	onChange: Dispatch<SetStateAction<TQuery>>;
}): ReactElement {
	const router = useRouter();
	const searchParams = useSearchParams();

	/**************************************************************************
	 ** This function is used to update the URL query params when the user
	 ** submits the search form. It also keeps the filter query param if it
	 ** exists.
	 **************************************************************************/
	const triggerSearch = useCallback(
		(e: FormEvent<HTMLFormElement>): void => {
			e.preventDefault();
			const form = e.currentTarget as HTMLFormElement;
			const formData = new FormData(form);
			const search = formData.get('search') as string;
			const query: TQuery = {search};
			if (queryArguments.filter) {
				query.filter = queryArguments.filter;
			}
			router.push(router.pathname, {query}, {shallow: true});
		},
		[queryArguments.filter, router]
	);

	/**************************************************************************
	 ** This function is used to update the URL query params when the user
	 ** clicks on the filter buttons. It also keeps the search query param
	 ** if it exists.
	 **************************************************************************/
	const triggerFilter = useCallback(
		(filter: TPossibleFilters): void => {
			const query: TQuery = {};
			if (queryArguments.search) {
				query.search = queryArguments.search;
			}
			if (filter !== undefined) {
				query.filter = filter; //After to keep order consistency
			} //Not using incentive as it's the default

			if (queryArguments.filter === filter) {
				query.filter = undefined;
				delete query.filter;
			}
			router.push(router.pathname, {query}, {shallow: true});
		},
		[queryArguments.search, router, queryArguments.filter]
	);

	/**************************************************************************
	 ** This function is used to clear the search query param when the user
	 ** clicks on the clear button. It also keeps the filter query param if it
	 ** exists.
	 **************************************************************************/
	const onClear = useCallback(
		(e: ChangeEvent<HTMLInputElement>): void => {
			e.preventDefault();
			if (e.target.value === '') {
				if (queryArguments.filter) {
					router.push(router.pathname, {query: {filter: queryArguments.filter}}, {shallow: true});
				} else {
					router.push(router.pathname, {}, {shallow: true});
				}
			}
		},
		[queryArguments.filter, router]
	);

	/**************************************************************************
	 ** This effect is used to update the queryArguments state when the user
	 ** interacts with the search bar.
	 **************************************************************************/
	useEffect(() => {
		const maybeSearch = searchParams.get('search');
		const maybeFilter = searchParams.get('filter');

		/**********************************************************************
		 ** If we're on the server and there's no search or filter, just return
		 ** the full list of pools
		 **********************************************************************/
		if (typeof window === 'undefined' && !maybeSearch && !maybeFilter) {
			onChange({});
			return;
		}

		/**********************************************************************
		 ** If we are on client side and we have a search result from the next
		 ** hook, use that to filter the list of pools
		 **********************************************************************/
		if (typeof window !== 'undefined' && maybeSearch && typeof maybeSearch === 'string') {
			const search = (maybeSearch as string).toLocaleLowerCase();
			onChange(prev => ({...prev, search, initialized: true}));
			document.getElementById('search')?.setAttribute('value', search);
		}

		/**********************************************************************
		 ** If we are on client side and we don't have a search result from the
		 ** next hook, we try to use the URL search param to filter the list of
		 ** pools. This could happen on initial load.
		 **********************************************************************/
		if (typeof window !== 'undefined' && !maybeSearch) {
			const search = new URLSearchParams(window.location.search).get('search');
			if (search) {
				onChange(prev => ({...prev, search, initialized: true}));
				document.getElementById('search')?.setAttribute('value', search);
			} else {
				onChange(prev => ({...prev, search: undefined, initialized: true}));
			}
		}

		/**********************************************************************
		 ** If we are on client side and we have a filter result from the next
		 ** hook, use that to filter the list of pools
		 **********************************************************************/
		if (typeof window !== 'undefined' && maybeFilter && typeof maybeFilter === 'string') {
			const filter = (maybeFilter as string).toLocaleLowerCase();
			if (filter !== undefined) {
				onChange(prev => ({...prev, filter: filter as TPossibleFilters, initialized: true}));
			} else {
				onChange(prev => ({...prev, filter: undefined, initialized: true}));
			}
		}

		/**********************************************************************
		 ** If we are on client side and we don't have a filter result from the
		 ** next hook, we try to use the URL search param to filter the list of
		 ** pools. This could happen on initial load.
		 **********************************************************************/
		if (typeof window !== 'undefined' && !maybeFilter) {
			const filter = new URLSearchParams(window.location.search).get('filter');
			if (filter) {
				if (filter !== undefined) {
					onChange(prev => ({...prev, filter: filter as TPossibleFilters, initialized: true}));
				} else {
					onChange(prev => ({...prev, filter: undefined, initialized: true}));
				}
			} else {
				onChange(prev => ({...prev, filter: undefined, initialized: true}));
			}
		}
	}, [onChange, queryArguments.filter, queryArguments.search, searchParams]);

	return (
		<aside className={'mx-auto w-full max-w-6xl'}>
			<div className={'box flex flex-col-reverse items-center justify-between gap-6 p-6 md:flex-row md:gap-2'}>
				<div className={'flex w-full items-center gap-2 text-left md:gap-6'}>
					<b className={'text-sm md:text-base'}>{'Sort by:'}</b>
					<button
						id={'trigger-filterDeposited'}
						onClick={() => triggerFilter('deposited')}
						className={`hover-fix text-sm md:text-base ${
							!queryArguments.filter || queryArguments.filter === 'deposited' ? 'font-bold underline' : ''
						}`}>
						{'Deposited'}
					</button>
					<button
						id={'trigger-filterAPY'}
						onClick={() => triggerFilter('apy')}
						className={`hover-fix text-sm md:text-base ${
							queryArguments.filter === 'apy' ? 'font-bold underline' : ''
						}`}>
						{'APY'}
					</button>
					<button
						id={'trigger-filterIncentive'}
						onClick={() => triggerFilter('incentive')}
						className={`hover-fix text-sm md:text-base ${
							queryArguments.filter === 'incentive' ? 'font-bold underline' : ''
						}`}>
						{'Incentives'}
					</button>
					<button
						id={'trigger-filterTVL'}
						onClick={() => triggerFilter('tvl')}
						className={`hover-fix text-sm md:text-base ${
							queryArguments.filter === 'tvl' ? 'font-bold underline' : ''
						}`}>
						{'TVL'}
					</button>
					<button
						id={'trigger-filterClaimable'}
						onClick={() => triggerFilter('claimable')}
						className={`hover-fix hidden text-sm md:text-base ${
							queryArguments.filter === 'claimable' ? 'font-bold underline' : ''
						}`}>
						{'Claimable'}
					</button>
				</div>
				<form
					id={'search-form'}
					onSubmit={triggerSearch}
					className={'flex w-full justify-end gap-2'}>
					<input
						id={'search'}
						name={'search'}
						onChange={onClear}
						className={
							'h-10 w-full rounded-lg border-2 border-neutral-900 bg-transparent px-2 text-left text-sm'
						}
						placeholder={'Name or address'}
						type={'search'}
					/>
					<button
						className={cl(
							'h-10 w-full md:w-28 rounded-lg border-2 border-neutral-900 text-center',
							'bg-blue hover:bg-blueHover transition-colors font-bold text-sm md:text-base'
						)}>
						{'Search'}
					</button>
				</form>
			</div>
		</aside>
	);
}

export {SearchBar};
