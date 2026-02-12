import lighthouse from 'lighthouse';
import fs from 'fs';
import { spawn } from 'child_process';
import { SCRIPT_CONFIG } from './config.js';

const { server, chrome, timeouts, thresholds, lighthouse: lhConfig } = SCRIPT_CONFIG;

async function runLighthouse() {
  console.log('🚦 Running Lighthouse audit...\n');
  
  // Launch Chrome with remote debugging
  const chromeProcess = spawn(chrome.path, [
    ...chrome.flags,
    `--remote-debugging-port=${chrome.debuggingPort}`,
  ], {
    detached: true,
    stdio: 'ignore'
  });
  
  // Wait for Chrome to start
  await new Promise(resolve => setTimeout(resolve, timeouts.chromeLaunch));
  
  const options = {
    logLevel: lhConfig.logLevel,
    output: lhConfig.outputFormat,
    onlyCategories: lhConfig.categories,
    port: chrome.debuggingPort,
  };
  
  try {
    const runnerResult = await lighthouse(server.baseUrl, options);
    const reportJson = runnerResult.report;
    const report = JSON.parse(reportJson);
    
    // Save report
    fs.mkdirSync(lhConfig.outputDir, { recursive: true });
    fs.writeFileSync(
      `${lhConfig.outputDir}/${lhConfig.outputFilename}`,
      reportJson
    );
    
    console.log('📊 Lighthouse Scores:');
    console.log('====================');
    
    const categories = report.categories;
    for (const [key, category] of Object.entries(categories)) {
      const score = Math.round(category.score * 100);
      const icon = score >= thresholds.excellent ? '✅' : score >= thresholds.poor ? '⚠️' : '❌';
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
