module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173/'],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'ready in',
      startServerReadyTimeout: 120000,
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
          rttMs: 0,
        },
        formFactor: 'desktop',
        screenEmulation: {
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          mobile: false,
        },
      },
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'uses-responsive-images': 'off',
        'offscreen-images': 'off',
        'third-party-summary': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
