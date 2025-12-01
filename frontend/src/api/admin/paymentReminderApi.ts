import { privateApi } from '../axios';
import { apiRoutes } from '../routes';

export interface TriggerPaymentRemindersResponse {
  success: boolean;
  message: string;
  sentCount: number;
  errorCount: number;
}

export const triggerPaymentRemindersRequest = () =>
  privateApi.post<TriggerPaymentRemindersResponse>(
    apiRoutes.admin('/payment-reminders/trigger')
  );

