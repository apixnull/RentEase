import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Settings as SettingsIcon, 
  Trash2, 
  AlertTriangle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { deleteAccountRequest } from "@/api/authApi";
import { useAuthStore } from "@/stores/useAuthStore";

const LandlordSettings = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { clearUser } = useAuthStore();

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE" || !agreedToTerms) {
      return;
    }

    setDeleting(true);
    try {
      await deleteAccountRequest();
      
      // Clear user from store
      clearUser();
      
      toast.success("Account deleted successfully");
      
      // Navigate to login page
      navigate("/auth/login", { replace: true });
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete account. Please try again."
      );
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteConfirmation("");
    setAgreedToTerms(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
            <SettingsIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your account settings</p>
          </div>
        </div>
      </motion.div>

      {/* Delete Account Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-red-200 bg-gradient-to-br from-red-50/50 to-orange-50/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  Delete Account
                </CardTitle>
                <CardDescription className="mt-2 text-gray-700">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Warning Box */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-1">
                      Warning: This is a permanent action
                    </h4>
                    <p className="text-sm text-red-800">
                      Once you delete your account, all your data will be permanently removed and cannot be restored. 
                      You will not be able to retrieve your account or any associated information.
                    </p>
                  </div>
                </div>
              </div>

              {/* What will be deleted */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">What will be deleted:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
                  <li>Your personal account information</li>
                  <li>All your properties and units</li>
                  <li>All your listings</li>
                  <li>All your messages and communications</li>
                  <li>Your lease history and records</li>
                  <li>Your tenant screening records</li>
                  <li>All financial records and transactions</li>
                  <li>All saved preferences and settings</li>
                </ul>
              </div>

              {/* Delete Button */}
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleDeleteCancel();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Delete Account
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 mt-1">
                  This action cannot be undone and will not be possible to revert
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Warning Box */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-1">
                    Warning: This is a destructive action
                  </h4>
                  <p className="text-sm text-red-800">
                    Deleting your account will permanently remove all your data and cannot be retrieved. 
                    This action is irreversible and you will not be able to recover your account.
                  </p>
                </div>
              </div>
            </div>

            {/* What will be deleted */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">What will be permanently deleted:</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-2">
                <li>Your personal account information (name, email, phone number)</li>
                <li>Your account profile and settings</li>
                <li>All your properties and units</li>
                <li>All your listings</li>
                <li>All your messages and communications</li>
                <li>Your lease history and records</li>
                <li>Your tenant screening records</li>
                <li>All financial records and transactions</li>
                <li>All saved searches and preferences</li>
                <li>Access to your account and all associated data</li>
              </ul>
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <input
                type="checkbox"
                id="agreeToDelete"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="agreeToDelete" className="text-sm text-gray-700 cursor-pointer">
                <span className="font-semibold text-amber-900">
                  I understand that deleting my account is permanent and cannot be undone.
                </span>
                <span className="block mt-1 text-amber-800">
                  I will not be able to retrieve my account or any associated information after deletion.
                </span>
              </label>
            </div>

            {/* Type DELETE confirmation */}
            <div className="space-y-2">
              <label htmlFor="deleteConfirmation" className="text-sm font-semibold text-gray-900">
                To confirm, type <span className="text-red-600 font-mono">DELETE</span> in the box below:
              </label>
              <input
                type="text"
                id="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={deleting}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={
                deleteConfirmation !== "DELETE" ||
                !agreedToTerms ||
                deleting
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandlordSettings;

