const { User } = require('../../models');

const updateUserPhone = async (req, res) => {
  const { userId } = req.params;
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    // Check if phone already exists for another user
    const existingUser = await User.findOne({ phone, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already exists for another user' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.phone = phone;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Phone number updated successfully.',
      user: {
        id: user._id,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Admin Phone Update Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = updateUserPhone;
