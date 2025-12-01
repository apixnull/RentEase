import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Settings,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
} from 'lucide-react';
import { triggerPaymentRemindersRequest } from '@/api/admin/paymentReminderApi';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<{
    sentCount: number;
    errorCount: number;
    timestamp: Date;
  } | null>(null);

  const handleTriggerPaymentReminders = async () => {
    try {
      setLoading(true);
      const response = await triggerPaymentRemindersRequest();
      
      if (response.data.success) {
        setLastRunResult({
          sentCount: response.data.sentCount,
          errorCount: response.data.errorCount,
          timestamp: new Date(),
        });
        toast.success(
          `Payment reminders sent successfully! Sent: ${response.data.sentCount}, Errors: ${response.data.errorCount}`
        );
      } else {
        toast.error('Failed to trigger payment reminders');
      }
    } catch (error: any) {
      console.error('Error triggering payment reminders:', error);
      toast.error(
        error?.response?.data?.error || 'Failed to trigger payment reminders'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white grid place-items-center shadow-lg">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage system settings and utilities
            </p>
          </div>
        </div>
      </motion.div>

      {/* Payment Reminders Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white grid place-items-center">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Payment Reminder System</CardTitle>
              <CardDescription>
                Manually trigger payment reminder emails for tenants
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-1">
                  How it works
                </h4>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>
                    Sends reminder emails to tenants with payments due in 2 days
                    (reminderStage = 0)
                  </li>
                  <li>
                    Sends due date emails to tenants with payments due today
                    (reminderStage = 1)
                  </li>
                  <li>
                    Only processes PENDING payments (ignores already paid)
                  </li>
                  <li>
                    Updates reminderStage after successful email sends (0→1, 1→2)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {lastRunResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Last Run Results
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700 font-medium">
                        Sent:
                      </span>{' '}
                      <span className="text-green-900 font-bold">
                        {lastRunResult.sentCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">
                        Errors:
                      </span>{' '}
                      <span className="text-green-900 font-bold">
                        {lastRunResult.errorCount}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                    <Clock className="h-3 w-3" />
                    <span>
                      {lastRunResult.timestamp.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <Button
            onClick={handleTriggerPaymentReminders}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Trigger Payment Reminders Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;

