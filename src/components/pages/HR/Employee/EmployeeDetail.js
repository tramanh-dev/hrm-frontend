import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateTask from '../Task/CreateTask';
import TaskReport from '../Task/TaskReport';

function EmployeeDetail({ employeeId, onBack, defaultAssigneeId }) {
    const [employee, setEmployee] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('tasks');
    const [viewingTask, setViewingTask] = useState(null);

    useEffect(() => {
        fetchEmployeeData();
    }, [employeeId]);

    const fetchEmployeeData = async () => {
        const token = localStorage.getItem('auth_token');
        if (!employeeId) return;

        try {
            setLoading(true);

            const [resTasks, resDetail] = await Promise.all([
                axios.get(`https://hrm-backend-iybp.onrender.com/api/employees/${employeeId}/tasks`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`https://hrm-backend-iybp.onrender.com/api/employees/${employeeId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setTasks(resTasks.data);
            setEmployee(resDetail.data);

        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Đang tải dữ liệu nhân viên...</p>;
    if (!employee) return <p>Không tìm thấy thông tin nhân viên.</p>;

    return (
        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white' }}>
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ color: '#2b6cb0', margin: '0 0 10px 0' }}>
                    {employee.name} <span style={{ fontSize: '14px', color: '#718096', fontWeight: 'normal' }}>(#{employee.id})</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '15px', color: '#4a5568' }}>
                    <div>📧 Email: <strong>{employee.email}</strong></div>
                    <div>🛡️ Vai trò: <strong style={{ color: employee.role === 'HR' ? '#e53e3e' : '#38a169' }}>{employee.role}</strong></div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        🏢 Phòng ban:
                        {employee.department ? (
                            <span style={{ marginLeft: '8px', background: '#ebf8ff', color: '#2c5282', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px' }}>
                                {employee.department.name}
                            </span>
                        ) : (
                            <span style={{ marginLeft: '8px', color: '#a0aec0', fontStyle: 'italic' }}>Chưa phân bổ</span>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
                <button
                    onClick={() => setMode('tasks')}
                    style={menuBtn(mode === 'tasks')}
                >
                    Công việc đã giao ({tasks.length})
                </button>
                <button
                    onClick={() => setMode('create')}
                    style={menuBtn(mode === 'create')}
                >
                    + Giao việc mới
                </button>

                <button onClick={onBack} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', color: '#718096' }}>
                    ❌ Đóng
                </button>
            </div>

            {/* HIỂN THỊ NỘI DUNG */}
            {mode === 'create' ? (
                <CreateTask
                    onSuccess={() => { setMode('tasks'); fetchEmployeeData(); }}
                    defaultAssigneeId={employeeId}
                />
            ) : (
                <div>
                    <h3 style={{ color: '#4a5568', fontSize: '16px' }}>📋 Danh sách công việc:</h3>
                    {tasks.length === 0 ? (
                        <p style={{ color: '#718096', fontStyle: 'italic' }}>Chưa có công việc nào được giao.</p>
                    ) : (
                        <TaskList tasks={tasks} setViewingTask={setViewingTask} />
                    )}
                </div>
            )}

            {viewingTask && <TaskReport task={viewingTask} onClose={() => setViewingTask(null)} />}
        </div>
    );
}

// Component phụ hiển thị danh sách Tasks
const TaskList = ({ tasks, setViewingTask }) => (
    <div style={{ display: 'grid', gap: '10px' }}>
        {tasks.map(task => (
            <div key={task.id} style={{
                padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: '8px',
                background: task.status === 2 ? '#f0fff4' : '#fff',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
                <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#2d3748' }}>{task.title}</h4>
                    <div style={{ fontSize: '13px', color: '#718096' }}>
                        📅 Hạn chót: {task.due_date || 'N/A'}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        padding: '4px 10px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold',
                        background: task.status === 2 ? '#48bb78' : '#ed8936', color: 'white', textTransform: 'uppercase'
                    }}>
                        {task.status === 2 ? 'Đã nộp' : 'Chưa nộp'}
                    </span>
                    {task.status === 2 && (
                        <button
                            onClick={() => setViewingTask(task)}
                            style={{ padding: '6px 12px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}
                        >
                            Xem báo cáo
                        </button>
                    )}
                </div>
            </div>
        ))}
    </div>
);

// Helper style cho menu tab
const menuBtn = (isActive) => ({
    padding: '10px 15px',
    border: 'none',
    background: 'none',
    color: isActive ? '#2b6cb0' : '#718096',
    borderBottom: isActive ? `3px solid #2b6cb0` : '3px solid transparent',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    marginBottom: '-2px',
    outline: 'none'
});

export default EmployeeDetail;