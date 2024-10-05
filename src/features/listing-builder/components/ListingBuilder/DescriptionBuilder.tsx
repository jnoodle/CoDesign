import { DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Link as ChakraLink,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Color } from '@tiptap/extension-color';
import ImageUpload from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import ListItem from '@tiptap/extension-list-item';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { usePostHog } from 'posthog-js/react';
import React, {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { AiOutlineLink, AiOutlineOrderedList } from 'react-icons/ai';
import { BiFontColor } from 'react-icons/bi';
import {
  BsBlockquoteLeft,
  BsCodeSlash,
  BsFileBreak,
  BsTypeItalic,
} from 'react-icons/bs';
import { CiRedo, CiUndo } from 'react-icons/ci';
import { GoBold } from 'react-icons/go';
import {
  MdOutlineAddPhotoAlternate,
  MdOutlineFormatListBulleted,
  MdOutlineFormatUnderlined,
  MdOutlineHorizontalRule,
} from 'react-icons/md';
import { toast } from 'sonner';
import ImageResize from 'tiptap-extension-resize-image';
import { z } from 'zod';

import { URL_REGEX } from '@/constants';
import { ReferenceCard } from '@/features/listings';
import { uploadToCloudinary } from '@/utils/upload';

import { useListingFormStore } from '../../store';
import { type ListingFormType } from '../../types';
import { ListingFormLabel, ListingTooltip, ToolbarButton } from './Form';

const LinkModal = ({
  isOpen,
  onClose,
  setLink,
  selectedLink,
}: {
  isOpen: boolean;
  onClose: () => void;
  setLink: (link: string) => void;
  selectedLink: string;
}) => {
  const [linkUrl, setLinkUrl] = useState<string>(selectedLink);

  useEffect(() => {
    setLinkUrl(selectedLink);
  }, [selectedLink]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody my={5}>
            <Input
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="add a link"
              value={linkUrl}
            />
            <HStack justify={'end'} w={'full'} mt={5}>
              <Button mr={4} onClick={onClose} variant="ghost">
                Cancel
              </Button>
              <Button onClick={() => setLink(linkUrl)} variant="solid">
                Submit
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

interface Props {
  setSteps: Dispatch<SetStateAction<number>>;
  createDraft: (data: ListingFormType) => Promise<void>;
  isDraftLoading?: boolean;
  editable?: boolean;
  type?: 'bounty' | 'project' | 'hackathon';
  isNewOrDraft?: boolean;
  isDuplicating?: boolean;
}

const schema = z.object({
  description: z.string(),
  requirements: z.string().optional(),
  references: z
    .array(
      z.object({
        order: z.number(),
        link: z
          .string()
          .refine((val) => URL_REGEX.test(val), {
            message: 'Please enter a valid URL',
          })
          .optional(),
      }),
    )
    .optional(),
});

type FormData = z.infer<typeof schema>;

export const DescriptionBuilder = ({
  setSteps,
  createDraft,
  isDraftLoading,
  type,
  isNewOrDraft,
  isDuplicating,
  editable,
}: Props) => {
  const { form, updateState } = useListingFormStore();
  const isDraft = isNewOrDraft || isDuplicating;
  const [selectedLink, setSelectedLink] = useState<string>('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      description: form?.description || '',
      requirements: form?.requirements,
      references: form?.references,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'references',
  });

  const description = watch('description');
  const requirements = watch('requirements');

  const { isOpen, onClose, onOpen } = useDisclosure();

  const [editorError, setEditorError] = useState(false);

  useEffect(() => {
    if (editable) {
      reset({
        description: form?.description,
        requirements: form?.requirements,
        references: (form?.references || [])?.map((e) => ({
          order: e.order,
          link: e.link,
        })),
      });
      if (editor && form?.description) {
        editor.commands.setContent(form?.description);
      }
    }
  }, [form, editable]);

  const editor = useEditor({
    extensions: [
      Underline,
      ImageResize,
      ImageUpload.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          style: 'align-item:center',
        },
      }),
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure(),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Give more details about the Listing...',
        showOnlyWhenEditable: false,
      }),
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setValue('description', html);
    },
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
    content: description,
  });

  useEffect(() => {
    if (editor) {
      editor.on('selectionUpdate', ({ editor }) => {
        const { from, to } = editor.state.selection;
        editor.state.doc.nodesBetween(from, to, (node) => {
          if (
            node.type.name === 'text' &&
            node.marks.find((mark) => mark.type.name === 'link')
          ) {
            const linkMark = node.marks.find(
              (mark) => mark.type.name === 'link',
            );
            if (linkMark) {
              setSelectedLink(linkMark.attrs.href || '');
            }
          }
        });
      });
    }

    return () => {
      editor?.off('selectionUpdate');
    };
  }, [editor]);

  const setLink = useCallback(
    (url: string) => {
      // cancelled
      if (url === null) {
        return;
      }

      // empty
      if (url === '') {
        editor?.chain().focus().extendMarkRange('link').unsetLink().run();
        onClose();
        return;
      }

      // update link
      editor
        ?.chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();
      onClose();
    },
    [editor],
  );

  const addImage = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg, image/png'; // Accept only JPEG & PNG files
    fileInput.click();

    fileInput.addEventListener('change', async (event: any) => {
      const file = event?.target?.files[0];
      if (file) {
        const toastId = toast.loading('Uploading image...');

        try {
          const url = await uploadToCloudinary(
            file,
            'listing-description',
            'description',
          );
          if (url) {
            // Set the image in the editor
            editor?.chain().focus().setImage({ src: url }).run();
            toast.success('Image uploaded successfully!', { id: toastId });
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image.', { id: toastId });
        }
      }
    });
  }, [editor]);

  const isProject = type === 'project';

  const onSubmit = async (data: any) => {
    updateState({ ...data });
    if (editor?.isEmpty) {
      setEditorError(true);
      return;
    }
    posthog.capture('description_sponsor');
    setSteps(4);
  };

  const onDraftClick = async () => {
    const data = getValues();
    const formData = { ...form, ...data };
    if (isNewOrDraft || isDuplicating) {
      posthog.capture('save draft_sponsor');
    } else {
      posthog.capture('edit listing_sponsor');
    }
    createDraft(formData);
  };

  const posthog = usePostHog();

  return (
    <>
      {isOpen && (
        <LinkModal
          setLink={setLink}
          isOpen={isOpen}
          onClose={onClose}
          selectedLink={selectedLink}
        />
      )}
      <Box>
        <Box mb={8} pt={5}>
          <Flex justify="start" w="full">
            <Flex>
              <ListingFormLabel htmlFor="requirements">
                Eligibility Requirements
              </ListingFormLabel>
              <ListingTooltip label="Add here if you have any specific eligibility requirements for the Listing." />
            </Flex>
          </Flex>
          <Input
            w={'full'}
            color={'brand.slate.500'}
            borderColor="brand.slate.300"
            _placeholder={{
              color: 'brand.slate.300',
            }}
            focusBorderColor="brand.purple"
            id="requirements"
            maxLength={220}
            {...register('requirements')}
            placeholder="Add Eligibility Requirements"
            type={'text'}
          />
          <Text
            color={
              (requirements?.length || 0) > 200 ? 'red' : 'brand.slate.400'
            }
            fontSize={'xs'}
            textAlign="right"
          >
            {220 - (requirements?.length || 0)} characters left
          </Text>
        </Box>
        <Flex justify="space-between" w="full">
          <Flex>
            <ListingFormLabel htmlFor="description">
              Listing Details
            </ListingFormLabel>
            <Text
              as="sup"
              mt={3.5}
              mr={3}
              ml={-2}
              color="#e53e3e"
              fontWeight={600}
            >
              *
            </Text>
            <ListingTooltip label="Write details about the Listing - About, Requirements, Evaluation Criteria, Resources, Rewards, etc." />
          </Flex>
          <ChakraLink
            className="ph-no-capture"
            gap={1}
            display="flex"
            color="brand.slate.400"
            fontSize={'13px'}
            _hover={{
              textDecoration: 'none',
              color: 'brand.slate.500',
            }}
            hidden={true}
            href="https://chat.openai.com/g/g-HS6eWTMku-st-earn-listings-bot"
            onClick={() => {
              posthog.capture('chatGPT bot_sponsor');
            }}
            target="_blank"
          >
            <Text textDecoration="none">🤖</Text>
            <Text textDecoration="underline" textUnderlineOffset={2}>
              Go live in {'<1'} min by using our drafting bot (ChatGPT 4
              Required)
            </Text>
          </ChakraLink>
        </Flex>
        <VStack w={'min-content'} mb={8}>
          <Flex
            pos={'sticky'}
            zIndex="200"
            top="14"
            align={'center'}
            justify={'start'}
            w={'full'}
            borderBottom={'1px solid #D2D2D2'}
            bgColor={'#ffffff'}
          >
            <ToolbarButton
              isActive={editor?.isActive('heading', { level: 1 })}
              onClick={() => {
                editor?.chain().focus().toggleHeading({ level: 1 }).run();
              }}
              borderLeft={'1px solid #D2D2D2'}
            >
              H1
            </ToolbarButton>
            <ToolbarButton
              isActive={editor?.isActive('heading', { level: 2 })}
              onClick={() => {
                editor?.chain().focus().toggleHeading({ level: 2 }).run();
              }}
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              isActive={editor?.isActive('heading', { level: 3 })}
              onClick={() => {
                editor?.chain().focus().toggleHeading({ level: 3 }).run();
              }}
            >
              H3
            </ToolbarButton>
            <ToolbarButton
              isActive={editor?.isActive('bold')}
              onClick={() => {
                editor?.chain().focus().toggleBold().run();
              }}
            >
              <GoBold />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor?.isActive('italic')}
              onClick={() => {
                editor?.chain().focus().toggleItalic().run();
              }}
            >
              <BsTypeItalic />
            </ToolbarButton>{' '}
            <ToolbarButton
              isActive={editor?.isActive('underline')}
              onClick={() => {
                editor?.chain().focus().toggleUnderline().run();
              }}
            >
              <MdOutlineFormatUnderlined />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor?.isActive('image')}
              onClick={addImage}
            >
              <MdOutlineAddPhotoAlternate />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor?.isActive('link')}
              onClick={() => {
                if (editor?.isActive('link')) {
                  setSelectedLink(editor.getAttributes('link').href || '');
                } else {
                  setSelectedLink('');
                }
                onOpen();
              }}
            >
              <AiOutlineLink />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor?.isActive('bulletList')}
              onClick={() => {
                editor?.chain().focus().toggleBulletList().run();
              }}
            >
              <MdOutlineFormatListBulleted />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor?.isActive('orderedList')}
              onClick={() => {
                editor?.chain().focus().toggleOrderedList().run();
              }}
            >
              <AiOutlineOrderedList />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor?.isActive('codeBlock')}
              onClick={() => {
                editor?.chain().focus().toggleCodeBlock().run();
              }}
            >
              <BsCodeSlash />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor?.isActive('blockquote')}
              onClick={() => {
                editor?.chain().focus().toggleBlockquote().run();
              }}
            >
              <BsBlockquoteLeft />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                editor?.chain().focus().setHorizontalRule().run();
              }}
            >
              <MdOutlineHorizontalRule />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                editor?.chain().focus().setHardBreak().run();
              }}
            >
              <BsFileBreak />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                editor?.chain().focus().undo().run();
              }}
            >
              <CiUndo />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                editor?.chain().focus().redo().run();
              }}
            >
              <CiRedo />
            </ToolbarButton>
            <ToolbarButton onClick={() => {}}>
              <BiFontColor />
            </ToolbarButton>
          </Flex>

          <Box w={'full'} h={'full'} mb={10}>
            <div style={{ height: '100% !important' }} className="reset">
              <EditorContent
                id="reset-des"
                width={'100%'}
                height={'100%'}
                editor={editor}
              />
            </div>
          </Box>
          {isProject && (
            <>
              <Flex
                align={'start'}
                justify={'start'}
                direction={'column'}
                w="100%"
                mb={3}
              >
                <Text
                  color={'brand.slate.500'}
                  fontSize={'15px'}
                  fontWeight={600}
                >
                  Deliverable References
                </Text>
                <Text
                  mt={'0px !important'}
                  color={'#94A3B8'}
                  fontSize={'0.88rem'}
                >
                  Add links of other projects/websites as references for the
                  kind of deliverables you are looking for.
                </Text>
              </Flex>
              {fields.map((field, index) => (
                <Flex
                  key={field.id}
                  align="end"
                  justify="space-between"
                  w="full"
                >
                  <ReferenceCard
                    register={register}
                    index={index}
                    errors={errors}
                  />
                  <Button ml={4} onClick={() => remove(index)}>
                    <DeleteIcon />
                  </Button>
                </Flex>
              ))}
              {fields.length < 6 && (
                <Button
                  w={'full'}
                  h={12}
                  mt={2}
                  color={'#64758B'}
                  bg={'#F1F5F9'}
                  borderRadius="sm"
                  onClick={() =>
                    append({
                      order: fields.length + 1,
                      link: '',
                    })
                  }
                >
                  + Add Reference
                </Button>
              )}
            </>
          )}
        </VStack>
        <VStack gap={4} w={'full'} mt={16}>
          {editorError && (
            <Text align={'center'} color={'red'}>
              Listing Details is a required field
            </Text>
          )}
          <Button
            className="ph-no-capture"
            w="100%"
            py={6}
            fontWeight={500}
            borderRadius="sm"
            onClick={handleSubmit(onSubmit)}
            type="submit"
            variant={!isDraft ? 'outline' : 'solid'}
          >
            Continue
          </Button>
          {isDraft && (
            <Button
              className="ph-no-capture"
              w="100%"
              py={6}
              color="brand.purple"
              fontWeight={500}
              bg="#EEF2FF"
              borderRadius="sm"
              isLoading={isDraftLoading}
              onClick={onDraftClick}
              variant={'ghost'}
            >
              Save Draft
            </Button>
          )}
          {!isDraft && (
            <Button
              className="ph-no-capture"
              w="100%"
              py={6}
              fontWeight={500}
              borderRadius="sm"
              isLoading={isDraftLoading}
              onClick={onDraftClick}
              variant={'solid'}
            >
              Update Listing
            </Button>
          )}
        </VStack>
      </Box>
    </>
  );
};
