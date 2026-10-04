import type { StorybookConfig } from '@storybook/react-vite';

const config = {
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.tsx'],
} satisfies StorybookConfig;

export default config;
