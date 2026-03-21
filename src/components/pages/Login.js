import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('https://hrm-backend-iybp.onrender.com/api/login', {
                email: email,
                password: password
            });

            if (response.data.status === 200) {
                localStorage.setItem('auth_token', response.data.access_token);
                localStorage.setItem('user_info', JSON.stringify(response.data.user));
                onLoginSuccess(response.data.user);
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message);
            } else {
                setError("Không thể kết nối đến Server.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    //  STYLES
    const styles = {
        container: {
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: "'Inter', 'Segoe UI', sans-serif", padding: '20px',
        },
        card: {
            background: 'white', width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', textAlign: 'center',
        },
        logo: { fontSize: '40px', marginBottom: '20px', },
        title: { fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '8px', },
        subtitle: {
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '30px',
        },
        inputGroup: {
            marginBottom: '20px',
            textAlign: 'left',
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '15px',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
            color: '#1f2937',
        },
        button: {
            width: '100%',
            padding: '12px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginTop: '10px',
            transition: 'background 0.2s',
        },
        error: {
            background: '#fef2f2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
            border: '1px solid #fecaca',
            textAlign: 'left',
        },
        footer: {
            marginTop: '24px',
            fontSize: '14px',
            color: '#6b7280',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                {/* Header */}
                <h2 style={styles.title}>Đăng nhập hệ thống</h2>
                <p style={styles.subtitle}>Chào mừng trở lại! Vui lòng nhập thông tin.</p>

                {/* Thông báo lỗi */}
                {error && <div style={styles.error}>⚠️ {error}</div>}

                {/* Form */}
                <form onSubmit={handleLogin}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            placeholder="abc@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#2563eb';
                                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#d1d5db';
                                e.target.style.boxShadow = 'none';
                            }}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Mật khẩu</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#2563eb';
                                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#d1d5db';
                                e.target.style.boxShadow = 'none';
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={isLoading}
                        onMouseOver={(e) => !isLoading && (e.target.style.background = '#1d4ed8')}
                        onMouseOut={(e) => !isLoading && (e.target.style.background = '#2563eb')}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>

                <div style={styles.footer}>
                    Chưa có tài khoản? <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}>Liên hệ </span>
                </div>
            </div>
        </div>
    );
};

export default Login;