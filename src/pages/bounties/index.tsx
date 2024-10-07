import { Box } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { listingsQuery, ListingTabs } from '@/features/listings';
import { Home } from '@/layouts/Home';
import { Meta } from '@/layouts/Meta';
import { dayjs } from '@/utils/dayjs';

export default function BountiesPage() {
  const deadline = useMemo(
    () => dayjs().subtract(2, 'months').toISOString(),
    [],
  );
  const { data: listings, isLoading } = useQuery(
    listingsQuery({
      type: 'bounty',
      deadline,
      take: 100,
    }),
  );

  return (
    <Home type="listing">
      <Meta
        title="CoDesign | Discover Bounties and Projects in Crypto for Design, Development, and Content"
        description="Explore the latest bounties on CoDesign, offering opportunities in the crypto space across Design, Development, and Content."
        canonical="https://codesign.top/bounties/"
      />
      <Box w={'100%'}>
        <ListingTabs
          bounties={listings}
          isListingsLoading={isLoading}
          emoji="/assets/home/emojis/moneyman.png"
          title="Bounties"
          take={20}
          showViewAll
          viewAllLink="/bounties/all"
        />
      </Box>
    </Home>
  );
}
