// utils/profile-helper.js

const formatBase64Image = (buffer, contentType) => {
  if (!buffer) return "";
  const b64 = buffer.toString("base64");
  return `data:${contentType};base64,${b64}`;
};

const formatDateString = (date) =>
  date
    ? new Date(date).toISOString().split("T")[0].split("-").reverse().join("-")
    : "";

const updateProfileFields = (userType, fields, files = {}) => {
  const updates = {};

  if (userType === "client") {
    updates["client_profile.first_name"] = fields.first_name;
    updates["client_profile.last_name"] = fields.last_name;
    updates["client_profile.email"] = fields.email;
    updates["client_profile.address"] = fields.address || "";

    if (files.profile_photo?.buffer) {
      updates["client_profile.profile_photo"] = {
        data: files.profile_photo.buffer,
        contentType: files.profile_photo.mimetype,
      };
    }
  }

  if (userType === "driver") {
    updates["truck_profile.driver_profile.first_name"] = fields.first_name;
    updates["truck_profile.driver_profile.last_name"] = fields.last_name;
    updates["truck_profile.driver_profile.license_number"] =
      fields.license_number;

    const [d1, m1, y1] = (fields.date_of_birth || "").split("-");
    const dob = new Date(`${y1}-${m1}-${d1}`);
    if (!isNaN(dob)) dob.setUTCHours(0, 0, 0, 0);
    updates["truck_profile.driver_profile.date_of_birth"] = dob;

    const [d2, m2, y2] = (fields.license_expiry || "").split("-");
    const exp = new Date(`${y2}-${m2}-${d2}`);
    if (!isNaN(exp)) exp.setUTCHours(0, 0, 0, 0);
    updates["truck_profile.driver_profile.license_expiry"] = exp;

    if (files.license_Front?.buffer) {
      updates["truck_profile.driver_profile.license_front"] = {
        data: files.license_Front.buffer,
        contentType: files.license_Front.mimetype,
      };
    }
    if (files.license_Back?.buffer) {
      updates["truck_profile.driver_profile.license_back"] = {
        data: files.license_Back.buffer,
        contentType: files.license_Back.mimetype,
      };
    }
    if (files.license_Selfie?.buffer) {
      updates["truck_profile.driver_profile.license_selfie"] = {
        data: files.license_Selfie.buffer,
        contentType: files.license_Selfie.mimetype,
      };
    }
  }

  if (userType === "vehicle") {
    updates["truck_profile.vehicle_profile.make"] = fields.make;
    updates["truck_profile.vehicle_profile.model"] = fields.model;
    updates["truck_profile.vehicle_profile.year"] = fields.year;
    updates["truck_profile.vehicle_profile.registration_number"] =
      fields.registration_number;
    updates["truck_profile.vehicle_profile.category"] = fields.category;
    updates["truck_profile.vehicle_profile.wheels"] = fields.wheels;
    updates["truck_profile.vehicle_profile.loaded"] = fields.loaded;

    if (files.vehiclePhoto?.buffer) {
      updates["truck_profile.vehicle_profile.vehicle_photo"] = {
        data: files.vehiclePhoto.buffer,
        contentType: files.vehiclePhoto.mimetype,
      };
    }
  }

  return updates;
};

module.exports = {
  formatBase64Image,
  updateProfileFields,
  formatDateString,
};
