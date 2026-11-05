import { useGetAllSystemLocksQuery } from '../../admin/controlPanel/systemLock/api/systemLockApi';

export const useFeatureLock = (portalType, featureName) => {
  const {
    data: response,
    isLoading,
    error,
  } = useGetAllSystemLocksQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const locksList = response?.data || [];

  const portal = locksList.find((lock) => lock.portalType === 'student');

  const feature = portal?.features?.find(
    (f) => f.featureName === 'data_update',
  );

  return {
    isLoading,
    error,
    isLocked: Boolean(feature?.isLocked),
    isHidden: Boolean(feature?.isHidden || portal?.isFrozen), // পোর্টাল ফ্রোজেন থাকলেও হিডেন হওয়া উচিত

    // ৩. রেসপন্স অনুযায়ী notices.frozenMessage থেকে ডেটা রিড করা
    frozenMessage:
      portal?.notices?.frozenMessage ||
      'This section is currently unavailable! Please check back later.',

    // ৪. ফিচার লেভেলের lockMessage থেকে ডেটা রিড করা (আপনার রেসপন্সে ফিল্ডের নাম lockMessage)
    generalMessage:
      feature?.lockMessage ||
      portal?.notices?.generalMessage ||
      'This feature is currently locked! Please check back later.',
  };
};
