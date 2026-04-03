const axios = require('axios');

const testBackendAPI = async () => {
    console.log('--- Testing Backend API (OTP Generation) ---');
    try {
        const response = await axios.post('http://localhost:5000/api/users/register', {
            name: 'Test User',
            email: 'your_test_email@example.com', // Change this to a real one for verification
            password: 'Password123!',
            phoneNumber: '1234567890'
        });
        console.log('✅ Status:', response.status);
        console.log('✅ Response:', response.data);
    } catch (error) {
        console.error('❌ API Error:', error.response?.data?.message || error.message);
    }
};

testBackendAPI();
