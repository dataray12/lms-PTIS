const admin = require("firebase-admin");
const fs = require("fs");

// Load service account key
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load courses.json
const data = JSON.parse(fs.readFileSync("courses.json", "utf8"));

async function importData() {
  const courses = data.courses;

  for (const [key, value] of Object.entries(courses)) {
    await db.collection("courses").doc(key).set(value);
    console.log(`Uploaded course: ${key}`);
  }

  console.log("All courses uploaded successfully!");
}

importData().catch(console.error);
