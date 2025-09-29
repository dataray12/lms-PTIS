// 1) Import required modules
const fs = require("fs"); // to read users.json
const admin = require("firebase-admin"); // firebase admin SDK to access Firestore

// 2) Load your Firebase service account key
// 👉 You download this JSON file from Firebase Console > Project Settings > Service Accounts
const serviceAccount = require("./serviceAccountKey.json");

// 3) Initialize Firebase Admin with that key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 4) Get reference to Firestore database
const db = admin.firestore();

// 5) Read the users.json file
// 👉 This will load the file contents into a JavaScript object
const users = JSON.parse(fs.readFileSync("users.json", "utf8"));

// 6) Function to upload users
async function uploadUsers() {
  const batch = db.batch(); // batch lets us write many docs in one go
  const usersCollection = db.collection("users"); // reference to "users" collection

  // Loop through each user in users.json
  Object.keys(users).forEach((key) => {
    const user = users[key];
    const docRef = usersCollection.doc(user.username); // use username as document ID
    batch.set(docRef, user); // add user data to Firestore
  });

  // Commit the batch write
  await batch.commit();
  console.log("✅ Users uploaded successfully to Firestore!");
}

// 7) Run the function
uploadUsers().catch((err) => {
  console.error("❌ Error uploading users:", err);
});
