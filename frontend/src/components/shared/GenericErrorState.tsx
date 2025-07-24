import { Button } from "../ui/button";

const GenericErrorState = ({ 
  errorMessage = "An unexpected error occurred",
  title = "Error Loading Data",
  retryText = "Retry",
  onRetry = () => window.location.reload(),
  iconSize = "h-12 w-12"
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div className="text-center max-w-md">
        <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${iconSize} text-red-500`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {title}
        </h2>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        <Button onClick={onRetry}>
          {retryText}
        </Button>
      </div>
    </div>
  );
};

export default GenericErrorState;


// USAGE
/**
 *  <ErrorState 
      errorMessage={error.message || "Failed to load properties"}
      title="Property Load Error"
      retryText="Try Again"
      onRetry={() => refetchData()} // Custom retry handler
    />
 */