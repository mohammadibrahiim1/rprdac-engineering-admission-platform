import { useAppSelector } from "@/hooks/storeHooks";

export const useCheckAuth = () => {
  const { user, accessToken, isLoggedIn, authChecked } = useAppSelector(
    (state) => state.auth,
  );

  // Authentication verification এখনো শেষ হয়নি
  const isLoading = !authChecked;

  // Valid user session থাকলেই authenticated
  const isAuthenticated = Boolean(
    isLoggedIn && user && (accessToken || isLoggedIn),
  );

  const userType = user?.userType;

  const isSuperAdmin = userType === "super-admin";
  const isAdmin = userType === "admin";

  return {
    user,
    isAuthenticated,
    isLoading,
    authChecked,
    isSuperAdmin,
    isAdmin,
  };
};
