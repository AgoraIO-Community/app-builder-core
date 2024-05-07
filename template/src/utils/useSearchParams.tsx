import {useLocation} from '../components/Router';
import {useMemo} from 'react';
import isSDK from './isSDK';

interface ReadOnlyURLSearchParams extends URLSearchParams {
  append: never;
  set: never;
  delete: never;
  sort: never;
}

function useLocationWrapper() {
  let search = useLocation().search;
  if (isSDK()) {
    search = window.location.search;
  }
  return {
    search,
  };
}

export function useSearchParams() {
  const {search} = useLocationWrapper();
  return useMemo(
    () => new URLSearchParams(search) as ReadOnlyURLSearchParams,
    [search],
  );
}
