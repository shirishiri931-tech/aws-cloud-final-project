import { useState, useEffect } from "react"
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js"

const FONT = "Inter, Segoe UI, system-ui, sans-serif"

const API_URL = "https://bi2179b7r7.execute-api.us-east-1.amazonaws.com/prod"
const S3_BUCKET = "https://documentflow-files-217019990923.s3.amazonaws.com"
const poolData = { UserPoolId: "us-east-1_l9br8j9ax", ClientId: "1ok3trp2uigpjrb823lk6mpipk" }
const userPool = new CognitoUserPool(poolData)
const STATUS_COLORS = { "Not Started": "#95a5a6", "In Progress": "#3498db", "Ready for Review": "#f39c12", "Under Review": "#9b59b6", "Revision Required": "#e74c3c", "Approved": "#27ae60", "Completed": "#2ecc71", "Rejected": "#c0392b", "Overdue": "#c0392b" }

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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F2E4C 0%, #1F4E79 50%, #2E75B6 100%)", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
      <div style={{ backgroundColor: "white", padding: "48px", borderRadius: "16px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ color: "#1F4E79", fontSize: "26px", margin: "0 0 8px", fontWeight: "800", letterSpacing: "-0.5px" }}>☁ DocumentFlow Cloud</h1>
          <p style={{ color: "#888", fontSize: "14px" }}>Sign in to your account</p>
        </div>
        {!needsNewPassword ? (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e1e5ea", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none", transition: "border-color 0.15s" }} />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e1e5ea", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none", transition: "border-color 0.15s" }} />
            </div>
            {error && <p style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}
            <button onClick={handleLogin} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg, #1F4E79, #2E75B6)", color: "white", border: "none", padding: "13px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "15px", boxShadow: "0 4px 12px rgba(31,78,121,0.3)", transition: "transform 0.1s" }}>{loading ? "Signing in..." : "Sign In"}</button>
          </div>
        ) : (
          <div>
            <p style={{ color: "#f39c12", fontSize: "13px", marginBottom: "16px" }}>Please set a new password.</p>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e1e5ea", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none", transition: "border-color 0.15s" }} />
            </div>
            {error && <p style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}
            <button onClick={handleNewPassword} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg, #1F4E79, #2E75B6)", color: "white", border: "none", padding: "13px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "15px", boxShadow: "0 4px 12px rgba(31,78,121,0.3)" }}>{loading ? "Setting..." : "Set New Password"}</button>
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
  const [showAdmin, setShowAdmin] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [newDoc, setNewDoc] = useState({ title: "", projectName: "", category: "", assignedUserId: "", assignedUserEmail: "", reviewerUserId: "", reviewerEmail: "", deadline: "" })
  const [allUsers, setAllUsers] = useState([])

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(API_URL + "/users")
      const data = await res.json()
      setAllUsers(Array.isArray(data) ? data : JSON.parse(data.body || "[]"))
    } catch (err) { console.error(err) }
  }

  const handleLogin = (email, groups) => {
    setUser(email)
    const g = groups || []
    const primaryGroup = g.includes("Admin") ? "Admin" : (g.includes("PMO") ? "PMO" : (g.includes("Reviewer") ? "Reviewer" : (g[0] || "Member")))
    setUserGroup(primaryGroup)
    if (primaryGroup === "Admin") { setShowAdmin(true); setLoading(false) }
    else { fetchDocuments() }
  }

  const handleShowAdminFromHeader = () => setShowAdmin(true)
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
            const primaryGroup = groups.includes("Admin") ? "Admin" : (groups.includes("PMO") ? "PMO" : (groups.includes("Reviewer") ? "Reviewer" : (groups[0] || "Member")))
            setUserGroup(primaryGroup)
            if (primaryGroup === "Admin") { setShowAdmin(true); setLoading(false) }
            else { fetchDocuments() }
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
      const res = await fetch(API_URL + "/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newDoc, createdByEmail: user }) })
      const data = await res.json()
      if (data.documentId) { setShowForm(false); setNewDoc({ title: "", projectName: "", category: "", assignedUserId: "", assignedUserEmail: "", reviewerUserId: "", reviewerEmail: "", deadline: "" }); fetchDocuments() }
    } catch (err) { console.error(err) }
  }
  const uploadFile = async (doc, file) => {
    try {
      const res = await fetch(API_URL + "/documents/" + doc.documentId + "/versions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, uploadedBy: user }) })
      const data = await res.json()
      if (data.uploadUrl) { await fetch(data.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": "application/octet-stream" } }); alert("Uploaded! Version " + data.versionNumber); fetchDocuments() }
    } catch (err) { console.error(err) }
  }
  const changeStatus = async (doc, newStatus, comment) => {
    try {
      await fetch(API_URL + "/documents/" + doc.documentId + "/status", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus, comment, notifyEmail: doc.assignedUserEmail || doc.reviewerEmail || "" }) })
      setShowStatusModal(null); fetchDocuments()
    } catch (err) { console.error(err) }
  }
  const downloadFile = async (doc, versionNumber) => {
    try {
      const url = versionNumber
        ? API_URL + "/documents/" + doc.documentId + "/download?version=" + versionNumber
        : API_URL + "/documents/" + doc.documentId + "/download"
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) { alert(data.error || "Download failed"); return }
      if (data.downloadUrl) { window.open(data.downloadUrl, "_blank") }
      else { alert("Download failed") }
    } catch (err) { alert("Download failed") }
  }

  if (!user && !loading) return <LoginPage onLogin={handleLogin} />
  if (showAdmin) return <AdminScreen onBack={() => { setShowAdmin(false); fetchDocuments() }} />
  if (selectedDoc) return <DocumentDetail doc={selectedDoc} user={user} userGroup={userGroup} onBack={() => setSelectedDoc(null)} onUpdate={fetchDocuments} />
  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "18px", color: "#1F4E79" }}>Loading...</div>

  const visibleDocs = (userGroup === "Admin" || userGroup === "PMO")
    ? documents
    : documents.filter(d => d.assignedUserEmail === user || d.reviewerEmail === user)

  const filteredDocs = filter === "All" ? visibleDocs : visibleDocs.filter(d => d.status === filter)
  return (
    <div style={{ fontFamily: "Arial", minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <div style={{ backgroundColor: "#1F4E79", color: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>DocumentFlow Cloud</h1>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.8 }}>Cloud-Based Project Document Management</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "13px", opacity: 0.8 }}>logged in as: {user} | {userGroup}</span>
          {userGroup === "Admin" && <button onClick={() => setShowAdmin(true)} style={{ backgroundColor: "#c0392b", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Admin Panel</button>}
          {(userGroup === "Admin" || userGroup === "PMO") && <button onClick={() => { setShowForm(true); fetchAllUsers() }} style={{ backgroundColor: "#f39c12", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>+ New Document</button>}
          <button onClick={handleLogout} style={{ backgroundColor: "transparent", color: "white", border: "1px solid white", padding: "10px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>Logout</button>
        </div>
      </div>
      <div style={{ padding: "24px 32px" }}>
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          {["All", "Ready for Review", "Approved", "Rejected"].map(s => (
            <div key={s} onClick={() => setFilter(s)} style={{ backgroundColor: filter === s ? "#1F4E79" : "white", color: filter === s ? "white" : "#333", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", fontWeight: "bold", fontSize: "14px" }}>
              {s} ({s === "All" ? documents.length : documents.filter(d => d.status === s).length})
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#1F4E79", color: "white" }}>
                {["Title", "Project", "Category", "Assigned User", "Reviewer", "Deadline", "Version", "Status", "Actions"].map(h => (
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
                    <td style={{ padding: "12px 16px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", color: "#1F4E79", textDecoration: "underline" }} onClick={() => setSelectedDoc(doc)}>{doc.title}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>{doc.projectName}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>{doc.category}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>{doc.assignedUserId}<br/><span style={{fontSize:"11px",color:"#888"}}>{doc.assignedUserEmail}</span></td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>{doc.reviewerUserId || "-"}<br/><span style={{fontSize:"11px",color:"#888"}}>{doc.reviewerEmail}</span></td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>{doc.deadline}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", textAlign: "center" }}>v{doc.currentVersion}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ backgroundColor: STATUS_COLORS[doc.status] || "#95a5a6", color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>{doc.status}</span></td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
{(doc.assignedUserEmail === user || doc.reviewerEmail === user || userGroup === "Admin" || userGroup === "PMO") && <label style={{ backgroundColor: "#2E75B6", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>Upload<input type="file" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) uploadFile(doc, f) }} /></label>}
                        <button onClick={() => setShowStatusModal(doc)} style={{ backgroundColor: "#f39c12", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>Status</button>
                        {(doc.currentVersion > 0 && doc.s3Key) && <button onClick={() => downloadFile(doc)} style={{ backgroundColor: "#27ae60", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>Download</button>}
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
            {[["Document Title","title","text"],["Project Name","projectName","text"],["Document Category","category","text"]].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>{label}</label>
                <input type={type} value={newDoc[key]} onChange={e => setNewDoc({ ...newDoc, [key]: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e1e5ea", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none", transition: "border-color 0.15s" }} />
              </div>
            ))}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>Responsible User</label>
              <select value={newDoc.assignedUserEmail} onChange={e => {
                const selected = allUsers.find(u => u.email === e.target.value)
                setNewDoc({ ...newDoc, assignedUserId: selected ? ((selected.firstName || "") + " " + (selected.lastName || "")).trim() : "", assignedUserEmail: e.target.value })
              }} style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e1e5ea", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none" }}>
                <option value="">Select a user</option>
                {allUsers.map(u => (
                  <option key={u.email} value={u.email}>{((u.firstName || "") + " " + (u.lastName || "")).trim() || u.email} - {u.email}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>Reviewer / Approver</label>
              <select value={newDoc.reviewerEmail} onChange={e => {
                const selected = allUsers.find(u => u.email === e.target.value)
                setNewDoc({ ...newDoc, reviewerUserId: selected ? ((selected.firstName || "") + " " + (selected.lastName || "")).trim() : "", reviewerEmail: e.target.value })
              }} style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e1e5ea", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none" }}>
                <option value="">Select a reviewer</option>
                {allUsers.map(u => (
                  <option key={u.email} value={u.email}>{((u.firstName || "") + " " + (u.lastName || "")).trim() || u.email} - {u.email}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>Review Deadline</label>
              <input type="date" value={newDoc.deadline} onChange={e => setNewDoc({ ...newDoc, deadline: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e1e5ea", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none", transition: "border-color 0.15s" }} />
            </div>
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


function DocumentDetail({ doc, user, userGroup, onBack, onUpdate }) {
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)

  useEffect(() => { fetchHistory() }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch(API_URL + "/documents/" + doc.documentId + "/history")
      const raw = await res.json()
      const items = Array.isArray(raw) ? raw : (raw.body ? JSON.parse(raw.body) : [])
      setHistory(items)
    } catch (err) { console.error(err) }
    finally { setLoadingHistory(false) }
  }

  const uploadFile = async (file, versionType) => {
    setUploading(true)
    try {
      const res = await fetch(API_URL + "/documents/" + doc.documentId + "/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, uploadedBy: user, versionType: versionType, statusAtUpload: doc.status })
      })
      const data = await res.json()
      if (data.uploadUrl) {
        await fetch(data.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": "application/octet-stream" } })
        alert("Uploaded! Version " + data.versionNumber)
        onUpdate()
        onBack()
      }
    } catch (err) { console.error(err) }
    finally { setUploading(false) }
  }

  const VERSION_TYPE_COLORS = {
    "Submitted": "#3498db", "Reviewed": "#9b59b6",
    "Revised": "#f39c12", "Approved": "#27ae60"
  }

  const isAssigned = doc.assignedUserId === user || doc.assignedUserEmail === user
  const isReviewer = doc.reviewerUserId === user || doc.reviewerEmail === user
  const isPMO = userGroup === "PMO" || userGroup === "Admin"

  return (
    <div style={{ fontFamily: "Arial", minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <div style={{ backgroundColor: "#1F4E79", color: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px" }}>{doc.title}</h1>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.8 }}>{doc.projectName} · {doc.category}</p>
        </div>
        <button onClick={onBack} style={{ backgroundColor: "transparent", color: "white", border: "1px solid white", padding: "10px 16px", borderRadius: "6px", cursor: "pointer" }}>← Back</button>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          {[
            ["Assigned User", (doc.assignedUserId || "-") + (doc.assignedUserEmail ? " (" + doc.assignedUserEmail + ")" : "")],
            ["Reviewer", (doc.reviewerUserId || "-") + (doc.reviewerEmail ? " (" + doc.reviewerEmail + ")" : "")],
            ["Deadline", doc.deadline],
            ["Current Version", "v" + doc.currentVersion],
            ["Current File", doc.currentFileName || "-"],
            ["Last Updated", doc.lastUpdated ? doc.lastUpdated.slice(0,10) : "-"],
          ].map(([label, value]) => (
            <div key={label} style={{ backgroundColor: "white", padding: "16px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: "11px", color: "#888", fontWeight: "bold", marginBottom: "4px" }}>{label}</div>
              <div style={{ fontSize: "14px", color: "#333" }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.08)", marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", color: "#888", fontWeight: "bold", marginBottom: "8px" }}>STATUS</div>
          <span style={{ backgroundColor: STATUS_COLORS[doc.status] || "#95a5a6", color: "white", padding: "6px 16px", borderRadius: "16px", fontSize: "14px", fontWeight: "bold" }}>
            {doc.status}
          </span>
          {doc.comments && <p style={{ marginTop: "12px", fontSize: "13px", color: "#555", borderTop: "1px solid #eee", paddingTop: "12px" }}>Comment: {doc.comments}</p>}
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          {(isAssigned || isPMO) && (
            <label style={{ backgroundColor: "#2E75B6", color: "white", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
              {uploading ? "Uploading..." : "Upload Submitted"}
              <input type="file" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) uploadFile(f, "Submitted") }} />
            </label>
          )}
          {(isAssigned || isPMO) && (
            <label style={{ backgroundColor: "#f39c12", color: "white", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
              {uploading ? "Uploading..." : "Upload Revised"}
              <input type="file" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) uploadFile(f, "Revised") }} />
            </label>
          )}
          {(isReviewer || isPMO) && (
            <label style={{ backgroundColor: "#9b59b6", color: "white", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
              {uploading ? "Uploading..." : "Upload Reviewed"}
              <input type="file" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) uploadFile(f, "Reviewed") }} />
            </label>
          )}
          <button onClick={() => setShowStatusModal(true)} style={{ backgroundColor: "#1F4E79", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
            Change Status
          </button>
        </div>

        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1F4E79", marginBottom: "12px" }}>VERSION HISTORY</div>
          {loadingHistory ? <p style={{ color: "#888" }}>Loading...</p> : history.length === 0 ? <p style={{ color: "#888" }}>No versions uploaded yet</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  {["Version", "Type", "File Name", "Uploaded By", "Date", "Status", ""].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", color: "#555" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((v, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #eee" }}>
                    <td style={{ padding: "8px 12px", fontSize: "13px", fontWeight: "bold" }}>v{v.versionNumber}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ backgroundColor: VERSION_TYPE_COLORS[v.versionType] || "#95a5a6", color: "white", padding: "2px 8px", borderRadius: "10px", fontSize: "11px" }}>
                        {v.versionType || "Submitted"}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: "13px" }}>{v.fileName}</td>
                    <td style={{ padding: "8px 12px", fontSize: "13px" }}>{v.uploadedBy}</td>
                    <td style={{ padding: "8px 12px", fontSize: "13px" }}>{v.uploadedAt ? v.uploadedAt.slice(0,10) : "-"}</td>
                    <td style={{ padding: "8px 12px", fontSize: "12px", color: "#888" }}>{v.statusAtUpload || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showStatusModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <StatusModal doc={doc} onClose={() => setShowStatusModal(false)} onSave={async (d, status, comment) => {
            await fetch(API_URL + "/documents/" + doc.documentId + "/status", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status, comment, notifyEmail: doc.assignedUserEmail || doc.reviewerEmail || "" })
            })
            setShowStatusModal(false)
            onUpdate()
            onBack()
          }} />
        </div>
      )}
    </div>
  )
}


function AdminScreen({ onBack }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", group: "PMO" })
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL + "/users")
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : JSON.parse(data.body || "[]"))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const createUser = async () => {
    if (!newUser.email || !newUser.firstName || !newUser.lastName) {
      alert("Please fill in all fields")
      return
    }
    setCreating(true)
    try {
      const res = await fetch(API_URL + "/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      })
      const data = await res.json()
      if (res.ok) {
        alert("User created successfully. An invitation email was sent to " + newUser.email)
        setShowAddUser(false)
        setNewUser({ firstName: "", lastName: "", email: "", group: "PMO" })
        fetchUsers()
      } else {
        alert(data.error || "Failed to create user")
      }
    } catch (err) { alert("Failed to create user") }
    finally { setCreating(false) }
  }

  const GROUP_COLORS = { Admin: "#c0392b", PMO: "#1F4E79", Reviewer: "#9b59b6" }

  return (
    <div style={{ fontFamily: "Arial", minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <div style={{ backgroundColor: "#1F4E79", color: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>DocumentFlow Cloud - Admin Panel</h1>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.8 }}>User Management</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => setShowAddUser(true)} style={{ backgroundColor: "#f39c12", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>+ New User</button>
          <button onClick={onBack} style={{ backgroundColor: "transparent", color: "white", border: "1px solid white", padding: "10px 16px", borderRadius: "6px", cursor: "pointer" }}>View Documents</button>
        </div>
      </div>
      <div style={{ padding: "24px 32px" }}>
        <h2 style={{ color: "#1F4E79", marginBottom: "16px" }}>All Users ({users.length})</h2>
        {loading ? <p>Loading...</p> : (
          <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#1F4E79", color: "white" }}>
                  {["Name", "Email", "Status", "Role", "Created"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.username} style={{ backgroundColor: i % 2 === 0 ? "white" : "#f8f9fa", borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>{(u.firstName || "") + " " + (u.lastName || "")}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "bold" }}>{u.email}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                      <span style={{ backgroundColor: u.status === "CONFIRMED" ? "#27ae60" : "#f39c12", color: "white", padding: "3px 8px", borderRadius: "10px", fontSize: "11px" }}>
                        {u.status === "CONFIRMED" ? "Active" : "Pending First Login"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {(u.groups || []).map(g => (
                          <span key={g} style={{ backgroundColor: GROUP_COLORS[g] || "#95a5a6", color: "white", padding: "3px 8px", borderRadius: "10px", fontSize: "11px" }}>{g}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#888" }}>{u.createdAt ? u.createdAt.slice(0,10) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showAddUser && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "12px", width: "420px" }}>
            <h2 style={{ margin: "0 0 24px", color: "#1F4E79" }}>New User</h2>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>First Name</label>
              <input type="text" value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e1e5ea", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none", transition: "border-color 0.15s" }} />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>Last Name</label>
              <input type="text" value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e1e5ea", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none", transition: "border-color 0.15s" }} />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>Email</label>
              <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e1e5ea", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none", transition: "border-color 0.15s" }} />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>Role</label>
              <select value={newUser.group} onChange={e => setNewUser({ ...newUser, group: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}>
                <option value="Admin">Admin</option>
                <option value="PMO">PMO</option>
                <option value="Reviewer">Reviewer</option>
              </select>
            </div>
            <p style={{ fontSize: "12px", color: "#888", marginBottom: "16px" }}>An invitation email with a temporary password will be sent automatically to this address.</p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={createUser} disabled={creating} style={{ flex: 1, backgroundColor: "#1F4E79", color: "white", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>{creating ? "Creating..." : "Create User"}</button>
              <button onClick={() => setShowAddUser(false)} style={{ flex: 1, backgroundColor: "#eee", color: "#333", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
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
  const statuses = ["Not Started", "In Progress", "Ready for Review", "Under Review", "Revision Required", "Approved", "Rejected"]
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
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e1e5ea", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", resize: "none", outline: "none" }} />
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <button onClick={() => onSave(doc, selectedStatus, comment)} style={{ flex: 1, backgroundColor: "#1F4E79", color: "white", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Save</button>
        <button onClick={onClose} style={{ flex: 1, backgroundColor: "#eee", color: "#333", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  )
}

export default App