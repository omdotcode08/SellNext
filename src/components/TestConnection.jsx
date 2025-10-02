import { useState } from 'react'

const TestConnection = () => {
  const [status, setStatus] = useState('Not tested')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/health')
      const data = await response.json()
      
      if (data.success) {
        setStatus('✅ Backend Connected Successfully!')
      } else {
        setStatus('❌ Backend responded but with error')
      }
    } catch (error) {
      setStatus('❌ Cannot connect to backend. Make sure server is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-700/30 backdrop-blur-md border border-gray-600 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <i className="fas fa-server text-2xl text-blue-400"></i>
        <h3 className="text-xl font-semibold text-white">Backend Connection Test</h3>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            status.includes('✅') ? 'bg-green-400' : 
            status.includes('❌') ? 'bg-red-400' : 'bg-gray-400'
          }`}></div>
          <span className="text-gray-300">Status:</span>
        </div>
        <p className="text-white font-medium ml-5">{status}</p>
      </div>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 font-medium flex items-center gap-2 hover:transform hover:-translate-y-1"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Testing...
          </>
        ) : (
          <>
            <i className="fas fa-plug"></i>
            Test Backend Connection
          </>
        )}
      </button>
      
      <div className="mt-6 space-y-2 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <i className="fas fa-info-circle text-blue-400"></i>
          <span>Backend should be running on http://localhost:5000</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="fas fa-database text-green-400"></i>
          <span>Make sure MongoDB is running and connection string is correct in server/.env</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="fas fa-terminal text-purple-400"></i>
          <span>Run: <code className="bg-gray-600 text-gray-200 px-2 py-1 rounded text-xs">npm start</code> in server directory</span>
        </div>
      </div>
    </div>
  )
}

export default TestConnection