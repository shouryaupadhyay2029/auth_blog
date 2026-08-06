/* BlogAuth V1 test-editorial.js — Editorial Studio Integration Tests */
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
process.env.PORT = '5001'; // Run on test port

const app = require('./app');
const connectDB = require('./config/db');
const { User, Category, Tag, Article, ArticleVersion, Media } = require('./models');

let server;

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/v1' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data)
          });
        } catch(e) {
          resolve({
            status: res.statusCode,
            body: data
          });
        }
      });
    });
    
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('=== STARTING INTEGRATION TESTS FOR EDITORIAL STUDIO ===');
  
  // 1. Establish database connection
  await connectDB();
  
  // Start server
  server = app.listen(5001, () => {
    console.log('Test server active on port 5001.');
  });

  try {
    // 2. Setup mock data
    console.log('\n[Setup] Creating test users and categories...');
    await User.deleteMany({ email: 'testwriter@domain.com' });
    await Category.deleteMany({ name: 'Testing Category' });
    await Tag.deleteMany({ name: 'test-tag-1' });

    // Create Category
    const category = await Category.create({
      name: 'Testing Category',
      description: 'Used for integration tests.'
    });

    // Create user
    const writer = await User.create({
      username: 'testwriter',
      email: 'testwriter@domain.com',
      password: 'password123',
      role: 'writer',
      isVerified: true
    });

    // 3. Authenticate and get JWT token
    console.log('\n[Auth] Authenticating writer user...');
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: 'testwriter@domain.com',
      password: 'password123'
    });

    if (loginRes.status !== 200 || !loginRes.body.token) {
      throw new Error(`Authentication failed. Status: ${loginRes.status}, Body: ${JSON.stringify(loginRes.body)}`);
    }
    const token = loginRes.body.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };
    console.log('✓ Writer authenticated successfully.');

    // 4. Test GET /auth/me
    console.log('\n[Me] Fetching current user profile...');
    const meRes = await makeRequest('GET', '/auth/me', null, authHeaders);
    if (meRes.status !== 200 || meRes.body.data.user.username !== 'testwriter') {
      throw new Error('/auth/me failed: ' + JSON.stringify(meRes.body));
    }
    console.log('✓ /auth/me profile returned successfully.');

    // 5. Test POST /articles (Create Draft)
    console.log('\n[Draft] Creating new draft article...');
    const draftRes = await makeRequest('POST', '/articles', {
      title: 'Testing Async State Handling inside Distributed Nodes',
      content: 'Initial contents of the article go here. A long block of text to estimate read time calculations.',
      category: category._id
    }, authHeaders);

    if (draftRes.status !== 219) {
      throw new Error(`Draft creation failed. Status: ${draftRes.status}, Body: ${JSON.stringify(draftRes.body)}`);
    }
    const article = draftRes.body.data.article;
    const articleId = article._id;
    console.log(`✓ Draft created successfully. ID: ${articleId}`);
    console.log(`  Auto-generated Slug: ${article.slug}`);
    console.log(`  Auto-generated Excerpt: ${article.excerpt}`);
    console.log(`  Auto-calculated ReadTime: ${article.readTime} min`);

    // 6. Test POST /articles/:id/autosave (Autosave check & save skip)
    console.log('\n[Autosave] Testing autosave without changes...');
    const auto1 = await makeRequest('POST', `/articles/${articleId}/autosave`, {
      title: 'Testing Async State Handling inside Distributed Nodes',
      lastSavedAt: article.updatedAt
    }, authHeaders);
    if (auto1.status !== 200 || auto1.body.message.indexOf('No changes detected') === -1) {
      throw new Error('Autosave fail: expected save skip.');
    }
    console.log('✓ Autosave skipped redundant write on identical payload.');

    console.log('[Autosave] Waiting 1200ms for clock tick so second write gets newer timestamp...');
    await sleep(1200);

    // Autosave with actual changes
    console.log('[Autosave] Testing autosave with content changes...');
    const auto2 = await makeRequest('POST', `/articles/${articleId}/autosave`, {
      title: 'Testing Async State Handling inside Distributed Nodes',
      content: 'Modified content to force database write.',
      lastSavedAt: article.updatedAt
    }, authHeaders);
    if (auto2.status !== 200 || !auto2.body.lastSavedTime) {
      throw new Error('Autosave write failed: ' + JSON.stringify(auto2.body));
    }
    const lastSavedTime = auto2.body.lastSavedTime;
    console.log('✓ Autosave successfully executed database write.');

    // Test Conflict protection
    console.log('[Autosave] Testing conflict protection with old timestamp...');
    const autoConflict = await makeRequest('POST', `/articles/${articleId}/autosave`, {
      title: 'Conflicting Title change',
      lastSavedAt: article.updatedAt // Sending original timestamp which is now older
    }, authHeaders);
    if (autoConflict.status !== 409) {
      throw new Error(`Conflict protection failed. Expected 409, got: ${autoConflict.status}`);
    }
    console.log('✓ Conflict protection successfully blocked overwrite.');

    // 7. Test Duplicate
    console.log('\n[Duplicate] Duplicating the draft...');
    const dupRes = await makeRequest('POST', `/articles/${articleId}/duplicate`, null, authHeaders);
    if (dupRes.status !== 211 && dupRes.status !== 201) {
      throw new Error('Duplication failed: ' + JSON.stringify(dupRes.body));
    }
    const duplicateId = dupRes.body.data.article._id;
    console.log(`✓ Duplicated successfully. New Copy ID: ${duplicateId}`);

    // Clean up duplicated
    await Article.deleteOne({ _id: duplicateId });

    // 8. Test Version history lists & restoration
    console.log('\n[Versions] Fetching revision history...');
    const versionsRes = await makeRequest('GET', `/articles/${articleId}/versions`, null, authHeaders);
    if (versionsRes.status !== 200 || versionsRes.body.versions.length < 2) {
      throw new Error('Revisions list failed: ' + JSON.stringify(versionsRes.body));
    }
    console.log(`✓ Revision history loaded. Found ${versionsRes.body.versions.length} revisions.`);
    const restoreVersionId = versionsRes.body.versions[1]._id; // Get first initial save version

    console.log('[Versions] Restoring to previous revision version...');
    const restoreRes = await makeRequest('POST', `/articles/${articleId}/versions/${restoreVersionId}/restore`, null, authHeaders);
    if (restoreRes.status !== 200) {
      throw new Error('Revision restore failed: ' + JSON.stringify(restoreRes.body));
    }
    console.log('✓ Revision version successfully restored.');

    // 9. Test preview token generation & bypass view
    console.log('\n[Preview] Generating draft preview token...');
    const previewTokenRes = await makeRequest('POST', `/articles/${articleId}/preview`, null, authHeaders);
    if (previewTokenRes.status !== 200 || !previewTokenRes.body.token) {
      throw new Error('Preview token generation failed: ' + JSON.stringify(previewTokenRes.body));
    }
    const previewToken = previewTokenRes.body.token;
    console.log(`✓ Token generated: ${previewToken}`);

    console.log('[Preview] Querying preview bypass endpoint...');
    const previewViewRes = await makeRequest('GET', `/articles/preview/${previewToken}`);
    if (previewViewRes.status !== 200 || previewViewRes.body.data.article._id !== articleId) {
      throw new Error('Preview article view failed: ' + JSON.stringify(previewViewRes.body));
    }
    console.log('✓ Preview bypass endpoint verified successfully.');

    // 10. Test scheduling
    console.log('\n[Schedule] Scheduling post for future publication...');
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const scheduleRes = await makeRequest('POST', `/articles/${articleId}/schedule`, {
      scheduledAt: tomorrow,
      timezone: 'UTC'
    }, authHeaders);
    if (scheduleRes.status !== 200 || scheduleRes.body.data.article.status !== 'scheduled') {
      throw new Error('Scheduling failed: ' + JSON.stringify(scheduleRes.body));
    }
    console.log('✓ Article successfully scheduled for tomorrow.');

    // 11. Test publish immediately
    console.log('\n[Publish] Publishing article immediately...');
    const publishRes = await makeRequest('POST', `/articles/${articleId}/publish`, null, authHeaders);
    if (publishRes.status !== 200 || publishRes.body.data.article.status !== 'published') {
      throw new Error('Publishing failed: ' + JSON.stringify(publishRes.body));
    }
    console.log('✓ Article published immediately.');

    // 12. Test Archive & Restore
    console.log('\n[Workflow] Archiving published article...');
    const archiveRes = await makeRequest('POST', `/articles/${articleId}/archive`, null, authHeaders);
    if (archiveRes.status !== 200 || archiveRes.body.data.article.status !== 'archived') {
      throw new Error('Archiving failed: ' + JSON.stringify(archiveRes.body));
    }
    console.log('✓ Article archived.');

    console.log('[Workflow] Restoring archived article back to draft status...');
    const restoreDraftRes = await makeRequest('POST', `/articles/${articleId}/restore`, null, authHeaders);
    if (restoreDraftRes.status !== 200 || restoreDraftRes.body.data.article.status !== 'draft') {
      throw new Error('Restoration back to draft failed: ' + JSON.stringify(restoreDraftRes.body));
    }
    console.log('✓ Article restored back to draft.');

    // 13. Test GET /dashboard metrics aggregation
    console.log('\n[Dashboard] Fetching aggregator metrics...');
    const dashRes = await makeRequest('GET', '/dashboard', null, authHeaders);
    if (dashRes.status !== 200 || dashRes.body.draftCount === undefined) {
      throw new Error('Dashboard stats failed: ' + JSON.stringify(dashRes.body));
    }
    console.log(`✓ Metrics retrieved successfully. Draft Count: ${dashRes.body.draftCount}, Published Count: ${dashRes.body.publishedCount}, Scheduled Count: ${dashRes.body.scheduledCount}`);

    // Cleanup
    console.log('\n[Teardown] Cleaning up testing entities...');
    await makeRequest('DELETE', `/articles/${articleId}`, null, authHeaders);
    await User.deleteOne({ _id: writer._id });
    await Category.deleteOne({ _id: category._id });
    console.log('✓ Test databases returned to clean state.');

    console.log('\n======================================================');
    console.log(' ALL INTEGRATION TESTS PASSED SUCCESSFULLY! (100% OK)');
    console.log('======================================================');
  } catch (error) {
    console.error('\n❌ INTEGRATION TEST FAILURE:');
    console.error(error);
  } finally {
    if (server) server.close();
    mongoose.connection.close();
  }
}

runTests();
