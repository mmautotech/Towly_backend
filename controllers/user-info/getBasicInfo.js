const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
const { formatBase64Image } = require("../../utils/profile-helper");

const getBasicInfo = async (req, res, next) => {
  try {
    
    const userId = req.body?.user_id || req.user.id;
    console.log(userId)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const role = user.role;
    let name = user.user_name || "";
    let profile_photo = "";
    let profile_photo_size = 0;
    let rating = 0;
    let ratings_count = 0;

    if (role === "client") {
      const profile = user.client_profile || {};
      name = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || user.user_name;
      const photo = profile.profile_photo?.compressed || profile.profile_photo?.original;
      if (photo?.data) {
        profile_photo = formatBase64Image(photo.data, photo.contentType);
        profile_photo_size = photo.data.length;
      }
      rating = profile.rating || 0;
      ratings_count = profile.ratings_count || 0;
    } else if (role === "truck") {
      const vp = user.truck_profile?.vehicle_profile;
      const dp = user.truck_profile?.driver_profile;
      if (vp?.make && vp?.model) {
        name = `${vp.make} ${vp.model}`;
      } else if (dp?.first_name && dp?.last_name) {
        name = `${dp.first_name} ${dp.last_name}`;
      }
      const photo = vp?.vehicle_photo?.compressed || vp?.vehicle_photo?.original;
      if (photo?.data) {
        profile_photo = formatBase64Image(photo.data, photo.contentType);
        profile_photo_size = photo.data.length;
      }
      rating = vp?.rating || 0;
      ratings_count = vp?.ratings_count || 0;
    } else {
      return res.status(403).json({ success: false, message: "Unsupported role." });
    }

    return sendSuccessResponse(res, "Basic profile info retrieved.", {
      name,
      profile_photo,
      profile_photo_size,
      rating,
      ratings_count,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = getBasicInfo;
