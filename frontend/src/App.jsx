import { useState, useEffect } from "react"
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js"

const API_URL = "https://bi2179b7r7.execute-api.us-east-1.amazonaws.com/prod"
const S3_BUCKET = "https://documentflow-files-217019990923.s3.amazonaws.com"
const poolData = { UserPoolId: "us-east-1_l9br8j9ax", ClientId: "1ok3trp2uigpjrb823lk6mpipk" }
const userPool = new CognitoUserPool(poolData)
const STATUS_COLORS = { "Not Started": "#95a5a6", "In Progress": "#3498db", "Ready for Review": "#f39c12", "Under Review": "#9b59b6", "Revision Required": "#e74c3c", "Approved": "#27ae60", "Completed": "#2ecc71", "Overdue": "#c0392b" }

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [needsNewPassword, setNeedsNewPassword] = useState(false)
  const [cognitoUser, setCognitoUser] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const handleLogin = () => {
    setLoading(true); setError("")
    const authDetails = new AuthenticationDetails({ Username: email, Password: password })
    const user = new CognitoUser({ Username: email, Pool: userPool })
    user.authenticateUser(authDetails, {
      onSuccess: (result) => { setLoading(false); const groups = result.getIdToken().decodePayload()["cognito:groups"] || []; onLogin(email, groups) },
      onFailure: (err) => { setLoading(false); setError(err.message) },
      newPasswordRequired: () => { setLoading(false); setNeedsNewPassword(true); setCognitoUser(user) }
    })
  }
  const handleNewPassword = () => {
    setLoading(true)
    cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
      onSuccess: (result) => { setLoading(false); const groups = result.getIdToken().decodePayload()["cognito:groups"] || []; onLogin(email, groups) },
      onFailure: (err) => { setLoading(false); setError(err.message) }
    })
  }
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f6fa", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ backgroundColor: "white", padding: "48px", borderRadius: "12px", width: "400px", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ color: "#1F4E79", fontSize: "28px", margin: "0 0 8px" }}>DocumentFlow Cloud</h1>
          <p style={{ color: "#888", fontSize: "14px" }}>Sign in to your account</p>
        </div>
        {!needsNewPassword ? (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
            </div>
            {error && <p style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}
            <button onClick={handleLogin} disabled={loading} style={{ width: "100%", backgroundColor: "#1F4E79", color: "white", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>{loading ? "Signing in..." : "Sign In"}</button>
          </div>
        ) : (
          <div>
            <p style={{ color: "#f39c12", fontSize: "13px", marginBottom: "16px" }}>Please set a new password.</p>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
            </div>
            {error && <p style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}
            <button onClick={handleNewPassword} disabled={loading} style={{ width: "100%", backgroundColor: "#1F4E79", color: "white", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>{loading ? "Setting..." : "Set New Password"}</button>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [userGroup, setUserGroup] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [showForm, setShowForm] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(null)
  const [newDoc, setNewDoc] = useState({ title: "", projectName: "", category: "", ownerId: "", ownerEmail: "", reviewerId: "", reviewerEmail: "", deadline: "" })

  const handleLogin = (email, groups) => {
    setUser(email)
    setUserGroup(groups && groups.length > 0 ? groups[0] : "Member")
    fetchDocuments()
  }
  const handleLogout = () => {
    const currentUser = userPool.getCurrentUser()
    if (currentUser) currentUser.signOut()
    setUser(null); setUserGroup(null); setDocuments([]); setLoading(false)
  }
  useEffect(() => {
    const currentUser = userPool.getCurrentUser()
    if (currentUser) {
      currentUser.getSession((err, session) => {
        if (err || !session.isValid()) { setLoading(false); return }
        const groups = session.getIdToken().decodePayload()["cognito:groups"] || []
        currentUser.getUserAttributes((err2, attrs) => {
          if (!err2) {
            const emailAttr = attrs.find(a => a.Name === "email")
            setUser(emailAttr ? emailAttr.Value : currentUser.getUsername())
            setUserGroup(groups[0] || "Member")
            fetchDocuments()
          } else { setLoading(false) }
        })
      })
    } else { setLoading(false) }
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const res = await fetch(API_URL + "/documents")
      const data = await res.json()
      setDocuments(Array.isArray(data) ? data : [])
    } catch (err) { setDocuments([]) } finally { setLoading(false) }
  }
  const createDocument = async () => {
    try {
      const res = await fetch(API_URL + "/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newDoc) })
      const data = await res.json()
      if (data.documentId) { setShowForm(false); setNewDoc({ title: "", projectName: "", category: "", ownerId: "", ownerEmail: "", reviewerId: "", reviewerEmail: "", deadline: "" }); fetchDocuments() }
    } catch (err) { console.error(err) }
  }
  const uploadFile = async (doc, file) => {
    try {
      const res = await fetch(API_URL + "/documents/" + doc.documentId + "/versions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, uploadedBy: user }) })
      const data = await res.json()
      if (data.uploadUrl) { await fetch(data.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } }); alert("Uploaded! Version " + data.versionNumber); fetchDocuments() }
    } catch (err) { console.error(err) }
  }
  const changeStatus = async (doc, newStatus, comment) => {
    try {
      await fetch(API_URL + "/documents/" + doc.documentId + "/status", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus, comment, notifyEmail: doc.ownerEmail || doc.reviewerEmail || "" }) })
      setShowStatusModal(null); fetchDocuments()
    } catch (err) { console.error(err) }
  }
  const downloadFile = (doc) => {
    if (!doc.s3Key) { alert("No file uploaded yet"); return }
    window.open(S3_BUCKET + "/" + doc.s3Key, "_blank")
  }

  if (!user && !loading) return <LoginPage onLogin={handleLogin} />
  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "18px", color: "#1F4E79" }}>Loading...</div>

  const filteredDocs = filter === "All" ? documents : documents.filter(d => d.status === filter)
  return (
    <div style={{ fontFamily: "Arial", minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <div style={{ backgroundColor: "#1F4E79", color: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>DocumentFlow Cloud</h1>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.8 }}>Cloud-Based Project Document Management</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "13px", opacity: 0.8 }}>logged in as: {user} | {userGroup}</span>
          {(userGroup === "Admin" || userGroup === "PMO") && <button onClick={() => setShowForm(true)} style={{ backgroundColor: "#f39c12", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>+ New Document</button>}
          <button onClick={handleLogout} style={{ backgroundColor: "transparent", color: "white", border: "1px solid white", padding: "10px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>Logout</button>
        </div>
      </div>
      <div style={{ padding: "24px 32px" }}>
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          {["All", "Overdue", "Ready for Review", "Approved"].map(s => (
            <div key={s} onClick={() => setFilter(s)} style={{ backgroundColor: filter === s ? "#1F4E79" : "white", color: filter === s ? "white" : "#333", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", fontWeight: "bold", fontSize: "14px" }}>
              {s} ({s === "All" ? documents.length : documents.filter(d => d.status === s).length})
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#1F4E79", color: "white" }}>
                {["Title", "Project", "Category", "Owner", "Reviewer", "Deadline", "Version", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: "24px", textAlign: "center", color: "#888" }}>No documents found</td></tr>
              ) : (
                filteredDocs.map((doc, i) => (
                  <tr key={doc.documentId} style={{ backgroundColor: i % 2 === 0 ? "white" : "#f8f9fa", borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", fontSize: "13px" }}>{doc.title}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>{doc.projectName}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>{doc.category}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>{doc.ownerId}<br/><span style={{fontSize:"11px",color:"#888"}}>{doc.ownerEmail}</span></td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>{doc.reviewerId || "-"}<br/><span style={{fontSize:"11px",color:"#888"}}>{doc.reviewerEmail}</span></td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>{doc.deadline}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", textAlign: "center" }}>v{doc.currentVersion}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ backgroundColor: STATUS_COLORS[doc.status] || "#95a5a6", color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>{doc.status}</span></td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
{(userGroup !== "Reviewer") && <label style={{ backgroundColor: "#2E75B6", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>Upload<input type="file" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) uploadFile(doc, f) }} /></label>}
                        <button onClick={() => setShowStatusModal(doc)} style={{ backgroundColor: "#f39c12", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>Status</button>
                        <button onClick={() => downloadFile(doc)} style={{ backgroundColor: "#27ae60", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>Download</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showStatusModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <StatusModal doc={showStatusModal} onClose={() => setShowStatusModal(null)} onSave={changeStatus} />
        </div>
      )}
      {showForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "12px", width: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 24px", color: "#1F4E79" }}>New Document</h2>
            {[["Title","title","text"],["Project Name","projectName","text"],["Category","category","text"],["Owner Name","ownerId","text"],["Owner Email","ownerEmail","email"],["Reviewer Name","reviewerId","text"],["Reviewer Email","reviewerEmail","email"],["Deadline","deadline","date"]].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>{label}</label>
                <input type={type} value={newDoc[key]} onChange={e => setNewDoc({ ...newDoc, [key]: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={createDocument} style={{ flex: 1, backgroundColor: "#1F4E79", color: "white", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Create Document</button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, backgroundColor: "#eee", color: "#333", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusModal({ doc, onClose, onSave }) {
  const [selectedStatus, setSelectedStatus] = useState(doc.status)
  const [comment, setComment] = useState("")
  const statuses = ["Not Started", "In Progress", "Ready for Review", "Under Review", "Revision Required", "Approved", "Completed"]
  return (
    <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "12px", width: "460px" }}>
      <h2 style={{ margin: "0 0 8px", color: "#1F4E79" }}>Change Status</h2>
      <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#888" }}>{doc.title}</p>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setSelectedStatus(s)} style={{ padding: "6px 12px", borderRadius: "16px", border: "2px solid", borderColor: selectedStatus === s ? "#1F4E79" : "#ddd", backgroundColor: selectedStatus === s ? "#1F4E79" : "white", color: selectedStatus === s ? "white" : "#333", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>Comment</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box", resize: "none" }} />
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <button onClick={() => onSave(doc, selectedStatus, comment)} style={{ flex: 1, backgroundColor: "#1F4E79", color: "white", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Save</button>
        <button onClick={onClose} style={{ flex: 1, backgroundColor: "#eee", color: "#333", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  )
}

export default App