// Simple test script to verify authentication is working
const baseUrl = 'http://localhost:4000';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Login
    console.log('1. Testing login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com', // Replace with your test email
        password: 'testpassword123' // Replace with your test password
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('Access Token:', loginData.accessToken ? 'Present' : 'Missing');
    console.log('User ID:', loginData.user?.id);

    const accessToken = loginData.accessToken;

    // Test 2: Access protected route without token
    console.log('\n2. Testing protected route without token...');
    const noTokenResponse = await fetch(`${baseUrl}/api/user`);
    console.log('Status:', noTokenResponse.status);
    if (noTokenResponse.status === 401) {
      console.log('✅ Correctly rejected without token');
    } else {
      console.log('❌ Should have been rejected');
    }

    // Test 3: Access protected route with token
    console.log('\n3. Testing protected route with token...');
    const withTokenResponse = await fetch(`${baseUrl}/api/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('Status:', withTokenResponse.status);
    if (withTokenResponse.ok) {
      const userData = await withTokenResponse.json();
      console.log('✅ Successfully accessed protected route');
      console.log('User data:', userData);
    } else {
      console.log('❌ Failed to access protected route:', await withTokenResponse.text());
    }

    // Test 4: Test session endpoint
    console.log('\n4. Testing session endpoint...');
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('Status:', sessionResponse.status);
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      console.log('✅ Session check successful');
      console.log('Authenticated:', sessionData.authenticated);
      console.log('User:', sessionData.user);
    } else {
      console.log('❌ Session check failed:', await sessionResponse.text());
    }

    // Test 5: Test models endpoint (should work without auth for GET)
    console.log('\n5. Testing models endpoint (public)...');
    const modelsResponse = await fetch(`${baseUrl}/api/models`);
    console.log('Status:', modelsResponse.status);
    if (modelsResponse.ok) {
      console.log('✅ Models endpoint accessible without auth');
    } else {
      console.log('❌ Models endpoint should be public');
    }

    console.log('\n🎉 Authentication test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAuth();
