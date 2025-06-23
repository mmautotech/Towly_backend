const { User } = require("../../models");

/**
 * @swagger
 * /user_profiles/AllTrucker:
 *   get:
 *     summary: Get all trucker users (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: List of all trucker users
 *       403:
 *         description: Forbidden, only admin can access
 *       500:
 *         description: Server error
 */
const formatBase64Image = (data) =>
  data ? `base64,${data.toString("base64")}` : "";

const formatPhoto = (photoObj) => {
  if (!photoObj) return "";
  return photoObj.original?.data
    ? formatBase64Image(photoObj.original.data)
    : "";
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

    if (user.role === "truck") {
      const truck = user.truck_profile || {};
      const vehicle = truck.vehicle_profile || {};
      const driver = truck.driver_profile || {};
      const settings = user.settings?.truck_settings || {};

      return {
        ...baseInfo,
        profile_photo_truck: formatPhoto(vehicle.vehicle_photo),
        truck_profile: {
          rating: vehicle.rating || 0,
          ratings_count: vehicle.ratings_count || 0,
          geo_location: truck.geo_location || null,
          vehicle_profile: {
            registration_number: vehicle.registration_number || "",
            make: vehicle.make || "",
            model: vehicle.model || "",
            color: vehicle.color || "",
            vehicle_photo: formatPhoto(vehicle.vehicle_photo),
          },
        },
        driver_profile: {
          first_name: driver.first_name || "",
          last_name: driver.last_name || "",
          date_of_birth: driver.date_of_birth || null,
          license_number: driver.license_number || "",
          license_expiry: driver.license_expiry || null,
          license_front: formatPhoto(driver.license_front),
          license_back: formatPhoto(driver.license_back),
          license_selfie: formatPhoto(driver.license_selfie),
        },
        truck_settings: {
          language: settings.language || "",
          currency: settings.currency || "",
          distance_unit: settings.distance_unit || "",
          time_format: settings.time_format || "",
          radius: settings.radius || "",
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
  "truck_profile.geo_location": 1,
  "truck_profile.vehicle_profile.registration_number": 1,
  "truck_profile.vehicle_profile.make": 1,
  "truck_profile.vehicle_profile.model": 1,
  "truck_profile.vehicle_profile.color": 1,
  "truck_profile.vehicle_profile.rating": 1,
  "truck_profile.vehicle_profile.ratings_count": 1,
  "truck_profile.vehicle_profile.vehicle_photo.original.data": 1,
  "truck_profile.driver_profile.first_name": 1,
  "truck_profile.driver_profile.last_name": 1,
  "truck_profile.driver_profile.date_of_birth": 1,
  "truck_profile.driver_profile.license_number": 1,
  "truck_profile.driver_profile.license_expiry": 1,
  "truck_profile.driver_profile.license_front.original.data": 1,
  "truck_profile.driver_profile.license_back.original.data": 1,
  "truck_profile.driver_profile.license_selfie.original.data": 1,
  "settings.truck_settings": 1,
};

const getAllTrucker = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden: Admins only.",
      });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 5, 1);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ role: "truck" }, projection).skip(skip).limit(limit).lean(),
      User.countDocuments({ role: "truck" }),
    ]);

    res.status(200).json({
      users: formatUsersWithProfiles(users),
      total,
    });
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = getAllTrucker;
