import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://hrm-backend-iybp.onrender.com';

function TaskAssignment() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    // State cho Modal phân công
    const [showModal, setShowModal] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Lấy dữ liệu Tasks và Users
    const fetchInitialData = async () => {
        const token = localStorage.getItem('auth_token');
        setLoading(true);
        try {
            const tasksRes = await axios.get(`${BASE_URL}/api/tasks`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const usersRes = await axios.get(`${BASE_URL}/api/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTasks(tasksRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            alert("Không thể tải danh sách công việc hoặc nhân viên.");
        } finally {
            setLoading(false);
        }
    };

    const openAssignModal = (task) => {
        setCurrentTask(task);
        const existingIds = task.assignees ? task.assignees.map(u => u.id) : [];
        setSelectedUserIds(existingIds);
        setShowModal(true);
    };

    const handleCheckboxChange = (userId) => {
        setSelectedUserIds(prevIds => {
            if (prevIds.includes(userId)) {
                return prevIds.filter(id => id !== userId);
            } else {
                return [...prevIds, userId];
            }
        });
    };

  
    // const handleSaveAssignment = async () => {
    //     const token = localStorage.getItem('auth_token');
    //     try {
    //         // Gọi API assignUsers mà bạn đã viết trong TaskController
    //         await axios.post(`${BASE_URL}/api/tasks/${currentTask.id}/assign`, {
    //             user_ids: selectedUserIds
    //         }, {
    //             headers: { Authorization: `Bearer ${token}` }
    //         });

    //         alert("Đã cập nhật thành công!");
    //         setShowModal(false);
    //         fetchInitialData(); 
    //     } catch (error) {
    //         console.error("Lỗi lưu phân công:", error);
    //         alert("Lỗi khi lưu phân công.");
    //     }
    // };

    if (loading) return <div style={{padding: '20px'}}>Đang tải dữ liệu kho việc...</div>;

    return (
        <div style={{ padding: '20px', background: '#f7fafc', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#2d3748' }}>📦 Phân Công Kho Việc</h2>
                <button 
                    onClick={fetchInitialData} 
                    style={{ padding: '8px 15px', background: '#fff', border: '1px solid #cbd5e0', borderRadius: '5px', cursor: 'pointer' }}
                >
                    🔄 Làm mới
                </button>
            </div>

            {/* BẢNG DANH SÁCH TASK */}
            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#edf2f7', textAlign: 'left' }}>
                        <tr>
                            <th style={thStyle}>Công việc</th>
                            <th style={thStyle}>Hạn chót</th>
                            <th style={thStyle}>Người thực hiện (Assignees)</th>
                            <th style={thStyle}>Trạng thái</th>
                            <th style={thStyle}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 'bold', color: '#2b6cb0' }}>{task.title}</div>
                                    <div style={{ fontSize: '0.85em', color: '#718096' }}>{task.description || 'Không có mô tả'}</div>
                                </td>
                                <td style={tdStyle}>{task.due_date || '-'}</td>
                                <td style={tdStyle}>
                                    {/* Hiển thị danh sách avatar hoặc tên */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {task.assignees && task.assignees.length > 0 ? (
                                            task.assignees.map(u => (
                                                <span key={u.id} style={{
                                                    background: '#ebf8ff', color: '#2b6cb0', 
                                                    padding: '2px 8px', borderRadius: '12px', fontSize: '12px', border: '1px solid #bee3f8'
                                                }}>
                                                    {u.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span style={{ color: '#e53e3e', fontSize: '12px' }}>Chưa giao ai</span>
                                        )}
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                        background: task.status === 2 ? '#c6f6d5' : (task.status === 1 ? '#feebc8' : '#fed7d7'),
                                        color: task.status === 2 ? '#22543d' : (task.status === 1 ? '#744210' : '#822727')
                                    }}>
                                        {task.status === 2 ? 'Hoàn thành' : (task.status === 1 ? 'Đang làm' : 'Chưa nhận')}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <button 
                                        onClick={() => openAssignModal(task)}
                                        style={{
                                            background: '#3182ce', color: 'white', border: 'none', 
                                            padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
                                        }}
                                    >
                                        👥 Phân công
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL PHÂN CÔNG (Multi-select) */}
            {showModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ marginTop: 0 }}>Chọn người làm: "{currentTask?.title}"</h3>
                        <p style={{ fontSize: '13px', color: '#718096', marginBottom: '15px' }}>
                            Tích chọn vào các nhân viên bạn muốn giao việc này.
                        </p>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '10px' }}>
                            {users.map(user => (
                                <label key={user.id} style={{ display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedUserIds.includes(user.id)}
                                        onChange={() => handleCheckboxChange(user.id)}
                                        style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: '500' }}>{user.name}</div>
                                        <div style={{ fontSize: '12px', color: '#718096' }}>{user.email} - {user.role || 'Staff'}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                        
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid #cbd5e0', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                                Hủy
                            </button>
                            <button onClick={handleSaveAssignment} style={{ padding: '8px 16px', background: '#38a169', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Lưu Phân Công ({selectedUserIds.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- CSS Styles ---
const thStyle = { padding: '12px 15px', color: '#4a5568', fontWeight: '600', borderBottom: '2px solid #e2e8f0' };
const tdStyle = { padding: '12px 15px', color: '#2d3748', verticalAlign: 'middle' };
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalContentStyle = {
    background: 'white', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '500px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

export default TaskAssignment;