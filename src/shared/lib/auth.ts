import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { openAPI } from 'better-auth/plugins';
import prisma from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: {
        type: ['student', 'admin', 'teacher'],
        required: false,
        defaultValue: 'student',
        input: false,
      },
    },
  },
  plugins: [openAPI()],
});
