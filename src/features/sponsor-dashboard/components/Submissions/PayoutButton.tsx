import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
// import {
//   createAssociatedTokenAccountInstruction,
//   createTransferInstruction,
//   getAssociatedTokenAddressSync,
// } from '@solana/spl-token';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import {
//   LAMPORTS_PER_SOL,
//   PublicKey,
//   SystemProgram,
//   Transaction,
// } from '@solana/web3.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAtom } from 'jotai';
import { log } from 'next-axiom';
import { usePostHog } from 'posthog-js/react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { tokenList } from '@/constants';
import { type Listing, type Rewards } from '@/features/listings';
import { type SubmissionWithUser } from '@/interface/submission';

import { selectedSubmissionAtom } from '../..';

interface Props {
  bounty: Listing | null;
}

// change solana online tx to fill form
export const PayoutButton = ({ bounty }: Props) => {
  const [isPaying, setIsPaying] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedSubmission, setSelectedSubmission] = useAtom(
    selectedSubmissionAtom,
  );

  const { register, handleSubmit, setValue, watch } = useForm<{
    chainExplorerUrl: string;
    txId: string;
  }>();

  // const { connected, publicKey, sendTransaction } = useWallet();
  // const { connection } = useConnection();
  const posthog = usePostHog();
  const queryClient = useQueryClient();

  // const DynamicWalletMultiButton = dynamic(
  //   async () =>
  //     (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  //   { ssr: false },
  // );

  const {
    mutate: addPayment,
    isPending: isPaymentSaving,
    isError: isPaymentError,
  } = useMutation({
    mutationFn: ({
      id,
      isPaid,
      paymentDetails,
    }: {
      id: string;
      isPaid: boolean;
      paymentDetails: any;
    }) =>
      axios.post(`/api/sponsor-dashboard/submission/add-payment/`, {
        id,
        isPaid,
        paymentDetails,
      }),
    onSuccess: (_, variables) => {
      onClose();
      queryClient.setQueryData<SubmissionWithUser[]>(
        ['sponsor-submissions', bounty?.slug],
        (old) =>
          old?.map((submission) =>
            submission.id === variables.id
              ? {
                  ...submission,
                  isPaid: variables.isPaid,
                  paymentDetails: variables.paymentDetails,
                }
              : submission,
          ),
      );

      setSelectedSubmission((prev) =>
        prev && prev.id === variables.id
          ? {
              ...prev,
              isPaid: variables.isPaid,
              paymentDetails: variables.paymentDetails,
            }
          : prev,
      );
    },
    onError: (error) => {
      // setFormError(error.message);
      toast.error(error.message);
      console.error('Payment record update failed', error);
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setValue('chainExplorerUrl', '');
      setValue('txId', '');
    }
  }, [isOpen]);

  const handlePayout = async ({
    id,
    token,
    amount,
    receiver,
  }: {
    id: string;
    token: string;
    amount: number;
    receiver: string;
  }) => {
    // setIsPaying(true);
    try {
      // const transaction = new Transaction();
      const tokenDetails = tokenList.find((e) => e.tokenSymbol === token);
      const tokenAddress = tokenDetails?.mintAddress as string;
      const power = tokenDetails?.decimals as number;

      // const latestBlockHash = await connection.getLatestBlockhash();
      //
      // const senderATA = await getAssociatedTokenAddressSync(
      //   new PublicKey(tokenAddress),
      //   publicKey as PublicKey,
      // );
      // const receiverATA = await getAssociatedTokenAddressSync(
      //   new PublicKey(tokenAddress),
      //   receiver as PublicKey,
      // );

      // if (token === 'SOL') {
      //   transaction.add(
      //     SystemProgram.transfer({
      //       fromPubkey: publicKey as PublicKey,
      //       toPubkey: receiver,
      //       lamports: LAMPORTS_PER_SOL * amount,
      //     }),
      //   );
      // } else {
      //   const receiverATAExists = await connection.getAccountInfo(receiverATA);
      //
      //   if (!receiverATAExists) {
      //     transaction.add(
      //       createAssociatedTokenAccountInstruction(
      //         publicKey as PublicKey,
      //         receiverATA,
      //         receiver,
      //         new PublicKey(tokenAddress),
      //       ),
      //     );
      //   }
      //
      //   transaction.add(
      //     createTransferInstruction(
      //       senderATA,
      //       receiverATA,
      //       publicKey as PublicKey,
      //       amount * 10 ** power,
      //     ),
      //   );
      // }
      //
      // const signature = await sendTransaction(transaction, connection);
      //
      // await connection.confirmTransaction({
      //   blockhash: latestBlockHash.blockhash,
      //   lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      //   signature,
      // });
      //
      // await new Promise((resolve, reject) => {
      //   connection.onSignature(
      //     signature,
      //     async (res) => {
      //       if (res.err) {
      //         reject(new Error('Transaction failed'));
      //       } else {
      //         addPayment({
      //           id,
      //           isPaid: true,
      //           paymentDetails: {
      //             txId: signature,
      //           },
      //         });
      //         resolve(res);
      //       }
      //     },
      //     'confirmed',
      //   );
      // });

      console.log('Pay Info', {
        id,
        token,
        amount,
        receiver,
        tokenDetails,
        tokenAddress,
        power,
        isPaid: true,
      });
      onOpen();
      // setIsPaying(false);
    } catch (error) {
      console.log(error);
      log.error('Sponsor unable to pay');
      // setIsPaying(false);
    }
  };

  const onSubmit = async (data: any): Promise<void> => {
    const paymentDetails = {
      chainExplorerUrl: data.chainExplorerUrl,
      txId: data.txId,
    };

    console.log('paymentDetails', paymentDetails);

    addPayment({
      id: selectedSubmission?.id as string,
      isPaid: true,
      paymentDetails,
    });
  };

  return (
    <>
      {/*<div*/}
      {/*  className="ph-no-capture"*/}
      {/*  onClick={() => {*/}
      {/*    posthog.capture('connect wallet_payment');*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <DynamicWalletMultiButton*/}
      {/*    style={{*/}
      {/*      height: '40px',*/}
      {/*      fontWeight: 600,*/}
      {/*      fontFamily: 'Inter',*/}
      {/*      paddingRight: '16px',*/}
      {/*      paddingLeft: '16px',*/}
      {/*      fontSize: '12px',*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    {connected*/}
      {/*      ? truncatePublicKey(publicKey?.toBase58(), 3)*/}
      {/*      : `Pay ${bounty?.token} ${*/}
      {/*          bounty?.rewards?.[*/}
      {/*            selectedSubmission?.winnerPosition as keyof Rewards*/}
      {/*          ] || '0'*/}
      {/*        }`}*/}
      {/*  </DynamicWalletMultiButton>*/}
      {/*</div>*/}
      {/*{connected && (*/}
      <Button
        className="ph-no-capture"
        w="fit-content"
        minW={'120px'}
        mr={4}
        isDisabled={!bounty?.isWinnersAnnounced}
        isLoading={isPaying}
        loadingText={'Paying...'}
        onClick={async () => {
          if (!selectedSubmission?.user.publicKey) {
            console.error('Public key is null, cannot proceed with payment');
            return;
          }
          posthog.capture('pay winner_sponsor');
          handlePayout({
            id: selectedSubmission?.id as string,
            token: bounty?.token as string,
            amount: bounty?.rewards![
              selectedSubmission?.winnerPosition as keyof Rewards
            ] as number,
            receiver: selectedSubmission.user.publicKey,
          });
        }}
        size="md"
        variant="solid"
      >
        Pay{' '}
        {!!bounty?.rewards &&
          bounty?.rewards[
            selectedSubmission?.winnerPosition as keyof Rewards
          ]}{' '}
        {bounty?.token}
      </Button>
      {/*)}*/}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Payment Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text as="b" fontSize="md">
              After payment, fill in the transaction information.
            </Text>
            <Text mt={2} fontFamily={'var(--font-mono)'} fontSize="sm">
              Winner{' '}
              <Text as="b" color={'brand.purple'}>
                `{selectedSubmission?.user.username}`
              </Text>{' '}
              Wallet address:
            </Text>
            <Text
              as="b"
              color={'brand.purple'}
              fontFamily={'var(--font-mono)'}
              fontSize="sm"
            >
              {selectedSubmission?.user.publicKey}
            </Text>
            <Text mt={2} fontFamily={'var(--font-mono)'} fontSize="sm">
              Prize:
            </Text>
            <Text
              as="b"
              color={'brand.purple'}
              fontFamily={'var(--font-mono)'}
              fontSize="sm"
            >
              {
                bounty?.rewards![
                  selectedSubmission?.winnerPosition as keyof Rewards
                ] as number
              }{' '}
              {bounty?.token as string}
            </Text>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormControl isRequired>
                <Box w={'full'} mb={'1.25rem'}>
                  <FormLabel color={'brand.slate.500'}>
                    Tx&apos;s Chain Explorer Url
                  </FormLabel>
                  <Input
                    borderColor="brand.slate.300"
                    _placeholder={{
                      color: 'brand.slate.300',
                    }}
                    focusBorderColor="brand.purple"
                    id="chainExplorerUrl"
                    placeholder="https://etherscan.io/tx/0x..."
                    {...register('chainExplorerUrl', { required: true })}
                  />
                </Box>
                <Box w={'full'} mb={'1.25rem'}>
                  <FormLabel color={'brand.slate.500'}>Tx Hash</FormLabel>
                  <Input
                    borderColor="brand.slate.300"
                    _placeholder={{
                      color: 'brand.slate.300',
                    }}
                    focusBorderColor="brand.purple"
                    id="txId"
                    placeholder="0x..."
                    {...register('txId', { required: true })}
                  />
                </Box>
                <Button
                  w={'full'}
                  h="50px"
                  color={'white'}
                  bg={'rgb(101, 98, 255)'}
                  isLoading={isPaymentSaving}
                  loadingText="Saving Payment Info..."
                  type="submit"
                >
                  Save
                </Button>
                {/*<Box w={'full'} mb={'1.25rem'}>*/}
                {/*  {isPaymentError && <Text color={'red'}>{formError}</Text>}*/}
                {/*</Box>*/}
              </FormControl>
            </form>
            <Alert mt={2} mb={3} status="warning">
              <AlertIcon />
              Ensure the transaction information is correct. Once saved, it
              cannot be modified.
            </Alert>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
