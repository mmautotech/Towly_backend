const { User } = require('../../models');

/**
 * @swagger
 * /user_profiles/AllClient:
 *   get:
 *     summary: Get all client users (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all client users
 *       403:
 *         description: Forbidden, only admin can access
 *       500:
 *         description: Server error
 */
const formatBase64Image = (data) => data ? `base64,${data.toString('base64')}` : '';

const formatPhoto = (photoObj) => {
  if (!photoObj) return '';
  return photoObj.original?.data ? formatBase64Image(photoObj.original.data) : '';
};

const formatUsersWithProfiles = (users) => {
  return users.map((user) => {
    const baseInfo = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (user.role === 'client') {
      const profile = user.client_profile || {};
      const settings = user.settings?.client_settings || {};
      return {
        ...baseInfo,
        profile_photo: formatPhoto(profile.profile_photo),
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        rating: profile.rating || 0,
        ratings_count: profile.ratings_count || 0,
        address: profile.address || '',
        client_settings: {
          language: settings.language || '',
          currency: settings.currency || '',
          distance_unit: settings.distance_unit || '',
          time_format: settings.time_format || '',
          radius: settings.radius || '',
        },
      };
    }

    return baseInfo;
  });
};

const projection = {
  user_name: 1,
  email: 1,
  phone: 1,
  role: 1,
  status: 1,
  createdAt: 1,
  updatedAt: 1,
  'client_profile.first_name': 1,
  'client_profile.last_name': 1,
  'client_profile.rating': 1,
  'client_profile.ratings_count': 1,
  'client_profile.address': 1,
  'client_profile.profile_photo.original.data': 1,
  'settings.client_settings': 1,
};

const getAllClients = async (req, res) => {
  try {
    // Defensive: Confirm current user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admins only.',
      });
    }

    const users = await User.find({ role: 'client' }, projection).lean();
    res.status(200).json({
      success: true,
      count: users.length,
      clients: formatUsersWithProfiles(users),
    });
  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = getAllClients;
