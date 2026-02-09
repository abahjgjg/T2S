import lighthouse from 'lighthouse';
import fs from 'fs';
import { spawn } from 'child_process';

async function runLighthouse() {
  console.log('🚦 Running Lighthouse audit...\n');
  
  // Launch Chrome with remote debugging
  const chromeProcess = spawn('/home/runner/.cache/ms-playwright/chromium-1208/chrome-linux/chrome', [
    '--headless',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--disable-dev-shm-usage'
  ], {
    detached: true,
    stdio: 'ignore'
  });
  
  // Wait for Chrome to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: 9222,
  };
  
  try {
    const runnerResult = await lighthouse('http://localhost:4173/', options);
    const reportJson = runnerResult.report;
    const report = JSON.parse(reportJson);
    
    // Save report
    fs.mkdirSync('.lighthouseci', { recursive: true });
    fs.writeFileSync('.lighthouseci/lighthouse-report.json', reportJson);
    
    console.log('📊 Lighthouse Scores:');
    console.log('====================');
    
    const categories = report.categories;
    for (const [key, category] of Object.entries(categories)) {
      const score = Math.round(category.score * 100);
      const icon = score >= 90 ? '✅' : score >= 50 ? '⚠️' : '❌';
      console.log(`${icon} ${category.title}: ${score}`);
    }
    
    console.log('\n🔍 Optimization Opportunities:');
    console.log('==============================');
    
    const audits = report.audits;
    let hasOpportunities = false;
    
    for (const [key, audit] of Object.entries(audits)) {
      if (audit.details && audit.details.type === 'opportunity' && audit.numericValue > 0) {
        hasOpportunities = true;
        console.log(`⚠️  ${audit.title}`);
        console.log(`   Potential savings: ${Math.round(audit.numericValue)}ms`);
        if (audit.description) {
          console.log(`   ${audit.description.substring(0, 100)}...`);
        }
        console.log('');
      }
    }
    
    if (!hasOpportunities) {
      console.log('✅ No optimization opportunities found!');
    }
    
    console.log('\n🚨 Diagnostics (score < 1):');
    console.log('=====================================');
    
    let hasFailed = false;
    for (const [key, audit] of Object.entries(audits)) {
      if (audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'informative') {
        hasFailed = true;
        const score = Math.round(audit.score * 100);
        console.log(`❌ ${audit.title} (${score}%): ${audit.description?.substring(0, 80) || 'No description'}...`);
      }
    }
    
    if (!hasFailed) {
      console.log('✅ All audits passed!');
    }
    
    // Kill Chrome
    process.kill(-chromeProcess.pid);
    
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error.message);
    process.kill(-chromeProcess.pid);
    process.exit(1);
  }
}

runLighthouse();
