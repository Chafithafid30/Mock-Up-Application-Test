import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';

interface Item {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface TransactionResult {
  id: number;
  transactionDate: string;
  itemName: string;
  category: string;
  quantity: number;
  pricePerItem: number;
  totalPrice: number;
  remainingStock: number;
}

export default function POSPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [error, setError] = useState('');
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      const res = await api.get('/items');
      setItems(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Gagal mengambil data barang.');
      } else {
        setError('Gagal mengambil data barang.');
      }
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const selectedItem = items.find((item) => item.id === Number(itemId));

  const totalPrice =
    selectedItem && Number(quantity) > 0
      ? selectedItem.price * Number(quantity)
      : 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!itemId) {
      setError('Pilih item terlebih dahulu.');
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError('Jumlah harus lebih dari 0.');
      return;
    }

    if (selectedItem && Number(quantity) > selectedItem.stock) {
      setError(`Stok tidak cukup. Stok tersedia: ${selectedItem.stock}`);
      return;
    }

    try {
      setLoadingSubmit(true);

      const res = await api.post('/pos/transactions', {
        itemId: Number(itemId),
        quantity: Number(quantity),
      });

      setResult(res.data);
      setItemId('');
      setQuantity('');
      await fetchItems();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || 'Terjadi kesalahan saat transaksi.'
        );
      } else {
        setError('Terjadi kesalahan saat transaksi.');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6"> Point of Sale</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        {loadingItems ? (
          <p className="text-gray-500">Memuat data barang...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Item
              </label>
              <select
                required
                value={itemId}
                onChange={(e) => {
                  setItemId(e.target.value);
                  setResult(null);
                  setError('');
                }}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">-- Pilih Barang --</option>
                {items.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    disabled={item.stock === 0}
                  >
                    {item.name} {item.stock === 0 ? '(Habis)' : `(Stok: ${item.stock})`} — Rp{' '}
                    {item.price.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-1">
                <p>
                  <b>Kategori:</b> {selectedItem.category}
                </p>
                <p>
                  <b>Harga/item:</b> Rp {selectedItem.price.toLocaleString('id-ID')}
                </p>
                <p>
                  <b>Stok tersedia:</b>{' '}
                  <span
                    className={`font-semibold ${
                      selectedItem.stock < 5 ? 'text-red-500' : 'text-green-600'
                    }`}
                  >
                    {selectedItem.stock} unit
                  </span>
                </p>
                {Number(quantity) > 0 && (
                  <p className="text-lg font-bold text-blue-700 pt-1 border-t mt-1">
                    Total: Rp {totalPrice.toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah
              </label>
              <input
                required
                type="number"
                min="1"
                max={selectedItem?.stock || undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Masukkan jumlah"
              />
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loadingSubmit}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold disabled:opacity-70"
            >
              {loadingSubmit ? 'Memproses...' : ' Proses Transaksi'}
            </button>
          </form>
        )}
      </div>

      {result && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-6 space-y-1">
          <h2 className="font-bold text-green-700 text-lg mb-3">
            ✅ Transaksi Berhasil
          </h2>
          <p>
            Item: <b>{result.itemName}</b>
          </p>
          <p>
            Kategori: <b>{result.category}</b>
          </p>
          <p>
            Jumlah: <b>{result.quantity} unit</b>
          </p>
          <p>
            Harga/item: <b>Rp {result.pricePerItem.toLocaleString('id-ID')}</b>
          </p>
          <p className="text-lg font-bold text-green-700 pt-1 border-t">
            Total: Rp {result.totalPrice.toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-gray-500">
            Sisa Stok: {result.remainingStock} unit
          </p>
        </div>
      )}
    </div>
  );
}