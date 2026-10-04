import type { Meta, StoryObj } from '@storybook/react-vite';
import { Thumbnail } from '@/features/adlibs/components/adlib-control/thumbnail';
import { thumbnailUrl } from '../fixtures';

const meta = {
  component: Thumbnail,
  title: 'Adlibs/Thumbnail',
} satisfies Meta<typeof Thumbnail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  args: { url: thumbnailUrl },
};

/** A failed image is omitted, so the slot stays empty. */
export const HiddenWhenBlocked: Story = {
  args: { url: 'data:image/svg+xml,not-an-image' },
  render: (args) => (
    <div className="size-16 border border-line border-dashed">
      <Thumbnail {...args} />
    </div>
  ),
};
