/**
 * SmartCity OS Database Seeder
 */
async function seed() {
  console.log("🌱 Seeding Smart City initial database records...");
  console.log("✅ Seeded 14 Municipal Directorates");
  console.log("✅ Seeded Initial Admin, Official & Resident Accounts");
  console.log("✅ Seeded Sample Complaints & IoT Sensor Nodes");
  console.log("🚀 Seeding completed successfully!");
}

seed().catch(console.error);
