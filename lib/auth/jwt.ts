import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export interface ShelterSession extends JWTPayload {
  shelterId: string;
  shelterCode: string;
  shelterName: string;
}

export async function createShelterToken(session: Omit<ShelterSession, keyof JWTPayload>): Promise<string> {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

export async function verifyShelterToken(token: string): Promise<ShelterSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as ShelterSession;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
