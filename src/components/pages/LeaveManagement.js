import React, { useState, useEffect } from 'react';
import axios from 'axios';


function LeaveManagement() {
    const [leaves, setLeaves] = useState([]);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ start_date: '', end_date: '', reason: '' });
    const [loading, setLoading] = useState(false);

    const BASE_URL = 'https://hrm-backend-iybp.onrender.com';

    useEffect(() => {
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchLeaves(parsedUser);
        }
    }, []);

    // --- LOGIC LẤY VÀ CẬP NHẬT ĐƠN (Giữ nguyên) ---

    const fetchLeaves = async (currentUser) => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const endpoint = currentUser.role === 'HR' ? '/api/all-leaves' : '/api/my-leaves';

        try {
            const res = await axios.get(`${BASE_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaves(res.data);
        } catch (err) {
            console.error("Lỗi tải danh sách nghỉ phép:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('auth_token');

        try {
            await axios.post(`${BASE_URL}/api/leaves`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Gửi đơn xin nghỉ thành công!");
            setFormData({ start_date: '', end_date: '', reason: '' });
            fetchLeaves(user);
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || "Lỗi kết nối server"));
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, status) => {
        const comment = prompt(status === 'approved' ? "Nhập lời nhắn (Optional):" : "Nhập lý do từ chối (Bắt buộc):");

        if (status === 'rejected' && !comment) {
            return alert("Bạn phải nhập lý do từ chối!");
        }

        const token = localStorage.getItem('auth_token');
        try {
            await axios.put(`${BASE_URL}/api/leaves/${id}/status`,
                { status, admin_comment: comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Đã cập nhật trạng thái đơn!");
            fetchLeaves(user);
        } catch (err) {
            alert("Lỗi cập nhật: " + (err.response?.data?.message || "Lỗi server"));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="badge badge-success">✅ Đã duyệt</span>;
            case 'rejected': return <span className="badge badge-danger">❌ Từ chối</span>;
            default: return <span className="badge badge-warning">⏳ Chờ duyệt</span>;
        }
    };

    if (!user) return <div className="loading-message">Đang tải dữ liệu...</div>;

    return (
        <div className="page-content-container">

            {/* 1. FORM XIN NGHỈ (Cho Nhân viên) */}
            {user.role !== 'HR' && (
                <div className="card form-container">
                    <h3 className="card-title">📝 Tạo đơn xin nghỉ phép</h3>
                    <form onSubmit={handleSubmit} className="form-grid-2-col">
                        <div className="form-group">
                            <label>Từ ngày:</label>
                            <input
                                type="date"
                                className="form-input"
                                required
                                value={formData.start_date}
                                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Đến ngày:</label>
                            <input
                                type="date"
                                className="form-input"
                                required
                                value={formData.end_date}
                                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Lý do nghỉ:</label>
                            <textarea
                                required
                                placeholder="Ví dụ: Em bị ốm / Nhà có việc bận..."
                                className="form-input"
                                value={formData.reason}
                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary full-width"
                        >
                            {loading ? 'Đang gửi đơn...' : 'Gửi Đơn Xin Nghỉ'}
                        </button>
                    </form>
                </div>
            )}

            {/* 2. DANH SÁCH ĐƠN */}
            <h3 className="section-heading">Danh sách đơn nghỉ phép</h3>

            {leaves.length === 0 ? (
                <p className="no-data-message">Chưa có đơn nghỉ phép nào.</p>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                {user.role === 'HR' && <th>Nhân viên</th>}
                                <th>Thời gian nghỉ</th>
                                <th>Lý do</th>
                                <th className="text-center">Trạng thái</th>
                                {user.role === 'HR' && <th className="text-center">Hành động</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map(leave => (
                                <tr key={leave.id}>
                                    <td>#{leave.id}</td>

                                    {user.role === 'HR' && (
                                        <td className="employee-info-cell">
                                            <span className="employee-name">{leave.user?.name}</span>
                                            <small className="employee-email">{leave.user?.email}</small>
                                        </td>
                                    )}

                                    <td>
                                        <div>{leave.start_date}</div>
                                        <div className="date-separator">→</div>
                                        <div>{leave.end_date}</div>
                                    </td>

                                    <td className="reason-cell">
                                        <div className="reason-box">
                                            {leave.reason}
                                        </div>
                                    </td>

                                    <td className="text-center">
                                        {getStatusBadge(leave.status)} <br />
                                        {leave.admin_comment && (
                                            <div className="admin-comment">
                                                "HR: {leave.admin_comment}"
                                            </div>
                                        )}
                                    </td>

                                    {/* NÚT DUYỆT CHO HR */}
                                    {user.role === 'HR' && (
                                        <td className="actions-cell">
                                            {leave.status === 'pending' ? (
                                                <div className="action-buttons-group">
                                                    <button
                                                        onClick={() => handleApprove(leave.id, 'approved')}
                                                        title="Duyệt đơn này"
                                                        className="btn btn-sm btn-approve"
                                                    >
                                                        ✔ Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(leave.id, 'rejected')}
                                                        title="Từ chối đơn này"
                                                        className="btn btn-sm btn-reject"
                                                    >
                                                        ✘ Từ chối
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="status-processed">Đã xử lý</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default LeaveManagement;