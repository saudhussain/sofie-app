import type { Meta, StoryObj } from '@storybook/react-vite';
import { DetailLine } from '@/features/adlibs/components/adlib-control/detail-line';
import { CardFrame } from '../stage';

const meta = {
  component: DetailLine,
  decorators: [
    (Story) => (
      <CardFrame>
        <Story />
      </CardFrame>
    ),
  ],
  title: 'Adlibs/Detail line',
} satisfies Meta<typeof DetailLine>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Credit: Story = {
  args: { detail: 'NRK' },
};

export const Sending: Story = {
  args: { detail: 'NRK', statusText: 'Sending', tone: 'standby' },
};

export const Sent: Story = {
  args: { detail: 'NRK', statusText: 'Sent', tone: 'ready' },
};

export const Failed: Story = {
  args: { detail: 'NRK', statusText: 'Failed', tone: 'danger' },
};

export const NotOnAir: Story = {
  args: { statusText: 'Not on air', tone: 'danger' },
};
