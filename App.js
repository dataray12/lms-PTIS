import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Common styles
const mainRed = "#D32F2F";
const lightRed = "#FF6659";
const white = "#fff";
const borderRadius = 8;
const boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
const fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

// ------------------- Login Component -------------------
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("User not found");
        return;
      }

      const userData = querySnapshot.docs[0].data();

      if (userData.password === password) {
        onLogin(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        navigate(userData.role === "admin" ? "/admin" : "/");
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed");
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "4rem auto",
        padding: 30,
        borderRadius,
        boxShadow,
        fontFamily,
        backgroundColor: white,
      }}
    >
      <h2 style={{ color: mainRed, marginBottom: 20, textAlign: "center" }}>PTIS Academy Login</h2>
      {error && (
        <p
          style={{
            color: white,
            backgroundColor: mainRed,
            padding: "10px 15px",
            borderRadius,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            width: "93%",
            padding: 12,
            marginBottom: 15,
            borderRadius,
            border: `1px solid ${mainRed}`,
            fontSize: 16,
            fontFamily,
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "93%",
            padding: 12,
            marginBottom: 25,
            borderRadius,
            border: `1px solid ${mainRed}`,
            fontSize: 16,
            fontFamily,
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 14,
            backgroundColor: mainRed,
            color: white,
            fontWeight: "bold",
            fontSize: 16,
            border: "none",
            borderRadius,
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = lightRed)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = mainRed)}
        >
          Login
        </button>
      </form>
    </div>
  );
}

