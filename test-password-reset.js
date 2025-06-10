// Test script for forgot password and reset password functionality
const { UserModel, User } = require('./models/userModel');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function testPasswordReset() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://user_dev:yourpassword@fitnesstracker.vcnx8.mongodb.net/fitness_tracker?retryWrites=true&w=majority&appName=FitnessTracker');
    console.log('Connected to MongoDB');

    // Find a test user (replace with actual email)
    const testEmail = 'test@example.com';
    const user = await UserModel.findByEmail(testEmail);
    
    if (!user) {
      console.log('Test user not found. Please create a user first or change the test email.');
      return;
    }

    console.log('Original password hash:', user.password);

    // Simulate password reset
    const newPassword = 'newTestPassword123';
    console.log('Setting new password:', newPassword);

    // Override password (this should trigger pre-save middleware)
    user.password = newPassword;
    user.tempPassword = undefined;
    user.tempPasswordExpires = undefined;
    user.needsPasswordReset = false;

    await user.save();
    console.log('Password saved successfully');

    // Reload user to verify password was hashed
    const updatedUser = await UserModel.findByEmail(testEmail);
    console.log('New password hash:', updatedUser.password);

    // Test if new password works
    const isValidPassword = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('Password verification test:', isValidPassword ? 'PASSED' : 'FAILED');

    // Test if old password doesn't work (assuming we know the old one)
    const isOldPasswordValid = await bcrypt.compare('oldPassword123', updatedUser.password);
    console.log('Old password should fail:', isOldPasswordValid ? 'FAILED (old password still works!)' : 'PASSED (old password rejected)');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testPasswordReset();
}

module.exports = { testPasswordReset };
