import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Save quiz result
export async function saveResult(result) {
  try {
    await addDoc(collection(db, "results"), {
      ...result,
      timestamp: serverTimestamp(),
    });
    console.log("✅ Result saved to Firestore");
  } catch (err) {
    console.error("❌ Error saving result:", err);
  }
}

// Fetch all quiz results
export async function fetchResults() {
  try {
    const snapshot = await getDocs(collection(db, "results"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("❌ Error fetching results:", err);
    return [];
  }
}
