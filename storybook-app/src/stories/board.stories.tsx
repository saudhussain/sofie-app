import type { Meta, StoryObj } from '@storybook/react-vite';
import { App } from '@/app';
import { GlobalPanel } from '@/features/adlibs/components/global-panel';
import { LocalPanel } from '@/features/adlibs/components/local-panel';
import { StatusBar } from '@/features/live-status/components/status-bar';
import { populatedConnection } from '../fixtures';
import { FullBleed } from '../stage';

const meta = {
  title: 'Board/Touch screen',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Fixture: Story = {
  render: () => (
    <FullBleed>
      <main className="flex h-full flex-col gap-3 overflow-hidden p-4">
        <StatusBar connection={populatedConnection} />
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3">
          <LocalPanel connection={populatedConnection} />
          <GlobalPanel connection={populatedConnection} />
        </div>
      </main>
    </FullBleed>
  ),
};

/**
 * The touch app, on the gateway. Taps in this catalog still resolve locally
 * and are not posted to Sofie.
 */
export const Live: Story = {
  render: () => (
    <FullBleed>
      <App />
    </FullBleed>
  ),
};
