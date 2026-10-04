import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Pressable } from '@/shared/ui/pressable';

const buttonClass =
  'min-h-12 border border-line bg-stage px-4 text-left font-medium text-ink';

const meta = {
  args: {
    children: 'Take',
    className: buttonClass,
    onFire: fn(),
  },
  component: Pressable,
  title: 'Shared/Pressable',
} satisfies Meta<typeof Pressable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Disabled: Story = {
  args: {
    children: 'Unavailable',
    disabled: true,
  },
};

export const Pressed: Story = {
  args: {
    'aria-pressed': true,
    children: 'Interview',
    className: `${buttonClass} border-cue`,
  },
};

export const Busy: Story = {
  args: {
    'aria-busy': true,
    children: 'Sending',
    className: `${buttonClass} border-standby text-standby`,
  },
};
