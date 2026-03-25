import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';

type Category = 'Makanan' | 'Minuman' | 'Lainnya';

interface Item {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

const initialForm = {
  name: '',
  price: '',
  stock: '',
  category: 'Makanan' as Category,
  image: null as File | null,
};

const errMsg = (err: unknown, fallback: string) =>
  axios.isAxiosError(err) ? err.response?.data?.message || fallback : fallback;

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState({ list: true, submit: false });
  const [message, setMessage] = useState({ error: '', success: '' });

  const isEdit = editingId !== null;

  const setField = (key: keyof typeof initialForm, value: string | File | null) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setCurrentImageUrl('');
    setPreviewUrl('');
    setMessage({ error: '', success: '' });
  };

  const fetchItems = async () => {
    try {
      setLoading((p) => ({ ...p, list: true }));
      const { data } = await api.get('/items');
      setItems(data);
    } catch (err) {
      setMessage((p) => ({ ...p, error: errMsg(err, 'Gagal mengambil data barang.') }));
    } finally {
      setLoading((p) => ({ ...p, list: false }));
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (!form.image) return setPreviewUrl('');
    const url = URL.createObjectURL(form.image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.image]);

  const validate = () => {
    if (!form.name.trim()) return 'Nama barang wajib diisi.';
    if (!form.price || Number(form.price) <= 0) return 'Harga harus lebih dari 0.';
    if (form.stock === '' || Number(form.stock) < 0) return 'Stok tidak boleh negatif.';
    if (form.image && !form.image.type.startsWith('image/')) return 'File harus berupa gambar.';
    if (form.image && form.image.size > 2 * 1024 * 1024) return 'Ukuran gambar maksimal 2 MB.';
    return '';
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ error: '', success: '' });

    const invalid = validate();
    if (invalid) return setMessage({ error: invalid, success: '' });

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('price', String(Number(form.price)));
    fd.append('stock', String(Number(form.stock)));
    fd.append('category', form.category);
    if (form.image) fd.append('image', form.image);

    try {
      setLoading((p) => ({ ...p, submit: true }));
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (isEdit) {
        await api.put(`/items/${editingId}`, fd, config);
        setMessage({ error: '', success: 'Barang berhasil diperbarui.' });
      } else {
        await api.post('/items', fd, config);
        setMessage({ error: '', success: 'Barang berhasil ditambahkan.' });
      }

      resetForm();
      await fetchItems();
    } catch (err) {
      setMessage({ error: errMsg(err, 'Gagal menyimpan data barang.'), success: '' });
    } finally {
      setLoading((p) => ({ ...p, submit: false }));
    }
  };

  const editItem = (item: Item) => {
    setEditingId(item.id);
    setCurrentImageUrl(item.imageUrl || '');
    setForm({
      name: item.name,
      price: String(item.price),
      stock: String(item.stock),
      category: item.category as Category,
      image: null,
    });
    setMessage({ error: '', success: '' });
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus item ini?')) return;

    try {
      await api.delete(`/items/${id}`);
      if (editingId === id) resetForm();
      setMessage({ error: '', success: 'Barang berhasil dihapus.' });
      await fetchItems();
    } catch (err) {
      setMessage({ error: errMsg(err, 'Gagal menghapus barang.'), success: '' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow p-6 h-fit">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isEdit ? 'Edit Barang' : 'Tambah Barang'}
        </h1>

        {message.error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{message.error}</div>}
        {message.success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message.success}</div>}

        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Nama Barang"
            type="text"
            value={form.name}
            onChange={(v) => setField('name', v)}
            placeholder="Contoh: Kopi Susu"
          />
          <Input
            label="Harga"
            type="number"
            min="1"
            value={form.price}
            onChange={(v) => setField('price', v)}
            placeholder="Contoh: 15000"
          />
          <Input
            label="Stok Awal"
            type="number"
            min="0"
            value={form.stock}
            onChange={(v) => setField('stock', v)}
            placeholder="Contoh: 20"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => setField('category', e.target.value as Category)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Makanan">Makanan</option>
              <option value="Minuman">Minuman</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Barang</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setField('image', e.target.files?.[0] || null)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-400 mt-1">Format gambar, maksimal 2 MB.</p>
          </div>

          {(previewUrl || currentImageUrl) && (
            <img
              src={previewUrl || currentImageUrl}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-lg border"
            />
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading.submit}
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg font-semibold disabled:opacity-70"
            >
              {loading.submit ? 'Menyimpan...' : isEdit ? 'Update Barang' : 'Tambah Barang'}
            </button>

            {isEdit && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6"> Daftar Barang</h2>

        {loading.list ? (
          <p className="text-gray-500">Memuat data barang...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-400">Belum ada barang.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-700 text-white">
                <tr>
                  {['No', 'Gambar', 'Nama', 'Kategori', 'Harga', 'Stok', 'Aksi'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">📦</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3">Rp {item.price.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">{item.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <ActionButton text="Edit" className="bg-yellow-400 hover:bg-yellow-500" onClick={() => editItem(item)} />
                        <ActionButton text="Hapus" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => deleteItem(item.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  type,
  value,
  onChange,
  placeholder,
  min,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  min?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
    </div>
  );
}

function ActionButton({
  text,
  className,
  onClick,
}: {
  text: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded text-sm font-medium ${className}`}
    >
      {text}
    </button>
  );
}