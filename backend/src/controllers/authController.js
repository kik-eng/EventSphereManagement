const User = require('../model/userSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, companyDetails } = req.body;

    // Prevent creating admin accounts from the public registration form
    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be created via public registration.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already registered.' });
    }

    // Password Hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save User in DB
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'attendee',
      companyDetails: role === 'exhibitor' ? companyDetails : {}
    });

    res.status(201).json({ 
      message: 'Registration successful!', 
      userId: newUser._id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

// 2. LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'eventsphere_secret_key',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

// 3. FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    // Generate Reset Token (15 minutes validity)
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'eventsphere_secret_key',
      { expiresIn: '15m' }
    );

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    res.status(200).json({
      message: 'Password reset token generated successfully.',
      resetToken,
      resetUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

// 4. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eventsphere_secret_key');
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ 
      message: 'Password successfully updated. Please log in with your new password.' 
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired password reset token.', error: error.message });
  }
};