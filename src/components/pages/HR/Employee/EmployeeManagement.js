import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeCreateForm from './EmployeeCreateForm';
import EmployeeEditForm from './EmployeeEditForm';
import EmployeeDetail from './EmployeeDetail';
const BASE_URL = 'https://hrm-backend-iybp.onrender.com';

function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [selectedEmpId, setSelectedEmpId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (viewMode === 'list') fetchEmployees();
    }, [viewMode]);

    const fetchEmployees = async () => {
        const token = localStorage.getItem('auth_token');
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/api/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedEmpId(null);
        fetchEmployees();
    };

    const handleDeleteEmployee = async (id) => {
        if (window.confirm("⚠️ Cảnh báo: Bạn có chắc chắn muốn xóa nhân viên này?")) {
            const token = localStorage.getItem('auth_token');
            try {
                await axios.delete(`${BASE_URL}/api/employees/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("✅ Đã xóa thành công!");
                fetchEmployees();
            } catch (e) {
                alert("❌ Lỗi: Không thể xóa nhân viên này.");
            }
        }
    };


    const removeAccents = (str) => {
        if (!str) return "";
        return str.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d").replace(/Đ/g, "D")
            .toLowerCase();
    };

    const filteredEmployees = employees.filter(emp => {
        const term = removeAccents(searchTerm);
        const name = emp.name ? removeAccents(emp.name) : '';
        const email = emp.email ? removeAccents(emp.email) : '';
        return name.includes(term) || email.includes(term);
    });

    return (
        <div className="page-content-container">
            {/* Header */}
            <div className="actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="section-heading" style={{ margin: 0, color: '#2d3748' }}>
                    {viewMode === 'list' && '👥 Quản Lý Nhân Viên'}
                    {viewMode === 'create' && 'Tạo Nhân Viên Mới'}
                    {viewMode === 'edit' && 'Cập Nhật Nhân Viên'}
                    {viewMode === 'detail' && 'Chi Tiết Nhân Viên'}
                </h2>

                {/* Nút điều hướng */}
                {viewMode === 'list' ? (
                    <button
                        onClick={() => setViewMode('create')}
                        style={{ padding: '10px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        + Thêm Mới
                    </button>
                ) : (
                    <button
                        onClick={handleBackToList}
                        style={{ padding: '8px 16px', background: '#718096', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        ← Quay lại
                    </button>
                )}
            </div>

            {viewMode === 'create' && (
                <div className="card form-container">
                    <EmployeeCreateForm onSuccess={handleBackToList} onCancel={handleBackToList} />
                </div>
            )}

            {viewMode === 'edit' && (
                <div className="card form-container">
                    <EmployeeEditForm
                        employeeId={selectedEmpId}
                        onSuccess={() => { alert("Cập nhật thành công!"); handleBackToList(); }}
                        onCancel={handleBackToList}
                    />
                </div>
            )}

            {viewMode === 'detail' && (
                <div className="card form-container">
                    <EmployeeDetail
                        employeeId={selectedEmpId}
                        onBack={handleBackToList}
                    />
                </div>
            )}

            {viewMode === 'list' && (
                <div className="table-content-area">
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="text" placeholder="🔍 Tìm kiếm nhân viên ..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none' }}
                        />
                    </div>

                    {loading ? <p>Đang tải dữ liệu...</p> : (
                        <div className="table-wrapper" style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#2c5282', color: 'white', textAlign: 'left' }}>
                                        <th style={{ padding: '15px' }}>ID</th>
                                        <th style={{ padding: '15px' }}>Nhân viên</th>
                                        <th style={{ padding: '15px' }}>Phòng ban</th>
                                        <th style={{ padding: '15px' }}>Quyền</th>
                                        <th style={{ padding: '15px', textAlign: 'center' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map(emp => (
                                        <tr key={emp.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '15px', color: '#718096' }}>#{emp.id}</td>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ fontWeight: 'bold', color: '#2d3748' }}>{emp.name}</div>
                                                <div style={{ fontSize: '13px', color: '#718096' }}>{emp.email}</div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                {emp.department ?
                                                    <span style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{emp.department.name}</span>
                                                    : <span style={{ color: '#ccc' }}>--</span>
                                                }
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{
                                                    background: emp.role === 'HR' ? '#fed7d7' : '#c6f6d5',
                                                    color: emp.role === 'HR' ? '#c53030' : '#2f855a',
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                                                }}>
                                                    {emp.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                    {/* 👇 NÚT XEM CHI TIẾT ĐÂY RỒI 👇 */}
                                                    <button
                                                        onClick={() => { setSelectedEmpId(emp.id); setViewMode('detail'); }}
                                                        style={{ background: '#e6fffa', color: '#2c7a7b', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                                        title="Xem chi tiết & Giao việc"
                                                    >
                                                        👁️
                                                    </button>

                                                    <button
                                                        onClick={() => { setSelectedEmpId(emp.id); setViewMode('edit'); }}
                                                        style={{ background: '#edf2f7', color: '#2b6cb0', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                                        title="Sửa thông tin"
                                                    >
                                                        ✍️
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteEmployee(emp.id)}
                                                        style={{ background: '#fff5f5', color: '#e53e3e', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                                        title="Xóa nhân viên"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default EmployeeManagement;