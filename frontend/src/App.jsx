import { useState, useEffect } from 'react'

const API_URL = 'https://bi2179b7r7.execute-api.us-east-1.amazonaws.com/prod'

const STATUS_COLORS = {
  'Not Started': '#95a5a6',
  'In Progress': '#3498db',
  'Ready for Review': '#f39c12',
  'Under Review': '#9b59b6',
  'Revision Required': '#e74c3c',
  'Approved': '#27ae60',
  'Completed': '#2ecc71',
  'Overdue': '#c0392b'
}

function App() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [newDoc, setNewDoc] = useState({
    title: '', projectName: '', category: '',
    ownerId: '', reviewerId: '', deadline: ''
  })

  useEffect(() => { fetchDocuments() }, [])

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/documents`)
      const data = await res.json()
      setDocuments(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createDocument = async () => {
    try {
      const res = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      })
      const data = await res.json()
      if (data.documentId) {
        setShowForm(false)
        setNewDoc({ title: '', projectName: '', category: '', ownerId: '', reviewerId: '', deadline: '' })
        fetchDocuments()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredDocs = filter === 'All' ? documents : documents.filter(d => d.status === filter)

  return (
    <div style={{ fontFamily: 'Arial', minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
      <div style={{ backgroundColor: '#1F4E79', color: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>DocumentFlow Cloud</h1>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Cloud-Based Project Document Management</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          + New Document
        </button>
      </div>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          {['All', 'Overdue', 'Ready for Review', 'Approved'].map(s => (
            <div key={s} onClick={() => setFilter(s)} style={{ backgroundColor: filter === s ? '#1F4E79' : 'white', color: filter === s ? 'white' : '#333', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '14px' }}>
              {s} ({s === 'All' ? documents.length : documents.filter(d => d.status === s).length})
            </div>
          ))}
        </div>
        {loading ? (
          <p>Loading documents...</p>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1F4E79', color: 'white' }}>
                  {['Title', 'Project', 'Category', 'Owner', 'Reviewer', 'Deadline', 'Version', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDocs.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No documents found</td></tr>
                ) : (
                  filteredDocs.map((doc, i) => (
                    <tr key={doc.documentId} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f8f9fa', borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold', fontSize: '13px' }}>{doc.title}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px' }}>{doc.projectName}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px' }}>{doc.category}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px' }}>{doc.ownerId}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px' }}>{doc.reviewerId || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px' }}>{doc.deadline}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', textAlign: 'center' }}>v{doc.currentVersion}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ backgroundColor: STATUS_COLORS[doc.status] || '#95a5a6', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '480px' }}>
            <h2 style={{ margin: '0 0 24px', color: '#1F4E79' }}>New Document</h2>
            {[
              { label: 'Title', key: 'title', type: 'text' },
              { label: 'Project Name', key: 'projectName', type: 'text' },
              { label: 'Category', key: 'category', type: 'text' },
              { label: 'Owner ID', key: 'ownerId', type: 'text' },
              { label: 'Reviewer ID', key: 'reviewerId', type: 'text' },
              { label: 'Deadline', key: 'deadline', type: 'date' },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>{label}</label>
                <input type={type} value={newDoc[key]} onChange={e => setNewDoc({ ...newDoc, [key]: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={createDocument} style={{ flex: 1, backgroundColor: '#1F4E79', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Create Document
              </button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, backgroundColor: '#eee', color: '#333', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
