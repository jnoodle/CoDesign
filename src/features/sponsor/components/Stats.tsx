import { Box, Divider, Flex, Grid, Text, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';

import { userCountQuery } from '@/features/home';
import GlobalEarn from '@/public/assets/landingsponsor/displays/global-earn.png';
import EarnIcon from '@/public/assets/landingsponsor/icons/earn.svg';

import { fontSize, maxW, padding } from '../utils';
import { HighQualityImage } from './HighQualityImage';

type Stats = {
  title: string;
  label: string;
  showEarn?: boolean;
};

const initialStats = [
  {
    title: '21K',
    label: 'Global Discord',
  },
  {
    title: '75K',
    label: 'Twitter Followers',
  },
  {
    title: '$4M',
    label: 'Community GDP',
  },
  {
    title: '100K',
    label: 'Monthly Views',
    showEarn: true,
  },
  {
    title: '16K',
    label: 'Verified CoDesign Users',
    showEarn: true,
  },
  {
    title: '20',
    label: 'Countries',
  },
];

export function Stats() {
  const { data: totals } = useQuery(userCountQuery);

  const stats = initialStats.map((stat) => {
    if (stat.label === 'Verified CoDesign Users' && totals?.totalUsers) {
      return {
        ...stat,
        title: new Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short',
          maximumFractionDigits: 0,
        }).format(totals.totalUsers),
      };
    }
    return stat;
  });

  return (
    <Flex
      align="center"
      direction={{ base: 'column', lg: 'row-reverse' }}
      gap={{ base: 16, lg: 20 }}
      w="100vw"
      maxW={maxW}
      px={padding}
    >
      <Box w="full" maxW={{ base: '20rem', xl: '30rem' }}>
        <HighQualityImage
          src={GlobalEarn}
          alt="CoDesign Global"
          style={{
            width: '100%',
            maxWidth: '30rem',
          }}
        />
      </Box>
      <VStack gap={{ base: 8 }}>
        <VStack
          align={{ base: 'center', lg: 'start' }}
          textAlign={{ base: 'center', lg: 'left' }}
        >
          <Text fontSize={fontSize} fontWeight={600} lineHeight={1}>
            The distribution of the CoDesign network
          </Text>
          <Text
            color="brand.slate.500"
            fontSize={{ base: '1.25rem', lg: '1.4rem' }}
            fontWeight={500}
          >
            Get instant access to CoDesign’s network of the best crypto talent
            in the world
          </Text>
        </VStack>
        <Divider display={{ base: 'none', lg: 'block' }} />
        <Grid gap={4} columnGap={8} templateColumns="repeat(3, 1fr)" w="full">
          {stats.map((s) => (
            <VStack
              key={s.title}
              align={{ base: 'center', lg: 'start' }}
              gap={0}
              overflow="visible"
            >
              <Text
                fontSize={{ base: '2.3rem', lg: '3.5rem' }}
                fontWeight={600}
                lineHeight={1.15}
              >
                {s.title}
              </Text>
              <Text
                pos="relative"
                color="brand.slate.500"
                fontSize={{ base: '0.68rem', lg: '1rem' }}
                fontWeight={500}
                whiteSpace={{ base: 'nowrap' }}
              >
                {s.label}
                {s.showEarn && (
                  <Box
                    pos="absolute"
                    top={0}
                    left={{ base: -4, lg: -5 }}
                    w={{ base: '0.6rem', lg: '0.9rem' }}
                  >
                    <HighQualityImage
                      src={EarnIcon}
                      alt="CoDesign Icon"
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </Box>
                )}
              </Text>
            </VStack>
          ))}
        </Grid>
      </VStack>
    </Flex>
  );
}
