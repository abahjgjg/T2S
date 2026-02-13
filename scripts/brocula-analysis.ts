import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { SCRIPT_CONFIG } from './config.js';

const { server, chrome, testRoutes, timeouts, thresholds } = SCRIPT_CONFIG;

// Global server process reference
let previewServer: ChildProcessWithoutNullStreams | null = null;

async function startPreviewServer(): Promise<void> {
  console.log('🚀 Starting preview server...');
  
  previewServer = spawn('npm', ['run', 'preview'], {
    stdio: 'pipe',
    detached: true
  });
  
  // Wait for server to be ready
  await new Promise<void>((resolve, reject) => {
    let output = '';
    
    previewServer!.stdout.on('data', (data: Buffer) => {
      output += data.toString();
      if (output.includes('Local:') || output.includes('http://localhost:')) {
        resolve();
      }
    });
    
    setTimeout(() => {
      if (!output.includes('error')) {
        resolve();
      }
    }, timeouts.serverStartup);
    
    setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, timeouts.serverStartupMax);
  });
  
  console.log('✅ Preview server ready\n');
  
  // Wait a bit more for server to fully initialize
  await new Promise(resolve => setTimeout(resolve, timeouts.serverReady));
}

async function stopPreviewServer(): Promise<void> {
  if (previewServer && previewServer.pid) {
    try {
      process.kill(-previewServer.pid);
      console.log('🛑 Preview server stopped');
    } catch (e) {
      // Ignore kill errors
    }
  }
}

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
    await page.goto(server.baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(timeouts.networkIdle);
    
    // Navigate to different routes to check for errors
    for (const route of testRoutes) {
      await page.goto(`${server.baseUrl}${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(timeouts.betweenRoutes);
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
  
  const chromeInstance = await chromeLauncher.launch({
    chromeFlags: chrome.flags,
    chromePath: chrome.path,
  });
  
  const options = {
    logLevel: 'info' as const,
    output: 'json' as const,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chromeInstance.port,
  };
  
  const runnerResult = await lighthouse(server.baseUrl, options);
  
  await chromeInstance.kill();
  
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
    const icon = score >= thresholds.excellent ? '✅' : score >= thresholds.good ? '⚠️' : '❌';
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
  
  try {
    // Start the preview server first
    await startPreviewServer();
    
    const { consoleLogs, pageErrors } = await checkConsoleErrors();
    const lighthouseReport = await runLighthouse();
    
    console.log('\n✨ BroCula analysis complete!');
    
    // Stop the preview server
    await stopPreviewServer();
    
    // Check for fatal errors
    const hasErrors = consoleLogs.filter(l => l.type === 'error').length > 0 || pageErrors.length > 0;
    
    if (hasErrors) {
      console.log('\n❌ FATAL: Console errors detected! BroCula must fix these immediately.');
      process.exit(1);
    }
    
    // Check for low Lighthouse scores
    const categories = lighthouseReport.categories;
    const lowScores = Object.entries(categories).filter(([key, category]: [string, any]) => {
      return category.score * 100 < thresholds.good;
    });
    
    if (lowScores.length > 0) {
      console.log('\n⚠️  Low Lighthouse scores detected - optimization needed');
    }
    
    process.exit(0);
  } catch (error) {
    await stopPreviewServer();
    throw error;
  }
}

main().catch(error => {
  console.error('❌ BroCula analysis failed:', error);
  process.exit(1);
});
