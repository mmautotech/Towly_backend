const { User } = require('../../models');

/**
 * @swagger
 * /update-contact/{userId}:
 *   put:
 *     summary: Update user's phone number or email
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
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact information updated successfully
 *       400:
 *         description: Email or phone already in use or invalid
 *       403:
 *         description: Forbidden, only admin can access
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const updateUserPhone = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admins only.',
    });
  }

  const { userId } = req.params;
  const { phone, email } = req.body;

  if (!phone && !email) {
    return res.status(400).json({
      success: false,
      message: 'At least one field (phone or email) is required'
    });
  }

  try {
    // Check for existing phone or email (excluding current user)
    const conflictQuery = {
      $or: [],
      _id: { $ne: userId }
    };
    if (phone) conflictQuery.$or.push({ phone });
    if (email) conflictQuery.$or.push({ email });

    if (conflictQuery.$or.length) {
      const conflict = await User.findOne(conflictQuery);
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'Phone or email already in use by another user'
        });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (phone) user.phone = phone;
    if (email) user.email = email;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Contact information updated successfully.',
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Admin Contact Update Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = updateUserPhone;
