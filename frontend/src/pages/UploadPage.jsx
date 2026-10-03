import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'

function UploadPage({ studentId }) {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [extractedCourses, setExtractedCourses] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setExtractedCourses(null)
    setError('')
  }

  async function handleExtract() {
    if (!image) return
    setLoading(true)
    setError('')

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(image)
      })

      const response = await fetch('https://aggiepath-backend.onrender.com/extract-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_data: base64,
          media_type: image.type
        })
      })

      const data = await response.json()
      const courses = data.courses
      setExtractedCourses(courses)
    } catch (err) {
      setError('Could not extract courses. Please try a clearer image or add manually.')
    }

    setLoading(false)
  }

  // Editing helpers: each change swaps one field on one row, leaving the rest untouched.
  function updateCourseField(index, field, value) {
    setExtractedCourses(prev =>
      prev.map((course, i) => (i === index ? { ...course, [field]: value } : course))
    )
  }

  function removeCourse(index) {
    setExtractedCourses(prev => prev.filter((_, i) => i !== index))
  }

  function addBlankCourse() {
    setExtractedCourses(prev => [...prev, { course_id: '', term: '', grade: '' }])
  }

  async function handleConfirm() {
    if (!extractedCourses) return
    setLoading(true)

    // Skip any row left blank after editing, rather than sending a bad request for it.
    const coursesToSave = extractedCourses.filter(c => c.course_id.trim() !== '')

    for (const course of coursesToSave) {
      try {
        await fetch('https://aggiepath-backend.onrender.com/completed-courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: null,
            student_id: studentId,
            course_id: course.course_id.trim(),
            term: course.term || '',
            grade: course.grade || ''
          })
        })
      } catch (err) {
        // Skip courses that fail (e.g. not in our database)
      }
    }

    setLoading(false)
    navigate('/')
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      padding: "48px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <div style={{ width: "100%", maxWidth: "700px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#002855", marginBottom: "8px" }}>
          Upload Your Transcript
        </h1>
        <p style={{ color: "#999", fontSize: "14px", marginBottom: "32px" }}>
          Upload a photo or screenshot of your transcript and we'll extract your courses automatically
        </p>

        <Card title="Select Image">
          <div
            onClick={() => document.getElementById('fileInput').click()}
            style={{
              border: "2px dashed #ddd",
              borderRadius: "8px",
              padding: "40px",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "#fafafa",
              marginBottom: "16px"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#002855"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#ddd"}
          >
            {preview ? (
              <img
                src={preview}
                alt="Transcript preview"
                style={{ maxHeight: "300px", maxWidth: "100%", borderRadius: "4px" }}
              />
            ) : (
              <>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
                <p style={{ fontSize: "14px", color: "#999" }}>
                  Click to upload a transcript image
                </p>
                <p style={{ fontSize: "12px", color: "#bbb", marginTop: "4px" }}>
                  PNG, JPG, or JPEG
                </p>
              </>
            )}
          </div>

          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {error && (
            <p style={{ color: "#c0392b", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
          )}

          <button
            onClick={handleExtract}
            disabled={!image || loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: image ? "#002855" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: image ? "pointer" : "not-allowed"
            }}
          >
            {loading ? "Extracting courses..." : "Extract Courses"}
          </button>
        </Card>

        {extractedCourses && (
          <Card title={`Extracted Courses (${extractedCourses.length} found)`}>
            <p style={{ color: "#999", fontSize: "12px", marginBottom: "12px" }}>
              Double check these against your transcript. Fix anything that's wrong, remove anything
              that doesn't belong, or add a row for anything that got missed.
            </p>

            <ul style={{ listStyle: "none", padding: 0, marginBottom: "16px" }}>
              {extractedCourses.map((course, index) => (
                <li key={index} style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #f0f0f0"
                }}>
                  <input
                    value={course.course_id}
                    onChange={e => updateCourseField(index, 'course_id', e.target.value)}
                    placeholder="Course ID"
                    style={{
                      flex: 2,
                      padding: "6px 8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#002855",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                  <input
                    value={course.term}
                    onChange={e => updateCourseField(index, 'term', e.target.value)}
                    placeholder="Term"
                    style={{
                      flex: 2,
                      padding: "6px 8px",
                      fontSize: "13px",
                      color: "#666",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                  <input
                    value={course.grade}
                    onChange={e => updateCourseField(index, 'grade', e.target.value)}
                    placeholder="Grade"
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      fontSize: "13px",
                      color: "#666",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                  <button
                    onClick={() => removeCourse(index)}
                    aria-label={`Remove ${course.course_id || 'this row'}`}
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "white",
                      color: "#c0392b",
                      border: "1px solid #eee",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px"
                    }}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={addBlankCourse}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "16px",
                backgroundColor: "white",
                color: "#002855",
                border: "1px dashed #002855",
                borderRadius: "6px",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              + Add a course that was missed
            </button>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setExtractedCourses(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "white",
                  color: "#666",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                Try Again
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: "10px",
                  backgroundColor: "#002855",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                {loading ? "Saving..." : "Confirm & Go to Dashboard →"}
              </button>
            </div>
          </Card>
        )}

        <p
          onClick={() => navigate('/')}
          style={{
            textAlign: "center",
            color: "#999",
            fontSize: "13px",
            cursor: "pointer",
            marginTop: "16px"
          }}
        >
          Skip and add manually instead →
        </p>
      </div>
    </div>
  )
}

export default UploadPage
