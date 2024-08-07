import type { NextApiResponse } from 'next';

import {
  checkGrantSponsorAuth,
  type NextApiRequestWithSponsor,
  withSponsorAuth,
} from '@/features/auth';
import { sendEmailNotification } from '@/features/emails';
import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const { id, trancheAmount, txId = '' } = req.query;
  const parsedTrancheAmount = parseInt(trancheAmount as string, 10);

  const userId = req.userId;
  const userSponsorId = req.userSponsorId;

  logger.debug(`Request query: ${safeStringify(req.query)}`);

  if (!id || !trancheAmount) {
    logger.warn('Missing required query parameters: id or trancheAmount');
    return res.status(400).json({
      error: 'Missing required query parameters: id or trancheAmount',
    });
  }

  try {
    logger.info(`Fetching grant application with ID: ${id}`);
    const currentApplication = await prisma.grantApplication.findUnique({
      where: { id: id as string },
      include: { grant: true },
    });

    if (!currentApplication) {
      logger.info(`Grant application not found with ID: ${id}`);
      return res.status(404).json({ error: 'Grant application not found' });
    }

    const { error } = await checkGrantSponsorAuth(
      userSponsorId,
      currentApplication.grantId,
    );

    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    let updatedPaymentDetails = currentApplication.paymentDetails || [];
    if (!Array.isArray(updatedPaymentDetails)) {
      updatedPaymentDetails = [];
    }

    updatedPaymentDetails.push({
      txId: txId || null,
      tranche: currentApplication.totalTranches + 1,
      amount: parsedTrancheAmount,
    });

    logger.info('Updating payment details and grant information');
    const result = await prisma.$transaction(async (tx) => {
      const updatedGrantApplication = await tx.grantApplication.update({
        where: { id: id as string },
        data: {
          totalPaid: {
            increment: parsedTrancheAmount,
          },
          totalTranches: {
            increment: 1,
          },
          paymentDetails: updatedPaymentDetails as any,
        },
        include: {
          user: true,
          grant: true,
        },
      });

      await tx.grants.update({
        where: {
          id: currentApplication.grantId,
        },
        data: {
          totalPaid: {
            increment: parsedTrancheAmount,
          },
        },
      });

      return updatedGrantApplication;
    });

    await sendEmailNotification({
      type: 'grantPaymentReceived',
      id: id as string,
      triggeredBy: userId,
      userId: currentApplication.userId,
    });

    logger.info(
      `Payment details updated successfully for grant application ID: ${id}`,
    );
    return res.status(200).json(result);
  } catch (error: any) {
    logger.error(
      `Error occurred while updating payment for grant application ID: ${id}`,
      safeStringify(error),
    );
    return res.status(400).json({
      error: error.message,
      message: `Error occurred while updating payment of a submission ${id}.`,
    });
  }
}

export default withSponsorAuth(handler);
