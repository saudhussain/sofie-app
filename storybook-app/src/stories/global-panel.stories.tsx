import type { Meta, StoryObj } from '@storybook/react-vite';
import { GlobalPanel } from '@/features/adlibs/components/global-panel';
import {
  connectingConnection,
  emptyConnection,
  inactiveConnection,
  populatedConnection,
} from '../fixtures';
import { PanelFrame } from '../stage';

const meta = {
  args: { connection: populatedConnection },
  component: GlobalPanel,
  decorators: [
    (Story) => (
      <PanelFrame>
        <Story />
      </PanelFrame>
    ),
  ],
  title: 'Adlibs/Global panel',
} satisfies Meta<typeof GlobalPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Populated: Story = {};

export const Empty: Story = {
  args: { connection: emptyConnection },
};

export const Waiting: Story = {
  args: { connection: connectingConnection },
};

export const RundownInactive: Story = {
  args: { connection: inactiveConnection },
};
