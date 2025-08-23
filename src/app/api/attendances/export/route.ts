import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import type { attendance } from '@/lib/data';

function getHtml(data: attendance[], month: string, className: string) {
    const calculateAttendance = (present: number, total: number) => {
        if (total === 0) return 0;
        return ((present / total) * 100).toFixed(0);
    };

    const tableRows = data
        .map(
            (item) => `
    <tr>
      <td>${item.nis_siswa}</td>
      <td>${item.nama_siswa}</td>
      <td>${item.class}</td>
      <td class="center">${item.present}</td>
      <td class="center">${item.totalDays}</td>
      <td class="center">${calculateAttendance(item.present, item.totalDays)}%</td>
    </tr>
  `
        )
        .join('');

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Laporan Absensi ${month} - ${className}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #555;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            font-size: 16px;
            line-height: 24px;
          }
          .invoice-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
            border-collapse: collapse;
          }
          .invoice-box table td {
            padding: 8px;
            vertical-align: top;
          }
          .invoice-box table tr td:nth-child(n+3) {
            text-align: right;
          }
          .invoice-box table tr.top table td {
            padding-bottom: 20px;
          }
          .invoice-box table tr.top table td.title {
            font-size: 45px;
            line-height: 45px;
            color: #333;
          }
          .invoice-box table tr.information table td {
            padding-bottom: 40px;
          }
          .invoice-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            text-align: left;
          }
          .invoice-box table tr.heading td.center {
            text-align: center;
          }
          .invoice-box table tr.item td {
            border-bottom: 1px solid #eee;
            text-align: left;
          }
          .invoice-box table tr.item td.center {
            text-align: center;
          }
          .invoice-box table tr.item.last td {
            border-bottom: none;
          }
          .invoice-box table tr.total td:nth-child(2) {
            border-top: 2px solid #eee;
            font-weight: bold;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
          }
          .header .title {
            font-size: 24px;
            font-weight: bold;
          }
          .header .details {
            text-align: right;
          }
          td, th {
            padding: 10px;
          }
          th {
             background-color: #f2f2f2;
          }
          .center {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
           <div class="header">
                <div class="title">Laporan Absensi Siswa</div>
                <div class="details">
                    <strong>Bulan:</strong> ${month}<br>
                    <strong>Kelas:</strong> ${className}<br>
                    <strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </div>
            </div>
            <table>
                <thead>
                    <tr class="heading">
                        <th>NIS</th>
                        <th>Nama Siswa</th>
                        <th>Kelas</th>
                        <th class="center">Hadir</th>
                        <th class="center">Total Hari</th>
                        <th class="center">Persentase</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        data.length > 0
                            ? tableRows
                            : '<tr><td colspan="6" class="center" style="padding: 20px;">Tidak ada data untuk ditampilkan.</td></tr>'
                    }
                </tbody>
            </table>
        </div>
      </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { data, month, className } = body;

        if (!Array.isArray(data) || !month || !className) {
            return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // <- this one doesn't works in Windows
                '--disable-gpu',
            ],
        });
        const page = await browser.newPage();
        const htmlContent = getHtml(data, month, className);
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px',
            },
        });

        await browser.close();

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=laporan-absensi.pdf',
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json({ error: 'Gagal membuat PDF.' }, { status: 500 });
    }
}
