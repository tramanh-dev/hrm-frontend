import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://hrm-backend-iybp.onrender.com';

const initialFormData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'Employee',
    department_id: '',
    salary_level_id: '',
};
const style = {
    // Containers
    container: { maxWidth: '600px', margin: 'auto' },
    card: { background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    heading: { borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px', color: '#2d3748' },

    // Form Elements
    formRow: { display: 'flex', gap: '20px' },
    formGroup: { marginBottom: '15px', flexGrow: 1 },
    label: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#4a5568' },
    input: { width: '100%', padding: '10px', border: '1px solid #cbd5e0', borderRadius: '5px', fontSize: '15px', boxSizing: 'border-box', transition: 'border-color 0.2s' },
    select: { width: '100%', padding: '10px', border: '1px solid #cbd5e0', borderRadius: '5px', fontSize: '15px', boxSizing: 'border-box', transition: 'border-color 0.2s' },

    // Errors
    inputError: { borderColor: '#e53e3e', boxShadow: '0 0 0 1px #e53e3e' },
    errorText: { display: 'block', color: '#e53e3e', fontSize: '13px', marginTop: '5px' },

    // Buttons
    buttonPrimary: {
        padding: '10px 20px', background: '#3182ce', color: 'white', border: 'none',
        borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s',
        minWidth: '150px'
    },
    buttonSecondary: {
        padding: '10px 20px', background: '#e2e8f0', color: '#4a5568', border: 'none',
        borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s',
        minWidth: '150px'
    }
};

function EmployeeCreateForm({ onSuccess, onCancel }) {
    const [formData, setFormData] = useState(initialFormData);
    const [departments, setDepartments] = useState([]); // <--- THÊM MỚI
    const [loading, setLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState({});

    useEffect(() => {
        const fetchDepartments = async () => {
            const token = localStorage.getItem('auth_token');
            try {
                const res = await axios.get(`${BASE_URL}/api/departments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDepartments(res.data);
            } catch (error) {
                console.error("Lỗi tải danh sách phòng ban:", error.response);
                // Vẫn cho tạo NV, nhưng cảnh báo lỗi tải P.Ban
                alert("Không tải được danh sách Phòng ban. Vui lòng kiểm tra kết nối API.");
            }
        };
        fetchDepartments();
    }, []);

    //  XỬ LÝ API VÀ INPUT

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (serverErrors[e.target.name]) {
            setServerErrors({ ...serverErrors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setServerErrors({});
        const token = localStorage.getItem('auth_token');

        const dataToSend = { ...formData };
        if (dataToSend.department_id === '') {
            delete dataToSend.department_id;
        }

        try {
            await axios.post(`${BASE_URL}/api/employees`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Tạo nhân viên thành công!");
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Lỗi tạo nhân viên:", error.response);
            if (error.response && error.response.data.errors) {
                setServerErrors(error.response.data.errors);
            } else {
                alert("Lỗi không xác định khi tạo nhân viên. Vui lòng kiểm tra console.");
            }
        } finally {
            setLoading(false);
        }
    };

    const getErrorMessage = (field) => {
        if (serverErrors[field]) {
            return <small style={style.errorText}>{serverErrors[field][0]}</small>;
        }
        return null;
    };

    // Hàm tạo input style động (cho cả input và select)
    const getFieldStyle = (fieldName) => ({
        ...(fieldName === 'role' || fieldName === 'department_id' ? style.select : style.input),
        ...(serverErrors[fieldName] ? style.inputError : {})
    });


    return (
        <div style={style.container}>

            <div style={style.card}>
                <h3 style={style.heading}>
                    ➕ Tạo Nhân viên Mới
                </h3>

                <form onSubmit={handleSubmit}>

                    <div style={style.formGroup}>
                        <label style={style.label}>Tên nhân viên:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={getFieldStyle('name')}
                            placeholder="Nhân viên 1"
                            required
                        />
                        {getErrorMessage('name')}
                    </div>

                    <div style={style.formGroup}>
                        <label style={style.label}>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={getFieldStyle('email')}
                            placeholder="employee@gmail.com"
                            required
                        />
                        {getErrorMessage('email')}
                    </div>

                    <div style={style.formRow}>
                        <div style={style.formGroup}>
                            <label style={style.label}>Mật khẩu:</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                style={getFieldStyle('password')}
                                required
                            />
                            {getErrorMessage('password')}
                        </div>

                        <div style={style.formGroup}>
                            <label style={style.label}>Xác nhận Mật khẩu:</label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                style={getFieldStyle('password_confirmation')}
                                required
                            />
                            {getErrorMessage('password_confirmation')}
                        </div>
                    </div>

                    <div style={style.formRow}>
                        <div style={style.formGroup}>
                            <label style={style.label}>Quyền (Role):</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                style={getFieldStyle('role')}
                                required
                            >
                                <option value="Employee">Employee (Nhân viên)</option>
                                <option value="HR">HR (Quản trị Nhân sự)</option>
                            </select>
                            {getErrorMessage('role')}
                        </div>

                        <div style={style.formGroup}>
                            <label style={style.label}>🏢 Phòng ban:</label>
                            <select
                                name="department_id"
                                value={formData.department_id}
                                onChange={handleChange}
                                style={getFieldStyle('department_id')}
                            >
                                <option value="">-- Chọn phòng ban --</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            {getErrorMessage('department_id')}
                        </div>

                        <div style={style.formGroup}>
                            <label style={style.label}>📈 Cấp bậc:</label>
                            <select
                                name="salary_level_id"
                                value={formData.salary_level_id} 
                                onChange={handleChange}
                                style={getFieldStyle('salary_level_id')}
                                required
                            >
                                <option value="">-- Chọn cấp bậc --</option>
                                <option value="1">Fresher</option>
                                <option value="2">Junior</option>
                                <option value="3">Senior</option>
                            </select>
                            {getErrorMessage('salary_level_id')}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
                        <button type="button" onClick={onCancel} style={style.buttonSecondary} disabled={loading}>
                            Hủy bỏ
                        </button>
                        <button type="submit" style={style.buttonPrimary} disabled={loading}>
                            {loading ? 'Đang tạo...' : 'Tạo Nhân Viên'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EmployeeCreateForm;