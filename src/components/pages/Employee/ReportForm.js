import React, { useState } from 'react';
import axios from 'axios';

const ReportForm = ({ task, onSuccess, onCancel }) => {
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // Xử lý chọn file
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    // Xử lý kéo thả
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!content.trim()) return alert("Vui lòng nhập nội dung báo cáo!");
        setIsSubmitting(true);
        const token = localStorage.getItem('auth_token');
        const formData = new FormData();
        formData.append('report_content', content);
        if (file) formData.append('file', file);

        try {
            await axios.post(`http://127.0.0.1:8000/api/tasks/${task.id}/report`,
                formData,
                { headers: { Authorization: `Bearer ${token}` }}
            );
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            alert("Lỗi: " + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modern-overlay">
            <style>{`
                .modern-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background-color: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(5px);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 9999; font-family: 'Inter', sans-serif;
                }

                .modern-modal {
                    background: white; width: 550px; max-width: 90%;
                    border-radius: 16px; /* Bo góc vừa phải như hình */
                    box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.15);
                    overflow: hidden;
                    animation: popUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex; flex-direction: column;
                }

                /* --- HEADER MÀU XANH NHƯ HÌNH --- */
                .modern-header {
                    background-color: #3182ce; /* Màu xanh dương chuẩn */
                    padding: 20px 25px;
                    color: white; /* Chữ màu trắng */
                    position: relative;
                    text-align: center; /* Căn giữa như hình */
                }
                .modern-title { margin: 0; font-size: 22px; font-weight: 700; }
                .modern-subtitle { margin: 5px 0 0; font-size: 14px; opacity: 0.8; }
                
                /* Nút tắt màu trắng mờ */
                .btn-close-modern {
                    position: absolute; top: 20px; right: 20px;
                    background: rgba(255,255,255,0.2); border: none;
                    color: white; width: 32px; height: 32px; border-radius: 50%;
                    font-size: 18px; cursor: pointer; transition: 0.2s;
                    display: flex; align-items: center; justify-content: center;
                }
                .btn-close-modern:hover { background: rgba(255,255,255,0.4); transform: rotate(90deg); }

                /* Body */
                .modern-body { padding: 30px; }

                .task-badge {
                    background: #f7fafc; padding: 15px; border-radius: 10px;
                    margin-bottom: 25px; border-left: 5px solid #3182ce; /* Viền trái cùng màu header */
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .task-badge h4 { margin: 0 0 5px; color: #2d3748; font-size: 15px; display: flex; align-items: center; gap: 8px;}
                .task-badge p { margin: 0; color: #718096; font-size: 13px; margin-left: 24px; }

                /* Textarea */
                .input-group label { display: block; font-weight: 700; color: #2d3748; margin-bottom: 8px; font-size: 14px; }
                .modern-textarea {
                    width: 100%; min-height: 120px; padding: 15px;
                    border: 1px solid #cbd5e0; border-radius: 8px;
                    font-family: inherit; font-size: 14px; resize: vertical;
                    transition: 0.2s; box-sizing: border-box; color: #2d3748;
                }
                .modern-textarea:focus {
                    outline: none; border-color: #3182ce; box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
                }

                /* Upload Zone nét đứt */
                .upload-zone {
                    margin-top: 20px;
                    border: 2px dashed #cbd5e1; border-radius: 12px;
                    padding: 30px; text-align: center;
                    cursor: pointer; transition: 0.2s; background: #fff;
                    position: relative;
                }
                .upload-zone:hover, .upload-zone.dragover {
                    border-color: #3182ce; background: #ebf8ff;
                }
                .upload-icon { font-size: 32px; margin-bottom: 5px; display: block; color: #a0aec0; }
                .upload-text { font-size: 14px; color: #718096; }
                .file-info {
                    margin-top: 10px; display: inline-flex; align-items: center; gap: 8px;
                    background: #bee3f8; color: #2c5282; padding: 6px 12px;
                    border-radius: 20px; font-size: 12px; font-weight: 600;
                }

                /* Footer */
                .modern-footer {
                    padding: 20px 30px; background: white; 
                    display: flex; justify-content: flex-end; gap: 12px;
                }
                .btn-mod {
                    padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;
                    font-size: 14px; transition: 0.2s; border: none;
                }
                .btn-cancel { background: #edf2f7; color: #4a5568; }
                .btn-cancel:hover { background: #e2e8f0; }
                
                /* NÚT SUBMIT CÙNG MÀU HEADER */
                .btn-submit {
                    background: #3182ce; color: white;
                    box-shadow: 0 4px 6px rgba(49, 130, 206, 0.3);
                }
                .btn-submit:hover {
                    background: #2b6cb0; transform: translateY(-1px);
                    box-shadow: 0 6px 8px rgba(49, 130, 206, 0.4);
                }
                .btn-submit:disabled { background: #a0aec0; cursor: not-allowed; transform: none; box-shadow: none; }

                @keyframes popUp {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>

            <div className="modern-modal">
                {/* Header Xanh, Chữ Trắng, Căn giữa */}
                <div className="modern-header">
                    <button className="btn-close-modern" onClick={onCancel}>✕</button>
                    <h3 className="modern-title">Nộp Báo Cáo</h3>
                    <p className="modern-subtitle">Cập nhật tiến độ công việc của bạn</p>
                </div>

                <div className="modern-body">
                    {/* Badge thông tin Task */}
                    <div className="task-badge">
                        <h4>📌 {task.title}</h4>
                        <p>{task.description || "Không có mô tả chi tiết"}</p>
                    </div>

                    <div className="input-group">
                        <label>Nội dung công việc</label>
                        <textarea
                            className="modern-textarea"
                            placeholder="Hôm nay bạn đã làm được những gì?..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Vùng Upload */}
                    <div 
                        className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
                        onClick={() => document.getElementById('hidden-file-input').click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                    >
                        <input 
                            id="hidden-file-input" 
                            type="file" 
                            hidden 
                            onChange={handleFileChange}
                        />
                        
                        {!file ? (
                            <>
                                <span className="upload-icon">☁️</span>
                                <span className="upload-text">
                                    Click để chọn file hoặc <strong>kéo thả vào đây</strong>
                                </span>
                            </>
                        ) : (
                            <div className="file-info">
                                📎 {file.name}
                                <span 
                                    style={{marginLeft: '5px', cursor: 'pointer', color: '#e53e3e'}}
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        setFile(null);
                                    }}
                                >
                                    ✕
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer với nút Gửi cùng màu Header */}
                <div className="modern-footer">
                    <button className="btn-mod btn-cancel" onClick={onCancel}>Huỷ bỏ</button>
                    <button 
                        className="btn-mod btn-submit" 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi Báo Cáo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportForm;