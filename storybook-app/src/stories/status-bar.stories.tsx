import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBar } from '@/features/live-status/components/status-bar';
import {
  connectingConnection,
  gatewayDownConnection,
  inactiveConnection,
  populatedConnection,
} from '../fixtures';

const meta = {
  component: StatusBar,
  title: 'Live status/Status bar',
} satisfies Meta<typeof StatusBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Connected: Story = {
  args: { connection: populatedConnection },
};

export const Connecting: Story = {
  args: { connection: connectingConnection },
};

export const GatewayDown: Story = {
  args: { connection: gatewayDownConnection },
};

export const RundownInactive: Story = {
  args: { connection: inactiveConnection },
};
