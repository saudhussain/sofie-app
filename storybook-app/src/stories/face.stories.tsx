import type { Meta, StoryObj } from '@storybook/react-vite';
import { Face } from '@/features/adlibs/components/adlib-control/face';
import {
  forecastItem,
  guestAgainItem,
  portraitItem,
  welcomeItem,
} from '../fixtures';
import { CardFrame } from '../stage';

const meta = {
  args: { item: welcomeItem },
  component: Face,
  decorators: [
    (Story) => (
      <CardFrame>
        <Story />
      </CardFrame>
    ),
  ],
  title: 'Adlibs/Face',
} satisfies Meta<typeof Face>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {};

export const Subtitle: Story = {
  args: { item: forecastItem },
};

export const Portrait: Story = {
  args: { item: portraitItem },
};

export const Duplicate: Story = {
  args: { item: guestAgainItem },
};

export const Sending: Story = {
  args: {
    item: portraitItem,
    statusText: 'Sending',
    tone: 'standby',
  },
};
