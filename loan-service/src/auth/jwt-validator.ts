import { HttpRequest, InvocationContext } from '@azure/functions';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const AUTH0_DOMAIN = 'campusdeviceloansystem.uk.auth0.com';
const AUTH0_AUDIENCE = 'https://campusdeviceloansystem';

const client = jwksClient({
  jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  cacheMaxAge: 86400000, 
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export interface DecodedToken {
  sub: string;
  email?: string;
  permissions?: string[];
  [key: string]: any;
}

export async function validateToken(request: HttpRequest, context: InvocationContext): Promise<DecodedToken | null> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      context.log('No authorization header found');
      return null;
    }

    const token = authHeader.substring(7);

    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          audience: AUTH0_AUDIENCE,
          issuer: `https://${AUTH0_DOMAIN}/`,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) {
            context.log('Token verification failed:', err.message);
            reject(err);
            return;
          }
          resolve(decoded as DecodedToken);
        }
      );
    });
  } catch (error) {
    context.log('Error validating token:', error);
    return null;
  }
}

export function requireAuth(request: HttpRequest, context: InvocationContext): { status: number; jsonBody: any } | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      status: 401,
      jsonBody: {
        error: 'Unauthorized',
        message: 'No authentication token provided'
      }
    };
  }

  return null;
}

export function hasRole(decodedToken: DecodedToken, requiredRole: string): boolean {
  const permissions = decodedToken.permissions || [];
  return permissions.includes(requiredRole);
}
