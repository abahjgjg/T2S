import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

interface ConsoleLog {
  type: string;
  text: string;
  location: { url?: string; lineNumber?: number; columnNumber?: number } | undefined;
}

async function checkConsoleErrors() {
  console.log('🔍 BroCula checking browser console for errors and warnings...\n');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleLogs: ConsoleLog[] = [];
  const pageErrors: Error[] = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();
    
    if (type === 'error' || type === 'warning') {
      consoleLogs.push({ type, text, location });
      console.log(`[${type.toUpperCase()}] ${text}`);
      if (location?.url) {
        console.log(`  at ${location.url}:${location.lineNumber}:${location.columnNumber}`);
      }
    }
  });
  
  page.on('pageerror', (error: Error) => {
    pageErrors.push(error);
    console.log(`[PAGE ERROR] ${error.message}`);
  });
  
  page.on('requestfailed', request => {
    console.log(`[FAILED REQUEST] ${request.url()} - ${request.failure()?.errorText}`);
  });
  
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // Navigate to different routes to check for errors
    const routes = ['/', '/directory'];
    for (const route of routes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }
    
    console.log('\n📊 Console Analysis Summary:');
    console.log(`Total errors: ${consoleLogs.filter(l => l.type === 'error').length}`);
    console.log(`Total warnings: ${consoleLogs.filter(l => l.type === 'warning').length}`);
    console.log(`Page errors: ${pageErrors.length}`);
    
  } catch (error) {
    console.error('Failed to check console:', error);
  } finally {
    await browser.close();
  }
  
  return { consoleLogs, pageErrors };
}

async function runLighthouse() {
  console.log('\n🚀 BroCula running Lighthouse audit...\n');
  
  // Use Playwright's Chromium for Lighthouse
  const chromePath = process.env.HOME + '/.cache/ms-playwright/chromium-1208/chrome-linux/chrome';
  
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
    chromePath,
  });
  
  const options = {
    logLevel: 'info' as const,
    output: 'json' as const,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };
  
  const runnerResult = await lighthouse(BASE_URL, options);
  
  await chrome.kill();
  
  if (!runnerResult) {
    throw new Error('Lighthouse returned null');
  }
  
  const reportJson = runnerResult.report as string;
  const report = JSON.parse(reportJson);
  
  console.log('\n📊 Lighthouse Results:');
  console.log('=====================');
  
  const categories = report.categories;
  Object.entries(categories).forEach(([key, category]: [string, any]) => {
    const score = Math.round(category.score * 100);
    const icon = score >= 90 ? '✅' : score >= 70 ? '⚠️' : '❌';
    console.log(`${icon} ${category.title}: ${score}/100`);
  });
  
  fs.writeFileSync('lighthouse-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to lighthouse-report.json');
  
  console.log('\n🔧 Optimization Opportunities:');
  console.log('=============================');
  
  const audits = report.audits;
  const opportunities = Object.values(audits).filter((audit: any) => 
    audit.details?.type === 'opportunity' && 
    audit.score !== null && 
    audit.score < 1
  );
  
  if (opportunities.length === 0) {
    console.log('✅ No optimization opportunities found!');
  } else {
    opportunities.forEach((audit: any) => {
      const savings = audit.details?.overallSavingsMs || 0;
      console.log(`⚠️  ${audit.title}`);
      console.log(`   Score: ${Math.round((audit.score || 0) * 100)}/100`);
      if (savings > 0) {
        console.log(`   Potential savings: ${savings}ms`);
      }
      console.log(`   ${audit.description}\n`);
    });
  }
  
  return report;
}

async function main() {
  console.log('🧛 BroCula starting browser analysis workflow...\n');
  
  const { consoleLogs, pageErrors } = await checkConsoleErrors();
  const lighthouseReport = await runLighthouse();
  
  console.log('\n✨ BroCula analysis complete!');
  
  // Check for fatal errors
  const hasErrors = consoleLogs.filter(l => l.type === 'error').length > 0 || pageErrors.length > 0;
  
  if (hasErrors) {
    console.log('\n❌ FATAL: Console errors detected! BroCula must fix these immediately.');
    process.exit(1);
  }
  
  // Check for low Lighthouse scores
  const categories = lighthouseReport.categories;
  const lowScores = Object.entries(categories).filter(([key, category]: [string, any]) => {
    return category.score * 100 < 70;
  });
  
  if (lowScores.length > 0) {
    console.log('\n⚠️  Low Lighthouse scores detected - optimization needed');
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ BroCula analysis failed:', error);
  process.exit(1);
});
