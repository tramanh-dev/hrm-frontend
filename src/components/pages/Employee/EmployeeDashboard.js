import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReportForm from './ReportForm';
import LeaveForm from './LeaveForm';
import Profile from './Profile';
import Timesheet from './Timesheet';
import MyPayslip from './MyPayslip';
import FaceCheckIn from './FaceCheckIn';
import PayrollManagement from '../Accountant/PayrollManagement';

const styles = {
    container: { display: 'flex', minHeight: '100vh', background: '#f4f6f8', fontFamily: "'Segoe UI', sans-serif" },
    sidebar: (isOpen) => ({
        width: isOpen ? '260px' : '0px', 
        background: '#fff', 
        borderRight: isOpen ? '1px solid #e0e0e0' : 'none',
        display: 'flex', 
        flexDirection: 'column', 
        position: 'fixed', 
        height: '100vh', 
        zIndex: 100,
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    }),
    main: (isSidebarOpen) => ({ 
        flex: 1, 
        marginLeft: isSidebarOpen ? '260px' : '0px', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease' 
    }),
    header: {
        height: '64px', background: '#fff', borderBottom: '1px solid #e0e0e0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px',
        position: 'sticky', top: 0, zIndex: 90
    },
    hamburgerBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#555', marginRight: '20px' },
    searchBar: { background: '#f0f2f5', padding: '8px 15px', borderRadius: '20px', border: 'none', width: '300px', outline: 'none' },
    notificationDropdown: {
        position: 'absolute', top: '50px', right: '0px', width: '320px', maxHeight: '400px',
        overflowY: 'auto', background: '#fff', border: '1px solid #ddd', borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)', zIndex: 1000, padding: '10px 0'
    },
    notifItem: { padding: '12px 20px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', fontSize: '14px' },
    content: { padding: '30px', maxWidth: '100%', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    timeWidget: {
        background: '#fff', padding: '15px 25px', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '25px', boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
    },
    statusGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' },
    statusCard: (color, bg) => ({
        background: bg, color: color, padding: '20px', borderRadius: '8px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontWeight: 'bold', fontSize: '15px', cursor: 'pointer'
    }),
    sectionCard: { background: '#fff', borderRadius: '8px', padding: '25px', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' },
    sectionTitle: { margin: '0 0 20px 0', color: '#333', fontSize: '18px', borderLeft: '4px solid #ff9f43', paddingLeft: '10px' },
    menuItem: (active) => ({
        padding: '12px 25px', cursor: 'pointer', color: active ? '#ff9f43' : '#555',
        borderLeft: active ? '4px solid #ff9f43' : '4px solid transparent',
        background: active ? '#fff8f0' : 'transparent', fontWeight: active ? '600' : 'normal'
    }),
    badge: (bg) => ({ 
        position: 'absolute', top: '-6px', right: '-8px', background: bg, 
        color: '#fff', fontSize: '10px', fontWeight: 'bold', 
        borderRadius: '50%', width: '18px', height: '18px', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 10
    }),
    drawerOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.1)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' },
    drawerContent: { width: '450px', height: '100vh', background: '#fff', boxShadow: '-5px 0 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', padding: '25px', position: 'relative' },
};

