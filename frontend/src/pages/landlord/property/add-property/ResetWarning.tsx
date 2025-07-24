import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResetWarningProps {
  onClose: () => void;
}

const ResetWarning = ({ onClose }: ResetWarningProps) => {
  return (
    <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-1 h-5 w-5 flex-shrink-0 text-yellow-600" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-800">Form Reset</h4>
          <p className="mt-1 text-sm text-yellow-700">
            Your form was reset to step 1 because photos are not saved on refresh.
            Please re-upload your property photos to continue.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-yellow-600 hover:text-yellow-800"
          aria-label="Dismiss alert"
        >
          ×
        </Button>
      </div>
    </div>
  );
};

export default ResetWarning;
