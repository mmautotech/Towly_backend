// scripts/seed.js

// Database seeder — usage: `node scripts/seed.js [--no-clear]`

require("dotenv").config();
const mongoose = require("mongoose");
const connectDb = require("../utils/db");
const { User, RideRequest, Message } = require("../models");

async function seed({ clear }) {
  await connectDb();

  if (clear) {
    await Promise.all([
      User.deleteMany({}),
      RideRequest.deleteMany({}),
      Message.deleteMany({}),
    ]);
    console.log("🔄 Cleared existing data");
  }

  // Sample client
  const client = new User({
    user_name: "John Client",
    phone: "+441234567890",
    email: "john.client@example.com",
    password: "password123",
    role: "client",
    client_profile: {
      first_name: "John",
      last_name: "Client",
      email: "john.client@example.com",
      address: "221B Baker Street, London",
    },
    setting: {
      language: "English",
      currency: "GBP",
      distance_unit: "Miles",
      time_format: "24 Hour",
      radius: "10",
    },
  });
  await client.save();

  // Sample driver
  const driver = new User({
    user_name: "Alice Driver",
    phone: "+441112223334",
    email: "alice.driver@example.com",
    password: "password123",
    role: "driver",
    driver_profile: {
      first_name: "Alice",
      last_name: "Driver",
      date_of_birth: new Date("1985-01-01"),
      license_number: "D1234567",
      license_expiry: new Date("2030-12-31"),
    },
    vehicle_profile: {
      registration_number: "ABC123",
      make: "Mercedes",
      model: "Sprinter",
      color: "White",
    },
    setting: {
      language: "English",
      currency: "GBP",
      distance_unit: "Miles",
      time_format: "24 Hour",
      radius: "15",
    },
  });
  await driver.save();

  console.log(`✅ Created users: client(${client._id}), driver(${driver._id})`);

  // Sample ride request
  const ride = new RideRequest({
    user_id: client._id,
    origin_location: { type: "Point", coordinates: [-0.1278, 51.5074] },
    dest_location:   { type: "Point", coordinates: [-0.1195, 51.5033] },
    pickup_date:     new Date(Date.now() + 3600 * 1000),
    vehicle_details: {
      registration: "XYZ987",
      make: "Ford",
      model: "Transit",
      year_of_manufacture: 2018,
    },
    status: "posted",
  });
  await ride.save();

  console.log(`✅ Created ride request: ${ride._id}`);

  // Add an offer
  ride.offers.push({
    truck_id:      driver._id,
    offered_price: 50,
    time_to_reach: "15 mins",
  });
  await ride.save();

  console.log("✅ Added sample offer to ride request");

  // Sample chat message
  const msg = new Message({
    sender:    client._id.toString(),
    receiver:  driver._id.toString(),
    text:      "Hello, I need a tow truck!",
    read:      false,
    truckId:   driver._id.toString(),
    requestId: ride._id.toString(),
  });
  await msg.save();

  console.log(`✅ Created sample message: ${msg._id}`);
}

(async () => {
  const args = process.argv.slice(2);
  const clear = !args.includes("--no-clear");

  try {
    await seed({ clear });
    console.log("🎉 Seed completed.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
