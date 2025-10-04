import "dotenv/config";

const testRegistration = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser123',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('User:', data);
    } else {
      console.error('❌ Registration failed:', data);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

testRegistration();
