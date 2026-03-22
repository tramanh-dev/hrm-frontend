import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import axios from 'axios';

const FaceCheckIn = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null); 
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [locationStatus, setLocationStatus] = useState("Đang kiểm tra vị trí...");
    const [isInside, setIsInside] = useState(false);
    const [userCoords, setUserCoords] = useState(null);

    // 1. Load Models và Kiểm tra GPS khi vào trang
    useEffect(() => {
        const prepareSystem = async () => {
            try {
                // Load AI Models
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
                ]);
                setModelsLoaded(true);

                // Lấy tọa độ và verify với Backend
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                    setUserCoords(coords);
                    
                    const token = localStorage.getItem('auth_token');
                    const res = await axios.post('https://hrm-backend-iybp.onrender.com/api/attendance/verify-location', 
                        coords,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    if (res.data.status === 'success') {
                        setIsInside(true);
                        setLocationStatus("✅ Vị trí hợp lệ. Vui lòng quét mặt!");
                    }
                }, (err) => setLocationStatus("❌ Vui lòng bật định vị!"));
            } catch (error) {
                console.error("Lỗi hệ thống:", error);
            }
        };
        prepareSystem();
    }, []);

    // 2. Hàm vẽ khung xanh chạy theo mặt (Real-time)
   const handleVideoOnPlay = () => {
    if (!canvasRef.current || !webcamRef.current) return;

    const interval = setInterval(async () => {
        // KIỂM TRA AN TOÀN: Nếu webcam hoặc video không tồn tại thì dừng lại ngay
        if (!webcamRef.current || !webcamRef.current.video) {
            clearInterval(interval); // Dừng luôn cái vòng lặp này lại để tránh lỗi
            return;
        }

        const video = webcamRef.current.video;
        const canvas = canvasRef.current;

        // Kiểm tra xem video đã sẵn sàng chưa (readyState === 4)
        if (video.readyState !== 4) return;

        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
        
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
        }
    }, 200);

    // Lưu lại ID của interval để xóa khi Component bị unmount (đóng trang)
    return () => clearInterval(interval);
};

    // 3. Hàm Chấm công khi nhấn nút
    const doCheckIn = async () => {
        const video = webcamRef.current.video;
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks().withFaceDescriptor();

        if (detection) {
            try {
                const token = localStorage.getItem('auth_token');
                await axios.post('https://hrm-backend-iybp.onrender.com/api/attendance/check-in', {
                    face_descriptors: Array.from(detection.descriptor),
                    lat: userCoords.latitude,
                    lng: userCoords.longitude
                }, { headers: { Authorization: `Bearer ${token}` } });
                alert("🎉 Chấm công thành công!");
            } catch (err) {
                alert(err.response?.data?.message || "Lỗi xác thực khuôn mặt!");
            }
        } else {
            alert("Không tìm thấy khuôn mặt!");
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2>Chấm Công FaceID + GPS</h2>
            <p style={{ color: isInside ? 'green' : 'red' }}>{locationStatus}</p>

            {modelsLoaded && isInside && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        width={640}
                        height={480}
                        onPlay={handleVideoOnPlay}
                        screenshotFormat="image/jpeg"
                        style={{ borderRadius: '10px' }}
                    />
                    <canvas
                        ref={canvasRef}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    />
                    <br />
                    <button onClick={doCheckIn} style={btnStyle}>Xác nhận chấm công</button>
                </div>
            )}
        </div>
    );
};

const btnStyle = { padding: '12px 24px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', fontSize: '16px' };

export default FaceCheckIn;