
"use client";
import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

type TableInfo = {
  columns: { name: string; type: string }[];
  sample_data: Record<string, any>[];
};
type QueryResult = Record<string, any>[] | { error: string } | null;
type UserProfile = {
  username: string;
  created_at: string;
  total_queries: number;
  last_login: string;
};

export default function Home() {
  const [token, setToken] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [result, setResult] = useState<QueryResult>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [recentQueries, setRecentQueries] = useState<any[]>([]);
  const [showRecent, setShowRecent] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<number>(0);
  const [loggedInUser, setLoggedInUser] = useState<string>("");
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    if (savedToken) {
      setToken(savedToken);
      setLoggedInUser(savedUsername || "");
      fetch("http://localhost:8000/tables", {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((r) => r.json())
        .then(setTables)
        .catch(() => setTables([]));
      
      fetch("http://localhost:8000/recent_queries", {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((r) => r.json())
        .then(setRecentQueries)
        .catch(() => setRecentQueries([]));
    }
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      fetchTables();
      fetchRecentQueries();
      setLoggedInUser(username);
    }
  }, [token]);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setError("");

    if (authTab === 0) {
      fetch("http://localhost:8000/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.access_token) {
            setToken(data.access_token);
            setError("");
            setUsername("");
            setPassword("");
          } else {
            setError("Invalid credentials");
          }
          setLoginLoading(false);
        })
        .catch(() => {
          setError("Login failed");
          setLoginLoading(false);
        });
    } else if (authTab === 1) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoginLoading(false);
        return;
      }
      fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.message) {
            setError("Registered! Now login.");
            setAuthTab(0);
            setUsername("");
            setPassword("");
            setConfirmPassword("");
          } else {
            setError(data.detail || "Registration failed");
          }
          setLoginLoading(false);
        })
        .catch(() => {
          setError("Registration failed");
          setLoginLoading(false);
        });
    } else if (authTab === 2) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoginLoading(false);
        return;
      }
      fetch("http://localhost:8000/forgot_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.message) {
            setError("Password reset! Now login.");
            setAuthTab(0);
            setUsername("");
            setPassword("");
            setConfirmPassword("");
          } else {
            setError(data.detail || "Reset failed");
          }
          setLoginLoading(false);
        })
        .catch(() => {
          setError("Reset failed");
          setLoginLoading(false);
        });
    }
  }

  function fetchTables() {
    fetch("http://localhost:8000/tables", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setTables);
  }

  function fetchTableInfo(name: string) {
    if (selectedTable === name) {
      setSelectedTable("");
      setTableInfo(null);
      setShowTableModal(false);
      return;
    }
    setSelectedTable(name);
    setShowTableModal(true);
    fetch("http://localhost:8000/table_info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ table: name }),
    })
      .then((r) => r.json())
      .then(setTableInfo);
  }

  function fetchRecentQueries() {
    fetch("http://localhost:8000/recent_queries", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setRecentQueries);
  }

  function fetchUserProfile() {
    fetch("http://localhost:8000/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setUserProfile)
      .catch(() => setUserProfile(null));
  }

  function handleLogout() {
    setToken("");
    setLoggedInUser("");
    setUsername("");
    setPassword("");
    setUserProfile(null);
    setShowProfile(false);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  }

  function handleRunQuery(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    fetch("http://localhost:8000/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    })
      .then((r) => r.json())
      .then((data) => {
        setResult(data);
        fetchRecentQueries();
        setLoading(false);
      })
      .catch(() => {
        setError("Query failed");
        setLoading(false);
      });
  }

  if (isInitializing) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f6fa' }}>
        <Typography variant="h6" sx={{ color: '#999' }}>Loading...</Typography>
      </Box>
    );
  }

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f6fa' }}>
        <Paper elevation={0} sx={{ p: 6, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ color: '#333', mb: 1 }}>SQL Runner</Typography>
          <Typography variant="body2" textAlign="center" sx={{ color: '#999', mb: 2 }}>Execute queries and explore your database</Typography>
          
          {authTab === 0 && (
            <>
              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <TextField
                  label="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  fullWidth
                  autoFocus
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px' } }}
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px' } }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loginLoading}
                  fullWidth
                  sx={{ py: 1.3, fontWeight: 700, fontSize: '15px', mt: 1 }}
                >
                  {loginLoading ? "Signing in..." : "SIGN IN"}
                </Button>
              </form>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>Don't have an account?</Typography>
                <Typography
                  sx={{
                    color: '#1976d2',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                  onClick={() => {
                    setAuthTab(1);
                    setUsername("");
                    setPassword("");
                    setConfirmPassword("");
                    setError("");
                  }}
                >
                  Sign up
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', pt: 1 }}>
                <Typography
                  sx={{
                    color: '#1976d2',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '13px',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                  onClick={() => {
                    setAuthTab(2);
                    setUsername("");
                    setPassword("");
                    setConfirmPassword("");
                    setError("");
                  }}
                >
                  Forgot password?
                </Typography>
              </Box>
            </>
          )}

          {authTab === 1 && (
            <>
              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <TextField
                  label="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  fullWidth
                  autoFocus
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px' } }}
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px' } }}
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px' } }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loginLoading}
                  fullWidth
                  sx={{ py: 1.3, fontWeight: 700, fontSize: '15px', mt: 1 }}
                >
                  {loginLoading ? "Creating account..." : "CREATE ACCOUNT"}
                </Button>
              </form>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>Already have an account?</Typography>
                <Typography
                  sx={{
                    color: '#1976d2',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                  onClick={() => {
                    setAuthTab(0);
                    setUsername("");
                    setPassword("");
                    setConfirmPassword("");
                    setError("");
                  }}
                >
                  Sign in
                </Typography>
              </Box>
            </>
          )}

          {authTab === 2 && (
            <>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Enter your username and new password</Typography>
              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <TextField
                  label="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  fullWidth
                  autoFocus
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px' } }}
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px' } }}
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px' } }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loginLoading}
                  fullWidth
                  sx={{ py: 1.3, fontWeight: 700, fontSize: '15px', mt: 1 }}
                >
                  {loginLoading ? "Resetting..." : "RESET PASSWORD"}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', pt: 1 }}>
                <Typography
                  sx={{
                    color: '#1976d2',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '13px',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                  onClick={() => {
                    setAuthTab(0);
                    setUsername("");
                    setPassword("");
                    setConfirmPassword("");
                    setError("");
                  }}
                >
                  Back to sign in
                </Typography>
              </Box>
            </>
          )}

          {error && <Typography color="error" sx={{ mt: 1, p: 2, bgcolor: '#ffebee', borderRadius: 1, fontSize: '13px', textAlign: 'center', fontWeight: 500 }}>{error}</Typography>}
        </Paper>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f6fa' }}>
        <Drawer variant="permanent" PaperProps={{ sx: { width: 320, bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: 3, border: 'none' } }}>
          <Box sx={{
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)',
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <Typography variant="h6" fontWeight={800} fontSize={24} color="#1976d2" mb={3} letterSpacing={1} sx={{ textShadow: '0 2px 8px #e3f2fd' }}>Tables</Typography>
            <List sx={{ flex: 1, overflow: 'auto', gap: 2 }}>
              {tables
                .filter(t => t !== "recent_queries" && t.toLowerCase() !== "users" && t.toLowerCase() !== "sqlite_sequence")
                .map((t) => (
                  <ListItem key={t} disablePadding sx={{ mb: 2 }}>
                    <ListItemButton selected={selectedTable === t} onClick={() => fetchTableInfo(t)} sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '18px',
                      color: selectedTable === t ? '#1976d2' : '#333',
                      bgcolor: selectedTable === t ? '#e3f2fd' : '#f8fafc',
                      border: selectedTable === t ? '2px solid #90caf9' : '1.5px solid #e0e0e0',
                      boxShadow: selectedTable === t ? '0 2px 8px #e3f2fd' : 'none',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#e3f2fd', color: '#1976d2', border: '2px solid #90caf9' },
                    }}>
                      <ListItemText primary={t} sx={{ fontSize: '18px', color: 'inherit' }} />
                    </ListItemButton>
                  </ListItem>
                ))}
            </List>
          </Box>
        </Drawer>
        <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {/* User instruction banner */}
                <Box sx={{ width: '100%', maxWidth: 700, bgcolor: '#e3f2fd', p: 2.5, borderRadius: 2, boxShadow: 1, mb: 3, mt: 2, textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color="#1976d2" mb={1}>
                    Welcome to SQL Runner!
                  </Typography>
                  <Typography variant="body1" color="#333" fontSize={16}>
                    <b>Tip:</b> Click any table name in the sidebar to preview its columns and sample data.<br/>
                    Type your SQL query above and click <b>Run Query</b> to see results below.<br/>
                    Your recent queries and profile options are on the right.
                  </Typography>
                </Box>
          <Box sx={{ width: '100%', mb: 2, ml: 4 }}>
            <Typography variant="h6" fontWeight={700} fontSize={20} color="#222">Welcome, {loggedInUser}</Typography>
          </Box>
          <Paper elevation={3} sx={{ width: '100%', maxWidth: 700, p: 3, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', mb: 3 }}>
            <form onSubmit={handleRunQuery} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TextField multiline minRows={4} maxRows={8} label="Type your SQL query here" value={query} onChange={e => setQuery(e.target.value)} required fullWidth variant="outlined" sx={{ fontSize: '16px', bgcolor: '#f5f6fa', borderRadius: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary" type="submit" disabled={loading} sx={{ fontWeight: 600, px: 4, py: 1.5, fontSize: '16px', borderRadius: 2, boxShadow: 1, '&:hover': { bgcolor: '#1976d2' } }}>{loading ? "Running..." : "Run Query"}</Button>
              </Box>
            </form>
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            {loading && <Typography sx={{ mt: 2 }}>Loading...</Typography>}
          </Paper>
          {Array.isArray(result) && result.length > 0 && (
            <TableContainer component={Paper} sx={{
              width: '100%',
              maxWidth: 900,
              overflowX: 'auto',
              ml: 6,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              borderRadius: 3,
              p: 2,
            }}>
              <Table size="small" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f6fa' }}>
                    {Object.keys(result[0]).map((col) => (
                      <TableCell key={col} sx={{ fontWeight: 700, fontSize: '16px', color: '#1976d2', py: 2 }}>{col}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.map((row, i) => (
                    <TableRow key={i} sx={{
                      transition: 'background 0.2s',
                      '&:hover': { backgroundColor: '#e3f2fd' },
                    }}>
                      {Object.keys(row).map((col) => (
                        <TableCell key={col} sx={{ fontSize: '15px', py: 1.5 }}>{row[col]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {Array.isArray(result) && result.length === 0 && (
            <Paper elevation={1} sx={{ width: '100%', maxWidth: 700, p: 3, textAlign: 'center' }}>No results.</Paper>)}
          {result && !Array.isArray(result) && 'error' in result && (
            <Paper elevation={1} sx={{ width: '100%', maxWidth: 700, p: 3, textAlign: 'center', bgcolor: '#ffeaea' }}><Typography color="error">{(result as { error: string }).error}</Typography></Paper>)}
        </Box>
        <Drawer anchor="right" variant="permanent" PaperProps={{ sx: { width: 280, bgcolor: '#fff', boxShadow: 2 } }}>
          <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 3, justifyContent: 'flex-start' }}>
            {/* Profile and Logout options at the top for better UI */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<PersonIcon />}
                onClick={() => {
                  setShowProfile(true);
                  fetchUserProfile();
                }}
                sx={{ fontWeight: 600, bgcolor: '#f5f6fa', borderRadius: 2, boxShadow: 1, mb: 1 }}
              >
                Profile
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                size="small"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ fontWeight: 600, bgcolor: '#f5f6fa', borderRadius: 2, boxShadow: 1 }}
              >
                Logout
              </Button>
            </Box>
            {/* Move Recent Queries dropdown lower */}
            <Box sx={{ mt: 4 }}>
              <Button fullWidth variant="outlined" onClick={() => setShowRecent((v) => !v)} endIcon={showRecent ? <ExpandLessIcon /> : <ExpandMoreIcon />}>Recent Queries</Button>
              <Collapse in={showRecent} sx={{ flex: 1, overflow: 'auto', mt: 2 }}>
                {recentQueries.length > 0 ? (
                  <Paper elevation={0} sx={{ p: 1 }}>
                    {recentQueries.slice(-10).reverse().map((q: any, i: number) => (
                      <Paper key={i} elevation={0} sx={{ p: 1, mb: 1, bgcolor: '#f0f0f0', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ wordBreak: 'break-all', display: 'block' }}>{q.query}</Typography>
                      </Paper>
                    ))}
                  </Paper>
                ) : (
                  <Typography variant="body2" sx={{ mt: 2 }}>No recent queries</Typography>
                )}
              </Collapse>
            </Box>
          </Box>
        </Drawer>
      </Box>

      {showTableModal && tableInfo && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: '#fafafa',
          borderRadius: '6px',
          padding: '28px',
          maxWidth: '85%',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          border: '1px solid #ddd',
        }}>
          <button
            onClick={() => {
              setShowTableModal(false);
              setSelectedTable("");
              setTableInfo(null);
            }}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '28px',
              height: '28px',
              border: '1px solid #ccc',
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              color: '#666',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e74c3c';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = '#e74c3c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.color = '#666';
              e.currentTarget.style.borderColor = '#ccc';
            }}
          >
            ×
          </button>

          <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px', fontWeight: '700', paddingRight: '40px', color: '#333' }}>
            {selectedTable}
          </h2>

          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#555', letterSpacing: '0.5px' }}>
            COLUMNS
          </h3>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '32px',
            fontSize: '13px',
            border: '1px solid #ddd',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{
                  padding: '10px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  borderBottom: '2px solid #999',
                  color: '#333',
                }}>
                  Name
                </th>
                <th style={{
                  padding: '10px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  borderBottom: '2px solid #999',
                  color: '#333',
                }}>
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {tableInfo.columns.map((col, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #e0e0e0',
                    color: '#333',
                    fontWeight: '500',
                  }}>
                    {col.name}
                  </td>
                  <td style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #e0e0e0',
                    color: '#666',
                  }}>
                    {col.type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#555', letterSpacing: '0.5px' }}>
            SAMPLE DATA
          </h3>
          <div style={{ overflowX: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              backgroundColor: '#fff',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  {tableInfo.columns.map((col) => (
                    <th key={col.name} style={{
                      padding: '10px 12px',
                      textAlign: 'left',
                      fontWeight: '600',
                      borderBottom: '2px solid #999',
                      color: '#333',
                      whiteSpace: 'nowrap',
                    }}>
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableInfo.sample_data.map((row, rowIdx) => (
                  <tr key={rowIdx} style={{ backgroundColor: rowIdx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    {tableInfo.columns.map((col) => (
                      <td key={col.name} style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid #e0e0e0',
                        color: '#333',
                      }}>
                        {row[col.name]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      <Dialog open={showProfile} onClose={() => setShowProfile(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>User Profile</DialogTitle>
        <DialogContent>
          {userProfile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Username</Typography>
                <Typography variant="body1" fontWeight={500}>{userProfile.username}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Member Since</Typography>
                <Typography variant="body1">{new Date(userProfile.created_at).toLocaleDateString()}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total Queries Executed</Typography>
                <Typography variant="body1" fontWeight={500}>{userProfile.total_queries}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Last Login</Typography>
                <Typography variant="body1">{new Date(userProfile.last_login).toLocaleString()}</Typography>
              </Box>
            </Box>
          ) : (
            <Typography>Loading profile...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProfile(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}