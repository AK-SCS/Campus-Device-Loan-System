import { createContext, useEffect, useState } from 'react';
import { User } from '@auth0/auth0-spa-js';
import { getAuth0Client, getAuth0ClientInstance } from './auth0Client';

interface Auth0ContextType {
  isAuthenticated: boolean;
  user: User | undefined;
  isLoading: boolean;
  loginWithRedirect: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string>;
  hasRole: (role: string) => boolean;
  userRoles: string[];
}

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined);

export { Auth0Context };

export const Auth0Provider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const initAuth0 = async () => {
      try {
        const client = await getAuth0Client();

        if (window.location.search.includes('code=') || window.location.search.includes('error=')) {
          await client.handleRedirectCallback();
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const authenticated = await client.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const userData = await client.getUser();
          setUser(userData);

          const singleRole = userData?.['https://campus-device-loan-api/role'] as string;
          const rolesArray = (userData?.['https://campus-device-loan.com/roles'] as string[]) || [];

          let roles: string[] = [];

          if (singleRole) {

            roles = [singleRole.toLowerCase()];
          } else if (rolesArray.length > 0) {
            roles = rolesArray.map(r => r.toLowerCase());
          }

          console.log('=== Auth0 User Data ===');
          console.log('Full user object:', userData);
          console.log('Single role (app_metadata):', singleRole);
          console.log('Roles array:', rolesArray);
          console.log('Final roles:', roles);
          console.log('=====================');

          setUserRoles(roles);
        }
      } catch (error) {
        console.error('Auth0 initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth0();
  }, []);

  const loginWithRedirect = async () => {
    const client = await getAuth0Client();
    await client.loginWithRedirect();
  };

  const logout = () => {
    const client = getAuth0ClientInstance();
    if (client) {
      client.logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
    }
  };

  const getAccessToken = async (): Promise<string> => {
    const client = await getAuth0Client();
    const token = await client.getTokenSilently();
    return token;
  };

  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        loginWithRedirect,
        logout,
        getAccessToken,
        hasRole,
        userRoles,
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};
