import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as faceapi from 'face-api.js'; // Đảm bảo đã install face-api.js

const BASE_URL = 'http://127.0.0.1:8000';

function Timesheet({ onBack }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    const videoRef = useRef();
    const streamRef = useRef(null);

    // 1. Load Models và Dữ liệu khi vào trang
    useEffect(() => {
        const loadResources = async () => {
            try {
                // Load các model cần thiết cho nhận diện
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
                ]);
                setModelsLoaded(true);
                console.log("Models Loaded!");
            } catch (err) {
                console.error("Lỗi load models:", err);
                setMsg("❌ Không thể tải bộ nhận diện khuôn mặt.");
            }
            fetchTimesheet();
        };
        loadResources();

        return () => stopVideo();
    }, []);

    const fetchTimesheet = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get(`${BASE_URL}/api/my-timesheets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error("Lỗi fetch:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Mở Camera
    const handleStartScan = async () => {
        if (!modelsLoaded) {
            setMsg('⏳ Đang tải bộ quét, vui lòng đợi giây lát...');
            return;
        }
        setIsScanning(true);
        setMsg('📷 Hệ thống đang khởi động xác thực...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 300, height: 300, facingMode: "user" }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setMsg('😊 Hãy nhìn thẳng vào camera');
            }
        } catch (err) {
            setMsg('❌ Lỗi: Bạn cần cấp quyền Camera!');
            setIsScanning(false);
        }
    };

    const stopVideo = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    // 3. Logic xử lý Chấm công (Quét mặt thật)
    // Tìm hàm handleAction trong Timesheet.js và thay bằng đoạn này:
    const handleAction = async (type) => {
        if (!videoRef.current) return;
        setLoading(true);
        setMsg('⏳ Đang nhận diện khuôn mặt...');

        try {
            // QUÉT MẶT THẬT (Thay vì gửi mảng 0.1 như cũ)
            const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks().withFaceDescriptor();

            if (!detection) {
                setMsg('❌ Không tìm thấy khuôn mặt!');
                setLoading(false);
                return;
            }

            // Lấy GPS
            const coords = await new Promise((res, rej) => {
                navigator.geolocation.getCurrentPosition(p => res(p.coords), e => rej(e));
            });

            const token = localStorage.getItem('auth_token');
            const url = type === 'in' ? `${BASE_URL}/api/attendance/check-in` : `${BASE_URL}/api/attendance/check-out`;

            const res = await axios.post(url, {
                lat: coords.latitude,
                lng: coords.longitude,
                face_descriptors: Array.from(detection.descriptor) // Gửi mảng số thật
            }, { headers: { Authorization: `Bearer ${token}` } });

            setMsg(`✅ ${res.data.message}`);
            setIsScanning(false);
            stopVideo();
            fetchTimesheet(); // Tự động load lại bảng lịch sử bên dưới
        } catch (error) {
            setMsg(`❌ ${error.response?.data?.message || 'Lỗi xác thực'}`);
        } finally { setLoading(false); }
    };
    if (loading && !data && !isScanning) return <div style={{ padding: '20px' }}>Đang tải...</div>;

    return (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={onBack} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>⬅</button>
                <h2 style={{ margin: 0, marginLeft: '15px', color: '#2d3748' }}>📅 Chấm công tháng này</h2>
            </div>

            {msg && (
                <div style={{
                    padding: '15px',
                    background: msg.includes('❌') ? '#fff5f5' : '#e6fffa',
                    color: msg.includes('❌') ? '#c53030' : '#2c7a7b',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    border: '1px solid'
                }}>
                    {msg}
                </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '40px', padding: '30px', background: '#f8fafc', borderRadius: '15px' }}>
                {isScanning ? (
                    <>
                        <div style={{
                            width: '240px', height: '240px', borderRadius: '50%',
                            overflow: 'hidden', margin: '0 auto', border: '6px solid #ff9f43', background: '#000'
                        }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                            {!data?.today_record && (
                                <button onClick={() => handleAction('in')} disabled={loading} style={btnConfirmStyle('#48bb78')}>
                                    {loading ? 'Đang quét...' : 'Xác nhận Vào'}
                                </button>
                            )}
                            {data?.today_record && !data.today_record.check_out && (
                                <button onClick={() => handleAction('out')} disabled={loading} style={btnConfirmStyle('#e53e3e')}>
                                    {loading ? 'Đang quét...' : 'Xác nhận Ra'}
                                </button>
                            )}
                            <button onClick={() => { setIsScanning(false); stopVideo(); }} style={btnConfirmStyle('#cbd5e0', '#4a5568')}>Hủy</button>
                        </div>
                    </>
                ) : (
                    <>
                        {!data?.today_record?.check_out ? (
                            <div>
                                <p style={{ color: '#718096', marginBottom: '20px' }}>Nhấn nút dưới đây để mở camera xác thực khuôn mặt</p>
                                <button onClick={handleStartScan} style={btnStartStyle}>🕒 Bắt đầu quét khuôn mặt</button>
                            </div>
                        ) : (
                            <div style={{ color: '#2f855a', fontWeight: 'bold', fontSize: '18px' }}>✅ Bạn đã hoàn thành chấm công hôm nay!</div>
                        )}
                    </>
                )}
            </div>

            <h3 style={{ color: '#2d3748', borderBottom: '2px solid #edf2f7', paddingBottom: '10px' }}>Lịch sử chấm công</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                    <tr style={{ background: '#f7fafc', textAlign: 'left' }}>
                        <th style={tdStyle}>Ngày</th>
                        <th style={tdStyle}>Giờ vào</th>
                        <th style={tdStyle}>Giờ ra</th>
                        <th style={tdStyle}>Công</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.history.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #edf2f7' }}>
                            <td style={{ ...tdStyle, fontWeight: 'bold' }}>{item.work_date}</td>
                            <td style={{ ...tdStyle, color: '#48bb78' }}>{item.check_in}</td>
                            <td style={{ ...tdStyle, color: '#e53e3e' }}>{item.check_out || '--:--'}</td>
                            <td style={{ ...tdStyle, fontWeight: 'bold' }}>{item.day_count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// --- Styles ---
const btnStartStyle = { padding: '15px 40px', background: '#ff9f43', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };
const btnConfirmStyle = (bg, color = '#fff') => ({ padding: '10px 25px', background: bg, color: color, border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', minWidth: '120px' });
const tdStyle = { padding: '12px', fontSize: '14px' };

export default Timesheet;