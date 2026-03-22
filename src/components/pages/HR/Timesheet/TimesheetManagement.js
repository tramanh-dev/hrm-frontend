import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TimesheetManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const handleExport = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios({
        url: 'https://hrm-backend-iybp.onrender.com/api/export-timesheet',
        method: 'GET',
        responseType: 'blob', 
        headers: { Authorization: `Bearer ${token}` }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bang_cong_thang.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("Bạn không có quyền hoặc hệ thống đang lỗi!");
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get('https://hrm-backend-iybp.onrender.com/api/hr/timesheets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Đang tải dữ liệu chấm công toàn ty...</div>;

  return (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#2d3748', margin: 0, borderBottom: '2px solid #edf2f7', paddingBottom: '10px' }}>
          📊 Bảng Công Toàn Nhân Viên (Tháng này)
        </h2>

        {/* Nút Xuất Excel */}
        <button
          onClick={handleExport}
          style={{
            background: '#2f855a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          📥 Xuất
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: '#2c5282', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>Nhân viên</th>
              <th style={{ padding: '15px' }}>Ngày</th>
              <th style={{ padding: '15px' }}>Giờ vào</th>
              <th style={{ padding: '15px' }}>Giờ ra</th>
              <th style={{ padding: '15px' }}>Công</th>
              <th style={{ padding: '15px' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #edf2f7', background: index % 2 === 0 ? '#fff' : '#f7fafc' }}>
                  <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#cbd5e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', overflow: 'hidden' }}>
                      {item.user.avatar ? <img src={`https://hrm-backend-iybp.onrender.com/storage/${item.user.avatar}`} alt="avt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : item.user.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#2d3748' }}>{item.user.name}</div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>{item.user.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: '#4a5568' }}>{item.work_date}</td>
                  <td style={{ padding: '12px', color: 'green', fontWeight: 'bold' }}>{item.check_in}</td>
                  <td style={{ padding: '12px', color: 'red', fontWeight: 'bold' }}>{item.check_out || '--:--'}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.day_count}</td>
                  <td style={{ padding: '12px' }}>
                    {item.check_out ? (
                      <span style={{ background: '#c6f6d5', color: '#22543d', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>Hoàn thành</span>
                    ) : (
                      <span style={{ background: '#feebc8', color: '#744210', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>Đang làm việc</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>Chưa có dữ liệu chấm công tháng này.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TimesheetManagement;