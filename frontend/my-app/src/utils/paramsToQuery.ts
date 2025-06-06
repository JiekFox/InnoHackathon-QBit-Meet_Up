import { ParamsForFetch } from '../constant/types';

export function paramsToQuery(params: ParamsForFetch) {
    return new URLSearchParams({
        page: String(params.page),
        page_size: String(params.pageSize),
        ...(params.search && { search: params.search }),
        ...(params.startDate && { datetime_beg__gt: params.startDate }),
        ...(params.endDate && { datetime_beg__lt: params.endDate })
    }).toString();
}
