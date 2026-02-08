const { chromium } = require('playwright');
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');

async function runLighthouse() {
  console.log('🔍 Running Lighthouse Performance Audit...\n');
  
  try {
    // Get Puppeteer's Chromium executable path
    const browser = await puppeteer.launch({ headless: true });
    const executablePath = puppeteer.executablePath();
    await browser.close();
    
    // Launch Chrome using Puppeteer's Chromium
    const chromeLauncher = require('chrome-launcher');
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox'],
      chromePath: executablePath
    });
    
    // Run Lighthouse
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    };
    
    const runnerResult = await lighthouse('http://localhost:4173/', options);
    
    // Close Chrome
    await chrome.kill();
    
    // Extract scores
    const scores = {
      performance: runnerResult.lhr.categories.performance.score * 100,
      accessibility: runnerResult.lhr.categories.accessibility.score * 100,
      bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
      seo: runnerResult.lhr.categories.seo.score * 100,
    };
    
    console.log('\n📊 Lighthouse Scores:');
    console.log('====================');
    console.log(`Performance: ${scores.performance.toFixed(0)}`);
    console.log(`Accessibility: ${scores.accessibility.toFixed(0)}`);
    console.log(`Best Practices: ${scores.bestPractices.toFixed(0)}`);
    console.log(`SEO: ${scores.seo.toFixed(0)}`);
    
    // Check for optimization opportunities
    const audits = runnerResult.lhr.audits;
    const opportunities = [];
    
    if (audits['unused-javascript']?.score < 1) {
      opportunities.push(`Unused JavaScript: ${audits['unused-javascript'].displayValue}`);
    }
    if (audits['unused-css-rules']?.score < 1) {
      opportunities.push(`Unused CSS: ${audits['unused-css-rules'].displayValue}`);
    }
    if (audits['modern-image-formats']?.score < 1) {
      opportunities.push('Modern image formats not used');
    }
    if (audits['efficiently-encode-images']?.score < 1) {
      opportunities.push('Images not efficiently encoded');
    }
    if (audits['render-blocking-resources']?.score < 1) {
      opportunities.push('Render-blocking resources detected');
    }
    if (audits['uses-optimized-images']?.score < 1) {
      opportunities.push('Images need optimization');
    }
    if (audits['uses-text-compression']?.score < 1) {
      opportunities.push('Text compression not enabled');
    }
    
    if (opportunities.length > 0) {
      console.log('\n🔧 Optimization Opportunities:');
      opportunities.forEach(opp => console.log(`  - ${opp}`));
    } else {
      console.log('\n✅ No major optimization opportunities found!');
    }
    
    // Return scores for potential assertions
    return scores;
    
  } catch (error) {
    console.error('Lighthouse audit failed:', error.message);
    process.exit(1);
  }
}

runLighthouse();
