import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://hrm-backend-iybp.onrender.com';

function PayrollManagement() {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => { fetchDraftData(); }, [month, year]);

    const fetchDraftData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get(`${BASE_URL}/api/payroll/draft?month=${month}&year=${year}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const initialized = res.data.map(item => ({
                ...item,
                bonus: item.bonus || 0,
                deduction: item.deduction || 0
            }));
            setDrafts(initialized);
        } catch (error) { console.error("Lỗi:", error); } finally { setLoading(false); }
    };

    const handleValueChange = (index, field, value) => {
        const newData = [...drafts];
        newData[index][field] = parseFloat(value) || 0;
        setDrafts(newData);
    };

    const handleConfirmSalary = async (item, index) => {
        // LƯU Ý: net_salary từ Backend mới đã trừ sẵn late_deduction rồi
        const finalSalary = (item.net_salary || 0) + (item.bonus || 0) - (item.deduction || 0);

        try {
            const token = localStorage.getItem('auth_token');
            await axios.post(`${BASE_URL}/api/payroll/store`, {
                user_id: item.user_id,
                month: month,
                year: year,
                total_work_days: item.total_work_days,
                paid_leave_days: item.paid_leave_days, 
                total_payable_days: item.total_payable_days,
                total_late_minutes: item.total_late_minutes,
                late_deduction: item.late_deduction,
                bonus: item.bonus,
                deduction: item.deduction,
                insurance_amount: item.total_insurance,
                final_salary: finalSalary,
                status: 'paid'
            }, { headers: { Authorization: `Bearer ${token}` } });

            const newData = [...drafts];
            newData[index].status = 'paid';
            setDrafts(newData);

            alert(`✅ Đã chốt lương cho ${item.name} thành công!`);
        } catch (error) { alert("❌ Lỗi khi lưu phiếu lương!"); }
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang tính toán bảng lương...</div>;

    return (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#2d3748', borderLeft: '5px solid #6366f1', paddingLeft: '15px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between' }}>
                💰 Quản lý Lương - {month}/{year}
                <button onClick={fetchDraftData} style={{ fontSize: '14px', cursor: 'pointer', background: 'none', border: '1px solid #ddd', borderRadius: '5px', padding: '5px 10px' }}>Làm mới 🔄</button>
            </h2>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #edf2f7' }}>
                        <th style={thStyle}>Nhân viên</th>
                        <th style={thStyle}>Công thực tế</th>
                        <th style={thStyle}>Nghỉ có lương</th>
                        <th style={thStyle}>Tổng công</th>
                        <th style={thStyle}>Đi trễ (phút)</th>
                        <th style={thStyle}>Bảo hiểm</th>
                        <th style={thStyle}>Thưởng/Phạt thêm</th>
                        <th style={thStyle}>Thực nhận</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {drafts.map((item, index) => {
                        // Tính toán thực nhận: net_salary từ backend đã trừ sẵn late_deduction và insurance
                        const final = (item.net_salary || 0) + (item.bonus || 0) - (item.deduction || 0);
                        const isPaid = item.status === 'paid';

                        return (
                            <tr key={index} style={{ borderBottom: '1px solid #edf2f7', background: isPaid ? '#f0fff4' : 'transparent', transition: '0.3s' }}>
                                <td style={tdStyle}>
                                    <strong>{item.name}</strong><br/>
                                    <small style={{color: '#718096'}}>{item.salary_level}</small>
                                </td>

                                <td style={tdStyle}>{item.total_work_days} ngày</td>
                                
                                {/* HIỂN THỊ NGÀY NGHỈ PHÉP ĐƯỢC TRẢ LƯƠNG */}
                                <td style={{ ...tdStyle, color: '#3182ce' }}>+{item.paid_leave_days} ngày</td>
                                
                                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{item.total_payable_days} ngày</td>

                                <td style={tdStyle}>
                                    <div style={{ fontWeight: '600' }}>{item.total_late_minutes} phút</div>
                                    <small style={{ color: '#e53e3e' }}>-{Number(item.late_deduction).toLocaleString()}đ</small>
                                </td>

                                <td style={{ ...tdStyle, color: '#e53e3e' }}>
                                    -{Number(item.total_insurance).toLocaleString()}đ
                                </td>

                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input type="number" style={inputStyle} value={item.bonus} onChange={(e) => handleValueChange(index, 'bonus', e.target.value)} disabled={isPaid} title="Thưởng" />
                                        <input type="number" style={{ ...inputStyle, borderColor: '#feb2b2' }} value={item.deduction} onChange={(e) => handleValueChange(index, 'deduction', e.target.value)} disabled={isPaid} title="Phạt vi phạm" />
                                    </div>
                                </td>

                                <td style={{ ...tdStyle, color: '#2f855a', fontWeight: 'bold', fontSize: '16px' }}>
                                    {final.toLocaleString()}đ
                                </td>

                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                    <button onClick={() => handleConfirmSalary(item, index)} style={isPaid ? btnSuccessStyle : btnPrimaryStyle} disabled={isPaid}>
                                        {isPaid ? '✓ Đã chốt' : 'Chốt lương'}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// Styles
const thStyle = { padding: '15px', color: '#4a5568', fontSize: '13px', fontWeight: '600' };
const tdStyle = { padding: '15px', fontSize: '14px' };
const inputStyle = { width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none' };
const btnPrimaryStyle = { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const btnSuccessStyle = { background: '#ecfdf5', color: '#10b981', border: '1px solid #10b981', padding: '8px 16px', borderRadius: '8px', fontWeight: '600' };

export default PayrollManagement;