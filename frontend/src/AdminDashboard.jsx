import { useState, useEffect } from 'react'

function AdminDashboard() {
  const [patients, setPatients] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPatients()
    fetchStats()
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchPatients()
      fetchStats()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/patients')
      const data = await response.json()
      setPatients(data.patients || [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch patients')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/stats')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error(err)
    }
  }

  const completePatient = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/patients/${patientId}/complete`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        await fetchPatients()
        await fetchStats()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const cancelPatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to cancel this patient?')) return
    
    try {
      const response = await fetch(`http://localhost:5001/api/patients/${patientId}/cancel`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        await fetchPatients()
        await fetchStats()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getUrgencyColor = (level) => {
    if (level <= 3) return '#4ade80' // green
    if (level <= 7) return '#fbbf24' // yellow
    return '#f87171' // red
  }

  const getTriageBadge = (score) => {
    if (score >= 80) return { text: 'CRITICAL', color: '#dc2626' }
    if (score >= 60) return { text: 'URGENT', color: '#ea580c' }
    if (score >= 40) return { text: 'MODERATE', color: '#f59e0b' }
    if (score >= 20) return { text: 'ROUTINE', color: '#3b82f6' }
    return { text: 'LOW', color: '#10b981' }
  }

  if (loading && patients.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', fontSize: '28px', color: '#1f2937' }}>
        Live Queue Dashboard
      </h2>

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              {stats.totalWaiting}
            </div>
            <div style={{ opacity: 0.9 }}>Total Waiting</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              {Math.round(stats.avgWaitTime)}m
            </div>
            <div style={{ opacity: 0.9 }}>Avg Wait Time</div>
          </div>

          <div style={{
            background: '#fff',
            border: '2px solid #e5e7eb',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#10b981' }}>
              {stats.byUrgency.low}
            </div>
            <div style={{ color: '#6b7280' }}>Low Urgency</div>
          </div>

          <div style={{
            background: '#fff',
            border: '2px solid #e5e7eb',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#f59e0b' }}>
              {stats.byUrgency.moderate}
            </div>
            <div style={{ color: '#6b7280' }}>Moderate Urgency</div>
          </div>

          <div style={{
            background: '#fff',
            border: '2px solid #e5e7eb',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#f87171' }}>
              {stats.byUrgency.high}
            </div>
            <div style={{ color: '#6b7280' }}>High Urgency</div>
          </div>
        </div>
      )}

      {/* Patient Queue */}
      {patients.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #d1d5db',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '20px', fontWeight: '600' }}>No patients in queue</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>The queue will update automatically when patients register</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {patients.map((patient) => {
            const triageBadge = getTriageBadge(patient.triageScore)
            return (
              <div
                key={patient.id}
                style={{
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        #{patient.position}
                      </div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                          {patient.name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                          {patient.email} • {patient.phone}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px', color: '#374151' }}>
                      <strong>Symptoms:</strong> {patient.symptoms}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: getUrgencyColor(patient.urgencyLevel),
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Urgency: {patient.urgencyLevel}/10
                      </span>
                      <span style={{
                        padding: '4px 12px',
                        background: triageBadge.color,
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {triageBadge.text}
                      </span>
                      <span style={{
                        padding: '4px 12px',
                        background: '#e5e7eb',
                        color: '#374151',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        {patient.visitType}
                      </span>
                      <span style={{
                        padding: '4px 12px',
                        background: '#e5e7eb',
                        color: '#374151',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        ~{patient.estimatedDuration} min
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => completePatient(patient.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#059669'}
                      onMouseLeave={(e) => e.target.style.background = '#10b981'}
                    >
                      ✓ Complete
                    </button>
                    <button
                      onClick={() => cancelPatient(patient.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                      onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

