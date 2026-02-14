import { chromium } from 'playwright';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

async function startPreviewServer(): Promise<ChildProcessWithoutNullStreams> {
  console.log('🚀 Starting preview server...');
  
  const previewServer = spawn('npm', ['run', 'preview'], {
    stdio: 'pipe',
    detached: true
  });
  
  await new Promise<void>((resolve, reject) => {
    let output = '';
    previewServer.stdout.on('data', (data: Buffer) => {
      output += data.toString();
      if (output.includes('Local:') || output.includes('http://localhost:')) {
        resolve();
      }
    });
    
    setTimeout(() => resolve(), 8000);
    setTimeout(() => reject(new Error('Server timeout')), 30000);
  });
  
  console.log('✅ Preview server ready\n');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return previewServer;
}

async function checkNetworkRequests() {
  console.log('🔍 Checking network requests...\n');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const requests: string[] = [];
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('localhost:4173') && url.endsWith('.js')) {
      requests.push(url);
      console.log(`📦 ${url.split('/').pop()}`);
    }
  });
  
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  console.log('\n📊 Network Analysis:');
  console.log('====================');
  console.log(`Total JS files loaded: ${requests.length}`);
  
  const hasCharts = requests.some(r => r.includes('vendor-charts'));
  const hasSupabase = requests.some(r => r.includes('vendor-supabase'));
  const hasMarkdown = requests.some(r => r.includes('vendor-markdown'));
  
  console.log(`\nvendor-charts loaded: ${hasCharts ? '❌ YES (unexpected!)' : '✅ NO (correct)'}`);
  console.log(`vendor-supabase loaded: ${hasSupabase ? '❌ YES (unexpected!)' : '✅ NO (correct)'}`);
  console.log(`vendor-markdown loaded: ${hasMarkdown ? '❌ YES (unexpected!)' : '✅ NO (correct)'}`);
  
  await browser.close();
  
  return { requests, hasCharts, hasSupabase, hasMarkdown };
}

async function main() {
  const server = await startPreviewServer();
  
  try {
    const result = await checkNetworkRequests();
    
    if (result.hasCharts || result.hasSupabase || result.hasMarkdown) {
      console.log('\n❌ FAIL: Lazy-loaded chunks are being loaded on initial page load!');
      process.exit(1);
    } else {
      console.log('\n✅ PASS: Lazy-loaded chunks are NOT being loaded on initial page load!');
      process.exit(0);
    }
  } finally {
    if (server.pid) {
      try {
        process.kill(-server.pid);
      } catch (e) { /* Ignore kill errors */ }
    }
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
