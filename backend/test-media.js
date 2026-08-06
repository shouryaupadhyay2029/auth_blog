/* BlogAuth V1 test-media.js — Media System Integration Tests */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });
process.env.PORT = '5001'; // Run on test port

const app = require('./app');
const connectDB = require('./config/db');
const { User, Category, Article, Media } = require('./models');

let server;

// Simple wait helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('=== STARTING INTEGRATION TESTS FOR MEDIA SYSTEM ===');

  // 1. Establish database connection
  await connectDB();

  // Start server
  server = app.listen(5001, () => {
    console.log('Test server active on port 5001.');
  });

  try {
    // 2. Setup mock data
    console.log('\n[Setup] Cleaning previous testing assets...');
    await User.deleteMany({ email: 'testmedia@domain.com' });
    await Category.deleteMany({ name: 'Media Testing Category' });

    // Create Category
    const category = await Category.create({
      name: 'Media Testing Category',
      description: 'Used for media integration tests.'
    });

    // Create test user
    const writer = await User.create({
      username: 'testmedia',
      email: 'testmedia@domain.com',
      password: 'password123',
      role: 'writer',
      isVerified: true
    });

    // 3. Authenticate and get JWT token
    console.log('\n[Auth] Authenticating media writer...');
    const loginRes = await fetch('http://localhost:5001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testmedia@domain.com',
        password: 'password123'
      })
    });

    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Authentication failed. Status: ${loginRes.status}, Body: ${JSON.stringify(loginData)}`);
    }
    const token = loginData.token;
    console.log('✓ Writer authenticated successfully.');

    // 4. Test POST /users/avatar (Avatar Upload)
    console.log('\n[Avatar] Uploading first avatar image...');
    
    // Create a 1x1 mock PNG transparent buffer or basic binary data
    const mockImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const avatarBlob = new Blob([mockImageBuffer], { type: 'image/png' });
    
    let formData = new FormData();
    formData.append('avatar', avatarBlob, 'avatar1.png');

    let uploadRes = await fetch('http://localhost:5001/api/v1/users/avatar', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    let uploadData = await uploadRes.json();
    if (uploadRes.status !== 200 || !uploadData.avatarUrl) {
      throw new Error(`First avatar upload failed. Status: ${uploadRes.status}, Body: ${JSON.stringify(uploadData)}`);
    }
    const firstAvatarUrl = uploadData.avatarUrl;
    console.log(`✓ First avatar uploaded successfully. Url: ${firstAvatarUrl}`);

    // Verify record exists in Media collection
    let firstMediaRecord = await Media.findOne({ url: firstAvatarUrl, uploader: writer._id });
    if (!firstMediaRecord || firstMediaRecord.type !== 'avatar' || !firstMediaRecord.isUsed) {
      throw new Error('Database Media tracking record incorrect for first avatar.');
    }
    console.log('✓ Database Media record is correct.');

    // Upload another avatar to verify the old one gets cleaned up
    console.log('[Avatar] Uploading second avatar to trigger old asset cleanup...');
    const secondAvatarBlob = new Blob([mockImageBuffer], { type: 'image/png' });
    
    formData = new FormData();
    formData.append('avatar', secondAvatarBlob, 'avatar2.png');

    uploadRes = await fetch('http://localhost:5001/api/v1/users/avatar', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    uploadData = await uploadRes.json();
    if (uploadRes.status !== 200 || !uploadData.avatarUrl) {
      throw new Error(`Second avatar upload failed. Status: ${uploadRes.status}, Body: ${JSON.stringify(uploadData)}`);
    }
    const secondAvatarUrl = uploadData.avatarUrl;
    console.log(`✓ Second avatar uploaded successfully. Url: ${secondAvatarUrl}`);

    // Verify old media is deleted from database
    const oldMediaRecord = await Media.findById(firstMediaRecord._id);
    if (oldMediaRecord) {
      throw new Error('Old avatar media record was not deleted from database.');
    }
    console.log('✓ Old avatar media record cleaned up successfully.');

    // 5. Setup Draft Article to test Cover Upload
    console.log('\n[Cover] Setting up draft article...');
    const articleRes = await fetch('http://localhost:5001/api/v1/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Exploring Complex Visual Performance in Modern Web Applications',
        content: 'This draft will test cover image uploads.',
        category: category._id
      })
    });

    const articleData = await articleRes.json();
    if (articleRes.status !== 219) {
      throw new Error('Draft article setup failed: ' + JSON.stringify(articleData));
    }
    const articleId = articleData.data.article._id;
    console.log(`✓ Article setup completed. ID: ${articleId}`);

    // 6. Test POST /articles/:id/cover (Cover upload directly to article)
    console.log('[Cover] Uploading cover image for article...');
    const coverBlob = new Blob([mockImageBuffer], { type: 'image/png' });
    
    formData = new FormData();
    formData.append('image', coverBlob, 'cover.png');

    uploadRes = await fetch(`http://localhost:5001/api/v1/articles/${articleId}/cover`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    uploadData = await uploadRes.json();
    if (uploadRes.status !== 200 || !uploadData.coverUrl) {
      throw new Error(`Cover image upload failed. Status: ${uploadRes.status}, Body: ${JSON.stringify(uploadData)}`);
    }
    const coverUrl = uploadData.coverUrl;
    console.log(`✓ Cover image uploaded successfully. Url: ${coverUrl}`);

    // Verify cover media is linked to article and isUsed is true
    const coverMedia = await Media.findOne({ url: coverUrl });
    if (!coverMedia || !coverMedia.isUsed || coverMedia.article?.toString() !== articleId) {
      throw new Error('Cover media document does not have correct link parameters.');
    }
    console.log('✓ Database Cover Media record linked and validated.');

    // 7. Test POST /media/upload-inline (Inline image upload)
    console.log('\n[Inline] Uploading inline writing image...');
    const inlineBlob = new Blob([mockImageBuffer], { type: 'image/png' });
    
    formData = new FormData();
    formData.append('image', inlineBlob, 'inline1.png');

    uploadRes = await fetch('http://localhost:5001/api/v1/media/upload-inline', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    uploadData = await uploadRes.json();
    if (uploadRes.status !== 200 || !uploadData.url) {
      throw new Error(`Inline upload failed. Status: ${uploadRes.status}, Body: ${JSON.stringify(uploadData)}`);
    }
    const inlineUrl = uploadData.url;
    const inlineMediaId = uploadData.mediaId;
    console.log(`✓ Inline image uploaded successfully. Url: ${inlineUrl}, Media ID: ${inlineMediaId}`);

    // 8. Test GET /media (List uploaded assets)
    console.log('\n[List] Fetching media library list...');
    const listRes = await fetch('http://localhost:5001/api/v1/media?sort=size', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const listData = await listRes.json();
    if (listRes.status !== 200 || !listData.results || listData.results.length === 0) {
      throw new Error('Media list query failed: ' + JSON.stringify(listData));
    }
    console.log(`✓ Media library returned ${listData.results.length} uploaded assets.`);

    // 9. Test Delete Media and Active usage protections
    console.log('\n[Delete] Testing active usage protection (attempt to delete cover in use)...');
    let deleteRes = await fetch(`http://localhost:5001/api/v1/media/${coverMedia._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    let deleteData = await deleteRes.json();
    if (deleteRes.status !== 400) {
      throw new Error(`Expected deletion failure (400), got: ${deleteRes.status}, Body: ${JSON.stringify(deleteData)}`);
    }
    console.log('✓ Deletion rejected as expected: cover is currently in use.');

    // Delete the unused inline image
    console.log('[Delete] Testing delete on unused inline image...');
    deleteRes = await fetch(`http://localhost:5001/api/v1/media/${inlineMediaId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    deleteData = await deleteRes.json();
    if (deleteRes.status !== 200) {
      throw new Error(`Inline delete failed. Status: ${deleteRes.status}, Body: ${JSON.stringify(deleteData)}`);
    }
    console.log('✓ Unused inline image deleted successfully.');

    // 10. Test GET /dashboard connection (aggregated stats)
    console.log('\n[Dashboard] Fetching dashboard stats...');
    const dashRes = await fetch('http://localhost:5001/api/v1/dashboard', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const dashData = await dashRes.json();
    if (dashRes.status !== 200 || dashData.storageUsage === undefined || dashData.uploadedMediaCount === undefined) {
      throw new Error('Dashboard stats missing media properties: ' + JSON.stringify(dashData));
    }
    console.log(`✓ Dashboard stats contain media metrics:`);
    console.log(`  Uploaded media count: ${dashData.uploadedMediaCount}`);
    console.log(`  Storage usage: ${dashData.storageUsage} bytes`);
    console.log(`  Recent Uploads count: ${dashData.recentUploads ? dashData.recentUploads.length : 0}`);

    // Teardown
    console.log('\n[Teardown] Cleaning up test entities...');
    await Article.deleteOne({ _id: articleId });
    await Media.deleteMany({ uploader: writer._id });
    await User.deleteOne({ _id: writer._id });
    await Category.deleteOne({ _id: category._id });
    console.log('✓ Databases returned to clean state.');

    console.log('\n======================================================');
    console.log(' ALL MEDIA SYSTEM INTEGRATION TESTS PASSED! (100% OK)');
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
