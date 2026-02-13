import { ParamsForFetch } from '../constant/types';

export function paramsToQuery(params: ParamsForFetch) {
    const searchParams = new URLSearchParams({
        page: String(params.page),
        page_size: String(params.pageSize),
        ...(params.search && { search: params.search }),
        ...(params.startDate && { datetime_beg__gt: params.startDate }),
        ...(params.endDate && { datetime_beg__lt: params.endDate })
    });

    // Add tagIds if present
    if (params.tagIds && params.tagIds.length > 0) {
        params.tagIds.forEach(tagId => {
            searchParams.append('tags', String(tagId));
        });
    }

    return searchParams.toString();
}
