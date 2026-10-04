import type { Meta, StoryObj } from '@storybook/react-vite';
import { LocalPanel } from '@/features/adlibs/components/local-panel';
import {
  connectingConnection,
  emptyConnection,
  inactiveConnection,
  populatedConnection,
  unknownSegmentConnection,
} from '../fixtures';
import { PanelFrame } from '../stage';

const meta = {
  args: { connection: populatedConnection },
  component: LocalPanel,
  decorators: [
    (Story) => (
      <PanelFrame wide>
        <Story />
      </PanelFrame>
    ),
  ],
  title: 'Adlibs/Local panel',
} satisfies Meta<typeof LocalPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Populated: Story = {};

export const UnknownSegment: Story = {
  args: { connection: unknownSegmentConnection },
};

export const Empty: Story = {
  args: { connection: emptyConnection },
};

export const Waiting: Story = {
  args: { connection: connectingConnection },
};

export const RundownInactive: Story = {
  args: { connection: inactiveConnection },
};
