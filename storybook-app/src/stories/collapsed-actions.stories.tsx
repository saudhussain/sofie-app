import type { Meta, StoryObj } from '@storybook/react-vite';
import { CollapsedActions } from '@/features/adlibs/components/adlib-control/collapsed-actions';
import { routingItem } from '../fixtures';
import { CardFrame } from '../stage';

const meta = {
  args: { danger: false, item: routingItem },
  component: CollapsedActions,
  decorators: [
    (Story) => (
      <CardFrame>
        <Story />
      </CardFrame>
    ),
  ],
  title: 'Adlibs/Collapsed actions',
} satisfies Meta<typeof CollapsedActions>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The zones mount after the summary is opened. */
export const Closed: Story = {};

export const Danger: Story = {
  args: { danger: true },
};
