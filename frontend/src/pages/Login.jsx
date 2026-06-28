import { useState } from 'react'
import { useApp } from '../context/AppContext'

function Login() {
  const { login, auth, resetPassword } = useApp()
  const [view, setView] = useState('login') // login | forgot-verify | forgot-otp | forgot-reset
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  // Forgot password flow
  const [contact, setContact] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [enteredOtp, setEnteredOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  function handleLogin() {
    setError('')
    if (!form.username || !form.password) {
      setError('Please enter username and password')
      return
    }
    const success = login(form.username, form.password)
    if (!success) {
      setError('Invalid username or password')
    }
  }

  function handleVerifyContact() {
    setError('')
    if (contact !== auth.username && contact !== auth.phone) {
      setError('No account found with this username/phone')
      return
    }
    // Generate simulated OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    setGeneratedOtp(otp)
    setView('forgot-otp')
  }

  function handleVerifyOtp() {
    setError('')
    if (enteredOtp !== generatedOtp) {
      setError('Incorrect OTP')
      return
    }
    setView('forgot-reset')
  }

  function handleResetPassword() {
    setError('')
    if (!newPassword || newPassword.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    resetPassword(newPassword)
    setResetSuccess(true)
    setTimeout(() => {
      setView('login')
      setResetSuccess(false)
      setForm({ username: '', password: '' })
      setContact('')
      setGeneratedOtp('')
      setEnteredOtp('')
      setNewPassword('')
      setConfirmPassword('')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">RC</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Rajesh Copper Works</h1>
          <p className="text-sm text-gray-500 mt-1">Manufacturing ERP</p>
        </div>

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="admin"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Login
            </button>

            <button
              onClick={() => { setView('forgot-verify'); setError('') }}
              className="w-full text-center text-sm text-indigo-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* FORGOT - VERIFY CONTACT */}
        {view === 'forgot-verify' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Enter your registered username or phone number</p>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Username or Phone</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="admin or 9876543210"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              onClick={handleVerifyContact}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Send OTP
            </button>
            <button
              onClick={() => { setView('login'); setError('') }}
              className="w-full text-center text-sm text-gray-500 hover:underline"
            >
              ← Back to Login
            </button>
          </div>
        )}

        {/* FORGOT - OTP VERIFICATION */}
        {view === 'forgot-otp' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <p className="text-sm text-blue-700">
                📱 Simulated OTP sent! Your OTP is: <span className="font-bold text-lg">{generatedOtp}</span>
              </p>
              <p className="text-xs text-blue-500 mt-1">(In production, this would be sent via SMS/Email)</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Enter OTP</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg tracking-widest"
                value={enteredOtp}
                onChange={e => setEnteredOtp(e.target.value)}
                placeholder="0000"
                maxLength={4}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Verify OTP
            </button>
            <button
              onClick={() => { setView('forgot-verify'); setError(''); setEnteredOtp('') }}
              className="w-full text-center text-sm text-gray-500 hover:underline"
            >
              ← Back
            </button>
          </div>
        )}

        {/* FORGOT - RESET PASSWORD */}
        {view === 'forgot-reset' && (
          <div className="space-y-4">
            {resetSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-6 text-center">
                <p className="text-green-700 font-semibold">✅ Password reset successful!</p>
                <p className="text-xs text-green-500 mt-1">Redirecting to login...</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600">Create your new password</p>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                )}
                <button
                  onClick={handleResetPassword}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Reset Password
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Login