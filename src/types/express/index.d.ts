import { User as PrismaUser } from '@prisma/client';

declare global {
  namespace Express {
    type User = PrismaUser;
  }
}

export {};
