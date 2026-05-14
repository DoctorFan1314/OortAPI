export const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });

/** SWR config for dashboard data (30s polling + focus refresh) */
export const dashboardSWRConfig = {
  fetcher,
  refreshInterval: 30_000,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5_000,
};

/** SWR config for less critical data (60s polling) */
export const relaxedSWRConfig = {
  fetcher,
  refreshInterval: 60_000,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 10_000,
};
