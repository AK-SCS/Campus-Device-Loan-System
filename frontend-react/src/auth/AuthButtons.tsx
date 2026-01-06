import { useAuth0 } from './useAuth0';

export const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      onClick={() => loginWithRedirect()}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Log In
    </button>
  );
};

export const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button
      onClick={() => logout()}
      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
    >
      Log Out
    </button>
  );
};

export const AuthenticationButton = () => {
  const { isAuthenticated, isLoading, user } = useAuth0();

  if (isLoading) {
    return <div className="px-4 py-2">Loading...</div>;
  }

  return (
    <div className="flex items-center gap-4">
      {isAuthenticated ? (
        <>
          <span className="text-gray-700">
            Welcome, {user?.email || 'User'}
          </span>
          <LogoutButton />
        </>
      ) : (
        <LoginButton />
      )}
    </div>
  );
};
