import React from 'react';
import { Loader2, Lock } from 'lucide-react';
import { useFeatureLock } from '../hooks/useFeaturedLock';

export const FeatureGuard = ({
  portalType,
  featureName,
  children,
  fallback,
}) => {
  const { isLoading, isHidden, isLocked, frozenMessage, generalMessage } =
    useFeatureLock(portalType, featureName);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm text-gray-500 mt-2 font-medium">Please wait...</p>
      </div>
    );
  }

  if (isHidden) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-50 rounded-xl border border-gray-100 font-sans">
          <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Portal is Closed</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md">{frozenMessage}</p>
        </div>
      )
    );
  }

  if (isLocked) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-amber-50/50 rounded-xl border border-amber-100 font-sans">
          <div className="p-4 bg-amber-50 text-amber-500 rounded-full mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-amber-800">Feature Locked!</h2>
          <p className="text-sm text-amber-600 mt-2 max-w-7xl">
            {generalMessage}
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
};
