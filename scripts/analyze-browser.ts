import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import { execSync } from 'child_process';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

interface ConsoleLog {
  type: string;
  text: string;
  location: { url?: string; lineNumber?: number; columnNumber?: number } | undefined;
}

interface LighthouseCategory {
  title: string;
  score: number;
}

interface LighthouseAudit {
  title: string;
  description: string;
  score: number | null;
  details?: {
    type: string;
    overallSavingsMs?: number;
  };
}

function getChromePath(): string {
  try {
    // Try to find Chrome using playwright
    const playwrightCache = process.env.HOME + '/.cache/ms-playwright';
    const chromiumPath = `${playwrightCache}/chromium-1208/chrome-linux/chrome`;
    if (fs.existsSync(chromiumPath)) {
      return chromiumPath;
    }
    
    // Try system Chrome
    const paths = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/local/bin/google-chrome',
    ];
    
    for (const path of paths) {
      if (fs.existsSync(path)) {
        return path;
      }
    }
  } catch (e) {
    // Ignore
  }
  
  throw new Error('Chrome not found. Please install Chrome or set CHROME_PATH');
}

async function checkConsoleErrors() {
  console.log('🔍 Checking browser console for errors and warnings...');
  
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
    await page.waitForTimeout(3000);
    
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
  console.log('\n🚀 Running Lighthouse audit...');
  
  const chromePath = getChromePath();
  console.log(`Using Chrome at: ${chromePath}`);
  
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
  
  const categories: Record<string, LighthouseCategory> = report.categories;
  Object.entries(categories).forEach(([key, category]) => {
    const score = Math.round(category.score * 100);
    const icon = score >= 90 ? '✅' : score >= 70 ? '⚠️' : '❌';
    console.log(`${icon} ${category.title}: ${score}/100`);
  });
  
  fs.writeFileSync('lighthouse-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to lighthouse-report.json');
  
  console.log('\n🔧 Optimization Opportunities:');
  console.log('=============================');
  
  const audits: Record<string, LighthouseAudit> = report.audits;
  const opportunities = Object.values(audits).filter(audit => 
    audit.details?.type === 'opportunity' && 
    audit.score !== null && 
    audit.score < 1
  );
  
  if (opportunities.length === 0) {
    console.log('✅ No optimization opportunities found!');
  } else {
    opportunities.forEach(audit => {
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
  console.log('🧛 BroCula starting analysis...\n');
  
  const { consoleLogs, pageErrors } = await checkConsoleErrors();
  const lighthouseReport = await runLighthouse();
  
  console.log('\n✨ Analysis complete!');
  
  if (consoleLogs.length > 0 || pageErrors.length > 0) {
    console.log('\n❌ FATAL: Console errors detected!');
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Analysis failed:', error);
  process.exit(1);
});
