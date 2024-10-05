import type { NextApiResponse } from 'next';

import { BONUS_REWARD_POSITION } from '@/constants';
import {
  checkListingSponsorAuth,
  type NextApiRequestWithSponsor,
  withSponsorAuth,
} from '@/features/auth';
import { sendEmailNotification } from '@/features/emails';
import earncognitoClient from '@/lib/earncognitoClient';
import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { cleanSkills } from '@/utils/cleanSkills';
import { dayjs } from '@/utils/dayjs';
import { fetchTokenUSDValue } from '@/utils/fetchTokenUSDValue';
import { filterAllowedFields } from '@/utils/filterAllowedFields';
import { safeStringify } from '@/utils/safeStringify';

const allowedFields = [
  'type',
  'title',
  'skills',
  'slug',
  'deadline',
  'templateId',
  'pocSocials',
  'applicationType',
  'timeToComplete',
  'description',
  'eligibility',
  'references',
  'region',
  'referredBy',
  'isPrivate',
  'requirements',
  'rewardAmount',
  'rewards',
  'maxBonusSpots',
  'token',
  'compensationType',
  'minRewardAsk',
  'maxRewardAsk',
  'isPublished',
];

async function bounty(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const { id } = req.query;

  const data = req.body;
  const updatedData = filterAllowedFields(data, allowedFields);

  logger.debug(`Request query: ${safeStringify(req.query)}`);
  logger.debug(`Request body: ${safeStringify(req.body)}`);

  try {
    const userSponsorId = req.userSponsorId;
    const userId = req.userId;

    const { error, listing } = await checkListingSponsorAuth(
      userSponsorId,
      id as string,
    );
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const {
      rewards,
      rewardAmount,
      token,
      maxRewardAsk,
      minRewardAsk,
      compensationType,
      description,
      skills,
    } = updatedData;
    let { isPublished } = updatedData;

    let { maxBonusSpots } = updatedData;

    let publishedAt = listing.publishedAt;
    if (isPublished && !listing.publishedAt) {
      publishedAt = new Date();
    }

    if (listing.isVerifying)
      return res.status(500).json({
        message: `Listing is being verified and cannot be updated.`,
      });

    if (listing.maxBonusSpots > 0 && typeof maxBonusSpots === 'undefined') {
      maxBonusSpots = 0;
    }

    const language = 'eng';
    // TODO remove franc
    // if (description) {
    //   language = franc(description);
    //   // both 'eng' and 'sco' are english listings
    // } else {
    //   language = 'eng';
    // }

    const skillsToUpdate =
      'skills' in updatedData ? (skills ? cleanSkills(skills) : []) : undefined;

    const newRewardsCount = Object.keys(rewards || {}).length;
    const currentTotalWinners = listing.totalWinnersSelected
      ? listing.totalWinnersSelected - (maxBonusSpots ?? 0)
      : 0;

    if (newRewardsCount < currentTotalWinners) {
      updatedData.totalWinnersSelected = newRewardsCount;

      for (
        let position = newRewardsCount + 1;
        position <= currentTotalWinners;
        position++
      ) {
        logger.debug(
          `Resetting winner position: ${position} for listing ID: ${id} `,
        );
        await prisma.submission.updateMany({
          where: {
            listingId: id as string,
            isWinner: true,
            winnerPosition: position,
          },
          data: {
            isWinner: false,
            winnerPosition: null,
          },
        });
      }
    }

    if (maxBonusSpots < listing.maxBonusSpots) {
      const bonusSubmissionsToUpdate = await prisma.submission.findMany({
        where: {
          listingId: id as string,
          isWinner: true,
          winnerPosition: BONUS_REWARD_POSITION,
        },
        select: { id: true },
        take: listing.maxBonusSpots - maxBonusSpots,
      });
      await prisma.submission.updateMany({
        where: {
          id: {
            in: bonusSubmissionsToUpdate.map(({ id }) => id),
          },
          listingId: id as string,
          isWinner: true,
          winnerPosition: BONUS_REWARD_POSITION,
        },
        data: {
          isWinner: false,
          winnerPosition: null,
        },
      });
    }

    let usdValue = 0;
    let amount;
    if (isPublished && publishedAt) {
      try {
        if (compensationType === 'fixed') {
          amount = rewardAmount;
        } else if (compensationType === 'range') {
          amount = (maxRewardAsk + minRewardAsk) / 2;
        }
        if (token && amount) {
          const tokenUsdValue = await fetchTokenUSDValue(token, publishedAt);
          usdValue = tokenUsdValue * amount;
        }
      } catch (err) {
        logger.error('Error calculating USD value -', err);
      }
    }

    let isVerifying = false;
    if (isPublished) {
      isVerifying =
        (
          await prisma.sponsors.findUnique({
            where: {
              id: userSponsorId,
            },
            select: {
              isCaution: true,
            },
          })
        )?.isCaution || false;
      if (!isVerifying) {
        isVerifying =
          (await prisma.bounties.count({
            where: {
              sponsorId: userSponsorId,
              isArchived: false,
              isPublished: true,
              isActive: true,
            },
          })) === 0;
      }
    }

    if (isVerifying) {
      isPublished = false;
      publishedAt = null;
    }

    const result = await prisma.bounties.update({
      where: { id: id as string },
      data: {
        ...updatedData,
        isVerifying,
        rewards,
        rewardAmount,
        token,
        maxRewardAsk,
        minRewardAsk,
        maxBonusSpots,
        compensationType,
        isPublished,
        publishedAt,
        usdValue,
        language,
        ...(skillsToUpdate !== undefined && { skills: skillsToUpdate }),
      },
    });

    if (isVerifying) {
      try {
        if (!process.env.EARNCOGNITO_URL) {
          throw new Error('ENV EARNCOGNITO_URL not provided');
        }
        await earncognitoClient.post(`/discord/verify-listing/initiate`, {
          listingId: result.id,
        });
      } catch (err) {
        console.log('Failed to send Verification Message to discord', err);
        logger.error('Failed to send Verification Message to discord', err);
      }
    } else {
      try {
        if (listing.isPublished === true && result.isPublished === false) {
          await earncognitoClient.post(`/discord/listing-update`, {
            listingId: result.id,
            status: 'Unpublished',
          });
        }
        if (listing.isPublished === false && result.isPublished === true) {
          await earncognitoClient.post(`/discord/listing-update`, {
            listingId: result.id,
            status: 'Published',
          });
        }
      } catch (err) {
        logger.error('Discord Listing Update Message Error', err);
      }
    }

    logger.info(`Bounty with ID: ${id} updated successfully`);
    logger.debug(`Updated bounty data: ${safeStringify(result)} `);

    const deadlineChanged =
      listing.deadline?.toString() !== result.deadline?.toString();
    if (deadlineChanged && result.isPublished && userId) {
      const dayjsDeadline = dayjs(result.deadline);
      logger.debug(
        `Creating comment for deadline extension for listing ID: ${result.id} `,
      );
      await prisma.comment.create({
        data: {
          message: `The deadline for this listing has been updated to ${dayjsDeadline.format('h:mm A, MMMM D, YYYY (UTC)')} `,
          listingId: result.id,
          authorId: userId,
          type: 'DEADLINE_EXTENSION',
        },
      });
      logger.debug(`Sending email notification for deadline extension`);
      sendEmailNotification({
        type: 'deadlineExtended',
        id: id as string,
        triggeredBy: req.userId,
      });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    logger.error(
      `Error occurred while updating bounty with id = ${id}: ${safeStringify(error)} `,
    );
    return res.status(400).json({
      error: error.message,
      message: `Error occurred while updating bounty with id = ${id}.`,
    });
  }
}

export default withSponsorAuth(bounty);
