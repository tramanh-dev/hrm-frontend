import React from 'react'; // Bỏ useState, useEffect, axios nếu không dùng bên trong component

const TaskReport = ({ task, onClose }) => {
    const fileUrl = task.report_file_path ? `http://127.0.0.1:8000/storage/${task.report_file_path}` : null;

    // -----------------------------------------------------------------
    // CSS INLINE CHO MODAL 
    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };

    const contentStyle = {
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        width: '500px',
        maxWidth: '90%',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        animation: 'fadeIn 0.3s',
    };

    const headerStyle = {
        borderBottom: '2px solid #3182ce',
        paddingBottom: '10px',
        marginBottom: '20px',
        color: '#2d3748',
    };

    // -----------------------------------------------------------------

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#e53e3e' }}
                >
                    ✕
                </button>

                <h3 style={headerStyle}>
                    Báo cáo Công việc: {task.title}
                </h3>

                {/* THÔNG TIN BÁO CÁO */}
                <div style={{ padding: '15px', background: '#f0fff4', borderLeft: '5px solid #48bb78', borderRadius: '5px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#2d3748' }}>
                        Nội dung báo cáo:
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontStyle: 'italic', fontSize: '14px' }}>
                        "{task.report_content || 'Không có nội dung báo cáo.'}"
                    </p>
                </div>

                {/* HIỂN THỊ TỆP ĐÍNH KÈM */}
                <div style={{ marginTop: '20px' }}>
                    <h4 style={{ color: '#3182ce', borderBottom: '1px dashed #e2e8f0', paddingBottom: '5px' }}>
                        📎 Tệp đính kèm
                    </h4>
                    {fileUrl ? (
                        <div style={{ padding: '10px', background: '#e9f8ff', borderRadius: '5px', fontSize: '14px' }}>
                            <a
                                href={fileUrl} // Đường dẫn đã xác nhận dùng cổng 8000
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#2b6cb0', fontWeight: 'bold', textDecoration: 'underline' }}
                            >
                                Tải xuống tệp đã nộp (Click để xem)
                            </a>
                        </div>
                    ) : (
                        <p style={{ color: '#718096', fontSize: '14px' }}>Không có tệp đính kèm.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskReport;