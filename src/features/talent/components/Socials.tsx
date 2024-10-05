import { Flex, Icon, type IconProps, Link, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { type IconType } from 'react-icons';
import {
  FaDiscord,
  FaGithub,
  FaGlobe,
  FaLinkedin,
  FaTelegram,
  FaXTwitter,
} from 'react-icons/fa6';

interface SocialHOCIconProps extends Omit<IconProps, 'as'> {
  link?: string;
  as?: IconType;
}
const SocialIcon = React.forwardRef(
  ({ link, as, ...props }: SocialHOCIconProps, ref: any) => {
    return (
      <Link
        ref={ref}
        h={20}
        href={link}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Flex>
          <Icon
            as={as}
            opacity={link ? '1' : '0.3'}
            cursor={link ? 'pointer' : 'auto'}
            filter={link ? '' : 'grayscale(80%)'}
            {...props}
          />
        </Flex>
      </Link>
    );
  },
);

SocialIcon.displayName = 'SocialIcon';

interface SocialIconProps extends Omit<SocialHOCIconProps, 'as'> {
  link?: string;
}

const Twitter = ({ link, ...props }: SocialIconProps) => (
  <SocialIcon as={FaXTwitter} link={link} {...props} />
);

const Telegram = ({ link, ...props }: SocialIconProps) => (
  <SocialIcon as={FaTelegram} link={link} {...props} />
);

const Linkedin = ({ link, ...props }: SocialIconProps) => (
  <SocialIcon as={FaLinkedin} link={link} {...props} />
);

const Website = ({ link, ...props }: SocialIconProps) => (
  <SocialIcon as={FaGlobe} link={link} {...props} />
);

const Discord = ({ link, ...props }: SocialIconProps) =>
  link ? (
    <Tooltip label={link} placement="top">
      <SocialIcon as={FaDiscord} link="https://discord.com" {...props} />
    </Tooltip>
  ) : (
    <SocialIcon as={FaDiscord} link={link} {...props} />
  );

const GitHub = ({ link, ...props }: SocialIconProps) => (
  <SocialIcon as={FaGithub} link={link} {...props} />
);

export { Discord, GitHub, Linkedin, Telegram, Twitter, Website };
