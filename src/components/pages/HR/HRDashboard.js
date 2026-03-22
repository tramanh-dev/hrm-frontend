import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell,
    LineChart, Line, PieChart, Pie 
} from 'recharts';


import EmployeeManagement from './Employee/EmployeeManagement';
import DepartmentManagement from './Department/DepartmentManagement';
import TaskManagement from './Task/TaskManagement'; 
import LeaveManagement from '../LeaveManagement';  
import TimesheetManagement from './Timesheet/TimesheetManagement'; 


import LeaveForm from '../Employee/LeaveForm'; 
import Timesheet from '../Employee/Timesheet';
import MyPayslip from '../Employee/MyPayslip';
import Profile from '../Employee/Profile';

const BASE_URL = 'https://hrm-backend-iybp.onrender.com';

function HRDashboard({ user, onLogout, onUpdateUser }) {
    const [currentTab, setCurrentTab] = useState('dashboard');
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const [stats, setStats] = useState({
        user_count: 0, dept_count: 0, pending_tasks: 0, payslip_count: 0, chart_data: []
    });
    const [myTasks, setMyTasks] = useState([]);
    const [weather] = useState({ temp: 30, humidity: 65, desc: 'Nắng nhẹ' });
    
    const today = new Date();
    const dateString = `Thứ ${today.getDay() === 0 ? 'CN' : today.getDay() + 1}, ngày ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

    useEffect(() => {
        if (currentTab === 'dashboard') fetchStats();
        if (currentTab === 'my_tasks') fetchMyTasks();
    }, [currentTab]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get(`${BASE_URL}/api/dashboard-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) { console.error("Lỗi stats:", error); }
    };

    const fetchMyTasks = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get(`${BASE_URL}/api/my-tasks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyTasks(res.data);
        } catch (error) { console.error("Lỗi my-tasks:", error); }
    };

    const renderMenuBtn = (id, icon, label, isPersonal = false) => {
        const isActive = currentTab === id;
        return (
            <button
                onClick={() => setCurrentTab(id)}
                style={{
                    ...menuBtnStyle(isActive, isCollapsed),
                    borderLeft: isActive 
                        ? (isPersonal ? '4px solid #48bb78' : '4px solid #3182ce') 
                        : '4px solid transparent',
                    background: isActive 
                        ? (isPersonal ? '#f0fff4' : '#ebf8ff') 
                        : 'transparent',
                    color: isActive 
                        ? (isPersonal ? '#2f855a' : '#2b6cb0') 
                        : '#a0aec0'
                }}
            >
                <span style={{ fontSize: '20px', minWidth: '30px', textAlign: 'center' }}>{icon}</span>
                {!isCollapsed && <span style={{ marginLeft: '12px', whiteSpace: 'nowrap' }}>{label}</span>}
            </button>
        );
    };

    const DashboardHome = () => (
        <div style={{ paddingBottom: '40px' }}>
            <div style={weatherWidgetStyle}>
                <div>
                    <h2 style={{ margin: 0, color: '#2d3748', fontSize: '22px' }}>📊 Tổng Quan Hệ Thống</h2>
                    <span style={{ color: '#718096', fontSize: '14px' }}>{dateString}</span>
                </div>
                <div style={{ display: 'flex', gap: '30px' }}>
                    <div style={weatherItemStyle}>🌡️ <b>{weather.temp}°C</b><br /><small>Nhiệt độ</small></div>
                    <div style={weatherItemStyle}>💧 <b>{weather.humidity}%</b><br /><small>Độ ẩm</small></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={cardStyle('#4299e1')}><h3>{stats.user_count}</h3><p>Nhân viên</p></div>
                <div style={cardStyle('#48bb78')}><h3>{stats.dept_count}</h3><p>Phòng ban</p></div>
                <div style={cardStyle('#ed8936')}><h3>{stats.pending_tasks}</h3><p>Việc đang chạy</p></div>
                <div style={cardStyle('#f56565')}><h3>{stats.payslip_count}</h3><p>Lương đã chốt</p></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div style={sectionStyle}>
                    <h4 style={{ marginTop: 0, color: '#4a5568' }}>📈 Nhân sự theo phòng ban</h4>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chart_data || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip cursor={{ fill: '#f7fafc' }} />
                                <Bar dataKey="nv" radius={[6, 6, 0, 0]}>
                                    {stats.chart_data.map((e, i) => <Cell key={i} fill={['#4299e1', '#48bb78', '#ed8936', '#f56565', '#805ad5'][i % 5]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={sectionStyle}>
                    <h4 style={{ marginTop: 0, color: '#4a5568' }}>📝 Tình trạng Đơn nghỉ phép</h4>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.leave_stats || []}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={80}
                                    paddingAngle={5} dataKey="value"
                                >
                                    <Cell fill="#ecc94b" name="Chờ duyệt" />
                                    <Cell fill="#48bb78" name="Đã duyệt" />
                                    <Cell fill="#f56565" name="Từ chối" />
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <header style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => setIsCollapsed(!isCollapsed)} style={hamburgerBtnStyle}>☰</button>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#63b3ed' }}>HRM System <span style={{fontSize:'12px', color:'#718096'}}>(Admin)</span></h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '14px', color: '#cbd5e0' }}>Admin: <strong>{user.name}</strong></span>
                    <button onClick={onLogout} style={logoutBtnStyle}>Đăng xuất</button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <nav style={sidebarStyle(isCollapsed)}>
                    <div style={{ padding: '15px' }}>
                        
                        {/* --- MENU QUẢN TRỊ --- */}
                        <div style={sectionLabelStyle(isCollapsed)}>QUẢN TRỊ HỆ THỐNG</div>
                        {renderMenuBtn('dashboard', '📊', 'Tổng quan')}
                        {renderMenuBtn('employees', '👥', 'Nhân sự')}
                        {renderMenuBtn('departments', '🏢', 'Phòng ban')}
                        {renderMenuBtn('admin_tasks', '📋', 'Giao việc')}
                        {/* Đã khôi phục 2 mục này */}
                        {renderMenuBtn('leaves_manage', '📝', 'Duyệt phép')} 
                        {renderMenuBtn('timesheets_manage', '📅', 'Bảng công')} 

                        <hr style={{ borderColor: '#2d3748', margin: '20px 0' }} />

                        {/* --- MENU CÁ NHÂN --- */}
                        <div style={sectionLabelStyle(isCollapsed)}>CÁ NHÂN CỦA TÔI</div>
                        {renderMenuBtn('my_tasks', '💼', 'Công việc của tôi', true)}
                        {renderMenuBtn('my_leaves', '✉️', 'Xin nghỉ phép', true)}
                        {renderMenuBtn('my_timesheet', '🕒', 'Chấm công', true)}
                        {renderMenuBtn('my_payslip', '💸', 'Phiếu lương', true)}
                        {renderMenuBtn('my_profile', '👤', 'Hồ sơ cá nhân', true)}
                    </div>
                </nav>

                <main style={mainContentStyle}>
                    {/* === KHU VỰC ADMIN === */}
                    {currentTab === 'dashboard' && <DashboardHome />}
                    {currentTab === 'employees' && <EmployeeManagement />}
                    {currentTab === 'departments' && <DepartmentManagement />}
                    {currentTab === 'admin_tasks' && <TaskManagement />}
                    {currentTab === 'leaves_manage' && <LeaveManagement />} 
                    {currentTab === 'timesheets_manage' && <TimesheetManagement />} 

                    {/* === KHU VỰC CÁ NHÂN === */}
                    {currentTab === 'my_tasks' && (
                        <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                                <h2 style={{ margin: 0, color: '#2d3748' }}>💼 Công việc được giao cho tôi</h2>
                                <button onClick={fetchMyTasks} style={{border:'1px solid #ddd', background:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>Làm mới 🔄</button>
                            </div>
                            {myTasks.length === 0 ? (
                                <p style={{color:'#718096', fontStyle:'italic', textAlign:'center', padding:'20px'}}>Bạn chưa được giao công việc nào.</p>
                            ) : (
                                myTasks.map((task, idx) => (
                                    <div key={idx} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#2d3748' }}>{task.title}</div>
                                            <div style={{ fontSize: '13px', color: '#718096' }}>Hạn: {task.due_date} • {task.description}</div>
                                        </div>
                                        <span style={{ 
                                            padding: '5px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold',
                                            background: task.status === 2 ? '#def7ec' : '#fff8f0',
                                            color: task.status === 2 ? 'green' : 'orange'
                                        }}>
                                            {task.status === 2 ? 'Hoàn thành' : 'Đang làm'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    {currentTab === 'my_leaves' && <LeaveForm onBack={() => setCurrentTab('dashboard')} />}
                    {currentTab === 'my_timesheet' && <Timesheet onBack={() => setCurrentTab('dashboard')} />}
                    {currentTab === 'my_payslip' && <MyPayslip onBack={() => setCurrentTab('dashboard')} />}
                    {currentTab === 'my_profile' && <Profile user={user} onBack={() => setCurrentTab('dashboard')} onUpdateUser={onUpdateUser} />}
                </main>
            </div>
        </div>
    );
}

// --- STYLES ---
const headerStyle = {
    background: '#1a202c', height: '65px', padding: '0 25px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)', zIndex: 1000
};

const sidebarStyle = (isCollapsed) => ({
    width: isCollapsed ? '75px' : '280px',
    background: '#1a202c',
    transition: 'width 0.3s ease',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    borderRight: '1px solid #2d3748'
});

const sectionLabelStyle = (isCollapsed) => ({
    color: '#718096', 
    fontSize: '11px', 
    fontWeight: 'bold', 
    marginBottom: '10px', 
    paddingLeft: '10px',
    marginTop: '15px',
    display: isCollapsed ? 'none' : 'block',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
});

const mainContentStyle = {
    flex: 1,
    height: '100%',
    overflowY: 'auto',
    padding: '30px',
    background: '#f8fafc',
    display: 'block'
};

const hamburgerBtnStyle = {
    background: '#2d3748', color: 'white', border: 'none',
    width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', fontSize: '20px'
};

const menuBtnStyle = (isActive, isCollapsed) => ({
    border: 'none', width: '100%', textAlign: 'left',
    padding: '12px 15px', 
    cursor: 'pointer', fontWeight: 'bold', fontSize: '15px',
    borderRadius: '10px', marginBottom: '5px',
    display: 'flex', alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    transition: 'all 0.2s'
});

const weatherWidgetStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: '#fff', padding: '20px 30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const weatherItemStyle = { textAlign: 'center', fontSize: '14px', color: '#2d3748' };
const cardStyle = (color) => ({ background: '#fff', padding: '25px', borderRadius: '15px', borderTop: `6px solid ${color}`, boxShadow: '0 8px 20px rgba(0,0,0,0.04)', textAlign: 'center' });
const sectionStyle = { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' };
const logoutBtnStyle = { background: '#e53e3e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };

export default HRDashboard;