'use client';
import { adminFetch } from './admin-client';
import { useMemo, useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import type { Operations, OpsEnvelope } from '../lib/operations';
import { buildExecutiveReport, reportDateTime, reportKindLabels, reportMoney, wibDate } from '../lib/executive-report';
import type { ExecutiveReport, ReportKind } from '../lib/executive-report';
import { Card, Heading, Note } from './operations-components';

export default function ExecutiveReports({ state }: { state: Operations }) {
  const today = wibDate();
  const [kind, setKind] = useState<ReportKind>('month'), [week, setWeek] = useState(today), [month, setMonth] = useState(today.slice(0, 7)), [year, setYear] = useState(today.slice(0, 4));
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState(''), [page, setPage] = useState(0);
  const value = kind === 'week' ? week : kind === 'month' ? month : year;
  const result = useMemo((): { report: ExecutiveReport | null; error: string } => { try { return { report: buildExecutiveReport(state, kind, value), error: '' }; } catch (e) { return { report: null, error: e instanceof Error ? e.message : 'Periode belum valid.' }; } }, [state, kind, value]);
  const report = result.report, currentPage = Math.min(page, Math.max(0, Math.ceil((report?.orders.length || 0) / 20) - 1));
  function changed() { setPage(0); setError(''); setSuccess(''); }
  async function exportPdf() {
    if (busy || !report) return; setBusy(true); setError(''); setSuccess('');
    try {
      // Fetch a fresh, authenticated snapshot so the downloaded report includes recent payments.
      const r = await adminFetch('/admin/api/operations', { cache: 'no-store', signal: AbortSignal.timeout(20000) });
      const data = await r.json() as OpsEnvelope & { error?: string };
      if (!r.ok || !data.state?.records?.orders) throw Error(data.error || 'Data terbaru belum dapat dimuat. Silakan coba lagi.');
      const fresh = buildExecutiveReport(data.state, kind, value);
      const { downloadExecutivePdf } = await import('./executive-report-pdf');
      await downloadExecutivePdf(fresh); setSuccess(`PDF ${reportKindLabels[kind].toLowerCase()} siap: ${fresh.orders.length} pesanan.`);
    } catch (e) { setError(e instanceof Error && !['AbortError', 'TimeoutError', 'TypeError'].includes(e.name) ? e.message : 'Pembuatan PDF belum selesai. Periksa koneksi dan coba lagi.'); }
    finally { setBusy(false); }
  }
  return <>
    <Heading title="Laporan Eksekutif" description="Ringkasan dan rincian pesanan untuk evaluasi mingguan, bulanan, atau tahunan.">
      <button className="button primary" disabled={busy || !report} onClick={() => void exportPdf()}>{busy ? <LoaderCircle className="spin" size={16}/> : <Download size={16}/>} {busy ? 'Menyiapkan PDF...' : 'Unduh laporan PDF'}</button>
    </Heading>
    <div className="ops-date-filter" style={{ flexWrap: 'wrap' }}>
      <label>Periode <select aria-label="Jenis periode laporan" style={{ minHeight: 44, padding: '8px 12px', border: '1px solid #d5e1f2', borderRadius: 8, background: '#fff', color: '#173655', font: 'inherit' }} disabled={busy} value={kind} onChange={e => { setKind(e.target.value as ReportKind); changed(); }}>{Object.entries(reportKindLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      {kind === 'week' ? <label>Tanggal dalam minggu <input aria-label="Tanggal dalam minggu" disabled={busy} type="date" value={week} onChange={e => { setWeek(e.target.value); changed(); }}/></label> : kind === 'month' ? <label>Bulan <input aria-label="Bulan laporan" disabled={busy} type="month" value={month} onChange={e => { setMonth(e.target.value); changed(); }}/></label> : <label>Tahun <input aria-label="Tahun laporan" disabled={busy} type="number" min={1900} max={9998} step={1} value={year} onChange={e => { setYear(e.target.value); changed(); }}/></label>}
      <button type="button" className="text-button" disabled={busy} onClick={() => { setWeek(today); setMonth(today.slice(0, 7)); setYear(today.slice(0, 4)); changed(); }}>Periode saat ini</button>
    </div>
    {(error || result.error) && <div className="ops-error" role="alert">{error || result.error}</div>}
    {success && <p role="status" style={{ color: '#0f5145' }}>{success}</p>}
    {busy && <p role="status">Mengambil data terbaru dan menyiapkan rincian seluruh pesanan...</p>}
    {report && <>
      <p className="ops-muted"><strong>{report.period.label}</strong> · {report.period.from} s.d. {report.period.to} · WIB</p>
      <div className="ops-kpis">{[
        ['PESANAN', String(report.summary.orders), `${report.summary.units} unit, di luar pesanan batal`],
        ['NILAI DIBAYAR', reportMoney(report.summary.paidValue), `${report.summary.paidOrders} pesanan sudah dibayar`],
        ['BELUM DIBAYAR', reportMoney(report.summary.pendingValue), `${report.summary.pendingOrders} pesanan, termasuk draft`],
        ['DIBATALKAN', String(report.summary.cancelledOrders), reportMoney(report.summary.cancelledValue)],
      ].map(([label, amount, detail]) => <div className="ops-kpi" key={label}><div><span>{label}</span></div><strong style={{ fontSize: amount.length > 17 ? 20 : undefined, overflowWrap: 'anywhere' }}>{amount}</strong><p>{detail}</p></div>)}</div>
      <Card title="Rincian pesanan" extra={<span className="ops-chip">{report.orders.length} pesanan</span>}>
        <p className="ops-muted">PDF memuat semua pesanan dalam periode ini beserta nama, nomor pemesan, jumlah produk, harga satuan, diskon, pajak, ongkir, dan total.</p>
        <div className="ops-table-wrap"><table><thead><tr><th>Pesanan / tanggal</th><th>Pemesan</th><th>Produk dan jumlah</th><th>Total</th><th>Status</th></tr></thead><tbody>{report.orders.slice(currentPage * 20, currentPage * 20 + 20).map(o => <tr key={o.id}>
          <td><strong>{o.number}</strong><br/><small>{reportDateTime(o.createdAt)}</small></td>
          <td>{o.name}<br/><small>{o.phone}</small></td>
          <td>{o.items.map((i, index) => <div key={index}>{i.name} × {i.quantity}<br/><small>{reportMoney(i.price)} / unit</small></div>)}</td>
          <td style={{ whiteSpace: 'nowrap' }}>{reportMoney(o.total)}</td><td><span className="ops-chip">{o.status}</span></td>
        </tr>)}</tbody></table></div>
        {!report.orders.length && <div className="ops-empty"><h3>Belum ada pesanan pada periode ini</h3><p>Pilih periode lain atau unduh PDF dengan ringkasan kosong.</p></div>}
        {report.orders.length > 20 && <div className="ops-pagination"><span>Halaman {currentPage + 1} dari {Math.ceil(report.orders.length / 20)}</span><button className="button" disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>Sebelumnya</button><button className="button" disabled={(currentPage + 1) * 20 >= report.orders.length} onClick={() => setPage(currentPage + 1)}>Berikutnya</button></div>}
      </Card>
      <Note>Periode mengikuti tanggal pembuatan pesanan dalam WIB. Minggu dihitung Senin–Minggu. Data simulasi dikecualikan; status pembayaran mengikuti catatan terbaru saat PDF diunduh.</Note>
    </>}
  </>;
}