// ------------------- Dashboard (Students) -------------------
function Dashboard({ user }) {
  const [courses, setCourses] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function loadCourses() {
      const snapshot = await getDocs(collection(db, "courses"));
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setCourses(data);
    }
    loadCourses();
  }, []);

  useEffect(() => {
    async function loadResults() {
      const q = query(
        collection(db, "results"),
        where("username", "==", user.username),
        orderBy("date", "desc"),
        limit(3)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data());
      setResults(data);
    }
    loadResults();
  }, [user.username]);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "3rem auto",
        fontFamily,
        padding: "0 15px",
      }}
    >
      <h2 style={{ color: mainRed, marginBottom: 10 }}>Welcome, {user.name} 👋</h2>
      <p style={{ fontSize: 18, lineHeight: 1.5, marginBottom: 30 }}>
        This is your Learning Management System (LMS). Here you can access courses, track your
        learning progress, and review quiz results.
      </p>

      <hr style={{ marginBottom: 30, borderColor: "#eee" }} />

      <section style={{ marginBottom: 40 }}>
        <h3 style={{ color: mainRed, marginBottom: 15 }}>Recent Activity</h3>
        {results.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "#666" }}>No recent quiz activity.</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {results.map((r, i) => (
              <li
                key={i}
                style={{
                  backgroundColor: "#fff0f0",
                  padding: 12,
                  borderRadius,
                  marginBottom: 10,
                  boxShadow,
                }}
              >
                {r.course} — Scored {r.score}/{r.total}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 style={{ color: mainRed, marginBottom: 15 }}>Announcements</h3>
        <p style={{ fontStyle: "italic", color: "#666" }}>No announcements yet. Stay tuned!</p>
      </section>
    </div>
  );
}

// ------------------- Courses -------------------
function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function loadCourses() {
      const snapshot = await getDocs(collection(db, "courses"));
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setCourses(data);
    }
    loadCourses();
  }, []);

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "3rem auto",
        fontFamily,
        padding: "0 15px",
      }}
    >
      <h2 style={{ color: mainRed, marginBottom: 25 }}>Courses</h2>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {courses.map((course) => (
          <li
            key={course.id}
            style={{
              backgroundColor: "#fff0f0",
              marginBottom: 15,
              padding: 15,
              borderRadius,
              boxShadow,
              fontSize: 18,
            }}
          >
            <Link
              to={`/courses/${course.id}`}
              style={{
                color: mainRed,
                fontWeight: "600",
                textDecoration: "none",
                transition: "color 0.3s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = lightRed)}
              onMouseOut={(e) => (e.currentTarget.style.color = mainRed)}
            >
              {course.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------------------- Course Content -------------------
function CourseContent({ user }) {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourse() {
      const docRef = doc(db, "courses", courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCourse({ id: docSnap.id, ...docSnap.data() });
      }
    }
    fetchCourse();
  }, [courseId]);

  if (!course)
    return (
      <p
        style={{
          fontFamily,
          maxWidth: 700,
          margin: "3rem auto",
          textAlign: "center",
          color: "#999",
        }}
      >
        Loading course...
      </p>
    );

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "3rem auto",
        fontFamily,
        padding: "0 15px",
      }}
    >
      <h2 style={{ color: mainRed, marginBottom: 15 }}>{course.title}</h2>
      <button
        onClick={() => navigate("/courses")}
        style={{
          marginBottom: 25,
          backgroundColor: mainRed,
          color: white,
          border: "none",
          padding: "10px 18px",
          borderRadius,
          cursor: "pointer",
          fontWeight: "600",
          fontSize: 14,
          transition: "background-color 0.3s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = lightRed)}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = mainRed)}
      >
        ← Back to courses
      </button>
      <div style={{ lineHeight: 1.6, fontSize: 16, marginBottom: 25 }}>{course.content}</div>
      {course.video && (
        <iframe
          width="100%"
          height="360"
          src={course.video}
          title={course.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ borderRadius, marginBottom: 30, boxShadow }}
        ></iframe>
      )}
      {course.quiz && <Quiz user={user} courseId={course.id} quiz={course.quiz} />}
    </div>
  );
}

// ------------------- Quiz -------------------
function Quiz({ user, courseId, quiz }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const handleChange = (qIndex, optionIndex) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
  };

  const handleSubmit = async () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);

    const courseRef = doc(db, "courses", courseId);
    const courseSnap = await getDoc(courseRef);
    const courseTitle = courseSnap.exists() ? courseSnap.data().title : courseId;

    await addDoc(collection(db, "results"), {
      user: user.name,
      username: user.username,
      course: courseTitle,
      score: correct,
      total: quiz.length,
      date: new Date().toISOString(),
    });
  };

  if (!quiz || quiz.length === 0)
    return (
      <p style={{ fontStyle: "italic", color: "#666", marginTop: 20 }}>No quiz available.</p>
    );

  return (
    <div style={{ marginTop: 20 }}>
      <h4 style={{ color: mainRed, marginBottom: 15 }}>Quiz</h4>
      {quiz.map((q, i) => (
        <div
          key={i}
          style={{
            marginBottom: 20,
            padding: 15,
            backgroundColor: "#fff0f0",
            borderRadius,
            boxShadow,
          }}
        >
          <p style={{ fontWeight: "600", marginBottom: 10 }}>
            {i + 1}. {q.question}
          </p>
          {q.options.map((opt, idx) => (
            <label
              key={idx}
              style={{
                display: "block",
                cursor: submitted ? "default" : "pointer",
                userSelect: "none",
                marginBottom: 6,
                fontSize: 15,
              }}
            >
              <input
                type="radio"
                name={`q${i}`}
                value={idx}
                disabled={submitted}
                checked={answers[i] === idx}
                onChange={() => handleChange(i, idx)}
                style={{ marginRight: 10, cursor: submitted ? "default" : "pointer" }}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== quiz.length}
          style={{
            backgroundColor: mainRed,
            color: white,
            border: "none",
            padding: "12px 25px",
            borderRadius,
            cursor: Object.keys(answers).length === quiz.length ? "pointer" : "not-allowed",
            fontWeight: "600",
            fontSize: 16,
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => {
            if (Object.keys(answers).length === quiz.length)
              e.currentTarget.style.backgroundColor = lightRed;
          }}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = mainRed)}
        >
          Submit Quiz
        </button>
      ) : (
        <p style={{ marginTop: 20, fontWeight: "600", fontSize: 18 }}>
          You scored {score} out of {quiz.length}
        </p>
      )}
    </div>
  );
}

// ------------------- Admin -------------------
const statCardStyle = {
  flex: 1,
  backgroundColor: "#ffe6e6",
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "20px",
  textAlign: "center",
};

const statTitleStyle = {
  fontSize: "16px",
  fontWeight: "bold",
  marginBottom: "10px",
};

const statValueStyle = {
  fontSize: "24px",
  fontWeight: "bold",
};

function Admin({ onLogout, children, open, setOpen, courseData, setCourseData, editOpen, setEditOpen, editingCourse, setEditingCourse, coursesList, setCoursesList, userOpen, setUserOpen, userData, setUserData, editUserOpen, setEditUserOpen, editingUser, setEditingUser, usersList, setUsersList }) {
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    username: "",
    course: "",
    score: "",
    date: "",
    department: "",
  });

  useEffect(() => {
    async function loadResults() {
      const resultsSnapshot = await getDocs(collection(db, "results"));
      const usersSnapshot = await getDocs(collection(db, "users"));
      
      const userMap = {};
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        userMap[userData.username] = userData.department;
      });
      
      const data = resultsSnapshot.docs.map((doc) => {
        const result = doc.data();
        return {
          ...result,
          department: userMap[result.username] || "Unknown"
        };
      });
      
      const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setResults(sorted);
    }
    loadResults();
  }, []);

  useEffect(() => {
    async function loadCourses() {
      const snapshot = await getDocs(collection(db, "courses"));
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setCoursesList(data);
    }
    loadCourses();
  }, [setCoursesList]);

  useEffect(() => {
    async function loadUsers() {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setUsersList(data);
    }
    loadUsers();
  }, [setUsersList]);

  const filteredResults = results.filter((r) => {
    return (
      (filters.username === "" || r.username === filters.username) &&
      (filters.course === "" || r.course === filters.course) &&
      (filters.score === "" || r.score.toString() === filters.score) &&
      (filters.date === "" ||
        new Date(r.date).toLocaleDateString() === filters.date) &&
      (filters.department === "" || r.department === filters.department)
    );
  });

  const handleDownloadCSV = () => {
    if (filteredResults.length === 0) {
      alert("No data to export");
      return;
    }
    const headers = ["Name", "Department", "Course", "Score", "Date"];
    const rows = filteredResults.map((r) => [
      r.username,
      r.department || "Unknown",
      r.course,
      `${r.score} / ${r.total}`,
      new Date(r.date).toLocaleString(),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "quiz_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalAttempts = filteredResults.length;
  const avgScore =
    totalAttempts > 0
      ? (
          filteredResults.reduce((acc, r) => acc + r.score, 0) / totalAttempts
        ).toFixed(2)
      : 0;
  const maxScore =
    totalAttempts > 0 ? Math.max(...filteredResults.map((r) => r.score)) : 0;
  const minScore =
    totalAttempts > 0 ? Math.min(...filteredResults.map((r) => r.score)) : 0;

  const usernames = [...new Set(results.map((r) => r.username))];
  const courses = [...new Set(results.map((r) => r.course))];
  const scores = [...new Set(results.map((r) => r.score.toString()))];
  const dates = [
    ...new Set(results.map((r) => new Date(r.date).toLocaleDateString())),
  ];
  const departments = [...new Set(results.map((r) => r.department).filter(Boolean))];

  const handleSaveCourse = async () => {
    if (
      !courseData.title.trim() ||
      !courseData.content.trim() ||
      !courseData.video.trim() ||
      courseData.quiz.length === 0
    ) {
      alert("Please fill all fields and add at least one quiz question before saving!");
      return;
    }

    const fixedCourseData = {
      ...courseData,
      quiz: courseData.quiz.map(q => ({
        ...q,
        answer: q.answer > 3 ? q.answer - 1 : q.answer
      }))
    };

    const { id: _, ...courseToSave } = fixedCourseData;
    await addDoc(collection(db, "courses"), courseToSave);
    setOpen(false);
    setCourseData({ title: "", content: "", video: "", quiz: [] });
    alert("Course added successfully!");
    
    const snapshot = await getDocs(collection(db, "courses"));
    setCoursesList(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const addQuestion = () => {
    setCourseData({
      ...courseData,
      quiz: [
        ...courseData.quiz,
        { question: "", options: ["", "", "", ""], answer: 0 },
      ],
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCourse) return;
    
    const fixedEditingCourse = {
      ...editingCourse,
      quiz: editingCourse.quiz.map(q => ({
        ...q,
        answer: q.answer > 3 ? q.answer - 1 : q.answer
      }))
    };

    const { id: _, ...courseToSave } = fixedEditingCourse;
    await setDoc(doc(db, "courses", editingCourse.id), courseToSave);
    setEditOpen(false);
    alert("Course updated successfully!");
    
    const snapshot = await getDocs(collection(db, "courses"));
    setCoursesList(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const handleSaveUser = async () => {
    if (
      !userData.name.trim() ||
      !userData.username.trim() ||
      !userData.password.trim() ||
      !userData.department.trim() ||
      !userData.role.trim()
    ) {
      alert("Please fill all fields before saving!");
      return;
    }

    const { id: _, ...userToSave } = userData;
    await addDoc(collection(db, "users"), userToSave);
    setUserOpen(false);
    setUserData({ name: "", username: "", password: "", department: "", role: "" });
    alert("User added successfully!");
    
    const snapshot = await getDocs(collection(db, "users"));
    setUsersList(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser) return;
    
    const { id: _, ...userToSave } = editingUser;
    await setDoc(doc(db, "users", editingUser.id), userToSave);
    setEditUserOpen(false);
    alert("User updated successfully!");
    
    const snapshot = await getDocs(collection(db, "users"));
    setUsersList(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "3rem auto",
        padding: "0 20px",
      }}
    >
      {children || (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ color: "black", marginBottom: 25 }}>
              Performance Dashboard – Quiz Results
            </h2>
          </div>

          <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
            <div style={statCardStyle}>
              <h4 style={statTitleStyle}>Total Attempts</h4>
              <p style={statValueStyle}>{totalAttempts}</p>
            </div>
            <div style={statCardStyle}>
              <h4 style={statTitleStyle}>Average Score</h4>
              <p style={statValueStyle}>{avgScore}</p>
            </div>
            <div style={statCardStyle}>
              <h4 style={statTitleStyle}>Highest Score</h4>
              <p style={statValueStyle}>{maxScore}</p>
            </div>
            <div style={statCardStyle}>
              <h4 style={statTitleStyle}>Lowest Score</h4>
              <p style={statValueStyle}>{minScore}</p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "20px",
              alignItems: "center",
            }}
          >
            <select
              value={filters.username}
              onChange={(e) => setFilters({ ...filters, username: e.target.value })}
            >
              <option value="">All Names</option>
              {usernames.map((u, i) => (
                <option key={i} value={u}>
                  {u}
                </option>
              ))}
            </select>

            <select
              value={filters.course}
              onChange={(e) => setFilters({ ...filters, course: e.target.value })}
            >
              <option value="">All Courses</option>
              {courses.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="">All Departments</option>
              {departments.map((d, i) => (
                <option key={i} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={filters.score}
              onChange={(e) => setFilters({ ...filters, score: e.target.value })}
            >
              <option value="">All Scores</option>
              {scores.map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            >
              <option value="">All Dates</option>
              {dates.map((d, i) => (
                <option key={i} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                setFilters({ username: "", course: "", score: "", date: "", department: "" })
              }
              style={{
                backgroundColor: "#c60000",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Reset
            </button>

            <button
              onClick={handleDownloadCSV}
              style={{
                marginLeft: "auto",
                backgroundColor: "#c60000",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              ⬇ Download CSV
            </button>
          </div>

          {filteredResults.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#666" }}>
              No quiz results found.
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#c60000", color: "white" }}>
                  <th style={{ padding: 12, border: "1px solid #ddd" }}>Name</th>
                  <th style={{ padding: 12, border: "1px solid #ddd" }}>Department</th>
                  <th style={{ padding: 12, border: "1px solid #ddd" }}>Course</th>
                  <th style={{ padding: 12, border: "1px solid #ddd" }}>Score</th>
                  <th style={{ padding: 12, border: "1px solid #ddd" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r, i) => (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: i % 2 === 0 ? "#fff0f0" : "white",
                      textAlign: "center",
                    }}
                  >
                    <td style={{ padding: 12, border: "1px solid #ddd" }}>
                      {r.username}
                    </td>
                    <td style={{ padding: 12, border: "1px solid #ddd" }}>
                      {r.department || "Unknown"}
                    </td>
                    <td style={{ padding: 12, border: "1px solid #ddd" }}>
                      {r.course}
                    </td>
                    <td style={{ padding: 12, border: "1px solid #ddd" }}>
                      {r.score} / {r.total}
                    </td>
                    <td style={{ padding: 12, border: "1px solid #ddd" }}>
                      {new Date(r.date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3>Add New Course</h3>
            <input
              type="text"
              placeholder="Title"
              value={courseData.title}
              onChange={(e) =>
                setCourseData({ ...courseData, title: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10 }}
            />
            <textarea
              placeholder="Content"
              value={courseData.content}
              onChange={(e) =>
                setCourseData({ ...courseData, content: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10 }}
            />
            <input
              type="text"
              placeholder="YouTube Video URL"
              value={courseData.video}
              onChange={(e) =>
                setCourseData({ ...courseData, video: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10 }}
            />

            <h4>Quiz Questions</h4>
            {courseData.quiz.map((q, i) => (
              <div
                key={i}
                style={{ marginBottom: 15, padding: 10, border: "1px solid #ddd" }}
              >
                <input
                  type="text"
                  placeholder={`Question ${i + 1}`}
                  value={q.question}
                  onChange={(e) => {
                    const updatedQuiz = [...courseData.quiz];
                    updatedQuiz[i].question = e.target.value;
                    setCourseData({ ...courseData, quiz: updatedQuiz });
                  }}
                  style={{ width: "100%", marginBottom: 5 }}
                />
                {q.options.map((opt, j) => (
                  <input
                    key={j}
                    type="text"
                    placeholder={`Option ${j + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const updatedQuiz = [...courseData.quiz];
                      updatedQuiz[i].options[j] = e.target.value;
                      setCourseData({ ...courseData, quiz: updatedQuiz });
                    }}
                    style={{ width: "100%", marginBottom: 5 }}
                  />
                ))}
                <input
                  type="number"
                  placeholder="Correct Answer Index (0-3)"
                  value={q.answer}
                  onChange={(e) => {
                    const updatedQuiz = [...courseData.quiz];
                    updatedQuiz[i].answer = parseInt(e.target.value, 10);
                    setCourseData({ ...courseData, quiz: updatedQuiz });
                  }}
                  style={{ width: "100%" }}
                />
              </div>
            ))}
            <button
              onClick={addQuestion}
              style={{
                marginTop: 10,
                backgroundColor: "#c60000",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              + Add Question
            </button>

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  marginRight: 10,
                  backgroundColor: "#c60000",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCourse}
                style={{
                  backgroundColor: "#c60000",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {editOpen && editingCourse && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3>Edit Course</h3>
            <input
              type="text"
              value={editingCourse.title}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, title: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10 }}
            />
            <textarea
              value={editingCourse.content}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, content: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10 }}
            />
            <input
              type="text"
              value={editingCourse.video}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, video: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10 }}
            />

            <h4>Quiz Questions</h4>
            {editingCourse.quiz &&
              editingCourse.quiz.map((q, i) => (
                <div
                  key={i}
                  style={{ marginBottom: 15, padding: 10, border: "1px solid #ddd" }}
                >
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => {
                      const updatedQuiz = [...editingCourse.quiz];
                      updatedQuiz[i].question = e.target.value;
                      setEditingCourse({
                        ...editingCourse,
                        quiz: updatedQuiz,
                      });
                    }}
                    style={{ width: "100%", marginBottom: 5 }}
                  />
                  {q.options.map((opt, j) => (
                    <input
                      key={j}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updatedQuiz = [...editingCourse.quiz];
                        updatedQuiz[i].options[j] = e.target.value;
                        setEditingCourse({
                          ...editingCourse,
                          quiz: updatedQuiz,
                        });
                      }}
                      style={{ width: "100%", marginBottom: 5 }}
                    />
                  ))}
                  <input
                    type="number"
                    value={q.answer}
                    onChange={(e) => {
                      const updatedQuiz = [...editingCourse.quiz];
                      updatedQuiz[i].answer = parseInt(e.target.value, 10);
                      setEditingCourse({
                        ...editingCourse,
                        quiz: updatedQuiz,
                      });
                    }}
                    style={{ width: "100%" }}
                  />
                </div>
              ))}

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                onClick={() => setEditOpen(false)}
                style={{
                  marginRight: 10,
                  backgroundColor: "#c60000",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  backgroundColor: "#c60000",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {userOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: "400px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3>Add New User</h3>
            <input
              type="text"
              placeholder="Name"
              value={userData.name}
              onChange={(e) =>
                setUserData({ ...userData, name: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="Username"
              value={userData.username}
              onChange={(e) =>
                setUserData({ ...userData, username: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={userData.password}
              onChange={(e) =>
                setUserData({ ...userData, password: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="Department"
              value={userData.department}
              onChange={(e) =>
                setUserData({ ...userData, department: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="Role"
              value={userData.role}
              onChange={(e) =>
                setUserData({ ...userData, role: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                onClick={() => setUserOpen(false)}
                style={{
                  marginRight: 10,
                  backgroundColor: "#c60000",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                style={{
                  backgroundColor: "#c60000",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {editUserOpen && editingUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: "400px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3>Edit User</h3>
            <input
              type="text"
              placeholder="Name"
              value={editingUser.name}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="Username"
              value={editingUser.username}
              onChange={(e) =>
                setEditingUser({ ...editingUser, username: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={editingUser.password}
              onChange={(e) =>
                setEditingUser({ ...editingUser, password: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="Department"
              value={editingUser.department}
              onChange={(e) =>
                setEditingUser({ ...editingUser, department: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="Role"
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({ ...editingUser, role: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                onClick={() => setEditUserOpen(false)}
                style={{
                  marginRight: 10,
                  backgroundColor: "#c60000",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserEdit}
                style={{
                  backgroundColor: "#c60000",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------- Manage Courses Component -------------------
function ManageCourses({ setOpen, setEditOpen, setEditingCourse, coursesList, setCoursesList }) {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "3rem auto",
        padding: "0 20px",
        fontFamily,
      }}
    >
      <h2 style={{ color: mainRed, marginBottom: 25 }}>Manage Courses</h2>
      <div style={{ marginBottom: "20px" }}>
        <button
          style={{
            backgroundColor: "#c60000",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "50",
          }}
          onClick={() => setOpen(true)}
        >
          + Add Course
        </button>
      </div>
      <ul style={{ listStyle: "none", padding: 0, marginTop: "15px" }}>
        {coursesList.map((c) => (
          <li
            key={c.id}
            style={{
              marginBottom: "10px",
              padding: "10px",
              background: "white",
              borderRadius: "6px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <strong>{c.title}</strong>
            <button
              onClick={() => {
                setEditingCourse(c);
                setEditOpen(true);
              }}
              style={{
                marginLeft: "10px",
                backgroundColor: "#c60000",
                color: "white",
                border: "none",
                padding: "1px 5px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              ✎
            </button>
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this course?")) {
                  await deleteDoc(doc(db, "courses", c.id));
                  setCoursesList(coursesList.filter((course) => course.id !== c.id));
                  alert("Course deleted successfully!");
                }
              }}
              style={{
                marginLeft: "5px",
                backgroundColor: "#c60000",
                color: "white",
                border: "none",
                padding: "1px 5px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------------------- Manage Users Component -------------------
function ManageUsers({ setUserOpen, setEditUserOpen, setEditingUser, usersList, setUsersList }) {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "3rem auto",
        padding: "0 20px",
        fontFamily,
      }}
    >
      <h2 style={{ color: mainRed, marginBottom: 25 }}>Manage Users</h2>
      <div style={{ marginBottom: "20px" }}>
        <button
          style={{
            backgroundColor: "#c60000",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "50",
          }}
          onClick={() => setUserOpen(true)}
        >
          + Add User
        </button>
      </div>
      <ul style={{ listStyle: "none", padding: 0, marginTop: "15px" }}>
        {usersList.map((u) => (
          <li
            key={u.id}
            style={{
              marginBottom: "10px",
              padding: "10px",
              background: "white",
              borderRadius: "6px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <strong>{u.name}</strong>
            <div style={{ fontSize: "12px", color: "#666" }}>
              @{u.username} • {u.department} • {u.role}
            </div>
            <button
              onClick={() => {
                setEditingUser(u);
                setEditUserOpen(true);
              }}
              style={{
                marginTop: "5px",
                marginRight: "5px",
                backgroundColor: "#c60000",
                color: "white",
                border: "none",
                padding: "1px 5px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              ✎
            </button>
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this user?")) {
                  await deleteDoc(doc(db, "users", u.id));
                  setUsersList(usersList.filter((user) => user.id !== u.id));
                  alert("User deleted successfully!");
                }
              }}
              style={{
                marginTop: "5px",
                backgroundColor: "#c60000",
                color: "white",
                border: "none",
                padding: "1px 5px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------------------- Main App -------------------
export default function App() {
  const [user, setUser] = useState(null);
  const [manageDropdownOpen, setManageDropdownOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [courseData, setCourseData] = useState({
    title: "",
    content: "",
    video: "",
    quiz: [],
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [coursesList, setCoursesList] = useState([]);
  const [userOpen, setUserOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    password: "",
    department: "",
    role: "",
  });
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const loadCourses = async () => {
      const snapshot = await getDocs(collection(db, "courses"));
      const data = snapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        firebaseId: docSnap.id,
      }));
      setCoursesList(data);
    };

    loadCourses();
  }, []);

  useEffect(() => {
    async function loadUsers() {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setUsersList(data);
    }
    loadUsers();
  }, []);

  return (
    <Router>
      <nav
        style={{
          padding: 10,
          backgroundColor: mainRed,
          color: white,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily,
        }}
      >
        <div style={{ position: "relative" }}>
          <Link to="/" style={{ color: white, marginRight: 15, textDecoration: "none", fontWeight: "600" }}>
            Home
          </Link>
          {user && user.role === "student" && (
            <Link to="/courses" style={{ color: white, marginRight: 15, textDecoration: "none", fontWeight: "600" }}>
              Courses
            </Link>
          )}
          {user && user.role === "admin" && (
            <>
              <Link to="/admin" style={{ color: white, marginRight: 15, textDecoration: "none", fontWeight: "600" }}>
                
              </Link>
              <div
                style={{
                  display: "inline-block",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    color: white,
                    marginRight: 15,
                    textDecoration: "none",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onClick={() => setManageDropdownOpen(!manageDropdownOpen)}
                >
                  Manage
                </span>
                {manageDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "120%",
                      left: 0,
                      backgroundColor: white,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      borderRadius: 4,
                      zIndex: 1000,
                      minWidth: 180,
                    }}
                  >
                    <Link
                      to="/admin/courses"
                      style={{
                        display: "block",
                        padding: "8px 15px",
                        color: mainRed,
                        textDecoration: "none",
                        fontWeight: "500",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#fff0f0")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      onClick={() => setManageDropdownOpen(false)}
                    >
                      Manage Courses
                    </Link>
                    <Link
                      to="/admin/users"
                      style={{
                        display: "block",
                        padding: "8px 15px",
                        color: mainRed,
                        textDecoration: "none",
                        fontWeight: "500",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#fff0f0")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      onClick={() => setManageDropdownOpen(false)}
                    >
                      Manage Users
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div>
          {user ? (
            <button
              onClick={handleLogout}
              style={{
                cursor: "pointer",
                backgroundColor: "transparent",
                border: `2px solid ${white}`,
                color: white,
                padding: "6px 14px",
                borderRadius,
                fontWeight: "600",
                fontSize: 14,
                transition: "background-color 0.3s ease, color 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = white;
                e.currentTarget.style.color = mainRed;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = white;
              }}
            >
              Logout
            </button>
          ) : null}
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              user.role === "admin" ? (
                <Navigate to="/admin" />
              ) : (
                <Dashboard user={user} />
              )
            ) : (
              <Login onLogin={setUser} />
            )
          }
        />
        <Route
          path="/courses"
          element={user && user.role === "student" ? <Courses /> : <Navigate to="/" />}
        />
        <Route
          path="/courses/:courseId"
          element={user && user.role === "student" ? <CourseContent user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/admin"
          element={user && user.role === "admin" ? (
            <Admin
              onLogout={handleLogout}
              open={open}
              setOpen={setOpen}
              courseData={courseData}
              setCourseData={setCourseData}
              editOpen={editOpen}
              setEditOpen={setEditOpen}
              editingCourse={editingCourse}
              setEditingCourse={setEditingCourse}
              coursesList={coursesList}
              setCoursesList={setCoursesList}
              userOpen={userOpen}
              setUserOpen={setUserOpen}
              userData={userData}
              setUserData={setUserData}
              editUserOpen={editUserOpen}
              setEditUserOpen={setEditUserOpen}
              editingUser={editingUser}
              setEditingUser={setEditingUser}
              usersList={usersList}
              setUsersList={setUsersList}
            />
          ) : <Navigate to="/" />}
        />
        <Route
          path="/admin/courses"
          element={
            user && user.role === "admin" ? (
              <Admin
                onLogout={handleLogout}
                open={open}
                setOpen={setOpen}
                courseData={courseData}
                setCourseData={setCourseData}
                editOpen={editOpen}
                setEditOpen={setEditOpen}
                editingCourse={editingCourse}
                setEditingCourse={setEditingCourse}
                coursesList={coursesList}
                setCoursesList={setCoursesList}
                userOpen={userOpen}
                setUserOpen={setUserOpen}
                userData={userData}
                setUserData={setUserData}
                editUserOpen={editUserOpen}
                setEditUserOpen={setEditUserOpen}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                usersList={usersList}
                setUsersList={setUsersList}
              >
                <ManageCourses
                  setOpen={setOpen}
                  setEditOpen={setEditOpen}
                  setEditingCourse={setEditingCourse}
                  coursesList={coursesList}
                  setCoursesList={setCoursesList}
                />
              </Admin>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/users"
          element={
            user && user.role === "admin" ? (
              <Admin
                onLogout={handleLogout}
                open={open}
                setOpen={setOpen}
                courseData={courseData}
                setCourseData={setCourseData}
                editOpen={editOpen}
                setEditOpen={setEditOpen}
                editingCourse={editingCourse}
                setEditingCourse={setEditingCourse}
                coursesList={coursesList}
                setCoursesList={setCoursesList}
                userOpen={userOpen}
                setUserOpen={setUserOpen}
                userData={userData}
                setUserData={setUserData}
                editUserOpen={editUserOpen}
                setEditUserOpen={setEditUserOpen}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                usersList={usersList}
                setUsersList={setUsersList}
              >
                <ManageUsers
                  setUserOpen={setUserOpen}
                  setEditUserOpen={setEditUserOpen}
                  setEditingUser={setEditingUser}
                  usersList={usersList}
                  setUsersList={setUsersList}
                />
              </Admin>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="*" element={<p style={{ padding: 20, fontFamily }}>Page not found</p>} />
      </Routes>
    </Router>
  );
}