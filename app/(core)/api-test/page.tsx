import { useRegistrationStatus } from "@/hooks";

export default function ApiTestPage() {
  const { data: status, isLoading, error } = useRegistrationStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking API status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">API Connection Failed</p>
          <p className="mt-2">Could not connect to the registration endpoint</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            API Status Check
          </h1>

          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-semibold">✓ Online</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Message:</span>
              <span className="text-gray-900">{status?.message}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Environment:</span>
              <span className="text-gray-900 capitalize">
                {status?.environment}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-gray-500">
              Registration API is ready to accept requests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
