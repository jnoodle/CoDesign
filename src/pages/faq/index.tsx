import {
  Alert,
  Container,
  Divider,
  Image,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';

import { listingsQuery } from '@/features/listings';
import { Default } from '@/layouts/Default';
import { Meta } from '@/layouts/Meta';
import { dayjs } from '@/utils/dayjs';

export default function ProjectsPage() {
  const deadline = useMemo(
    () => dayjs().subtract(2, 'months').toISOString(),
    [],
  );

  const { data: listings, isLoading } = useQuery(
    listingsQuery({
      take: 100,
      type: 'project',
      deadline,
    }),
  );

  return (
    <Default
      meta={
        <Meta
          title="FAQ | CoDesign"
          description="CoDesign FAQ."
          canonical="https://codesign.top/faq/"
        />
      }
    >
      <VStack
        pos={'relative'}
        justify={'center'}
        direction={'column'}
        w={'100%'}
        minH={'100vh'}
        bg={'#F5F5F5'}
      >
        <Image
          pos={'absolute'}
          top={'0'}
          right={'0'}
          left={'0'}
          w={'100%'}
          alt=""
          src="/assets/home/bg_grad.svg"
        />
        <VStack maxW={'7xl'} mx={4} my={8} textAlign="left" spacing={2}>
          <Text
            w={'100%'}
            px={2}
            fontSize={{ base: '4xl', md: '5xl' }}
            fontWeight={700}
            lineHeight="1.2"
          >
            CoDesign FAQ
          </Text>
          <Alert my={2}>
            <div>
              We’ve tried to cover all generic questions here. Please reach out
              to if you have anything else to ask us, reach out to us at{' '}
              <Link color={`brand.purple`} href="mailto:codesign.top@proton.me">
                codesign.top@proton.me
              </Link>
            </div>
          </Alert>
          <Text as="b" w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            What are Bounties?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            A bounty is a competitive task, where everyone participating does
            the work and the best submission(s) get rewarded. Consider it as a
            contest where multiple people attempt the same scope of work.
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            Bounties are a great way to build your crypto proof of work while
            having an upside of winning some 💰 for excellent work.
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            What are Project listings?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            A Project listing is an ad for hiring a freelancer, where people
            fill out a custom application form (determined by the sponsor) and
            the best applicant gets selected to do the work. The scope of work
            is completed by only the selected applicant(s).
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            What is the difference between Bounty and Project listings?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            The main difference between bounty and project listings is the
            number of people who complete the scope of work. Multiple people
            submit in a bounty, while for a Project, only the selected
            person/team completes the scope of work.
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text
            w={'100%'}
            my={2}
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight={700}
            lineHeight="1.2"
          >
            💻 Earners
          </Text>
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            Who can participate on CoDesign?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            Anyone with an email address and a Web3 wallet!
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            What is the payout process for the winners?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            All sponsors have their own payout processes. Usually, once the
            winners are announced, the sponsor will pay out the winners on their
            own without contacting them, using the wallet address mentioned by
            the winners on their profile.
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            Others might reach out to the winners for confirmation of their
            wallet addresses before paying out.
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            Is KYC required for the winners to get paid out?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            Usually, sponsors don’t ask for KYC, although some might, depending
            on their internal processes.
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            How long does it take for winners to get announced and paid out?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            This greatly varies on the scope of work, number of submissions, and
            the sponsor. However, we urge the sponsors to review and announce
            the winners within 7 days after the deadline. Payments are usually
            completed shortly after the winners have been announced.
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            The wallet linked to my CoDesign account has been compromised / I
            have lost access to it. Can I change my wallet address on CoDesign?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            You get the chance to change the wallet address with each new
            submission you make. Add your trusted wallet in the “Your Web3
            Wallet Address” field every time you submit. The wallet address you
            added in your latest submission will be where your rewards (in case
            you win) will be sent.
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            Who reviews the submissions on CoDesign?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            The sponsors of the listings conduct the reviews and select the
            winners.
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            How can I submit to a Bounty or apply to a Project?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            Sign up on codesign.top -&gt; complete your profile → pick a listing
            -&gt; apply / submit (if it&apos;s a Project or Bounty listing,
            respectively) by clicking on the &quot;Apply/Submit Now&quot;
            button.
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            What is the process for collecting payments for winners?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            Generally, rewards for listings will be paid out to the wallet
            associated with the winner&apos;s CoDesign account. Occasionally,
            some sponsors might ask for invoices, KYC, etc. as per their
            respective payment processes.
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            Can I make changes to my submission after submitting it?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            Yes, you can edit your submission until the deadline of the listing
            is over.
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text
            w={'100%'}
            my={2}
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight={700}
            lineHeight="1.2"
          >
            💵 Sponsors
          </Text>
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            What can you use CoDesign for?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            CoDesign is a platform to get work done from crypto-native talent.
            This can be in the form of bounties (get the same work done by many
            people) or hiring freelancers in the form of Project listings.
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            CoDesign can be used to get any small to medium scale task done,
            including but not limited to development, writing, design, research,
            and product feedback.
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            Who can list work on CoDesign?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            Currently, CoDesign is an open platform. Any company that uses any
            blockchain, or operates in any web3 ecosystem in any capacity, can
            sponsor listings on CoDesign.
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            Who reviews and selects the winners?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            Sponsors are responsible for reviewing submission/applications and
            publishing winners.
          </Text>
          <Divider mt={2} borderColor={`brand.slate.300`} />
          <Text as="b" w={'100%'} mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            How can I pay the winners of my Bounty or Project listings?
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            You have two ways to pay the winners:
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            You have two ways to pay the winners:
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            1. Via CoDesign: You can pay them directly through the platform by
            going to Sponsor Dashboard → View Submissions → Publish Winners →
            Pay → Submit Transaction Info.
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            The option to pay the winners will become visible once the winners
            have been published.
          </Text>
          <Text w={'100%'} fontSize={{ base: 'md', md: 'lg' }}>
            2. Outside CoDesign: You can also choose to pay the winners from
            outside the platform. The wallet address of each winner will be
            visible from their submissions. You can copy the winners’ wallet
            address pay them through your preferred method/wallet.
          </Text>
        </VStack>
        <Container maxW={'7xl'} mb={12}></Container>
      </VStack>
    </Default>
  );
}