// --- COMPONENT CHI TIẾT (SIDE) ---
const DetailModal = ({
    selectedItem, setSelectedItem, isReporting, setIsReporting,
    fetchData, comments, newComment, setNewComment, handleSendComment, user
}) => {
    const chatEndRef = useRef(null);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);
    if (!selectedItem) return null;
    
    const isTask = selectedItem.type === 'task';
    const isExpired = new Date(selectedItem.due_date) < new Date();

    return (
        <div style={styles.drawerOverlay} onClick={() => setSelectedItem(null)}>
            <div style={styles.drawerContent} onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: '20px', left: '-15px', border: 'none', background: '#fff', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', zIndex: 1001 }}>➜</button>
                <h2 style={{ borderBottom: '2px solid #ff9f43', paddingBottom: '10px', marginBottom: '20px', fontSize: '20px' }}>{isTask ? '📋 Chi tiết Công việc' : '📝 Chi tiết Đơn nghỉ'}</h2>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    
                    <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                        <h3 style={{ color: '#2b6cb0', marginTop: 0, fontSize: '18px' }}>{selectedItem.title || selectedItem.reason}</h3>
                        <p style={{ fontSize: '14px' }}><strong>Mô tả:</strong> {selectedItem.description || selectedItem.reason}</p>
                        <p style={{ fontSize: '14px' }}>
                            <strong>Hạn:</strong> {isTask ? selectedItem.due_date : (selectedItem.start_date + ' -> ' + selectedItem.end_date)}
                        </p>

                        {/* --- NÚT BÁO CÁO ĐÃ QUAY TRỞ LẠI --- */}
                        {isTask && selectedItem.status !== 2 && !isExpired && (
                            <button 
                                onClick={() => setIsReporting(true)} 
                                style={{ width: '100%', padding: '12px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px' }}
                            >
                                ✍️ Gửi báo cáo kết quả
                            </button>
                        )}
                        {isTask && isExpired && <p style={{ color: 'red', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>⛔ Công việc đã hết hạn</p>}
                    </div>

                    {isReporting ? (
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <ReportForm task={selectedItem} onSuccess={() => { setIsReporting(false); setSelectedItem(null); fetchData(); }} onCancel={() => setIsReporting(false)} />
                        </div>
                    ) : (
                        isTask && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ padding: '10px', background: '#fff', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>💬 Thảo luận</div>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                                    {comments.map((c, i) => (
                                        <div key={i} style={{ marginBottom: '10px', textAlign: c.user_id === user.id ? 'right' : 'left' }}>
                                            <div style={{ fontSize: '13px', display: 'inline-block', padding: '8px 12px', borderRadius: '15px', background: c.user_id === user.id ? '#ff9f43' : '#eee', color: c.user_id === user.id ? '#fff' : '#333' }}>{c.content}</div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                                <div style={{ padding: '15px', display: 'flex', gap: '8px' }}>
                                    <input type="text" style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' }} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                                    <button onClick={() => handleSendComment(selectedItem.id)} style={{ background: '#ff9f43', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '20px' }}>Gửi</button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH ---
function EmployeeDashboard({ onLogout, user, onUpdateUser }) {
    const [tasks, setTasks] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentView, setCurrentView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isReporting, setIsReporting] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [shouldRecalculate, setShouldRecalculate] = useState(0);

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [readItemIds, setReadItemIds] = useState(() => JSON.parse(localStorage.getItem('read_items_storage') || '[]'));
    const [favoriteIds, setFavoriteIds] = useState(() => JSON.parse(localStorage.getItem('favorite_items_storage') || '[]'));

    useEffect(() => { fetchData(); }, [shouldRecalculate]);

    useEffect(() => {
        const echoInstance = window.Echo || window.echo;
        if (echoInstance && user) {
            const taskChannel = echoInstance.channel('task-board');
            taskChannel.listen('.TaskUpdated', () => setShouldRecalculate(p => p + 1));
            const leaveChannel = echoInstance.channel(`user-leave.${user.id}`);
            leaveChannel.listen('.LeaveStatusUpdated', (data) => {
                alert(`Đơn nghỉ của bạn ${data.leave.status === 'approved' ? 'đã được DUYỆT ✅' : 'bị TỪ CHỐI ❌'}`);
                setShouldRecalculate(p => p + 1);
            });
            return () => { echoInstance.leave('task-board'); echoInstance.leave(`user-leave.${user.id}`); };
        }
    }, [user.id]);

    const fetchData = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        try {
            const [resTask, resLeave] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/my-tasks', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://127.0.0.1:8000/api/leaves', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setTasks(resTask.data.map(t => ({ ...t, type: 'task' })));
            setLeaves(resLeave.data.map(l => ({ ...l, type: 'leave' })));
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleItemClick = (item) => {
        setSelectedItem(item); setIsReporting(false); setIsNotifOpen(false);
        if (item.type === 'task') fetchComments(item.id);
        const uniqueId = item.id + item.type;
        if (!readItemIds.includes(uniqueId)) {
            const newList = [...readItemIds, uniqueId];
            setReadItemIds(newList); localStorage.setItem('read_items_storage', JSON.stringify(newList));
        }
    };

    const fetchComments = async (taskId) => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/tasks/${taskId}/comments`, { headers: { Authorization: `Bearer ${token}` } });
            setComments(res.data);
        } catch (error) { console.error(error); }
    };

    const handleSendComment = async (taskId) => {
        if (!newComment.trim()) return;
        const token = localStorage.getItem('auth_token');
        try {
            const res = await axios.post(`http://127.0.0.1:8000/api/tasks/${taskId}/comments`, { content: newComment }, { headers: { Authorization: `Bearer ${token}` } });
            setComments([...comments, { ...res.data, user: { name: user.name } }]);
            setNewComment('');
        } catch (error) { alert("Lỗi gửi tin nhắn"); }
    };

    const toggleFavorite = (e, item) => {
        e.stopPropagation();
        const uniqueId = item.id + item.type;
        const newFavs = favoriteIds.includes(uniqueId) ? favoriteIds.filter(id => id !== uniqueId) : [...favoriteIds, uniqueId];
        setFavoriteIds(newFavs); localStorage.setItem('favorite_items_storage', JSON.stringify(newFavs));
    };

    const notificationList = [
        ...tasks.filter(t => t.status !== 2).map(t => ({ ...t, displayType: 'task' })),
        ...leaves.filter(l => l.status !== 'pending').map(l => ({ ...l, displayType: 'leave' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const completedList = tasks.filter(t => t.status === 2).map(t => ({ ...t, displayType: 'task' }));
    const favoriteList = [...tasks, ...leaves].filter(item => favoriteIds.includes(item.id + item.type)).map(item => ({ ...item, displayType: item.type }));
    const unreadCount = notificationList.filter(item => !readItemIds.includes(item.id + item.type)).length;

    const renderList = (list) => {
        if (list.length === 0) return <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Không có dữ liệu.</p>;
        return list.map((item, idx) => {
            const type = item.displayType || item.type;
            const uniqueId = item.id + type;
            const isRead = readItemIds.includes(uniqueId);
            const isFav = favoriteIds.includes(uniqueId);
            return (
                <div key={idx} style={{ padding: '15px 20px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', background: isRead ? 'transparent' : '#f0f7ff' }} onClick={() => handleItemClick(item)}>
                    <div>
                        <div style={{ fontWeight: isRead ? '600' : 'bold', color: isRead ? '#333' : '#0056b3' }}>{type === 'task' ? `💼 ${item.title}` : `📝 ${item.reason}`}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{new Date(item.created_at).toLocaleDateString('vi-VN')} - {item.status}</div>
                    </div>
                    <div onClick={(e) => toggleFavorite(e, item)} style={{ fontSize: '20px', color: isFav ? '#d69e2e' : '#cbd5e0' }}>{isFav ? '⭐' : '☆'}</div>
                </div>
            );
        });
    };

    const Header = () => (
        <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={styles.hamburgerBtn}>☰</button>
                <input type="text" placeholder="🔍 Tìm kiếm..." style={styles.searchBar} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px', position: 'relative' }}>
                <button onClick={() => { setFilterStatus('favorites'); setCurrentView('dashboard'); }} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', position: 'relative' }}>
                    ⭐ {favoriteList.length > 0 && <span style={styles.badge('#ff9f43')}>{favoriteList.length}</span>}
                </button>
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', position: 'relative' }}>
                    🔔 {unreadCount > 0 && <span style={styles.badge('#e53e3e')}>{unreadCount}</span>}
                </button>
                {isNotifOpen && (
                    <div style={styles.notificationDropdown}>
                        <h4 style={{ padding: '0 20px' }}>Thông báo mới nhất</h4>
                        {notificationList.slice(0, 5).map((item, idx) => (
                            <div key={idx} style={styles.notifItem} onClick={() => handleItemClick(item)}>
                                {item.displayType === 'task' ? `📌 Task: ${item.title}` : `📝 Đơn nghỉ: ${item.status}`}
                            </div>
                        ))}
                        <button onClick={() => { setFilterStatus('pending'); setCurrentView('dashboard'); setIsNotifOpen(false); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#3182ce', fontWeight: 'bold', cursor: 'pointer', borderTop: '1px solid #eee' }}>Xem tất cả thông báo</button>
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('profile')}>
                    <img src={user?.avatar ? `http://127.0.0.1:8000/storage/${user.avatar}` : null} alt="User" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontWeight: '600' }}>{user?.name}</span>
                </div>
            </div>
        </div>
    );

    const Sidebar = () => (
        <div style={styles.sidebar(isSidebarOpen)}>
            <div style={{ padding: '25px', fontSize: '22px', fontWeight: 'bold', color: '#333' }}>⚡ HRM System</div>
            <div style={{ marginTop: '20px' }}>
                <div onClick={() => { setCurrentView('dashboard'); setFilterStatus('all'); }} style={styles.menuItem(currentView === 'dashboard' && filterStatus === 'all')}>🏠 Trang chủ</div>
                <div onClick={() => setCurrentView('tasks')} style={styles.menuItem(currentView === 'tasks')}>💼 Công việc</div>
                <div onClick={() => setCurrentView('leave_request')} style={styles.menuItem(currentView === 'leave_request')}>📝 Nghỉ phép</div>
                <div onClick={() => setCurrentView('timesheet')} style={styles.menuItem(currentView === 'timesheet')}>📅 Chấm công</div>
                {user?.department_id === 4 && <div onClick={() => setCurrentView('payroll')} style={styles.menuItem(currentView === 'payroll')}>💰 Tính lương</div>}
                <div onClick={() => setCurrentView('my_payslips')} style={styles.menuItem(currentView === 'my_payslips')}>📄 Phiếu lương</div>
                <div onClick={() => setCurrentView('profile')} style={styles.menuItem(currentView === 'profile')}>👤 Hồ sơ</div>
                <div onClick={onLogout} style={{ ...styles.menuItem(false), color: '#e53e3e', marginTop: '20px' }}>🚪 Đăng xuất</div>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            <Sidebar />
            <div style={styles.main(isSidebarOpen)}>
                <Header />
                <div style={styles.content}>
                    {currentView === 'payroll' ? <PayrollManagement /> :
                     currentView === 'profile' ? <Profile user={user} onBack={() => setCurrentView('dashboard')} onUpdateUser={onUpdateUser} /> :
                     currentView === 'leave_request' ? <LeaveForm onBack={() => setCurrentView('dashboard')} /> :
                     currentView === 'timesheet' ? <Timesheet onBack={() => setCurrentView('dashboard')} /> :
                     currentView === 'face_checkin' ? <FaceCheckIn onBack={() => setCurrentView('dashboard')} /> :
                     currentView === 'my_payslips' ? <MyPayslip onBack={() => setCurrentView('dashboard')} /> :
                     currentView === 'tasks' ? (
                        <div style={styles.sectionCard}>
                            <h2 style={styles.sectionTitle}>📋 Danh sách công việc</h2>
                            {tasks.map((task, idx) => {
                                const isFav = favoriteIds.includes(task.id + 'task');
                                return (
                                    <div key={idx} style={{ padding: '15px 0', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => handleItemClick(task)}>
                                        <div><div style={{ fontWeight: 'bold' }}>💼 {task.title}</div><div style={{ fontSize: '13px', color: '#666' }}>Hạn: {task.due_date}</div></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ color: task.status === 2 ? 'green' : 'orange', fontWeight: 'bold' }}>{task.status === 2 ? 'Xong' : 'Làm'}</div>
                                            <div onClick={(e) => toggleFavorite(e, task)} style={{ fontSize: '22px', color: isFav ? '#d69e2e' : '#cbd5e0' }}>{isFav ? '⭐' : '☆'}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                     ) : (
                        <>
                            <h1>{filterStatus === 'all' ? '🏠 Trang chủ' : filterStatus === 'pending' ? '🔔 Tất cả thông báo' : '⭐ Mục yêu thích'}</h1>
                            {filterStatus === 'all' ? (
                                <>
                                    <div style={styles.timeWidget}><div>Hôm nay: {new Date().toLocaleDateString('vi-VN')}</div><button onClick={() => setCurrentView('face_checkin')} style={{ background: '#ff9f43', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px' }}>🕒 Chấm công</button></div>
                                    <div style={styles.statusGrid}>
                                        <div style={styles.statusCard('#2c7a7b', '#e6fffa')}>⏳ Chờ: {leaves.filter(l => l.status === 'pending').length}</div>
                                        <div style={styles.statusCard('#2f855a', '#f0fff4')}>✅ Duyệt: {leaves.filter(l => l.status === 'approved').length}</div>
                                        <div style={styles.statusCard('#c53030', '#fff5f5')}>⛔ Từ chối: {leaves.filter(l => l.status === 'rejected').length}</div>
                                    </div>
                                    <div style={styles.sectionCard}><h3 style={styles.sectionTitle}>Thông báo gần đây</h3>{renderList(notificationList.slice(0, 5))}</div>
                                </>
                            ) : (
                                <div style={styles.sectionCard}>{filterStatus === 'pending' ? renderList(notificationList) : renderList(favoriteList)}</div>
                            )}
                        </>
                     )}
                </div>
            </div>
            <DetailModal selectedItem={selectedItem} setSelectedItem={setSelectedItem} isReporting={isReporting} setIsReporting={setIsReporting} fetchData={fetchData} comments={comments} newComment={newComment} setNewComment={setNewComment} handleSendComment={handleSendComment} user={user} />
        </div>
    );
}

export default EmployeeDashboard;