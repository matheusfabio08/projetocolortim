import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET!;
if (!secret) throw new Error('JWT_SECRET is not defined');

export interface JwtPayload {
  userId: string;
  sessionId: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
