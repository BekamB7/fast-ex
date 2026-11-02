'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { notifyToast } from '@/components/ui/feedback'

const createEmptyQuestion = (questionNumber) => ({
  questionNumber,
  questionText: '',
  questionType: 'mcq',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  marks: 1,
})

export default function EditExamPage() {
  const { id } = useParams()
  const router = useRouter()
  const [exam, setExam] = useState(null)
  const [details, setDetails] = useState(null)
  const [questions, setQuestions] = useState([])
  const [hasAttempts, setHasAttempts] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const fetchExam = async () => {
      try {
        const response = await api.get(`/exam/${id}`)
        if (!active) return
        const current = response.data.exam
        setExam(current)
        setDetails({
          title: current.title,
          description: current.description || '',
          batchYear: current.batchYear,
          language: current.language,
          timeLimitMinutes: current.timeLimitMinutes,
          totalQuestions: current.totalQuestions,
          passingScore: current.passingScore,
        })
        setQuestions(current.questions.map((question, index) => ({
          ...question,
          questionNumber: index + 1,
        })))
        setHasAttempts(current.attempts.length > 0)
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Could not load this exam.')
      } finally {
        if (active) setLoading(false)
      }
    }

    if (id) fetchExam()
    return () => { active = false }
  }, [id])

  const updateQuestion = (index, field, value) => {
    setQuestions((current) => current.map((question, questionIndex) => {
      if (questionIndex !== index) return question
      const updated = { ...question, [field]: value }
      if (field === 'questionType') {
        updated.optionA = value === 'truefalse' ? 'True' : ''
        updated.optionB = value === 'truefalse' ? 'False' : ''
        updated.optionC = ''
        updated.optionD = ''
        updated.correctAnswer = value === 'fillblank' ? '' : 'A'
      }
      return updated
    }))
  }

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      notifyToast('An exam must have at least one question.', 'warning')
      return
    }
    const remaining = questions.filter((_, questionIndex) => questionIndex !== index)
    setQuestions(remaining.map((question, questionIndex) => ({
      ...question,
      questionNumber: questionIndex + 1,
    })))
    setDetails((current) => ({ ...current, totalQuestions: remaining.length }))
  }

  const addQuestion = () => {
    if (questions.length >= 30) {
      notifyToast('An exam cannot have more than 30 questions.', 'warning')
      return
    }
    setQuestions((current) => [...current, createEmptyQuestion(current.length + 1)])
    setDetails((current) => ({ ...current, totalQuestions: questions.length + 1 }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...details,
      title: details.title.trim(),
      description: details.description.trim() || null,
      batchYear: Number(details.batchYear),
      timeLimitMinutes: Number(details.timeLimitMinutes),
      totalQuestions: hasAttempts ? Number(details.totalQuestions) : questions.length,
      passingScore: Number(details.passingScore),
    }

    if (!hasAttempts) {
      if (questions.some((question) => !question.questionText.trim() || !question.correctAnswer.trim())) {
        setError('Every question needs question text and a correct answer.')
        setSaving(false)
        return
      }
      payload.questions = questions.map((question, index) => ({
        questionNumber: index + 1,
        questionText: question.questionText.trim(),
        questionType: question.questionType,
        ...(question.optionA ? { optionA: question.optionA } : {}),
        ...(question.optionB ? { optionB: question.optionB } : {}),
        ...(question.optionC ? { optionC: question.optionC } : {}),
        ...(question.optionD ? { optionD: question.optionD } : {}),
        correctAnswer: question.correctAnswer.trim(),
        marks: Number(question.marks),
      }))
    }

    try {
      await api.put(`/exam/${id}`, payload)
      notifyToast('Exam changes saved.', 'success')
      router.push('/dashboard/exams')
    } catch (requestError) {
      const message = requestError.response?.data?.error || 'Could not save exam changes.'
      setError(message)
      notifyToast(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="workspace-loading" role="status"><span className="workspace-spinner" /><p>Loading exam…</p></div>
  }

  if (!exam || !details) {
    return (
      <div className="edit-exam-page">
        <div className="settings-message is-error" role="alert">{error || 'Exam not found.'}</div>
        <Link href="/dashboard/exams" className="btn-primary">Back to exams</Link>
      </div>
    )
  }

  return (
    <div className="edit-exam-page">
      <Link href="/dashboard/exams" className="edit-exam-back"><ArrowLeft aria-hidden="true" size={17} /> Back to exams</Link>
      <header className="edit-exam-header">
        <h1>Edit exam</h1>
        <p>Update exam details and, before attempts begin, its questions.</p>
        <span className="edit-exam-code">Exam code: {exam.examCode}</span>
      </header>

      {error && <div className="settings-message is-error" role="alert"><AlertCircle aria-hidden="true" size={18} />{error}</div>}

      <form className="edit-exam-form" onSubmit={handleSave}>
        <section className="card edit-exam-card">
          <h2>Exam details</h2>
          <div className="edit-exam-grid">
            <label className="field">Title
              <input className="field-control" value={details.title} minLength={3} maxLength={200} required onChange={(event) => setDetails({ ...details, title: event.target.value })} />
            </label>
            <label className="field">Description
              <textarea className="field-control" rows={3} value={details.description} onChange={(event) => setDetails({ ...details, description: event.target.value })} />
            </label>
            <label className="field">Batch year
              <input className="field-control" type="number" min={2000} max={2100} required value={details.batchYear} onChange={(event) => setDetails({ ...details, batchYear: event.target.value })} />
            </label>
            <label className="field">Language
              <input className="field-control" minLength={2} maxLength={50} required value={details.language} onChange={(event) => setDetails({ ...details, language: event.target.value })} />
            </label>
            <label className="field">Time limit (minutes)
              <input className="field-control" type="number" min={1} max={600} required value={details.timeLimitMinutes} onChange={(event) => setDetails({ ...details, timeLimitMinutes: event.target.value })} />
            </label>
            <label className="field">Passing score
              <input className="field-control" type="number" min={0} required value={details.passingScore} onChange={(event) => setDetails({ ...details, passingScore: event.target.value })} />
            </label>
          </div>
        </section>

        <section className="card edit-exam-card">
          <div className="edit-exam-questions-heading">
            <div>
              <h2>Questions ({questions.length})</h2>
              {hasAttempts && <p>Questions are locked because students have already started this exam. Exam details can still be updated.</p>}
            </div>
            {!hasAttempts && <button className="btn-secondary" type="button" onClick={addQuestion}><Plus aria-hidden="true" size={16} /> Add question</button>}
          </div>
          <div className="edit-question-list">
            {questions.map((question, index) => (
              <article className="edit-question-card" key={question.id || index}>
                <div className="edit-question-heading">
                  <strong>Question {index + 1}</strong>
                  {!hasAttempts && <button type="button" className="edit-question-delete" aria-label={`Remove question ${index + 1}`} onClick={() => removeQuestion(index)}><Trash2 aria-hidden="true" size={17} /></button>}
                </div>
                <label className="field">Question text
                  <textarea className="field-control" rows={2} disabled={hasAttempts} value={question.questionText} onChange={(event) => updateQuestion(index, 'questionText', event.target.value)} />
                </label>
                <div className="edit-exam-grid">
                  <label className="field">Question type
                    <select className="field-control" disabled={hasAttempts} value={question.questionType} onChange={(event) => updateQuestion(index, 'questionType', event.target.value)}>
                      <option value="mcq">Multiple choice</option>
                      <option value="truefalse">True / false</option>
                      <option value="fillblank">Fill in the blank</option>
                    </select>
                  </label>
                  <label className="field">Correct answer
                    <input className="field-control" disabled={hasAttempts} value={question.correctAnswer} onChange={(event) => updateQuestion(index, 'correctAnswer', event.target.value)} required />
                  </label>
                  <label className="field">Marks
                    <input className="field-control" type="number" min={1} disabled={hasAttempts} value={question.marks} onChange={(event) => updateQuestion(index, 'marks', event.target.value)} required />
                  </label>
                </div>
                {question.questionType !== 'fillblank' && (
                  <div className="edit-exam-grid">
                    {['optionA', 'optionB', ...(question.questionType === 'mcq' ? ['optionC', 'optionD'] : [])].map((option) => (
                      <label className="field" key={option}>Option {option.slice(-1)}
                        <input className="field-control" disabled={hasAttempts} value={question[option] || ''} onChange={(event) => updateQuestion(index, option, event.target.value)} />
                      </label>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <button className="btn-primary" type="submit" disabled={saving}>
          <Save aria-hidden="true" size={17} /> {saving ? 'Saving…' : 'Save exam changes'}
        </button>
      </form>
    </div>
  )
}
