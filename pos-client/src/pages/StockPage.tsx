import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';

interface StockItem {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export default function StockPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        const res = await api.get('/items/stock');
        setStockItems(res.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Gagal mengambil data stok.');
        } else {
          setError('Gagal mengambil data stok.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6"> Laporan Stok</h1>

      {loading && (
        <div className="bg-white rounded-xl shadow p-4 text-gray-600">
          Memuat data stok...
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-purple-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Gambar</th>
                <th className="px-4 py-3 text-left">Nama Barang</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Harga</th>
                <th className="px-4 py-3 text-left">Stok</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                        📦
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">Rp {item.price.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3">{item.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.stock === 0
                          ? 'bg-red-100 text-red-600'
                          : item.stock < 5
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.stock === 0 ? 'Habis' : item.stock < 5 ? 'Menipis' : 'Tersedia'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {stockItems.length === 0 && (
            <p className="text-center text-gray-400 py-8">Belum ada data stok.</p>
          )}
        </div>
      )}
    </div>
  );
}