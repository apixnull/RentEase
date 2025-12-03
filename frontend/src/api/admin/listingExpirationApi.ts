import { privateApi } from '../axios';
import { apiRoutes } from '../routes';

export interface TriggerListingExpirationResponse {
  success: boolean;
  message: string;
  processedCount: number;
  errorCount: number;
}

export const triggerListingExpirationRequest = () =>
  privateApi.post<TriggerListingExpirationResponse>(
    apiRoutes.admin('/listing-expiration/trigger')
  );

