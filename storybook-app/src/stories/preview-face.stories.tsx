import type { Meta, StoryObj } from '@storybook/react-vite';
import { PreviewFace } from '@/features/adlibs/components/adlib-control/preview-face';
import { portraitItem } from '../fixtures';
import { CardFrame } from '../stage';

const meta = {
  args: { item: portraitItem },
  component: PreviewFace,
  decorators: [
    (Story) => (
      <CardFrame>
        <Story />
      </CardFrame>
    ),
  ],
  title: 'Adlibs/Preview face',
} satisfies Meta<typeof PreviewFace>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Header: Story = {};
