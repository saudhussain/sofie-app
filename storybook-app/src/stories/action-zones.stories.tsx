import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionZones } from '@/features/adlibs/components/adlib-control/action-zones';
import { routingItem, transitionItem } from '../fixtures';
import { CardFrame } from '../stage';

const meta = {
  args: {
    compact: false,
    danger: false,
    item: transitionItem,
  },
  component: ActionZones,
  decorators: [
    (Story) => (
      <CardFrame>
        <Story />
      </CardFrame>
    ),
  ],
  title: 'Adlibs/Action zones',
} satisfies Meta<typeof ActionZones>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Pair: Story = {};

export const Compact: Story = {
  args: { compact: true, item: routingItem },
};

export const Danger: Story = {
  args: { danger: true },
};
