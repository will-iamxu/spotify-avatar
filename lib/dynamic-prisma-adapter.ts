/**
 * Dynamic Prisma Adapter for NextAuth
 * 
 * This adapter extends the standard Prisma adapter to support dynamic database
 * credentials from AWS Secrets Manager, handling automatic password rotation.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Adapter } from "next-auth/adapters";
import { getDynamicPrismaClient } from "./db-dynamic";

/**
 * Creates a dynamic Prisma adapter that can handle credential rotation
 * 
 * This adapter wraps all Prisma operations to use the dynamic client,
 * ensuring fresh credentials are used for each database operation.
 */
export function DynamicPrismaAdapter(): Adapter {
  // Get the base adapter structure from PrismaAdapter
  // We'll override each method to use our dynamic client
  
  return {
    async createUser(user: any) {
      const prisma = await getDynamicPrismaClient();
      return prisma.user.create({ data: user });
    },

    async getUser(id: string) {
      const prisma = await getDynamicPrismaClient();
      return prisma.user.findUnique({ where: { id } });
    },

    async getUserByEmail(email: string) {
      const prisma = await getDynamicPrismaClient();
      return prisma.user.findUnique({ where: { email } });
    },

    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      const prisma = await getDynamicPrismaClient();
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        select: { user: true },
      });
      return account?.user ?? null;
    },

    async updateUser({ id, ...data }: any) {
      const prisma = await getDynamicPrismaClient();
      return prisma.user.update({ where: { id }, data });
    },

    async deleteUser(id: string) {
      const prisma = await getDynamicPrismaClient();
      return prisma.user.delete({ where: { id } });
    },

    async linkAccount(account: any) {
      const prisma = await getDynamicPrismaClient();
      return prisma.account.create({ data: account });
    },

    async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      const prisma = await getDynamicPrismaClient();
      return prisma.account.delete({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      });
    },

    async createSession(session: any) {
      const prisma = await getDynamicPrismaClient();
      return prisma.session.create({ data: session });
    },

    async getSessionAndUser(sessionToken: string) {
      const prisma = await getDynamicPrismaClient();
      const userAndSession = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user, session };
    },

    async updateSession(session: any) {
      const prisma = await getDynamicPrismaClient();
      return prisma.session.update({
        where: { sessionToken: session.sessionToken },
        data: session,
      });
    },

    async deleteSession(sessionToken: string) {
      const prisma = await getDynamicPrismaClient();
      return prisma.session.delete({ where: { sessionToken } });
    },

    async createVerificationToken(verificationToken: any) {
      const prisma = await getDynamicPrismaClient();
      return prisma.verificationToken.create({ data: verificationToken });
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      const prisma = await getDynamicPrismaClient();
      try {
        return await prisma.verificationToken.delete({
          where: { identifier_token: { identifier, token } },
        });
      } catch (error) {
        // If the token has already been used/deleted, return null
        if ((error as { code?: string })?.code === "P2025") return null;
        throw error;
      }
    },

    async getAccount(providerAccountId: string, provider: string) {
      const prisma = await getDynamicPrismaClient();
      return prisma.account.findFirst({
        where: { providerAccountId, provider },
      });
    },
  } as Adapter;
}