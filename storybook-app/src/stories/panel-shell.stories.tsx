import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  EmptyLine,
  PanelShell,
  PanelSubheading,
} from '@/shared/ui/panel-shell';
import { PanelFrame } from '../stage';

const meta = {
  args: {
    children: (
      <p className="px-5 py-6 text-sm">Cameras, graphics, and clears.</p>
    ),
    count: 4,
    headingId: 'global-adlibs-heading',
    title: 'Global Adlibs',
  },
  component: PanelShell,
  decorators: [
    (Story) => (
      <PanelFrame>
        <Story />
      </PanelFrame>
    ),
  ],
  title: 'Shared/Panel shell',
} satisfies Meta<typeof PanelShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithCount: Story = {};

export const WithoutCount: Story = {
  args: {
    count: undefined,
    headingId: 'adlibs-heading',
    title: 'Adlibs',
  },
};

export const Subheading: Story = {
  render: () => (
    <PanelShell headingId="global-adlibs-heading" title="Global Adlibs">
      <div className="px-5 py-4">
        <PanelSubheading count={3} title="Camera" />
      </div>
    </PanelShell>
  ),
};

export const Empty: Story = {
  render: () => (
    <PanelShell headingId="global-adlibs-heading" title="Global Adlibs">
      <EmptyLine message="No global adlibs" />
    </PanelShell>
  ),
};
