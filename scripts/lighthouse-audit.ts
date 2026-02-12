import lighthouse from 'lighthouse';
import fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import { SCRIPT_CONFIG } from './config.js';

const { server, chrome, timeouts, thresholds, lighthouse: lhConfig } = SCRIPT_CONFIG;

// Type definitions for Lighthouse results
interface LighthouseCategory {
  title: string;
  score: number | null;
}

interface LighthouseCategories {
  [key: string]: LighthouseCategory;
}

interface LighthouseAudit {
  title: string;
  description?: string;
  score: number | null;
  scoreDisplayMode?: string;
  numericValue?: number;
  details?: {
    type?: string;
  };
}

interface LighthouseAudits {
  [key: string]: LighthouseAudit;
}

interface LighthouseReport {
  categories: LighthouseCategories;
  audits: LighthouseAudits;
}

async function runLighthouse(): Promise<void> {
  console.log('🚦 Running Lighthouse audit...\n');
  
  // Launch Chrome with remote debugging
  const chromeProcess: ChildProcess = spawn(chrome.path, [
    ...chrome.flags,
    `--remote-debugging-port=${chrome.debuggingPort}`,
  ], {
    detached: true,
    stdio: 'ignore'
  });
  
  // Wait for Chrome to start
  await new Promise(resolve => setTimeout(resolve, timeouts.chromeLaunch));
  
  const options = {
    logLevel: lhConfig.logLevel as 'silent' | 'error' | 'info' | 'verbose',
    output: lhConfig.outputFormat as 'json' | 'html' | 'csv',
    onlyCategories: lhConfig.categories,
    port: chrome.debuggingPort,
  };
  
  try {
    const runnerResult = await lighthouse(server.baseUrl, options);
    
    if (!runnerResult || !runnerResult.report) {
      throw new Error('Lighthouse audit returned no results');
    }
    
    const reportJson = runnerResult.report;
    const report: LighthouseReport = JSON.parse(reportJson as string);
    
    // Save report
    fs.mkdirSync(lhConfig.outputDir, { recursive: true });
    fs.writeFileSync(
      `${lhConfig.outputDir}/${lhConfig.outputFilename}`,
      reportJson as string
    );
    
    console.log('📊 Lighthouse Scores:');
    console.log('====================');
    
    const categories = report.categories;
    for (const [key, category] of Object.entries(categories)) {
      const score = category.score !== null ? Math.round(category.score * 100) : 0;
      const icon = score >= thresholds.excellent ? '✅' : score >= thresholds.poor ? '⚠️' : '❌';
      console.log(`${icon} ${category.title}: ${score}`);
    }
    
    console.log('\n🔍 Optimization Opportunities:');
    console.log('==============================');
    
    const audits = report.audits;
    let hasOpportunities = false;
    
    for (const [key, audit] of Object.entries(audits)) {
      if (audit.details && audit.details.type === 'opportunity' && audit.numericValue && audit.numericValue > 0) {
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
    if (chromeProcess.pid) {
      process.kill(-chromeProcess.pid);
    }
    
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', (error as Error).message);
    if (chromeProcess.pid) {
      process.kill(-chromeProcess.pid);
    }
    process.exit(1);
  }
}

runLighthouse();

export { runLighthouse };
export type { LighthouseReport, LighthouseCategory, LighthouseCategories, LighthouseAudit, LighthouseAudits };
