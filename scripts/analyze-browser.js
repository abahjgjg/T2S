import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

async function analyze() {
  console.log('🔍 BroCula Browser Analysis Starting...\n');
  
  // Start the dev server
  const server = await chromium.launch();
  
  try {
    // Launch browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Collect console logs
    const consoleErrors = [];
    const consoleWarnings = [];
    
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        consoleErrors.push(text);
        console.log('❌ Console Error:', text);
      } else if (type === 'warning') {
        consoleWarnings.push(text);
        console.log('⚠️  Console Warning:', text);
      }
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
      console.log('❌ Page Error:', error.message);
    });
    
    // Navigate to the page
    console.log('📄 Loading application...');
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    
    // Wait for React to render
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: '.lighthouseci/screenshot.png' });
    
    console.log('\n📊 Analysis Results:');
    console.log('====================');
    console.log(`❌ Console Errors: ${consoleErrors.length}`);
    console.log(`⚠️  Console Warnings: ${consoleWarnings.length}`);
    
    if (consoleErrors.length === 0 && consoleWarnings.length === 0) {
      console.log('✅ No console errors or warnings found!');
    }
    
    await browser.close();
    
    // Exit with error code if there were console errors
    if (consoleErrors.length > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Analysis failed:', error);
    process.exit(1);
  }
}

analyze();
