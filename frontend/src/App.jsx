import { useState } from 'react'
import PatientForm from './PatientForm'
import AdminDashboard from './AdminDashboard'
import './index.css'

function App() {
  const [mode, setMode] = useState('patient')

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          color: 'white'
        }}>
          <h1 style={{
            margin: '0 0 20px 0',
            fontSize: '36px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '40px' }}>🏥</span>
            AIDE Services
          </h1>
          <p style={{
            margin: '0 0 24px 0',
            opacity: '0.95',
            fontSize: '16px'
          }}>
            Diagnostics & Engagement Services
          </p>

          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setMode('patient')}
              style={{
                padding: '12px 24px',
                backgroundColor: mode === 'patient' ? 'white' : 'rgba(255,255,255,0.2)',
                color: mode === 'patient' ? '#667eea' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: mode === 'patient' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              👤 Patient Intake
            </button>
            <button
              onClick={() => setMode('admin')}
              style={{
                padding: '12px 24px',
                backgroundColor: mode === 'admin' ? 'white' : 'rgba(255,255,255,0.2)',
                color: mode === 'admin' ? '#667eea' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: mode === 'admin' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              📊 Admin Dashboard
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '40px 60px' }}>
          {mode === 'patient' ? <PatientForm /> : <AdminDashboard />}
        </div>
      </div>
    </div>
  )
}

export default App