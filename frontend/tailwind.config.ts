import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    // Disable features that cause lab() color issues in Turbopack
    backgroundImage: true,
    gradientColorStops: false,
    preflight: false,
  },
};

export default config;
