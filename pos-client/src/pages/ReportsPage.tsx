import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';

interface ReportItem {
  id: number;
  transactionDate: string;
  itemName: string;
  category: string;
  quantity: number;
  pricePerItem: number;
  totalPrice: number;
}

interface ReportsApiResponse {
  totalTransaksi?: number;
  totalPendapatan?: number;
  data?: ReportItem[];
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        const res = await api.get<ReportItem[] | ReportsApiResponse>('/pos/reports');

        if (Array.isArray(res.data)) {
          setReports(res.data);
          setTotalTransactions(res.data.length);
          setTotalRevenue(res.data.reduce((sum, item) => sum + item.totalPrice, 0));
        } else {
          const data = res.data.data ?? [];
          setReports(data);
          setTotalTransactions(res.data.totalTransaksi ?? data.length);
          setTotalRevenue(
            res.data.totalPendapatan ??
              data.reduce((sum, item) => sum + item.totalPrice, 0)
          );
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Gagal mengambil laporan transaksi.');
        } else {
          setError('Gagal mengambil laporan transaksi.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6"> Laporan POS</h1>

      {loading && (
        <div className="bg-white rounded-xl shadow p-4 text-gray-600">
          Memuat laporan...
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-sm text-gray-500">Total Transaksi</p>
              <p className="text-2xl font-bold text-blue-700">{totalTransactions}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-sm text-gray-500">Total Pendapatan</p>
              <p className="text-2xl font-bold text-green-700">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Kategori</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Harga/Item</th>
                  <th className="px-4 py-3 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={report.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3">
                      {new Date(report.transactionDate).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 font-medium">{report.itemName}</td>
                    <td className="px-4 py-3">{report.category}</td>
                    <td className="px-4 py-3">{report.quantity}</td>
                    <td className="px-4 py-3">
                      Rp {report.pricePerItem.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      Rp {report.totalPrice.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {reports.length === 0 && (
              <p className="text-center text-gray-400 py-8">Belum ada transaksi.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}