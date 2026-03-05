import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateTask({ defaultAssigneeId, onSuccess }) {
    const hrInfo = JSON.parse(localStorage.getItem('user_info')) || {};
    const hrId = hrInfo.id;
    const hrName = hrInfo.name;

    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        assigned_to_user_id: defaultAssigneeId || hrId || '',
        due_date: '',
    });

    // --- STATE MỚI: Lưu file ---
    const [attachment, setAttachment] = useState(null);

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                const response = await axios.get('http://127.0.0.1:8000/api/employees', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const employeeList = response.data;
                const hrOption = {
                    id: hrId,
                    name: `${hrName} (Giao cho tôi)`,
                    email: hrInfo.email
                };
                const fullAssigneeList = [hrOption, ...employeeList];
                setEmployees(fullAssigneeList);
                if (!defaultAssigneeId && !taskData.assigned_to_user_id) {
                    setTaskData(prev => ({ ...prev, assigned_to_user_id: hrId }));
                }
            } catch (error) {
                console.error('Lỗi khi tải danh sách nhân viên:', error);
            }
        };
        fetchEmployees();
    }, [defaultAssigneeId, hrId, hrName]);

    const handleChange = (e) => {
        setTaskData({ ...taskData, [e.target.name]: e.target.value });
    };

    // --- Xử lý chọn file ---
    const handleFileChange = (e) => {
        setAttachment(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Đang tạo công việc...');
        const token = localStorage.getItem('auth_token');

        const formData = new FormData();
        formData.append('title', taskData.title);
        formData.append('description', taskData.description || '');
        formData.append('assigned_to_user_id', taskData.assigned_to_user_id);
        formData.append('due_date', taskData.due_date || '');

        if (attachment) {
            formData.append('attachment', attachment); // Khớp với $request->file('attachment') ở Laravel
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/tasks', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' // Bắt buộc khi gửi file
                }
            });

            setMessage("Tạo công việc thành công!");
            setAttachment(null); // Reset file sau khi xong

            if (onSuccess) {
                onSuccess();
            } else {
                setTaskData({
                    title: '',
                    description: '',
                    assigned_to_user_id: defaultAssigneeId || hrId,
                    due_date: ''
                });
            }
        } catch (error) {
            setMessage(`Lỗi: ${error.response?.data?.message || 'Lỗi kết nối server'}`);
        } finally {
            setLoading(false);
        }
    };

    const isEmployeesLoaded = employees.length > 0;

    return (
        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}>
            <p style={{ color: '#6b7280', marginTop: 0 }}>Giao việc từ **{hrName}**</p>

            {message && <p style={{ color: message.startsWith('Lỗi') ? 'red' : 'green', fontWeight: 'bold' }}>{message}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                <label style={{ fontWeight: 'bold', color: '#374151' }}>Tiêu đề Công việc:</label>
                <input type="text" name="title" value={taskData.title} onChange={handleChange} required
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />

                <label style={{ fontWeight: 'bold', color: '#374151' }}>Mô tả:</label>
                <textarea name="description" value={taskData.description} onChange={handleChange} rows="3"
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />

                {/* --- MỤC CHỌN FILE MỚI --- */}
                <label style={{ fontWeight: 'bold', color: '#374151' }}>📎 Đính kèm tài liệu (nếu có):</label>
                <input type="file" onChange={handleFileChange}
                    style={{ fontSize: '14px', color: '#4b5563' }} />

                <label style={{ fontWeight: 'bold', color: '#374151' }}>Giao cho:</label>
                {defaultAssigneeId && defaultAssigneeId !== hrId ? (
                    <input type="text" disabled value={employees.find(e => e.id === defaultAssigneeId)?.name || 'Loading...'}
                        style={{ background: '#e5f3ff', padding: '10px', borderRadius: '6px', border: '1px solid #90cdf4' }} />
                ) : (
                    isEmployeesLoaded ? (
                        <select name="assigned_to_user_id" value={taskData.assigned_to_user_id} onChange={handleChange} required
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    ) : <p>Đang tải danh sách...</p>
                )}

                <label style={{ fontWeight: 'bold', color: '#374151' }}>Thời hạn (Deadline):</label>
                <input type="date" name="due_date" value={taskData.due_date} onChange={handleChange}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />

                <button type="submit" disabled={loading || !isEmployeesLoaded}
                    style={{
                        padding: '12px', background: loading ? '#a0aec0' : '#3182ce',
                        color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
                    }}>
                    {loading ? 'Đang tạo...' : 'Tạo Công Việc'}
                </button>
            </form>
        </div>
    );
}

export default CreateTask;