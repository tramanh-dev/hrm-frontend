import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://hrm-backend-iybp.onrender.com';

// --- STYLES ---
const containerStyle = { maxWidth: '100%', margin: '0' };
const cardStyle = {
    background: '#fff', padding: '30px', borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '100%', margin: '20px 0'
};

const inputGroupStyle = { marginBottom: '15px' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' };
const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '5px',
    border: '1px solid #cbd5e0', fontSize: '16px', boxSizing: 'border-box'
};

function LeaveForm({ onBack }) {
    const [formData, setFormData] = useState({
        reason: '',
        start_date: '',
        end_date: '',
        leave_type: 'Nghỉ phép năm' 
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [viewMode, setViewMode] = useState('history');
    const [leaves, setLeaves] = useState([]);

    // 1. Tải lịch sử đơn xin nghỉ
    const fetchLeaves = async () => {
        const token = localStorage.getItem('auth_token');
        setLoading(true);
        setMessage(null);
        try {
            const res = await axios.get(`${BASE_URL}/api/leaves`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaves(res.data);
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
            setMessage({ type: 'error', text: '❌ Lỗi tải lịch sử đơn xin nghỉ.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'history') {
            fetchLeaves();
        }
    }, [viewMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('auth_token');

        try {
            // Gửi formData bao gồm cả leave_type
            await axios.post(`${BASE_URL}/api/leaves`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: '✅ Gửi đơn xin nghỉ thành công!' });
            setFormData({ reason: '', start_date: '', end_date: '', leave_type: 'Nghỉ phép năm' });
            setViewMode('history');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Lỗi khi gửi đơn.';
            setMessage({ type: 'error', text: `❌ ${errorMsg}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            {viewMode === 'form' && (
                <div style={cardStyle}>
                    <button
                        onClick={() => setViewMode('history')}
                        style={{
                            padding: '6px 12px', background: '#edf2f7', color: '#4a5568',
                            border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px', fontSize: '13px'
                        }}
                    >
                        ← Hủy & Quay lại
                    </button>

                    <h2 style={{ textAlign: 'center', color: '#2d3748', marginBottom: '20px' }}>📝 Tạo Đơn Xin Nghỉ</h2>

                    {message && (
                        <div style={{
                            padding: '10px', marginBottom: '15px', borderRadius: '5px',
                            background: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
                            color: message.type === 'success' ? '#22543d' : '#822727'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Loại nghỉ phép (Ảnh hưởng đến lương):</label>
                            <select
                                name="leave_type"
                                value={formData.leave_type}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="Nghỉ phép năm">Nghỉ phép năm (Có lương)</option>
                                {/* <option value="Nghỉ lễ">Nghỉ lễ (Có lương)</option>
                                <option value="Nghỉ phép">Nghỉ phép có lương</option> */}
                                {/* <option value="Nghỉ không lương">Nghỉ không lương</option> */}
                                <option value="Nghỉ ốm">Nghỉ ốm</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Từ ngày:</label>
                                <input type="date" name="start_date" required value={formData.start_date} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Đến ngày:</label>
                                <input type="date" name="end_date" required value={formData.end_date} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Lý do chi tiết:</label>
                            <textarea
                                name="reason"
                                required
                                rows="4"
                                placeholder="Nhập lý do xin nghỉ..."
                                value={formData.reason}
                                onChange={handleChange}
                                style={{ ...inputStyle, fontFamily: 'inherit' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '12px', background: '#3182ce', color: 'white',
                                border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Đang gửi...' : 'Xác nhận gửi đơn'}
                        </button>
                    </form>
                </div>
            )}

            {viewMode === 'history' && (
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ color: '#2d3748', margin: 0 }}>🗓️ Lịch Sử Nghỉ Phép</h2>
                        <button
                            onClick={() => { setViewMode('form'); setMessage(null); }}
                            style={btnPrimaryStyle}
                        >
                            ➕ Tạo Đơn Mới
                        </button>
                    </div>

                    {loading && leaves.length === 0 ? (
                        <p style={{ textAlign: 'center' }}>Đang tải...</p>
                    ) : leaves.length === 0 ? (
                        <p style={{ color: '#718096', textAlign: 'center' }}>Bạn chưa có đơn xin nghỉ nào.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {leaves.map((leave) => (
                                <LeaveHistoryItem key={leave.id} leave={leave} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Component hiển thị từng dòng lịch sử
const LeaveHistoryItem = ({ leave }) => {
    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { text: 'Chờ duyệt', color: '#ed8936', bg: '#fffaf0' };
            case 'approved': return { text: 'Đã duyệt', color: '#38a169', bg: '#f0fff4' };
            case 'rejected': return { text: 'Từ chối', color: '#e53e3e', bg: '#fff5f5' };
            default: return { text: 'Không rõ', color: '#718096', bg: '#f7fafc' };
        }
    };

    const status = getStatusStyle(leave.status);

    return (
        <div style={{
            padding: '15px', borderRadius: '8px', border: `1px solid ${status.bg}`, background: status.bg,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
            <div style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: 'bold', color: '#2d3748', marginBottom: '5px' }}>
                    {leave.leave_type} - {leave.duration_days} ngày
                </div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>
                    Từ: {new Date(leave.start_date).toLocaleDateString('vi-VN')} → {new Date(leave.end_date).toLocaleDateString('vi-VN')}
                </div>
                <small style={{ color: '#718096' }}>Lý do: {leave.reason}</small>
            </div>
            <div style={{ textAlign: 'right' }}>
                <span style={{
                    padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                    background: status.color, color: 'white', display: 'inline-block'
                }}>
                    {status.text}
                </span>
                {leave.admin_comment && (
                    <div style={{ fontSize: '11px', color: '#e53e3e', marginTop: '5px', maxWidth: '150px' }}>
                        💬: {leave.admin_comment}
                    </div>
                )}
            </div>
        </div>
    );
};

const btnPrimaryStyle = {
    padding: '8px 15px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
};

export default LeaveForm;