import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://hrm-backend-iybp.onrender.com';

const EmployeeEditForm = ({ employeeId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        department_id: '',
        salary_level_id: '',
        phone_number: '',
        address: '',
        date_of_birth: '',
        password: ''
    });

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}` };

            try {
                try {
                    const deptRes = await axios.get(`${BASE_URL}/api/departments`, { headers });
                    setDepartments(deptRes.data);
                } catch (deptErr) {
                    console.error("Lỗi không lấy được danh sách phòng ban:", deptErr);
                }

                if (employeeId) {
                    const res = await axios.get(`${BASE_URL}/api/employees/${employeeId}`, { headers });
                    const emp = res.data;

                    setFormData({
                        name: emp.name || '',
                        email: emp.email || '',
                        role: emp.role || 'Employee',
                        department_id: emp.department_id || (emp.department ? emp.department.id : ''),
                        salary_level_id: emp.salary_level_id || '',
                        phone_number: emp.phone_number || '',
                        address: emp.address || '',
                        date_of_birth: emp.date_of_birth || '',
                        password: ''
                    });
                }
            } catch (error) {
                console.error("Lỗi tải thông tin:", error);
                alert("Không thể tải thông tin nhân viên này!");
                onCancel();
            }
        };

        loadData();
    }, [employeeId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('auth_token');

        // Loại bỏ password nếu rỗng để không bị ghi đè thành chuỗi rỗng
        const dataToSend = { ...formData };
        if (!dataToSend.password) delete dataToSend.password;

        try {
            await axios.put(`${BASE_URL}/api/employees/${employeeId}`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Cập nhật hồ sơ thành công!");
            onSuccess();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Lỗi cập nhật";
            alert("❌ Lỗi: " + msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#2d3748', marginTop: 0, borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
                ✏️ Cập Nhật Hồ Sơ Nhân Viên
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: '1 / -1' }}><h4 style={{ margin: '10px 0 5px', color: '#718096' }}>Thông tin tài khoản</h4></div>

                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Họ tên <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text" required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="email" required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mật khẩu mới</label>
                    <input
                        type="password"
                        placeholder="Để trống nếu giữ nguyên"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        style={{ ...inputStyle, background: '#f7fafc' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Chức vụ</label>
                    <select
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        style={inputStyle}
                    >
                        <option value="Employee">Nhân viên (Employee)</option>
                        <option value="HR">Quản lý (HR)</option>
                    </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>🏢 Phòng ban</label>
                    <select
                        value={formData.department_id}
                        onChange={e => setFormData({ ...formData, department_id: e.target.value })}
                        style={inputStyle}
                    >
                        <option value="">-- Chọn phòng ban --</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>📈 Bậc lương</label>
                    <select
                        name="salary_level_id"
                        value={formData.salary_level_id} // Khớp với state đã khai báo
                        onChange={e => setFormData({ ...formData, salary_level_id: e.target.value })}
                        style={inputStyle}
                    >
                        <option value="">-- Chọn bậc lương --</option>
                        <option value="1">Fresher</option>
                        <option value="2">Junior</option>
                        <option value="3">Senior</option>
                    </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}><h4 style={{ margin: '10px 0 5px', color: '#718096', borderTop: '1px dashed #e2e8f0', paddingTop: '15px' }}>Thông tin cá nhân</h4></div>

                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Số điện thoại</label>
                    <input
                        type="text"
                        value={formData.phone_number}
                        onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Ngày sinh</label>
                    <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Địa chỉ</label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                {/* Nút bấm */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="button" onClick={onCancel} style={btnCancelStyle}>Hủy bỏ</button>
                    <button type="submit" disabled={loading} style={btnSubmitStyle}>
                        {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', boxSizing: 'border-box' };
const btnCancelStyle = { padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#4a5568' };
const btnSubmitStyle = { padding: '10px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };

export default EmployeeEditForm;