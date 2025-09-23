#!/usr/bin/env node

const https = require('https');

async function testGitHubConnection() {
  console.log('🧪 GitHub Connection Test\n');
  
  // Check for environment variables
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  
  if (!repo || !token) {
    console.log('❌ Missing environment variables');
    console.log('💡 Run: npm run setup-github first\n');
    return;
  }
  
  console.log(`🔍 Testing connection to: ${repo}`);
  console.log(`🔐 Using token: ${token.substring(0, 10)}...\n`);
  
  try {
    const response = await makeGitHubRequest(`/repos/${repo}`, token);
    
    if (response.success) {
      console.log('✅ CONNECTION SUCCESSFUL!');
      console.log(`📁 Repository: ${response.data.full_name}`);
      console.log(`👤 Owner: ${response.data.owner.login}`);
      console.log(`🔒 Private: ${response.data.private ? 'Yes' : 'No'}`);
      console.log(`📅 Created: ${new Date(response.data.created_at).toLocaleDateString()}`);
      console.log(`🌟 Stars: ${response.data.stargazers_count}`);
      console.log('\n🎉 Your GitHub setup is ready for deployment!');
      console.log('▶️  Next step: npm run deploy');
    } else {
      console.log('❌ CONNECTION FAILED');
      console.log(`🔥 Error: ${response.error}`);
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('1. Check repository name format: username/repo-name');
      console.log('2. Verify token has "repo" permission');
      console.log('3. Ensure repository exists and is accessible');
      console.log('4. Run: npm run setup-github to reconfigure');
    }
    
  } catch (error) {
    console.log('💥 UNEXPECTED ERROR:', error.message);
  }
}

function makeGitHubRequest(path, token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'EDSA-Deploy-Tool',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          if (res.statusCode === 200) {
            resolve({ success: true, data: parsed });
          } else {
            resolve({ 
              success: false, 
              error: `${res.statusCode} - ${parsed.message || 'Unknown error'}` 
            });
          }
        } catch (parseError) {
          resolve({ 
            success: false, 
            error: `Parse error: ${parseError.message}` 
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ 
        success: false, 
        error: `Network error: ${error.message}` 
      });
    });

    req.end();
  });
}

// Run if called directly
if (require.main === module) {
  testGitHubConnection();
}

module.exports = { testGitHubConnection };