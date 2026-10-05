import type { Meta, StoryObj } from '@storybook/react-vite';
import { SingleAdLib } from '@/features/adlibs/components/adlib-control/single-adlib';
import { PlaylistIdProvider } from '@/features/live-status/playlist-id';
import { clearItem, portraitItem, welcomeItem } from '../fixtures';
import { CardFrame } from '../stage';

const meta = {
  args: { item: portraitItem },
  component: SingleAdLib,
  decorators: [
    (Story) => (
      <CardFrame>
        <Story />
      </CardFrame>
    ),
  ],
  title: 'Adlibs/Single adlib',
} satisfies Meta<typeof SingleAdLib>;

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
      <SingleAdLib {...args} />
    </PlaylistIdProvider>
  ),
};
