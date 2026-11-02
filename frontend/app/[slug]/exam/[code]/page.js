// frontend/app/[slug]/exam/[code]/page.js
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  ChevronRight, 
  Clock, 
  FileText, 
  GraduationCap,
  User,
  Phone,
  Mail,
  AlertCircle,
  Send,
  ChevronLeft
} from 'lucide-react'
import api from '@/lib/api'
import { useConfirm } from '@/components/ui/feedback'

export default function ExamPage() {
  const params = useParams()
  const router = useRouter()
  const confirm = useConfirm()
  const { slug, code } = params

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [exam, setExam] = useState(null)
  const [error, setError] = useState('')

  // Student info
  const [studentInfo, setStudentInfo] = useState({
    studentName: '',
    studentPhone: '',
    studentEmail: '',
  })

  // Exam state
  const [attemptId, setAttemptId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [startedAt, setStartedAt] = useState(null)

  // Fetch exam info
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true)
        const res = await api.post(`/public/${slug}/validate`, {
          examCode: code,
        })
        if (res.data.valid) {
          setExam(res.data.exam)
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid exam code')
      } finally {
        setLoading(false)
      }
    }

    if (slug && code) {
      fetchExam()
    }
  }, [slug, code])

  // Save state to localStorage
  useEffect(() => {
    if (attemptId && currentStep === 4) {
      const state = {
        attemptId,
        answers,
        currentQuestion,
        timeLeft,
        startedAt,
      }
      localStorage.setItem(`exam_state_${attemptId}`, JSON.stringify(state))
    }
  }, [attemptId, answers, currentQuestion, timeLeft, startedAt, currentStep])

  // Handle student info submission
  const handleStudentInfoSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate
    if (!studentInfo.studentName.trim()) {
      setError('Please enter your name')
      return
    }
    if (!studentInfo.studentPhone.trim()) {
      setError('Please enter your phone number')
      return
    }
    const phone = studentInfo.studentPhone.trim()
    const phoneDigits = phone.replace(/\D/g, '')
    if (!/^\+?[0-9\s().-]+$/.test(phone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      setError('Enter a valid phone number with 7 to 15 digits.')
      return
    }

    // Start exam
    try {
      const res = await api.post(`/public/${slug}/exam/start`, {
        examCode: code,
        ...studentInfo,
        studentPhone: `${phone.startsWith('+') ? '+' : ''}${phoneDigits}`,
      })

      if (res.data.attemptId) {
        setAttemptId(res.data.attemptId)
        setQuestions(res.data.questions)
        setAnswers(res.data.answers || {})
        setStartedAt(res.data.startedAt)
        setTimeLeft(res.data.exam.timeLimitMinutes * 60)
        setCurrentStep(3) // Move to confirmation
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start exam')
    }
  }

  // Handle start exam (from confirmation)
  const handleStartExam = () => {
    setCurrentStep(4)
  }

  // Handle answer change
  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  // Handle submit
  const handleSubmit = useCallback(async () => {
    try {
      const res = await api.post(`/public/${slug}/exam/submit`, {
        attemptId,
        answers,
      })

      if (res.data.success) {
        // Clear local storage
        localStorage.removeItem(`exam_state_${attemptId}`)
        // Redirect to result page
        router.push(`/${slug}/exam/${code}/result/${attemptId}`)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit exam')
    }
  }, [attemptId, answers, code, router, slug])

  // Handle auto submit (timeout)
  const handleAutoSubmit = useCallback(() => {
    handleSubmit()
  }, [handleSubmit])

  // Timer effect
  useEffect(() => {
    if (currentStep === 4 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentStep, timeLeft, handleAutoSubmit])

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Loading state
  if (loading) {
    return (
      <div className="site-main">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            border: '3px solid var(--color-primary)', 
            borderTopColor: 'transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading exam...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !exam) {
    return (
      <div className="site-main">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <AlertCircle style={{ width: '4rem', height: '4rem', color: 'var(--color-destructive)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Error</h2>
          <p style={{ color: 'var(--color-muted-foreground)' }}>{error}</p>
          <button 
            className="btn-primary" 
            style={{ marginTop: '1.5rem' }}
            onClick={() => router.push(`/${slug}`)}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Steps rendering
  return (
    <div className="site-main">
      <div className="container" style={{ maxWidth: '900px' }}>

        {/* Stepper */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '2rem',
          padding: '1rem 0'
        }}>
          {[
            { id: 1, label: 'Info' },
            { id: 2, label: 'You' },
            { id: 3, label: 'Confirm' },
            { id: 4, label: 'Exam' },
          ].map((step, index) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  background: currentStep > step.id ? 'var(--color-primary)' : 
                             currentStep === step.id ? 'var(--color-primary)' : 
                             'var(--color-secondary)',
                  color: currentStep >= step.id ? '#fff' : 'var(--color-muted-foreground)',
                  transition: 'all 0.3s'
                }}>
                  {currentStep > step.id ? <Check style={{ width: '1.25rem', height: '1.25rem' }} /> : step.id}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                  fontWeight: currentStep === step.id ? '700' : '500',
                  color: currentStep >= step.id ? 'var(--color-primary)' : 'var(--color-muted-foreground)'
                }}>
                  {step.label}
                </span>
              </div>
              {index < 3 && (
                <div style={{
                  height: '2px',
                  flex: 1,
                  background: currentStep > step.id ? 'var(--color-primary)' : 'var(--color-secondary)',
                  transition: 'all 0.3s'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >

            {/* STEP 1: Exam Info */}
            {currentStep === 1 && exam && (
              <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '9999px',
                    background: 'var(--color-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <FileText style={{ width: '2rem', height: '2rem', color: 'var(--color-primary)' }} />
                  </div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {exam.title}
                  </h1>
                  <p style={{ color: 'var(--color-muted-foreground)' }}>{exam.description}</p>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{ 
                    background: 'var(--color-secondary)', 
                    padding: '1rem', 
                    borderRadius: '0.75rem',
                    textAlign: 'center'
                  }}>
                    <FileText style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary)', margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Questions</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{exam.totalQuestions}</p>
                  </div>
                  <div style={{ 
                    background: 'var(--color-secondary)', 
                    padding: '1rem', 
                    borderRadius: '0.75rem',
                    textAlign: 'center'
                  }}>
                    <Clock style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary)', margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Time Limit</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{exam.timeLimitMinutes} min</p>
                  </div>
                  <div style={{ 
                    background: 'var(--color-secondary)', 
                    padding: '1rem', 
                    borderRadius: '0.75rem',
                    textAlign: 'center'
                  }}>
                    <GraduationCap style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary)', margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Passing Score</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{exam.passingScore}/{exam.totalQuestions}</p>
                  </div>
                </div>

                <div style={{ 
                  background: 'rgba(227, 169, 59, 0.1)', 
                  border: '1px solid rgba(227, 169, 59, 0.3)', 
                  borderRadius: '0.75rem', 
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}>
                  <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#c58125', flexShrink: 0, marginTop: '0.125rem' }} />
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '0.875rem', color: '#c58125' }}>Important Notes</p>
                    <ul style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginTop: '0.25rem', paddingLeft: '1rem' }}>
                      <li>The timer starts as soon as you begin</li>
                      <li>You cannot pause the exam</li>
                      <li>You can revisit and change answers</li>
                      <li>Exam auto-submits when time runs out</li>
                    </ul>
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setCurrentStep(2)}
                >
                  Continue
                  <ChevronRight style={{ width: '1rem', height: '1rem' }} />
                </button>
              </div>
            )}

            {/* STEP 2: Student Info */}
            {currentStep === 2 && (
              <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '9999px',
                    background: 'var(--color-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <User style={{ width: '2rem', height: '2rem', color: 'var(--color-primary)' }} />
                  </div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Your Information
                  </h1>
                  <p style={{ color: 'var(--color-muted-foreground)' }}>
                    This will be used to identify your exam result
                  </p>
                </div>

                <form onSubmit={handleStudentInfoSubmit} className="form-stack">
                  <div className="field">
                    <label>Full Name *</label>
                    <div style={{ position: 'relative' }}>
                      <User style={{ 
                        position: 'absolute', 
                        left: '0.75rem', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        width: '1.25rem', 
                        height: '1.25rem', 
                        color: 'var(--color-muted-foreground)' 
                      }} />
                      <input
                        type="text"
                        className="field-control with-icon"
                        placeholder="Enter your full name"
                        value={studentInfo.studentName}
                        onChange={(e) => setStudentInfo({ ...studentInfo, studentName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Phone Number *</label>
                    <div style={{ position: 'relative' }}>
                      <Phone style={{ 
                        position: 'absolute', 
                        left: '0.75rem', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        width: '1.25rem', 
                        height: '1.25rem', 
                        color: 'var(--color-muted-foreground)' 
                      }} />
                      <input
                        type="tel"
                        className="field-control with-icon"
                        placeholder="0912345678"
                        value={studentInfo.studentPhone}
                        pattern="\+?[0-9\s().-]+"
                        minLength={7}
                        maxLength={24}
                        title="Enter a phone number containing 7 to 15 digits"
                        onChange={(e) => setStudentInfo({ ...studentInfo, studentPhone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Email (Optional)</label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ 
                        position: 'absolute', 
                        left: '0.75rem', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        width: '1.25rem', 
                        height: '1.25rem', 
                        color: 'var(--color-muted-foreground)' 
                      }} />
                      <input
                        type="email"
                        className="field-control with-icon"
                        placeholder="you@example.com"
                        value={studentInfo.studentEmail}
                        onChange={(e) => setStudentInfo({ ...studentInfo, studentEmail: e.target.value })}
                      />
                    </div>
                  </div>

                  {error && (
                    <p style={{ color: 'var(--color-destructive)', fontSize: '0.875rem' }}>{error}</p>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button 
                      type="button"
                      className="btn-outline" 
                      onClick={() => setCurrentStep(1)}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      className="btn-primary" 
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Continue
                      <ChevronRight style={{ width: '1rem', height: '1rem' }} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: Confirmation */}
            {currentStep === 3 && (
              <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '9999px',
                    background: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <Check style={{ width: '2rem', height: '2rem', color: '#059669' }} />
                  </div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Confirm Your Details
                  </h1>
                  <p style={{ color: 'var(--color-muted-foreground)' }}>
                    Please verify everything before starting
                  </p>
                </div>

                <div style={{ 
                  background: 'var(--color-secondary)', 
                  borderRadius: '0.75rem', 
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-muted-foreground)' }}>Exam</span>
                      <span style={{ fontWeight: '600' }}>{exam?.title}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-muted-foreground)' }}>Name</span>
                      <span style={{ fontWeight: '600' }}>{studentInfo.studentName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-muted-foreground)' }}>Phone</span>
                      <span style={{ fontWeight: '600' }}>{studentInfo.studentPhone}</span>
                    </div>
                    {studentInfo.studentEmail && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-muted-foreground)' }}>Email</span>
                        <span style={{ fontWeight: '600' }}>{studentInfo.studentEmail}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-muted-foreground)' }}>Time Limit</span>
                      <span style={{ fontWeight: '600' }}>{exam?.timeLimitMinutes} minutes</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-muted-foreground)' }}>Questions</span>
                      <span style={{ fontWeight: '600' }}>{exam?.totalQuestions}</span>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  background: 'rgba(227, 169, 59, 0.1)', 
                  border: '1px solid rgba(227, 169, 59, 0.3)', 
                  borderRadius: '0.75rem', 
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}>
                  <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#c58125', flexShrink: 0, marginTop: '0.125rem' }} />
                  <p style={{ fontSize: '0.875rem', color: '#c58125' }}>
                    Once you click <strong>Start Exam</strong>, the timer begins and cannot be paused.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    className="btn-outline" 
                    onClick={() => setCurrentStep(2)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
                    Back
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={handleStartExam}
                    style={{ flex: 2, justifyContent: 'center' }}
                  >
                    Start Exam
                    <ChevronRight style={{ width: '1rem', height: '1rem' }} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Exam Taking */}
            {currentStep === 4 && questions.length > 0 && (
              <div>
                {/* Timer Header */}
                <div className="card" style={{ 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock style={{ width: '1.25rem', height: '1.25rem', color: timeLeft < 60 ? '#DC2626' : 'var(--color-primary)' }} />
                    <span style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold',
                      color: timeLeft < 60 ? '#DC2626' : 'var(--color-primary)',
                      fontVariantNumeric: 'tabular-nums'
                    }}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                    Question {currentQuestion + 1} of {questions.length} • {Object.keys(answers).length} answered
                  </div>
                </div>

                {/* Question Card */}
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      background: 'var(--color-secondary)',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--color-primary)',
                      marginBottom: '0.75rem'
                    }}>
                      Question {questions[currentQuestion].questionNumber}
                    </span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.5' }}>
                      {questions[currentQuestion].questionText}
                    </h2>
                  </div>

                  {/* Answer Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {questions[currentQuestion].questionType === 'mcq' && (
                      ['A', 'B', 'C', 'D'].map((option) => {
                        const optionKey = `option${option}`
                        const optionText = questions[currentQuestion][optionKey]
                        if (!optionText) return null
                        
                        const isSelected = answers[questions[currentQuestion].id] === option
                        
                        return (
                          <button
                            key={option}
                            onClick={() => handleAnswer(questions[currentQuestion].id, option)}
                            style={{
                              padding: '1rem',
                              border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                              borderRadius: '0.75rem',
                              background: isSelected ? 'rgba(8, 127, 91, 0.05)' : 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              transition: 'all 0.2s',
                              width: '100%'
                            }}
                          >
                            <div style={{
                              width: '2rem',
                              height: '2rem',
                              borderRadius: '50%',
                              border: '2px solid ' + (isSelected ? 'var(--color-primary)' : 'var(--color-border)'),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              color: isSelected ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                              flexShrink: 0
                            }}>
                              {option}
                            </div>
                            <span style={{ flex: 1 }}>{optionText}</span>
                          </button>
                        )
                      })
                    )}

                    {questions[currentQuestion].questionType === 'truefalse' && (
                      ['True', 'False'].map((option, index) => {
                        const optionKey = index === 0 ? 'A' : 'B'
                        const isSelected = answers[questions[currentQuestion].id] === optionKey
                        
                        return (
                          <button
                            key={option}
                            onClick={() => handleAnswer(questions[currentQuestion].id, optionKey)}
                            style={{
                              padding: '1rem',
                              border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                              borderRadius: '0.75rem',
                              background: isSelected ? 'rgba(8, 127, 91, 0.05)' : 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.2s',
                              width: '100%'
                            }}
                          >
                            <span style={{ fontWeight: isSelected ? '600' : '400' }}>{option}</span>
                          </button>
                        )
                      })
                    )}

                    {questions[currentQuestion].questionType === 'fillblank' && (
                      <input
                        type="text"
                        className="field-control"
                        placeholder="Type your answer here..."
                        value={answers[questions[currentQuestion].id] || ''}
                        onChange={(e) => handleAnswer(questions[currentQuestion].id, e.target.value)}
                      />
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <button
                    className="btn-outline"
                    onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    style={{ flex: 1, justifyContent: 'center', opacity: currentQuestion === 0 ? 0.5 : 1 }}
                  >
                    <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
                    Previous
                  </button>
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      if (currentQuestion < questions.length - 1) {
                        setCurrentQuestion((prev) => prev + 1)
                      } else {
                        if (await confirm({
                          title: 'Submit your exam?',
                          description: 'You cannot change your answers after submitting.',
                          confirmLabel: 'Submit exam',
                        })) {
                          await handleSubmit()
                        }
                      }
                    }}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {currentQuestion < questions.length - 1 ? (
                      <>
                        Next
                        <ChevronRight style={{ width: '1rem', height: '1rem' }} />
                      </>
                    ) : (
                      <>
                        Submit
                        <Send style={{ width: '1rem', height: '1rem' }} />
                      </>
                    )}
                  </button>
                </div>

                {/* Question Navigator */}
                <div className="card">
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                    Question Navigator
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(2.5rem, 1fr))', gap: '0.5rem' }}>
                    {questions.map((q, index) => {
                      const isAnswered = answers[q.id] !== undefined
                      const isCurrent = index === currentQuestion
                      
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestion(index)}
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '0.5rem',
                            border: isCurrent ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            background: isAnswered ? '#ECFDF5' : 'transparent',
                            color: isAnswered ? '#059669' : 'var(--color-muted-foreground)',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {index + 1}
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', background: '#ECFDF5', border: '1px solid #059669' }} />
                      <span>Answered</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', background: 'transparent', border: '1px solid var(--color-border)' }} />
                      <span>Not answered</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', border: '2px solid var(--color-primary)' }} />
                      <span>Current</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}