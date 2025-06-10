// Database cleanup script to fix invalid enum values
const mongoose = require('mongoose');
const config = require('./config/config');

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    userName: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profileImage: { type: String, required: false },
    profile: {
        gender: { type: String, enum: ['male', 'female'], required: false },
        height: { type: Number, required: false },
        weight: { type: Number, required: false },
        goal: { type: String, enum: ['weight_loss', 'muscle_gain', 'maintenance'], required: false },
        activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], required: false },
        age: { type: Number, required: false },
        bmi: { type: Number, required: false },
        activities: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'UserActivity',
            },
        ],
    },
    hasCompletedOnboarding: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,
    tempPassword: String,
    tempPasswordExpires: Date,
    needsPasswordReset: { type: Boolean, default: false }
}, { collection: 'user_infor' });

const User = mongoose.model('User', userSchema);

async function cleanupInvalidEnumValues() {
    try {
        
        // Find all users
        const users = await User.find({});
        
        let updatedCount = 0;
        const validActivityLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
        const validGoals = ['weight_loss', 'muscle_gain', 'maintenance'];
        const validGenders = ['male', 'female'];
        
        for (const user of users) {
            let needsUpdate = false;
            
            if (user.profile) {
                // Fix invalid activityLevel
                if (user.profile.activityLevel && !validActivityLevels.includes(user.profile.activityLevel)) {
                    user.profile.activityLevel = 'sedentary';
                    needsUpdate = true;
                }
                
                // Fix invalid goal
                if (user.profile.goal && !validGoals.includes(user.profile.goal)) {
                    user.profile.goal = 'maintenance';
                    needsUpdate = true;
                }
                
                // Fix invalid gender
                if (user.profile.gender && !validGenders.includes(user.profile.gender)) {
                    user.profile.gender = undefined;
                    needsUpdate = true;
                }
            }
            
            if (needsUpdate) {
                await user.save();
                updatedCount++;
            }
        }
        
    } catch (error) {
        console.error('Cleanup error:', error);
    } finally {
        mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

// Run the cleanup
cleanupInvalidEnumValues();
