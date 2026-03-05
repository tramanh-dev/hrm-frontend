import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RegisterFace from './RegisterFace'; // 1. IMPORT COMPONENT ĐÃ LÀM

const BASE_URL = 'http://127.0.0.1:8000';

function Profile({ user, onBack, onUpdateUser }) {
    const [fullProfile, setFullProfile] = useState(user);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [isEditing, setIsEditing] = useState(false);
    
    // 2. THÊM STATE ĐỂ QUẢN LÝ CHẾ ĐỘ ĐĂNG KÝ MẶT
    const [isRegisteringFace, setIsRegisteringFace] = useState(false);
    
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        const fetchFullProfile = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;
            setLoading(true);
            try {
                const res = await axios.get(`${BASE_URL}/api/user-profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const fetchedUser = res.data;
                setFullProfile(fetchedUser);
                setEditFormData({
                    name: fetchedUser.name || '',
                    email: fetchedUser.email || '',
                    phone_number: fetchedUser.phone_number || '',
                    address: fetchedUser.address || '',
                    date_of_birth: fetchedUser.date_of_birth || '',
                    password: '',
                    new_password_confirmation: ''
                });
            } catch (error) {
                console.error("Lỗi lấy thông tin Profile chi tiết:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFullProfile();
    }, [user.id]);

    useEffect(() => {
        setEditFormData(prev => ({
            ...prev,
            name: fullProfile.name || '',
            email: fullProfile.email || '',
            phone_number: fullProfile.phone_number || '',
            address: fullProfile.address || '',
            date_of_birth: fullProfile.date_of_birth || '',
        }));
    }, [fullProfile]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.post(`${BASE_URL}/api/upload-avatar`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            const updatedUser = res.data.user;
            setFullProfile(updatedUser);
            localStorage.setItem('user_info', JSON.stringify(updatedUser));
            if (onUpdateUser) onUpdateUser(updatedUser);
            setMessage({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' });
            setSelectedFile(null);
            setPreview(null);
        } catch (error) {
            setMessage({ type: 'error', text: 'Lỗi upload avatar' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        const dataToSend = { ...editFormData };
        if (dataToSend.password && dataToSend.password !== dataToSend.new_password_confirmation) {
            setMessage({ type: 'error', text: 'Mật khẩu không khớp.' });
            setLoading(false);
            return;
        }
        delete dataToSend.new_password_confirmation;
        if (!dataToSend.password) delete dataToSend.password;

        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.put(`${BASE_URL}/api/profile`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updatedUser = res.data.user;
            setFullProfile(updatedUser);
            localStorage.setItem('user_info', JSON.stringify(updatedUser));
            if (onUpdateUser) onUpdateUser(updatedUser);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Lỗi cập nhật hồ sơ' });
        } finally {
            setLoading(false);
        }
    };

    // 3. LOGIC HIỂN THỊ NẾU ĐANG ĐĂNG KÝ MẶT
    if (isRegisteringFace) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: '15px', padding: '20px' }}>
                <button 
                    onClick={() => setIsRegisteringFace(false)} 
                    style={{ marginBottom: '20px', background: '#718096', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
                >
                    ⬅ Quay lại Profile
                </button>
                <RegisterFace /> 
            </div>
        );
    }

    const renderAvatar = () => {
        if (preview) return preview;
        if (fullProfile.avatar) return `${BASE_URL}/storage/${fullProfile.avatar}`;
        return null;
    };

    const formattedDateOfBirth = fullProfile.date_of_birth ? new Date(fullProfile.date_of_birth).toLocaleDateString('vi-VN') : '---';

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

            {/* HEADER */}
            <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#718096', display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                        ⬅ Quay lại
                    </button>
                    <h2 style={{ margin: 0, color: '#2d3748' }}>Hồ sơ cá nhân</h2>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* 4. NÚT MỞ ĐĂNG KÝ FACEID */}
                    {!isEditing && (
                        <button
                            onClick={() => setIsRegisteringFace(true)}
                            style={btnFaceIdStyle}
                        >
                            📸 Thiết lập FaceID
                        </button>
                    )}
                    
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        style={isEditing ? btnCancelStyle : btnEditStyle}
                        disabled={loading}
                    >
                        {isEditing ? 'Hủy Chỉnh sửa' : '✏️ Chỉnh sửa'}
                    </button>
                </div>
            </div>

            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* ... (Giữ nguyên phần Khung Avatar) */}
                <div style={{ position: 'relative', marginBottom: '30px' }}>
                    <div style={{
                        width: '150px', height: '150px', borderRadius: '50%',
                        overflow: 'hidden', border: '4px solid #fff',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        background: renderAvatar() ? '#fff' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '60px', color: '#fff', fontWeight: 'bold'
                    }}>
                        {renderAvatar() ? (
                            <img src={renderAvatar()} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            fullProfile.name ? fullProfile.name.charAt(0).toUpperCase() : 'U'
                        )}
                    </div>
                    <label htmlFor="avatar-upload" style={{
                        position: 'absolute', bottom: '5px', right: '5px',
                        background: '#4a5568', color: '#fff', width: '40px', height: '40px',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        📷
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </div>

                {selectedFile && (
                    <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                        <button onClick={handleUpload} disabled={loading} style={btnSaveAvatarStyle}>
                            {loading ? 'Đang tải lên...' : 'Lưu ảnh mới'}
                        </button>
                        <button onClick={() => {setSelectedFile(null); setPreview(null);}} style={btnCancelStyle}>Hủy</button>
                    </div>
                )}

                {message.text && (
                    <div style={{ marginBottom: '20px', padding: '10px 20px', borderRadius: '5px', fontSize: '14px', background: message.type === 'success' ? '#c6f6d5' : '#fed7d7', color: message.type === 'success' ? '#2f855a' : '#c53030', width: '100%' }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSaveProfile} style={{ width: '100%' }}>
                    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={itemStyle(isEditing)}>
                            <label style={labelStyle}>Họ và tên</label>
                            {isEditing ? <input name="name" type="text" value={editFormData.name} onChange={handleEditChange} style={inputStyle} required /> : <div style={valueStyle}>{fullProfile.name}</div>}
                        </div>
                        <div style={itemStyle(isEditing)}>
                            <label style={labelStyle}>Email</label>
                            {isEditing ? <input name="email" type="email" value={editFormData.email} onChange={handleEditChange} style={inputStyle} required /> : <div style={valueStyle}>{fullProfile.email}</div>}
                        </div>
                        <div style={itemStyle(isEditing)}>
                            <label style={labelStyle}>Số điện thoại</label>
                            {isEditing ? <input name="phone_number" type="text" value={editFormData.phone_number} onChange={handleEditChange} style={inputStyle} /> : <div style={valueStyle}>{fullProfile.phone_number || '---'}</div>}
                        </div>
                        <div style={itemStyle(isEditing)}>
                            <label style={labelStyle}>Ngày sinh</label>
                            {isEditing ? <input name="date_of_birth" type="date" value={editFormData.date_of_birth} onChange={handleEditChange} style={inputStyle} /> : <div style={valueStyle}>{formattedDateOfBirth}</div>}
                        </div>
                        <div style={{ ...itemStyle(isEditing), gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Địa chỉ</label>
                            {isEditing ? <input name="address" type="text" value={editFormData.address} onChange={handleEditChange} style={inputStyle} /> : <div style={valueStyle}>{fullProfile.address || '---'}</div>}
                        </div>
                        <div style={readOnlyItemStyle}>
                            <label style={labelStyle}>Vai trò</label>
                            <div style={valueStyle}>{fullProfile.role || 'Nhân viên'}</div>
                        </div>
                        <div style={readOnlyItemStyle}>
                            <label style={labelStyle}>Phòng ban</label>
                            <div style={valueStyle}>{fullProfile.department?.name || 'Chưa phân bổ'}</div>
                        </div>
                        {isEditing && (
                            <>
                                <div style={itemStyle(true)}>
                                    <label style={labelStyle}>Mật khẩu mới</label>
                                    <input name="password" type="password" value={editFormData.password} onChange={handleEditChange} style={inputStyle} placeholder="Để trống nếu không đổi" />
                                </div>
                                <div style={itemStyle(true)}>
                                    <label style={labelStyle}>Xác nhận Mật khẩu mới</label>
                                    <input name="new_password_confirmation" type="password" value={editFormData.new_password_confirmation} onChange={handleEditChange} style={inputStyle} />
                                </div>
                                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                    <button type="submit" style={btnSaveProfileStyle} disabled={loading}>Lưu Hồ Sơ Cá Nhân</button>
                                </div>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

// STYLES
const btnFaceIdStyle = { padding: '8px 15px', background: '#ff9f43', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const btnEditStyle = { padding: '8px 15px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const btnCancelStyle = { padding: '8px 15px', background: '#a0aec0', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const btnSaveAvatarStyle = { padding: '8px 20px', background: '#48bb78', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const btnSaveProfileStyle = { padding: '10px 25px', background: '#38a169', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', minWidth: '200px' };
const itemStyle = (isEditing) => ({ background: isEditing ? '#fff7e6' : '#f7fafc', padding: '15px', borderRadius: '8px', border: isEditing ? '1px solid #ffcc80' : '1px solid #edf2f7', transition: 'all 0.3s ease' });
const readOnlyItemStyle = { background: '#ebf8ff', padding: '15px', borderRadius: '8px', border: '1px solid #bee3f8' };
const labelStyle = { display: 'block', fontSize: '13px', color: '#718096', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' };
const valueStyle = { fontSize: '16px', color: '#2d3748', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '8px', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '15px', boxSizing: 'border-box' };

export default Profile;