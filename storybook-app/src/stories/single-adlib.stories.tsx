import type { Meta, StoryObj } from '@storybook/react-vite';
import { SingleAdlib } from '@/features/adlibs/components/adlib-control/single-adlib';
import { PlaylistIdProvider } from '@/features/live-status/playlist-id';
import { clearItem, portraitItem, welcomeItem } from '../fixtures';
import { CardFrame } from '../stage';

const meta = {
  args: { item: portraitItem },
  component: SingleAdlib,
  decorators: [
    (Story) => (
      <CardFrame>
        <Story />
      </CardFrame>
    ),
  ],
  title: 'Adlibs/Single adlib',
} satisfies Meta<typeof SingleAdlib>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OneAction: Story = {};

export const TitleOnly: Story = {
  args: { item: welcomeItem },
};

export const Clear: Story = {
  args: { danger: true, item: clearItem },
};

export const Compact: Story = {
  args: { compact: true, item: welcomeItem },
};

export const Hint: Story = {
  args: { hint: 'Queued' },
};

/** No playlist id, so the tap is not sent. The control reads Not on air, then its own text returns. */
export const NotOnAir: Story = {
  render: (args) => (
    <PlaylistIdProvider playlistId={null}>
      <SingleAdlib {...args} />
    </PlaylistIdProvider>
  ),
};
