import { useContext } from 'react';
import { Auth0Context } from './Auth0Provider';

export const useAuth0 = () => {
  const context = useContext(Auth0Context);
  if (!context) {
    throw new Error('useAuth0 must be used within Auth0Provider');
  }
  return context;
};
