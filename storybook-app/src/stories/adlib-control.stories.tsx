import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdlibControl } from '@/features/adlibs/components/adlib-control';
import {
  clearItem,
  portraitItem,
  routingItem,
  transitionItem,
} from '../fixtures';
import { CardFrame } from '../stage';

const meta = {
  args: { item: portraitItem },
  component: AdlibControl,
  decorators: [
    (Story) => (
      <CardFrame>
        <Story />
      </CardFrame>
    ),
  ],
  title: 'Adlibs/Adlib control',
} satisfies Meta<typeof AdlibControl>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {};

export const Split: Story = {
  args: { item: transitionItem },
};

export const Collapsed: Story = {
  args: { item: routingItem },
};

export const Danger: Story = {
  args: { danger: true, item: clearItem },
};

export const Compact: Story = {
  args: { compact: true },
};

export const Hint: Story = {
  args: { hint: 'Queued', item: transitionItem },
};
