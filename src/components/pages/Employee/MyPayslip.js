import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';

const BASE_URL = 'https://hrm-backend-iybp.onrender.com';

function MyPayslip() {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Phieu_Luong_Ca_Nhan',
    });

    useEffect(() => {
        const fetchMyPayslips = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const res = await axios.get(`${BASE_URL}/api/my-payslips`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayslips(Array.isArray(res.data) ? res.data : [res.data]);
            } catch (error) {
                console.error("Lỗi lấy phiếu lương:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyPayslips();
    }, []);

    if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu lương...</div>;

    return (
        <div style={{ padding: '25px', maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#2d3748', margin: 0 }}>📄 Lịch Sử Phiếu Lương</h2>
                <button onClick={() => handlePrint()} style={btnDownloadStyle} disabled={payslips.length === 0}>
                    📥 In Phiếu
                </button>
            </div>

            <div ref={componentRef} style={{ background: '#f7fafc', padding: '15px' }}>
                {payslips.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#a0aec0' }}>Bạn chưa có dữ liệu lương chính thức.</p>
                ) : (
                    payslips.map((slip, index) => {
                        // --- TRÍCH XUẤT DỮ LIỆU ---
                        const lateMinutes = Number(slip.total_late_minutes || 0);
                        const lateDeduction = Number(slip.late_deduction || 0);

                        // 1. Khai báo các biến cơ bản trước
                        const workDays = Number(slip.total_work_days || 0);
                        const paidLeaveDays = Number(slip.paid_leave_days || 0);

                        // 2. Sau đó mới dùng chúng để tính biến tổng hợp
                        const totalPayableDays = workDays + paidLeaveDays;

                        const final = Number(slip.final_salary || 0);
                        const bonus = Number(slip.bonus || 0);
                        const deduction = Number(slip.deduction || 0);
                        const insurance = Number(slip.insurance_amount || 0);
                        const employeeName = slip.user?.name || "Nhân viên";

                        // Lương gốc tính theo tổng ngày công (thực tế + nghỉ phép)
                        const salaryByDays = final - bonus + insurance + deduction + lateDeduction;

                        return (
                            <div key={slip.id || index} style={paperStyle}>
                                <div style={headerStyle}>
                                    <h2 style={{ margin: 0, color: '#2b6cb0' }}>PHIẾU CHI LƯƠNG CHI TIẾT</h2>
                                    <p style={{ fontWeight: 'bold' }}>Tháng {slip.month} / Năm {slip.year}</p>
                                </div>

                                <div style={infoGrid}>
                                    <div><strong>Nhân viên:</strong> {employeeName}</div>
                                    <div><strong>Mã NV:</strong> NV-{slip.user_id}</div>
                                    <div><strong>Công thực tế:</strong> {workDays} ngày</div>
                                    <div><strong>Nghỉ có lương:</strong> {paidLeaveDays} ngày</div>
                                    <div><strong>Tổng tính lương:</strong> <span style={{ fontWeight: 'bold', color: '#2b6cb0' }}>{totalPayableDays} ngày</span></div>
                                    <div><strong>Trạng thái:</strong>
                                        <span style={{ color: slip.status === 'paid' ? '#38a169' : '#dd6b20', marginLeft: '5px' }}>
                                            {slip.status === 'paid' ? '● Đã thanh toán' : '● Đã chốt'}
                                        </span>
                                    </div>
                                </div>

                                <table style={tableStyle}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#edf2f7' }}>
                                            <th style={thStyle}>Diễn giải khoản mục</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Thành tiền (VNĐ)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colSpan="2" style={sectionTitle}>I. THU NHẬP</td></tr>
                                        <tr>
                                            <td style={tdStyle}>
                                                Lương tính theo ngày công ({totalPayableDays} ngày)
                                                <br />
                                                <small style={{ color: '#718096' }}>(Bao gồm {workDays} công thực tế + {paidLeaveDays} ngày nghỉ phép)</small>
                                            </td>
                                            <td style={tdNumberStyle}>{salaryByDays.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td style={tdStyle}>Thưởng & Phụ cấp</td>
                                            <td style={{ ...tdNumberStyle, color: '#38a169' }}>+{bonus.toLocaleString()}</td>
                                        </tr>

                                        <tr><td colSpan="2" style={sectionTitle}>II. KHẤU TRỪ</td></tr>
                                        <tr>
                                            <td style={tdStyle}>Bảo hiểm bắt buộc (BHXH, BHYT, BHTN)</td>
                                            <td style={tdNumberStyle}>-{insurance.toLocaleString()}</td>
                                        </tr>

                                        <tr style={{ color: lateDeduction > 0 ? '#e53e3e' : 'inherit' }}>
                                            <td style={tdStyle}>Khấu trừ đi trễ ({lateMinutes} phút)</td>
                                            <td style={tdNumberStyle}>-{lateDeduction.toLocaleString()}</td>
                                        </tr>

                                        <tr>
                                            <td style={tdStyle}>Khấu trừ khác (Phạt vi phạm/Nội quy)</td>
                                            <td style={{ ...tdNumberStyle }}>-{deduction.toLocaleString()}</td>
                                        </tr>

                                        <tr style={{ backgroundColor: '#ebf8ff', fontWeight: 'bold' }}>
                                            <td style={{ ...tdStyle, fontSize: '16px', color: '#2c5282' }}>TỔNG THỰC NHẬN</td>
                                            <td style={{ ...tdNumberStyle, fontSize: '18px', color: '#2b6cb0' }}>
                                                {final.toLocaleString()} VNĐ
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style={footerSignature}>
                                    <div><p><strong>Người lập phiếu</strong></p><br /><br /><p>(Ký tên)</p></div>
                                    <div><p><strong>Nhân viên</strong></p><br /><br /><p>(Ký tên)</p></div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// ... (Giữ nguyên các biến Styles phía dưới của bạn)
const paperStyle = { background: '#fff', padding: '40px', border: '1px solid #ddd', marginBottom: '30px', pageBreakAfter: 'always', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const headerStyle = { textAlign: 'center', marginBottom: '25px', borderBottom: '2px solid #3182ce', paddingBottom: '10px' };
const infoGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', fontSize: '15px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { padding: '12px', borderBottom: '1px solid #cbd5e0', textAlign: 'left' };
const tdStyle = { padding: '10px', borderBottom: '1px solid #edf2f7' };
const tdNumberStyle = { textAlign: 'right', padding: '10px', borderBottom: '1px solid #edf2f7' };
const sectionTitle = { padding: '8px 10px', fontWeight: 'bold', backgroundColor: '#f8fafc', color: '#4a5568' };
const footerSignature = { display: 'flex', justifyContent: 'space-between', marginTop: '40px', textAlign: 'center' };
const btnDownloadStyle = { backgroundColor: '#3182ce', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' };

export default MyPayslip;