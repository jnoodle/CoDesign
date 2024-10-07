import { Box } from '@chakra-ui/react';
import axios from 'axios';
import type { GetServerSideProps } from 'next';

import {
  DescriptionUI,
  type Listing,
  ListingWinners,
} from '@/features/listings';
import { ListingPageLayout } from '@/layouts/Listing';
import { getURL } from '@/utils/validUrl';

interface BountyDetailsProps {
  bounty: Listing | null;
}

function BountyDetails({ bounty: bounty }: BountyDetailsProps) {
  return (
    <ListingPageLayout bounty={bounty}>
      {bounty?.isWinnersAnnounced && (
        <Box display={{ base: 'none', md: 'block' }} w="full" mt={6}>
          <ListingWinners bounty={bounty} />
        </Box>
      )}
      <DescriptionUI description={bounty?.description} />
    </ListingPageLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug, type } = context.query;
  const { req } = context;
  const host = req.headers.host || '';
  console.log(host);

  const redirectToEarnSlugs = [
    'write-a-twitter-thread-about-airspaces',
    'twitter-thread-neon-points-program',
    'video-neon-points-program',
  ];

  if (
    redirectToEarnSlugs.includes(slug as string) &&
    !host.includes('codesign.top')
  ) {
    return {
      redirect: {
        destination: `https://codesign.top/listings/${type}/${slug}`,
        permanent: false,
      },
    };
  }

  let bountyData;
  try {
    const bountyDetails = await axios.get(
      `${getURL()}api/listings/details/${slug}`,
      {
        params: { type },
      },
    );
    bountyData = bountyDetails.data;
  } catch (e) {
    console.error(e);
    bountyData = null;
  }

  return {
    props: {
      bounty: bountyData,
    },
  };
};
export default BountyDetails;
