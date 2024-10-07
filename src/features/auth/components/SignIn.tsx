import { Box, Button, Flex, Link, SlideFade, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
import React, { type Dispatch, type SetStateAction } from 'react';

import { TERMS_OF_USE } from '@/constants';
import { GoogleIcon } from '@/svg/google';

import { EmailSignIn } from './EmailSignIn';

interface SigninProps {
  loginStep: number;
  setLoginStep: Dispatch<SetStateAction<number>>;
}

export const SignIn = ({ loginStep, setLoginStep }: SigninProps) => {
  const router = useRouter();
  const posthog = usePostHog();

  const handleGmailSignIn = async () => {
    posthog.capture('google_auth');
    signIn('google', {
      callbackUrl: `${router.asPath}?loginState=signedIn`,
    });
  };

  return (
    <>
      <Box>
        <Box px={6}>
          <Box>
            <SlideFade in={loginStep === 0} offsetY="20px">
              {loginStep === 0 && (
                <Flex
                  align="center"
                  justify="center"
                  direction={'column'}
                  gap={2}
                  color="brand.slate.500"
                  fontSize="md"
                  textAlign="center"
                >
                  <Button
                    className="ph-no-capture"
                    w="100%"
                    fontSize="17px"
                    fontWeight={500}
                    leftIcon={<GoogleIcon />}
                    onClick={handleGmailSignIn}
                    size="lg"
                  >
                    Continue with Google
                  </Button>
                  {/*<Flex align={'center'} gap={4} w="100%" my={3}>*/}
                  {/*  <Divider borderColor={'brand.slate.300'} />{' '}*/}
                  {/*  <Text color={'brand.slate.400'} fontSize="14px">*/}
                  {/*    OR*/}
                  {/*  </Text>{' '}*/}
                  {/*  <Divider borderColor={'brand.slate.300'} />*/}
                  {/*</Flex>*/}
                  {/*<Button*/}
                  {/*  w="100%"*/}
                  {/*  h="2.9rem"*/}
                  {/*  color="brand.slate.500"*/}
                  {/*  fontSize="17px"*/}
                  {/*  fontWeight={500}*/}
                  {/*  bg="#fff"*/}
                  {/*  borderWidth="1px"*/}
                  {/*  borderColor="#CBD5E1"*/}
                  {/*  _hover={{ bg: 'brand.slate.100' }}*/}
                  {/*  _active={{ bg: 'brand.slate.200' }}*/}
                  {/*  leftIcon={<MdOutlineEmail />}*/}
                  {/*  onClick={() => setLoginStep(1)}*/}
                  {/*  size="lg"*/}
                  {/*>*/}
                  {/*  Continue with Email*/}
                  {/*</Button>*/}
                </Flex>
              )}
            </SlideFade>
            <SlideFade in={loginStep === 1} offsetY="20px">
              {loginStep === 1 && <EmailSignIn />}
            </SlideFade>
          </Box>
          <Text
            mt={4}
            mb={2}
            color="brand.slate.500"
            fontSize="xs"
            textAlign="center"
          >
            By using this website, you agree to our{' '}
            <Link
              as={NextLink}
              fontWeight={600}
              href={TERMS_OF_USE}
              isExternal
              rel="noopener noreferrer"
            >
              Terms of Use
            </Link>{' '}
            and our{' '}
            <Link
              as={NextLink}
              fontWeight={600}
              href={`${router.basePath}/privacy-policy.pdf`}
              isExternal
            >
              Privacy Policy
            </Link>
            .
          </Text>
        </Box>
        <Box
          flexDir={'column'}
          py={'7px'}
          bg={'brand.slate.100'}
          borderBottomRadius="6px"
        >
          <Text color="brand.slate.400" fontSize="xs" textAlign="center">
            Need help? Reach out to us at{' '}
            <Text as="u">
              <Link
                as={NextLink}
                href={'mailto:codesign.top@proton.me'}
                isExternal
              >
                codesign.top@proton.me
              </Link>
            </Text>
          </Text>
        </Box>
      </Box>
    </>
  );
};
