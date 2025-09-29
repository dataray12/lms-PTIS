import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export default function TestFirestore() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snap = await getDocs(collection(db, "courses"));
        setCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div>
      <h2>Courses from Firestore</h2>
      <ul>
        {courses.map(c => (
          <li key={c.id}>
            <strong>{c.title}</strong> — {c.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
