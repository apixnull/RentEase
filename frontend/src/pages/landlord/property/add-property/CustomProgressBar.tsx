import { Home, CheckCircle } from "lucide-react";

interface CustomProgressBarProps {
  currentStep: number;
}

const CustomProgressBar = ({ currentStep }: CustomProgressBarProps) => {
  const steps = [
    { name: "Property Details", icon: <Home className="h-5 w-5" /> },
    { name: "Add Unit", icon: <CheckCircle className="h-5 w-5" /> },
  ];

  return (
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <div key={step.name} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white scale-110"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : step.icon}
              </div>
              <p
                className={`mt-1 text-xs font-semibold text-center ${
                  isActive ? "text-blue-600" : "text-gray-600"
                }`}
              >
                {step.name}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-auto border-t-4 transition-all duration-300 mx-6 ${
                  isCompleted ? "border-green-500" : "border-gray-200"
                }`}
                style={{ width: "120px" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CustomProgressBar;
