import { useState } from 'react'

function PatientForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    symptoms: '',
    urgencyLevel: 5,
    visitType: 'follow-up',
    estimatedDuration: 30,
    visitPurpose: ''
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'urgencyLevel' || name === 'estimatedDuration' ? parseInt(value) : value
    }))
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://localhost:5001/api/patient/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          symptoms: `${formData.visitPurpose} ${formData.symptoms}`.trim(),
          urgencyLevel: formData.urgencyLevel,
          visitType: formData.visitType,
          estimatedDuration: formData.estimatedDuration
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit')
      }

      setResult(data)
      setStep(5) // Move to final review page after successful submission
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartNew = () => {
    setStep(1)
    setResult(null)
    setError(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      symptoms: '',
      urgencyLevel: 5,
      visitType: 'follow-up',
      estimatedDuration: 30,
      visitPurpose: ''
    })
  }

  const getUrgencyColor = (level) => {
    if (level <= 3) return '#4ade80' // green
    if (level <= 7) return '#fbbf24' // yellow
    return '#f87171' // red
  }

  const progressPercentage = step === 5 ? 100 : ((step - 1) / 3) * 100

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* Progress Bar */}
      <div style={{
        height: '4px',
        background: '#e5e7eb',
        borderRadius: '2px',
        marginBottom: '30px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercentage}%`,
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Success Message - shown during submission */}
      {result && step < 5 && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '24px' }}>Registration Successful!</h3>
          <p style={{ marginBottom: '8px', fontSize: '18px' }}>Position in Queue: <strong>#{result.patient.position}</strong></p>
          <p style={{ marginBottom: '8px' }}>Estimated Wait Time: <strong>{result.estimatedWait} minutes</strong></p>
          <p style={{ marginBottom: 0, fontSize: '14px', opacity: 0.9 }}>A summary has been sent to your email.</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #fca5a5'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Step Content */}
      {step === 1 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '16px',
          padding: '50px 80px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            marginBottom: '40px', 
            fontSize: '40px', 
            color: '#1f2937',
            fontWeight: '700'
          }}>
            Patient Registration
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '20px'
              }}>
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Michael Ross"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  border: '2px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '18px',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '20px'
              }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="e.g. michael.ross@gmail.com"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  border: '2px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '18px',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '20px'
              }}>
                Phone Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+x (xxx)-xxx-xxxx"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  border: '2px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '18px',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!formData.name || !formData.email || !formData.phone}
            style={{
              marginTop: '40px',
              padding: '20px 50px',
              backgroundColor: '#1f2937',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: '600',
              cursor: (!formData.name || !formData.email || !formData.phone) ? 'not-allowed' : 'pointer',
              opacity: (!formData.name || !formData.email || !formData.phone) ? 0.5 : 1,
              transition: 'all 0.2s',
              width: '100%'
            }}
          >
            Get Started →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '16px',
          padding: '50px 80px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            marginBottom: '40px', 
            fontSize: '40px', 
            color: '#1f2937',
            fontWeight: '700'
          }}>
            Visit Information
          </h2>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <div><strong style={{ color: '#374151' }}>Name:</strong> {formData.name}</div>
            <div><strong style={{ color: '#374151' }}>Email:</strong> {formData.email}</div>
            <div><strong style={{ color: '#374151' }}>Phone:</strong> {formData.phone}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '16px'
              }}>
                Please describe the purpose of your visit today <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                name="visitPurpose"
                value={formData.visitPurpose}
                onChange={handleChange}
                required
                rows="4"
                placeholder="e.g. Advisal regarding... follow up meeting... urgent visit regarding..."
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  border: '2px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '16px'
              }}>
                Please describe your symptoms (if applicable)
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                rows="4"
                placeholder="e.g. back pain, sudden illness, 'not applicable'"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  border: '2px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
            <button
              onClick={handleBack}
            style={{
              flex: 1,
              padding: '20px',
              backgroundColor: 'white',
              color: '#374151',
              border: '2px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!formData.visitPurpose}
            style={{
              flex: 1,
              padding: '20px',
              backgroundColor: '#1f2937',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: '600',
              cursor: !formData.visitPurpose ? 'not-allowed' : 'pointer',
              opacity: !formData.visitPurpose ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '16px',
          padding: '50px 80px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            marginBottom: '40px', 
            fontSize: '40px', 
            color: '#1f2937',
            fontWeight: '700'
          }}>
            Urgency & Duration
          </h2>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <div><strong style={{ color: '#374151' }}>Name:</strong> {formData.name}</div>
            <div><strong style={{ color: '#374151' }}>Email:</strong> {formData.email}</div>
            <div><strong style={{ color: '#374151' }}>Phone:</strong> {formData.phone}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '16px'
              }}>
                On a scale of one to ten, how would you describe your urgency level?
              </label>
              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                marginTop: '4px',
                marginBottom: '16px'
              }}>
                Please remember to answer to as much of an extent of honesty as possible. You are on record on this software.
              </p>
              <input
                type="range"
                name="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={handleChange}
                min="1"
                max="10"
                style={{
                  width: '100%',
                  height: '8px',
                  marginBottom: '12px',
                  background: 'linear-gradient(to right, #4ade80, #fbbf24, #f87171)',
                  borderRadius: '4px',
                  appearance: 'none'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
                <span>1 - Flexible</span>
                <span style={{
                  padding: '4px 16px',
                  background: getUrgencyColor(formData.urgencyLevel),
                  color: 'white',
                  borderRadius: '4px',
                  fontWeight: '600',
                  fontSize: '16px'
                }}>
                  {formData.urgencyLevel}/10
                </span>
                <span>10 - Critical</span>
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '16px'
              }}>
                Approximately how long in minutes do you expect this visit to take?
              </label>
              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                marginTop: '4px',
                marginBottom: '16px'
              }}>
                Please provide an estimate value. If you expect the visit to take more than sixty (60) minutes then please attend the front desk.
              </p>
              <input
                type="range"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleChange}
                min="10"
                max="60"
                step="5"
                style={{
                  width: '100%',
                  height: '8px',
                  marginBottom: '12px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  appearance: 'none'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
                <span>10 min</span>
                <span style={{
                  padding: '4px 16px',
                  background: '#667eea',
                  color: 'white',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  {formData.estimatedDuration} minutes
                </span>
                <span>60 min</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
            <button
              onClick={handleBack}
            style={{
              flex: 1,
              padding: '20px',
              backgroundColor: 'white',
              color: '#374151',
              border: '2px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: '#1f2937',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Review →
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '16px',
          padding: '50px 80px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            marginBottom: '40px', 
            fontSize: '40px', 
            color: '#1f2937',
            fontWeight: '700'
          }}>
            Review of Request
          </h2>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <div><strong style={{ color: '#374151' }}>Name:</strong> {formData.name}</div>
            <div><strong style={{ color: '#374151' }}>Email:</strong> {formData.email}</div>
            <div><strong style={{ color: '#374151' }}>Phone:</strong> {formData.phone}</div>
          </div>

          <div style={{
            background: '#f9fafb',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            marginBottom: '30px'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Visit Purpose:</strong> {formData.visitPurpose}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Symptoms:</strong> {formData.symptoms || 'Not specified'}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Urgency Level:</strong> {formData.urgencyLevel}
            </div>
            <div>
              <strong style={{ color: '#374151' }}>Approximated Visit Time:</strong> {formData.estimatedDuration} minutes
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
            <button
              onClick={handleBack}
            style={{
              flex: 1,
              padding: '20px',
              backgroundColor: 'white',
              color: '#374151',
              border: '2px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || result}
              style={{
                flex: 1,
                padding: '20px',
                backgroundColor: (submitting || result) ? '#9ca3af' : '#1f2937',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: '600',
                cursor: (submitting || result) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {submitting ? 'Submitting...' : result ? 'Submitted ✓' : 'Submit'}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Final Confirmation Page */}
      {step === 5 && result && (
        <div style={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '16px',
          padding: '50px 80px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>✓</div>
            <h2 style={{ 
              marginTop: 0, 
              marginBottom: '16px', 
              fontSize: '36px',
              fontWeight: '700'
            }}>
              Registration Complete!
            </h2>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>
              <strong>Position in Queue: #{result.patient.position}</strong>
            </div>
            <div style={{ fontSize: '20px', marginBottom: '12px' }}>
              Estimated Wait Time: <strong>{result.estimatedWait} minutes</strong>
            </div>
            <div style={{ fontSize: '16px', opacity: 0.95 }}>
              A summary has been sent to your email.
            </div>
          </div>

          <h3 style={{ 
            marginBottom: '30px', 
            fontSize: '32px', 
            color: '#1f2937',
            fontWeight: '700'
          }}>
            Your Visit Summary
          </h3>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '2px solid #e5e7eb'
          }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #e5e7eb' }}>
              <strong style={{ color: '#374151', fontSize: '16px' }}>Contact Information:</strong>
              <div style={{ marginTop: '8px', fontSize: '18px', color: '#6b7280' }}>
                <div><strong style={{ color: '#1f2937' }}>Name:</strong> {formData.name}</div>
                <div><strong style={{ color: '#1f2937' }}>Email:</strong> {formData.email}</div>
                <div><strong style={{ color: '#1f2937' }}>Phone:</strong> {formData.phone}</div>
              </div>
            </div>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #e5e7eb' }}>
              <strong style={{ color: '#374151', fontSize: '16px' }}>Visit Details:</strong>
              <div style={{ marginTop: '8px', fontSize: '18px', color: '#1f2937' }}>
                <div style={{ marginBottom: '8px' }}>Purpose: {formData.visitPurpose}</div>
                <div>Symptoms: {formData.symptoms || 'Not specified'}</div>
              </div>
            </div>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #e5e7eb' }}>
              <strong style={{ color: '#374151', fontSize: '16px' }}>Urgency & Duration:</strong>
              <div style={{ marginTop: '8px', fontSize: '18px', color: '#1f2937' }}>
                <div style={{ marginBottom: '8px' }}>Urgency Level: {formData.urgencyLevel}/10</div>
                <div>Estimated Duration: {formData.estimatedDuration} minutes</div>
              </div>
            </div>
            <div>
              <strong style={{ color: '#374151', fontSize: '16px' }}>Queue Information:</strong>
              <div style={{ marginTop: '8px', fontSize: '18px', color: '#1f2937' }}>
                <div style={{ marginBottom: '8px' }}>Your Position: #{result.patient.position}</div>
                <div>Expected Wait Time: ~{result.estimatedWait} minutes</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartNew}
            style={{
              width: '100%',
              padding: '20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            Start New Patient Registration
          </button>
        </div>
      )}
    </div>
  )
}

export default PatientForm
