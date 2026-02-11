import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { SCRIPT_CONFIG } from './config.ts';

const { server, timeouts, interaction } = SCRIPT_CONFIG;

const consoleErrors = [];
const consoleWarnings = [];

async function captureConsoleErrors() {
  console.log('🔍 BroCula starting browser console monitoring...\n');
  
  // Start preview server
  console.log('🚀 Starting preview server...');
  const previewServer = spawn('npm', ['run', 'preview'], {
    stdio: 'pipe',
    detached: true
  });
  
  // Wait for server to be ready
  await new Promise((resolve, reject) => {
    let output = '';
    previewServer.stdout.on('data', (data) => {
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
  
  // Launch browser
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();
    
    if (type === 'error') {
      consoleErrors.push({ text, location });
      console.log(`❌ Console Error: ${text}`);
      if (location?.url) {
        console.log(`   Location: ${location.url}:${location.lineNumber || '?'}`);
      }
    } else if (type === 'warning') {
      consoleWarnings.push({ text, location });
      console.log(`⚠️  Console Warning: ${text}`);
      if (location?.url) {
        console.log(`   Location: ${location.url}:${location.lineNumber || '?'}`);
      }
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    consoleErrors.push({ text: error.message, location: { url: 'page' } });
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  // Navigate to the app
  console.log('🌐 Navigating to application...\n');
  await page.goto(server.baseUrl, {
    waitUntil: 'networkidle',
    timeout: timeouts.pageNavigation
  });
  
  // Wait for app to fully load and settle
  await page.waitForTimeout(timeouts.pageSettle);
  
  // Try to interact with the app to trigger more console messages
  console.log('🖱️  Interacting with application...\n');
  
  // Click on various elements to trigger potential errors
  try {
    // Try to find and click buttons
    const buttons = await page.locator('button').all();
    for (let i = 0; i < Math.min(buttons.length, interaction.maxButtonsToClick); i++) {
      try {
        await buttons[i].click({ timeout: timeouts.clickTimeout });
        await page.waitForTimeout(timeouts.afterClick);
      } catch (e) {
        // Ignore click errors
      }
    }
  } catch (e) {
    // Ignore
  }
  
  await page.waitForTimeout(timeouts.betweenRoutes);
  
  // Close browser
  await browser.close();
  
  // Kill preview server
  try {
    process.kill(-previewServer.pid);
  } catch (e) {
    // Ignore kill errors
  }
  
  // Report results
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONSOLE MONITORING RESULTS');
  console.log('='.repeat(60));
  
  if (consoleErrors.length === 0 && consoleWarnings.length === 0) {
    console.log('✅ No console errors or warnings found!');
  } else {
    if (consoleErrors.length > 0) {
      console.log(`\n❌ Found ${consoleErrors.length} console error(s):`);
      consoleErrors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.text}`);
        if (err.location?.url && err.location.url !== 'page') {
          console.log(`     at ${err.location.url}:${err.location.lineNumber || '?'}`);
        }
      });
    }
    
    if (consoleWarnings.length > 0) {
      console.log(`\n⚠️  Found ${consoleWarnings.length} console warning(s):`);
      consoleWarnings.forEach((warn, i) => {
        console.log(`  ${i + 1}. ${warn.text}`);
        if (warn.location?.url) {
          console.log(`     at ${warn.location.url}:${warn.location.lineNumber || '?'}`);
        }
      });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Return results for further processing
  return {
    errors: consoleErrors,
    warnings: consoleWarnings,
    hasErrors: consoleErrors.length > 0,
    hasWarnings: consoleWarnings.length > 0
  };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  captureConsoleErrors()
    .then(results => {
      if (results.hasErrors) {
        console.log('\n🚨 FATAL: Console errors detected!');
        process.exit(1);
      } else if (results.hasWarnings) {
        console.log('\n⚠️  Warnings detected (non-fatal)');
        process.exit(0);
      } else {
        console.log('\n✅ All checks passed!');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Console monitoring failed:', error.message);
      process.exit(1);
    });
}

export { captureConsoleErrors };
