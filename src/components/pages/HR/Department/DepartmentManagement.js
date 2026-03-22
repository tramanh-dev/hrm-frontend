import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    // State cho Form Modal
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null); // Nếu null là Thêm, có ID là Sửa
    const [formData, setFormData] = useState({ name: '', description: '' });

    // 1. Lấy danh sách
    const fetchDepartments = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            setLoading(true);
            const res = await axios.get('https://hrm-backend-iybp.onrender.com/api/departments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(res.data);
        } catch (error) {
            console.error("Lỗi tải phòng ban:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleCreate = () => {
        setEditingId(null);
        setFormData({ name: '', description: '' });
        setShowForm(true);
    };

    const handleEdit = (dept) => {
        setEditingId(dept.id);
        setFormData({ name: dept.name, description: dept.description });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return alert("Tên phòng ban không được để trống!");

        const token = localStorage.getItem('auth_token');
        try {
            if (editingId) {
                await axios.put(`https://hrm-backend-iybp.onrender.com/api/departments/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Cập nhật thành công!");
            } else {
                await axios.post('https://hrm-backend-iybp.onrender.com/api/departments', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Thêm mới thành công!");
            }
            setShowForm(false);
            fetchDepartments(); // Load lại danh sách
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra, vui lòng thử lại.");
        }
    };

    // 5. Xử lý Xóa
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa phòng ban này không?")) return;

        const token = localStorage.getItem('auth_token');
        try {
            await axios.delete(`https://hrm-backend-iybp.onrender.com/api/departments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Đã xóa thành công!");
            fetchDepartments();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi xóa phòng ban.");
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#2d3748', margin: 0 }}>🏢 Quản lý Phòng Ban</h2>
                <button
                    onClick={handleCreate}
                    style={{ padding: '10px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    ➕ Thêm Mới
                </button>
            </div>

            {/* Bảng Danh Sách */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {loading ? <p style={{ padding: '20px' }}>Đang tải dữ liệu...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#2c5282', color: 'white', textAlign: 'left' }}>
                                <th style={{ padding: '16px' }}>ID</th>
                                <th style={{ padding: '16px' }}>Tên Phòng Ban</th>
                                <th style={{ padding: '16px' }}>Mô tả</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.length > 0 ? departments.map(dept => (
                                <tr key={dept.id} style={{ borderBottom: '1px solid #edf2f7', transition: '0.2s' }}>
                                    <td style={{ padding: '16px', color: '#718096' }}>#{dept.id}</td>
                                    <td style={{ padding: '16px', fontWeight: 'bold', color: '#2b6cb0', fontSize: '15px' }}>{dept.name}</td>
                                    <td style={{ padding: '16px', color: '#4a5568' }}>{dept.description || '-'}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(dept)}
                                            style={{ marginRight: '12px', background: '#ebf8ff', border: 'none', color: '#3182ce', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}
                                        >
                                            ✏️ Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept.id)}
                                            style={{ background: '#fff5f5', border: 'none', color: '#e53e3e', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>
                                        Chưa có phòng ban nào. Hãy thêm mới!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Form (Popup) */}
            {showForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0, color: '#2d3748' }}>
                            {editingId ? '✏️ Cập Nhật Phòng Ban' : '➕ Thêm Phòng Ban Mới'}
                        </h3>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>Tên phòng ban <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                placeholder="Ví dụ: Phòng Kế Toán..."
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>Mô tả</label>
                            <textarea
                                placeholder="Mô tả chức năng nhiệm vụ..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setShowForm(false)}
                                style={{ padding: '10px 20px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSave}
                                style={{ padding: '10px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 4px rgba(49, 130, 206, 0.3)' }}
                            >
                                {editingId ? 'Lưu Thay Đổi' : 'Tạo Mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentManagement;