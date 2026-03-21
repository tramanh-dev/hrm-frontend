import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://hrm-backend-iybp.onrender.com';

function TaskManagement() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    // Modal Trạng thái
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '' });

    // Modal Phân công & File
    const [assignTask, setAssignTask] = useState(null);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [newFile, setNewFile] = useState(null);
    const [filesToDelete, setFilesToDelete] = useState([]);

    // --- STYLES ---
    const gridContainerStyle = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' };
    const cardStyle = {
        background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        borderTop: '4px solid #ed8936', minHeight: '180px', position: 'relative'
    };

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get(`${BASE_URL}/api/tasks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
        } catch (error) { console.error("Lỗi tải tasks:", error); } finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get(`${BASE_URL}/api/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (error) { console.error("Lỗi tải users:", error); }
    };

    // --- TẠO MỚI TASK ---
    const handleCreateTask = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('auth_token');
        const formData = new FormData();
        formData.append('title', newTask.title);
        formData.append('description', newTask.description || '');
        if (selectedFile) formData.append('attachment', selectedFile);

        try {
            const res = await axios.post(`${BASE_URL}/api/tasks`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setTasks([res.data, ...tasks]);
            setShowCreateModal(false);
            setNewTask({ title: '', description: '' });
            setSelectedFile(null);
            alert("Đã tạo task thành công!");
        } catch (error) { alert("Lỗi tạo task."); }
    };

    // --- GHIM TASK ---
    const handleTogglePin = async (taskId) => {
        const token = localStorage.getItem('auth_token');
        try {
            await axios.put(`${BASE_URL}/api/tasks/${taskId}/pin`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTasks();
        } catch (e) { console.error("Lỗi ghim:", e); }
    };

    // --- MỞ MODAL PHÂN CÔNG ---
    const openAssignModal = (task) => {
        setAssignTask(task);
        const currentAssigneeIds = task.assignees ? task.assignees.map(u => u.id) : [];
        setSelectedUserIds(currentAssigneeIds);
        setDueDate(task.due_date || '');

        // Reset state file khi mở modal mới
        setNewFile(null);
        setFilesToDelete([]);
    };

    const handleCheckboxChange = (userId) => {
        setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    // --- LƯU THAY ĐỔI (PHÂN CÔNG + FILE) ---
    const handleSaveAssignment = async () => {
        if (!assignTask) return;
        const token = localStorage.getItem('auth_token');
        const formData = new FormData();

        formData.append('due_date', dueDate || '');

        selectedUserIds.forEach(id => formData.append('user_ids[]', id));
        filesToDelete.forEach(path => formData.append('delete_files[]', path));

        if (newFile) {
            formData.append('attachment', newFile);
        }

        try {
            const res = await axios.post(`${BASE_URL}/api/tasks/${assignTask.id}/assign`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            const updatedTasks = tasks.map(t => t.id === assignTask.id ? res.data : t);
            setTasks(updatedTasks);
            alert("Đã cập nhật thành công!");
            setAssignTask(null);
        } catch (error) {
            console.error("Lỗi lưu dữ liệu:", error);
            alert("Lỗi khi lưu. Kiểm tra lại Backend bà nhé!");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ color: '#2d3748', margin: 0 }}>📦 Kho Công Việc</h2>
                    <p style={{ color: '#718096', fontSize: '14px', marginTop: '5px' }}>Quản lý và phân công nhiều nhân viên.</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} style={{ padding: '10px 20px', background: '#ed8936', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ➕ Tạo Công Việc
                </button>
            </div>

            {/* Grid Tasks */}
            {loading ? <p>Đang tải...</p> : (
                <div style={gridContainerStyle}>
                    {tasks.map(task => (
                        <div key={task.id} style={cardStyle}>
                            <div onClick={() => handleTogglePin(task.id)} style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px', opacity: task.is_pinned ? 1 : 0.2, cursor: 'pointer', transition: 'opacity 0.3s' }}>
                                📌
                            </div>

                            <div>
                                <h3 style={{ fontSize: '16px', color: '#2d3748', margin: '0 0 10px 0', paddingRight: '20px' }}>{task.title}</h3>
                                {task.attachment_path && (
                                    <div style={{ fontSize: '12px', marginBottom: '10px', color: '#38a169', fontWeight: 'bold' }}>
                                        📎 Có tài liệu đính kèm
                                    </div>
                                )}
                                <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 15px 0', height: '50px', overflow: 'hidden' }}>{task.description || 'Không có mô tả'}</p>
                            </div>

                            <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '15px', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                        {task.assignees?.map(u => (
                                            <span key={u.id} style={{ background: '#c6f6d5', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', color: '#22543d' }}>{u.name}</span>
                                        ))}
                                        {(!task.assignees || task.assignees.length === 0) && <span style={{ color: '#e53e3e', fontSize: '11px' }}>Chưa giao ai</span>}
                                    </div>
                                    <button onClick={() => openAssignModal(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✏️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL TẠO MỚI */}
            {showCreateModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3>Thêm Việc Mới</h3>
                        <form onSubmit={handleCreateTask}>
                            <input type="text" placeholder="Tên công việc" required style={inputStyle} value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                            <textarea placeholder="Mô tả" style={inputStyle} value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                            <label style={labelStyle}>📁 Gửi kèm tài liệu:</label>
                            <input type="file" onChange={e => setSelectedFile(e.target.files[0])} style={{ marginBottom: '20px' }} />
                            <div style={btnGroupStyle}>
                                <button type="button" onClick={() => setShowCreateModal(false)}>Hủy</button>
                                <button type="submit" style={{ background: '#ed8936', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>Tạo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL PHÂN CÔNG  */}
            {assignTask && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalContentStyle, width: '400px' }}>
                        <h3 style={{ marginTop: 0 }}>Phân công: {assignTask.title}</h3>

                        {/* KHU VỰC QUẢN LÝ TÀI LIỆU  */}
                        <div style={{ marginBottom: '15px', padding: '12px', background: '#f0f7ff', borderRadius: '6px', border: '1px dashed #3182ce' }}>
                            <label style={{ ...labelStyle, color: '#2c5282' }}>📁 Tài liệu hướng dẫn:</label>

                            <div style={{ marginBottom: '10px' }}>
                                {assignTask.attachment_path && (Array.isArray(assignTask.attachment_path) ? assignTask.attachment_path : [assignTask.attachment_path]).map((path, idx) => (
                                    !filesToDelete.includes(path) && (
                                        <div key={idx} style={fileItemStyle}>
                                            <span style={{ fontSize: '12px' }}>📄 {path.split('/').pop()}</span>
                                            <button
                                                type="button"
                                                onClick={() => setFilesToDelete([...filesToDelete, path])}
                                                style={deleteXStyle}
                                            >✕</button>
                                        </div>
                                    )
                                ))}
                            </div>

                            <input type="file" onChange={(e) => setNewFile(e.target.files[0])} style={{ width: '100%', fontSize: '12px' }} />
                            <p style={{ fontSize: '10px', color: '#718096', marginTop: '5px' }}>* Bấm (✕) để xoá file cũ hoặc chọn file mới để bổ sung.</p>
                        </div>

                        <label style={labelStyle}>📅 Hạn chót:</label>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />

                        <label style={labelStyle}>👥 Chọn nhân viên:</label>
                        <div style={userListStyle}>
                            {users.map(user => (
                                <div key={user.id} style={{ display: 'flex', alignItems: 'center', padding: '5px 0' }}>
                                    <input type="checkbox" id={`user-${user.id}`} checked={selectedUserIds.includes(user.id)} onChange={() => handleCheckboxChange(user.id)} />
                                    <label htmlFor={`user-${user.id}`} style={{ marginLeft: '10px', fontSize: '14px', cursor: 'pointer' }}>{user.name}</label>
                                </div>
                            ))}
                        </div>

                        <div style={btnGroupStyle}>
                            <button onClick={() => { setAssignTask(null); setNewFile(null); }}>Đóng</button>
                            <button onClick={handleSaveAssignment} style={{ background: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Lưu Thay Đổi</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- CSS Objects ---
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #cbd5e0', borderRadius: '4px' };
const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' };
const btnGroupStyle = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' };
const userListStyle = { maxHeight: '180px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '4px' };
const fileItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '6px 10px', marginBottom: '5px', borderRadius: '4px', border: '1px solid #ddd' };
const deleteXStyle = { color: '#e53e3e', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };

export default TaskManagement;