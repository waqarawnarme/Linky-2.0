import prisma from '@/lib/prisma';
import { createNewOrganization } from '@/modules/organizations/utils';

export async function handleUserCreated({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw Error('User not found');
  }

  const newOrg = await createNewOrganization({
    ownerId: userId,
    type: 'personal',
  });

  // Stripe customer + subscription creation removed — this fork is free-tier
  // only. The Subscription Prisma model is still present (no destructive
  // migration was run) but no rows are created on signup.

  return newOrg.id;
}

export const createUserInitialFlags = async (userId: string) => {
  await prisma.userFlag.create({
    data: {
      userId,
      key: 'showOnboardingTour',
      value: true,
    },
  });
};
