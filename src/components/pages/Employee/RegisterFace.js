import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import axios from 'axios';

const RegisterFace = () => {
    const webcamRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("Đang khởi tạo camera...");

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setLoading(false);
                setStatus("Sẵn sàng đăng ký!");
            } catch (err) {
                setStatus("Lỗi nạp bộ não AI!");
                console.error(err);
            }
        };
        loadModels();
    }, []);

    const handleRegister = async () => {
        if (!webcamRef.current) return;
        
        setStatus("Đang phân tích khuôn mặt...");
        const imageSrc = webcamRef.current.getScreenshot();
        const img = await faceapi.fetchImage(imageSrc);

        const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detection) {
            const faceData = Array.from(detection.descriptor); 
            
            try {
                const token = localStorage.getItem('auth_token'); 
                const response = await axios.post('https://hrm-backend-iybp.onrender.com/api/attendance/register-face', 
                    { face_data: faceData },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                alert("✅ Chúc mừng Trâm Anh! Đã đăng ký khuôn mặt thành công.");
                setStatus("Đăng ký hoàn tất!");
            } catch (error) {
                alert("❌ Lỗi: " + (error.response?.data?.message || "Không thể kết nối server"));
                setStatus("Lỗi lưu dữ liệu.");
            }
        } else {
            alert("Không tìm thấy khuôn mặt! Hãy nhìn thẳng vào camera và thử lại.");
            setStatus("Thử lại lần nữa...");
        }
    };

    if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>{status}</div>;

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2 style={{ color: '#333' }}>Thiết lập FaceID Nhân viên</h2>
            <p style={{ color: '#666' }}>{status}</p>
            
            <div style={{ position: 'relative', display: 'inline-block', border: '5px solid #ddd', borderRadius: '15px', overflow: 'hidden' }}>
                <Webcam 
                    ref={webcamRef} 
                    screenshotFormat="image/jpeg" 
                    width={480} 
                    height={360}
                    mirrored={true} 
                />
            </div>
            
            <div style={{ marginTop: '20px' }}>
                <button onClick={handleRegister} style={btnStyle}>
                    📸 Chụp và Đăng ký ngay
                </button>
            </div>
        </div>
    );
};

const btnStyle = {
    padding: '12px 30px',
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: '0.3s'
};

export default RegisterFace;