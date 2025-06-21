const { User } = require('../../models');

/**
 * @swagger
 * /update-phone/{userId}:
 *   put:
 *     summary: Update user's phone number
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Phone number updated successfully
 *       400:
 *         description: Phone already in use or invalid
 *       403:
 *         description: Forbidden, only admin can access
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const updateUserPhone = async (req, res) => {
  // Defensive: Confirm current user is admin
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admins only.',
    });
  }

  const { userId } = req.params;
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  try {
    const existingUser = await User.findOne({ phone, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists for another user'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
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
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = updateUserPhone;
