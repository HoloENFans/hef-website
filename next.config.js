// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
    reactStrictMode: false,
    images: {
        loader: 'custom', loaderFile: './imageLoader.js', unoptimized: true,
    }, webpack: {
        ignoreWarnings: [{module: /@opentelemetry\/instrumentation/, message: /Critical dependency/},]
    }
};

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

// Disable Sentry in development
module.exports = process.env.NODE_ENV === 'production' ? withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: "holoen-fans",

    project: "hef-website",

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    authToken: process.env.SENTRY_AUTH_TOKEN,
}) : nextConfig;
