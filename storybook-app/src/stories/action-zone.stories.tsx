import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionZone } from '@/features/adlibs/components/adlib-control/action-zone';
import { transitionItem } from '../fixtures';
import { CardFrame } from '../stage';

const meta = {
  args: {
    actionName: 'in',
    compact: false,
    danger: false,
    item: transitionItem,
    label: 'In',
  },
  component: ActionZone,
  decorators: [
    (Story) => (
      <CardFrame>
        <Story />
      </CardFrame>
    ),
  ],
  title: 'Adlibs/Action zone',
} satisfies Meta<typeof ActionZone>;

export default meta;

type Story = StoryObj<typeof meta>;

export const In: Story = {};

export const Danger: Story = {
  args: { actionName: 'out', danger: true, label: 'Out' },
};

export const Compact: Story = {
  args: { compact: true },
};
