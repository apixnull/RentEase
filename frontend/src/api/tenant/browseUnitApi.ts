import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

export const getVisibleListingsForTenantRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.tenant("/browse-unit"), { signal: options?.signal });

export const getSpecificListingRequest = ( listingId: string, options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.tenant(`/browse-unit/${listingId}/details`), {
    signal: options?.signal,
  });

export const getCitiesAndMunicipalitiesRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.tenant("/browse-unit/cities-municipalities"), { signal: options?.signal });

export const searchListingsRequest = (
  searchParams: {
    search?: string;
    city?: string;
    municipality?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  } = {},
  options?: { signal?: AbortSignal }
) => {
  const params = new URLSearchParams();
  if (searchParams.search) params.append("search", searchParams.search);
  if (searchParams.city && searchParams.city !== "ALL") params.append("city", searchParams.city);
  if (searchParams.municipality && searchParams.municipality !== "ALL") params.append("municipality", searchParams.municipality);
  if (searchParams.minPrice) params.append("minPrice", searchParams.minPrice.toString());
  if (searchParams.maxPrice) params.append("maxPrice", searchParams.maxPrice.toString());
  if (searchParams.sortBy && searchParams.sortBy !== "ALL") params.append("sortBy", searchParams.sortBy);

  const queryString = params.toString();
  const url = queryString
    ? `${apiRoutes.tenant("/browse-unit/search")}?${queryString}`
    : apiRoutes.tenant("/browse-unit/search");

  return privateApi.get(url, { signal: options?.signal });
};

export const sendAIChatbotMessage = (
  message: string,
  conversationHistory: Array<{ text: string; isUser: boolean }>,
  sortBy?: string,
  options?: { signal?: AbortSignal }
) => {
  const params = new URLSearchParams();
  if (sortBy && sortBy !== "ALL") {
    params.append("sortBy", sortBy);
  }
  const queryString = params.toString();
  const url = queryString 
    ? `${apiRoutes.tenant("/browse-unit/ai-chat")}?${queryString}`
    : apiRoutes.tenant("/browse-unit/ai-chat");
  
  return privateApi.post(
    url,
    {
      message,
      conversationHistory,
    },
    { signal: options?.signal }
  );
};

export const recordUnitViewRequest = (unitId: string) =>
  privateApi.post(apiRoutes.tenant(`/browse-unit/${unitId}/view`));

export const createUnitReviewRequest = (unitId: string, rating: number, comment: string) =>
  privateApi.post(apiRoutes.tenant(`/browse-unit/${unitId}/review`), { rating, comment });

export const updateUnitReviewRequest = (reviewId: string, rating: number, comment: string) =>
  privateApi.patch(apiRoutes.tenant(`/browse-unit/review/${reviewId}`), { rating, comment });

export const deleteUnitReviewRequest = (reviewId: string) =>
  privateApi.delete(apiRoutes.tenant(`/browse-unit/review/${reviewId}`));

export const reportFraudulentListingRequest = (payload: {
  listingId: string;
  reason: string;
  details?: string;
  image1Url?: string;
  image2Url?: string;
}) => privateApi.post(apiRoutes.tenant("/fraud-reports"), payload);