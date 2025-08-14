import React from "react";
import { Wallet, AlertTriangle } from "lucide-react";

const PaymentStatusCard: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
      <div className="grid grid-cols-2 divide-x divide-gray-200 text-center">
        
        {/* Total Unpaid */}
        <div className="px-4">
          <div className="flex items-center justify-center gap-2">
            <Wallet size={18} aria-hidden />
            <p className="text-sm font-medium text-gray-500">Total Unpaid</p>
          </div>
          <p className="mt-1 text-lg font-semibold text-gray-800">₱0.00</p>
        </div>

        {/* Past Due */}
        <div className="px-4">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle size={18} className="text-red-500" aria-hidden />
            <p className="text-sm font-medium text-gray-500">Past Due</p>
          </div>
          <p className="mt-1 text-lg font-semibold text-red-600">₱0.00</p>
        </div>

      </div>
    </div>
  );
};

export default PaymentStatusCard;
