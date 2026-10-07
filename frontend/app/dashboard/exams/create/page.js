// frontend/app/dashboard/exams/create/page.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Save, 
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  GraduationCap,
  Globe
} from 'lucide-react'
import api from '@/lib/api'

const emptyQuestion = {
  questionNumber: 1,
  questionText: '',
  questionType: 'mcq',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  marks: 1,
}

export default function CreateExamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    batchYear: new Date().getFullYear(),
    language: 'English',
    timeLimitMinutes: 30,
    totalQuestions: 5,
    passingScore: 3,
  })

  const [questions, setQuestions] = useState([{ ...emptyQuestion }])

  // Add question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        ...emptyQuestion,
        questionNumber: questions.length + 1,
      }
    ])
  }

  // Remove question
  const removeQuestion = (index) => {
    if (questions.length === 1) {
      alert('You need at least one question')
      return
    }
    const newQuestions = questions.filter((_, i) => i !== index)
    // Renumber
    newQuestions.forEach((q, i) => {
      q.questionNumber = i + 1
    })
    setQuestions(newQuestions)
  }

  // Update question
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions]
    newQuestions[index][field] = value
    
    // If question type changes, reset options
    if (field === 'questionType') {
      if (value === 'truefalse') {
        newQuestions[index].optionA = 'True'
        newQuestions[index].optionB = 'False'
        newQuestions[index].optionC = ''
        newQuestions[index].optionD = ''
        newQuestions[index].correctAnswer = 'A'
      } else if (value === 'fillblank') {
        newQuestions[index].optionA = ''
        newQuestions[index].optionB = ''
        newQuestions[index].optionC = ''
        newQuestions[index].optionD = ''
        newQuestions[index].correctAnswer = ''
      } else {
        newQuestions[index].correctAnswer = 'A'
      }
    }
    
    setQuestions(newQuestions)
  }

  // Submit exam
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!examData.title.trim()) {
      setError('Please enter an exam title')
      setLoading(false)
      return
    }

    if (questions.length !== examData.totalQuestions) {
      setError(`You have ${questions.length} questions but set total to ${examData.totalQuestions}. Please adjust.`)
      setLoading(false)
      return
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1}: Please enter question text`)
        setLoading(false)
        return
      }
      if (q.questionType === 'mcq') {
        if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
          setError(`Question ${i + 1}: Please fill all 4 options`)
          setLoading(false)
          return
        }
      }
      if (q.questionType === 'fillblank' && !q.correctAnswer.trim()) {
        setError(`Question ${i + 1}: Please enter the correct answer`)
        setLoading(false)
        return
      }
    }

    try {
      const res = await api.post('/exam/create', {
        ...examData,
        questions,
      })

      setSuccess(`Exam created successfully! Code: ${res.data.examCode}`)
      
      setTimeout(() => {
        router.push('/dashboard/exams')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create exam')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-muted-foreground)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
            padding: 0
          }}
        >
          <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Exams
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
          Create New Exam
        </h1>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{
          background: 'rgba(201, 76, 69, 0.1)',
          border: '1px solid rgba(201, 76, 69, 0.3)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start'
        }}>
          <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-destructive)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--color-destructive)' }}>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          background: '#ECFDF5',
          border: '1px solid #059669',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start'
        }}>
          <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem', color: '#059669', flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', color: '#059669', fontWeight: '600' }}>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Exam Details */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            Exam Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="field">
              <label>Exam Title *</label>
              <input
                type="text"
                className="field-control"
                placeholder="e.g., Exit Exam 2026 - English"
                value={examData.title}
                onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                className="field-control"
                placeholder="Brief description of the exam"
                rows="3"
                value={examData.description}
                onChange={(e) => setExamData({ ...examData, description: e.target.value })}
              />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '1rem' 
            }}>
              <div className="field">
                <label>Batch Year</label>
                <input
                  type="number"
                  className="field-control"
                  value={examData.batchYear}
                  onChange={(e) => setExamData({ ...examData, batchYear: parseInt(e.target.value) })}
                  min="2000"
                  max="2100"
                  required
                />
              </div>

              <div className="field">
                <label>Language</label>
                <select
                  className="field-control"
                  value={examData.language}
                  onChange={(e) => setExamData({ ...examData, language: e.target.value })}
                >
                  <option>English</option>
                  <option>Amharic</option>
                  <option>Afaan Oromoo</option>
                  <option>Tigrinya</option>
                  <option>Somali</option>
                </select>
              </div>

              <div className="field">
                <label>Time Limit (minutes)</label>
                <input
                  type="number"
                  className="field-control"
                  value={examData.timeLimitMinutes}
                  onChange={(e) => setExamData({ ...examData, timeLimitMinutes: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>

              <div className="field">
                <label>Total Questions</label>
                <input
                  type="number"
                  className="field-control"
                  value={examData.totalQuestions}
                  onChange={(e) => {
                    const num = parseInt(e.target.value)
                    setExamData({ ...examData, totalQuestions: num })
                    // Adjust questions array to match
                    if (num > questions.length) {
                      const newQs = [...questions]
                      for (let i = questions.length; i < num; i++) {
                        newQs.push({ ...emptyQuestion, questionNumber: i + 1 })
                      }
                      setQuestions(newQs)
                    }
                  }}
                  min="1"
                  max="50"
                  required
                />
              </div>

              <div className="field">
                <label>Passing Score</label>
                <input
                  type="number"
                  className="field-control"
                  value={examData.passingScore}
                  onChange={(e) => setExamData({ ...examData, passingScore: parseInt(e.target.value) })}
                  min="0"
                  max={examData.totalQuestions}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
              Questions ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="btn-outline"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Add Question
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {questions.map((question, qIndex) => (
              <div
                key={qIndex}
                style={{
                  padding: '1rem',
                  background: 'var(--color-secondary)',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--color-border)'
                }}
              >
                {/* Question Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '0.75rem' 
                }}>
                  <span style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                    Question {qIndex + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-destructive)',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    <Trash2 style={{ width: '1rem', height: '1rem' }} />
                  </button>
                </div>

                {/* Question Text */}
                <div className="field" style={{ marginBottom: '0.75rem' }}>
                  <textarea
                    className="field-control"
                    placeholder="Enter your question..."
                    rows="2"
                    value={question.questionText}
                    onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                    required
                    style={{ background: 'white' }}
                  />
                </div>

                {/* Question Type */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="field">
                    <label style={{ fontSize: '0.75rem' }}>Type</label>
                    <select
                      className="field-control"
                      value={question.questionType}
                      onChange={(e) => updateQuestion(qIndex, 'questionType', e.target.value)}
                      style={{ background: 'white', fontSize: '0.875rem' }}
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="truefalse">True / False</option>
                      <option value="fillblank">Fill in Blank</option>
                    </select>
                  </div>
                  <div className="field">
                    <label style={{ fontSize: '0.75rem' }}>Marks</label>
                    <input
                      type="number"
                      className="field-control"
                      value={question.marks}
                      onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value))}
                      min="1"
                      style={{ background: 'white', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                {/* Options Based on Type */}
                {question.questionType === 'mcq' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {['A', 'B', 'C', 'D'].map((letter) => {
                      const field = `option${letter}`
                      return (
                        <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctAnswer === letter}
                            onChange={() => updateQuestion(qIndex, 'correctAnswer', letter)}
                            style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                          />
                          <input
                            type="text"
                            className="field-control"
                            placeholder={`Option ${letter}`}
                            value={question[field]}
                            onChange={(e) => updateQuestion(qIndex, field, e.target.value)}
                            style={{ background: 'white', fontSize: '0.875rem', flex: 1 }}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}

                {question.questionType === 'truefalse' && (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {['A', 'B'].map((letter, i) => {
                      const label = i === 0 ? 'True' : 'False'
                      return (
                        <label
                          key={letter}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            background: question.correctAnswer === letter ? 'rgba(8, 127, 91, 0.1)' : 'white',
                            border: question.correctAnswer === letter ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            flex: 1,
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}
                        >
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctAnswer === letter}
                            onChange={() => updateQuestion(qIndex, 'correctAnswer', letter)}
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          {label}
                        </label>
                      )
                    })}
                  </div>
                )}

                {question.questionType === 'fillblank' && (
                  <div className="field">
                    <label style={{ fontSize: '0.75rem' }}>Correct Answer</label>
                    <input
                      type="text"
                      className="field-control"
                      placeholder="Type the correct answer"
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                      style={{ background: 'white', fontSize: '0.875rem' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
              <p>✓ {questions.length} questions</p>
              <p>✓ {examData.timeLimitMinutes} minutes</p>
              <p>✓ Passing: {examData.passingScore}/{examData.totalQuestions}</p>
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ minWidth: '150px', justifyContent: 'center' }}
            >
              <Save style={{ width: '1rem', height: '1rem' }} />
              {loading ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}