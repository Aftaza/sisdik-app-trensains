import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import type { AttendanceMonthly } from '@/lib/data';

function getHtml(data: AttendanceMonthly[], month: string, className: string, waliKelas: string) {
    // Format bulan dan tahun dari parameter month (misal: "JULI 2025")
    const [bulan, tahun] = month.split(' ');
    const formattedMonth = `${bulan.charAt(0).toUpperCase() + bulan.slice(1).toLowerCase()} ${tahun}`;
    const totalHariEfektif = Math.max(...data.map(item => item.total_hari));
    
    const tableRows = data
        .map((item, index) => {
            // Pastikan semua nilai absensi memiliki nilai default 0 jika undefined
            const alpha = item.alpha || 0;
            const sakit = item.sakit || 0;
            const izin = item.izin || 0;
            const hadir = item.hadir || 0;
            const totalTidakHadir = alpha + sakit + izin;
            const percentage = ((hadir / totalHariEfektif) * 100).toFixed(2).replace('.', ',');
            
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td class="nama-column">${item.nama_siswa}</td>
                    <td>${item.nis_siswa}</td>
                    <td>${alpha}</td>
                    <td>${sakit}</td>
                    <td>${izin}</td>
                    <td>${totalTidakHadir}</td>
                    <td>${((sakit / totalHariEfektif) * 100).toFixed(2).replace('.', ',')}</td>
                    <td>${((izin / totalHariEfektif) * 100).toFixed(2).replace('.', ',')}</td>
                    <td>${((alpha / totalHariEfektif) * 100).toFixed(2).replace('.', ',')}</td>
                    <td>${hadir}</td>
                    <td>${percentage}%</td>
                    <td></td>
                </tr>
            `;
        })
        .join('');

    return `
        <!DOCTYPE html>
        <html lang="id">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Rekap Absensi</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #000;
                        background: white;
                    }

                    .container {
                        width: 100%;
                        max-width: 210mm;
                        margin: 0 auto;
                        padding: 20px;
                    }

                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                        position: relative;
                    }

                    .header-image {
                        width: 100%;
                        height: auto;
                        display: block;
                        margin: 0 auto 15px auto;
                    }

                    .report-title {
                        font-size: 18px;
                        font-weight: bold;
                        text-decoration: underline;
                        margin-bottom: 20px;
                    }

                    .report-info {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 15px;
                        font-size: 11px;
                    }

                    .info-left,
                    .info-right {
                        flex: 1;
                    }

                    .table-container {
                        width: 100%;
                        overflow-x: auto;
                        margin-bottom: 30px;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 10px;
                    }

                    th,
                    td {
                        border: 1px solid #000;
                        padding: 4px;
                        text-align: center;
                        vertical-align: middle;
                    }

                    th {
                        background-color: #f0f0f0;
                        font-weight: bold;
                    }

                    .nama-column {
                        text-align: left;
                        min-width: 180px;
                    }

                    .no-column {
                        width: 30px;
                    }

                    .induk-column {
                        width: 50px;
                    }

                    .absen-column {
                        width: 40px;
                    }

                    .persen-column {
                        width: 50px;
                    }

                    .kehadiran-column {
                        width: 40px;
                    }

                    .ket-column {
                        width: 60px;
                    }

                    .signature-section {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 30px;
                        font-size: 11px;
                    }

                    .signature-box {
                        text-align: center;
                        flex: 1;
                        margin: 0 20px;
                    }

                    .signature-title {
                        margin-bottom: 60px;
                    }

                    .signature-name {
                        text-decoration: underline;
                        font-weight: bold;
                    }

                    .date-location {
                        text-align: right;
                        margin-bottom: 20px;
                        font-size: 11px;
                    }

                    @media print {
                        body {
                            margin: 0;
                        }

                        .container {
                            padding: 10px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <img
                            src="https://res.cloudinary.com/dqofannrv/image/upload/v1756047450/header_trensains_ysdk48.jpg"
                            alt="Header SMA Trensains Tebuireng"
                            class="header-image"
                        />
                        <div class="report-title">REKAP ABSENSI</div>
                        <div style="font-size: 12px; margin-bottom: 15px">
                            <div>BULAN : ${formattedMonth.toUpperCase()}</div>
                            <div>TAHUN PELAJARAN : ${tahun}-${parseInt(tahun) + 1}
                    </div>

                    <!-- Report Information -->
                    <div class="report-info">
                        <div class="info-left">
                            <div>KELAS : ${className}</div>
                            <div>WALI KELAS : ${waliKelas}</div>
                        </div>
                        <div class="info-right">
                            <div>JUMLAH HARI EFEKTIF : ${totalHariEfektif} HARI</div>
                            <div>KET. ABSEN : PAGI & SIANG</div>
                        </div>
                    </div>

                    <!-- Table -->
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th rowspan="2" class="no-column">No. Urut</th>
                                    <th rowspan="2" class="nama-column">Nama</th>
                                    <th rowspan="2" class="induk-column">NO INDUK</th>
                                    <th colspan="3">ABSENSI</th>
                                    <th rowspan="2" class="absen-column">JML TDK HADIR</th>
                                    <th colspan="3">PROSENTASE</th>
                                    <th colspan="2" class="kehadiran-column">JUMLAH KEHADIRAN</th>
                                    <th rowspan="2" class="ket-column">KET.</th>
                                </tr>
                                <tr>
                                    <th class="absen-column">ABSTAIN</th>
                                    <th class="absen-column">Izin</th>
                                    <th class="absen-column">Sakit</th>
                                    <th class="persen-column">SAKIT %</th>
                                    <th class="persen-column">IZIN %</th>
                                    <th class="persen-column">ABSTAIN %</th>
                                    <th class="kehadiran-column">HARI</th>
                                    <th class="kehadiran-column">%</th>
                                </tr>
                            </thead>
                            <tbody id="studentData">
                                <!-- Data siswa akan dimasukkan di sini -->
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>

                    <!-- Date and Location -->
                    <div class="date-location">Jombang, 1 ${bulan} ${tahun}</div>

                    <!-- Signature Section -->
                    <div class="signature-section">
                        <div class="signature-box">
                            <div class="signature-title">Kepala SMA Trensains Tebuireng</div>
                            <div class="signature-name">{{namaKepsek}}</div>
                        </div>
                        <div class="signature-box">
                            <div class="signature-title">Guru BP/BK</div>
                            <div class="signature-name">{{namaGuruBK}}</div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="header">
                        <div class="tagline">Excellent in Qur'an and Science</div>
                    </div>
                </div>
            </body>
        </html>

    `;
}

async function generatePDFWithRetry(htmlContent: string, maxRetries = 3): Promise<Buffer> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        let browser = null;
        let page = null;
        
        try {
            console.log(`PDF Generation attempt ${attempt}/${maxRetries}`);
            
            // Launch browser dengan konfigurasi minimal
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--run-all-compositor-stages-before-draw',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-field-trial-config',
                    '--disable-back-forward-cache',
                    '--disable-hang-monitor',
                    '--disable-ipc-flooding-protection',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI'
                ],
                timeout: 0, // No timeout for browser launch
                protocolTimeout: 0, // No protocol timeout
            });

            // Buat page dengan event listeners untuk debugging
            page = await browser.newPage();
            
            // Event listeners untuk debugging
            page.on('error', (err) => {
                console.log('Page error:', err);
            });
            
            page.on('pageerror', (err) => {
                console.log('Page error:', err);
            });

            // Set viewport yang simple
            await page.setViewport({
                width: 800,
                height: 600,
                deviceScaleFactor: 1
            });
            
            // Set content secara langsung tanpa waitUntil
            await page.setContent(htmlContent);
            
            // Pastikan DOM sudah ready
            await page.evaluate(() => {
                return new Promise<void>((resolve) => {
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', () => resolve());
                    } else {
                        resolve();
                    }
                });
            });

            // Check if page is still connected before generating PDF
            if (page.isClosed()) {
                throw new Error('Page was closed before PDF generation');
            }

            // Generate PDF dengan timeout yang sangat tinggi
            const pdfBuffer = await Promise.race([
                page.pdf({
                    format: 'A4',
                    printBackground: true,
                    margin: {
                        top: '10mm',
                        right: '10mm',
                        bottom: '10mm',
                        left: '10mm',
                    },
                    landscape: false,
                    preferCSSPageSize: false,
                    displayHeaderFooter: false,
                }),
                new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('PDF generation timeout')), 60000);
                })
            ]);

            console.log(`PDF generated successfully on attempt ${attempt}`);
            
            // Clean up
            if (page && !page.isClosed()) {
                await page.close();
            }
            if (browser) {
                await browser.close();
            }

            return Buffer.from(pdfBuffer);

        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            
            // Clean up resources
            try {
                if (page && !page.isClosed()) {
                    await page.close();
                }
                if (browser) {
                    await browser.close();
                }
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }

            // If this was the last attempt, throw the error
            if (attempt === maxRetries) {
                throw error;
            }

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    throw new Error('All PDF generation attempts failed');
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { data, month, className, waliKelas } = body;

        // Validasi parameter yang diperlukan
        if (!Array.isArray(data) || !month || !className || waliKelas === undefined) {
            return NextResponse.json({ 
                error: 'Data tidak valid. Pastikan Anda mengirimkan data, month, className, dan waliKelas' 
            }, { status: 400 });
        }

        // Validasi data tidak kosong
        if (data.length === 0) {
            return NextResponse.json({ 
                error: 'Data siswa tidak boleh kosong' 
            }, { status: 400 });
        }

        console.log('Starting PDF generation for:', { month, className, dataLength: data.length });

        // Generate HTML content
        const htmlContent = getHtml(data, month, className, waliKelas);

        // Generate PDF dengan retry mechanism
        const pdfBuffer = await generatePDFWithRetry(htmlContent);
        
        // Return PDF response dengan headers yang lebih lengkap
        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="rekap-absensi-${month.toLowerCase().replace(' ', '-')}-${className.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Access-Control-Expose-Headers': 'Content-Disposition',
            },
        });

    } catch (error) {
        console.error('Error in PDF generation endpoint:', error);

        return NextResponse.json({ 
            error: 'Gagal membuat PDF. Silakan coba lagi dalam beberapa saat.' 
        }, { status: 500 });
    }
}