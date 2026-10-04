import type { Meta, StoryObj } from '@storybook/react-vite';
import { SplitAdlib } from '@/features/adlibs/components/adlib-control/split-adlib';
import { routingItem, transitionItem } from '../fixtures';
import { CardFrame } from '../stage';

const meta = {
  args: { item: transitionItem },
  component: SplitAdlib,
  decorators: [
    (Story) => (
      <CardFrame>
        <Story />
      </CardFrame>
    ),
  ],
  title: 'Adlibs/Split adlib',
} satisfies Meta<typeof SplitAdlib>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoZones: Story = {};

export const ManyActions: Story = {
  args: { item: routingItem },
};

export const Danger: Story = {
  args: { danger: true },
};

export const Hint: Story = {
  args: { hint: 'Queued' },
};
