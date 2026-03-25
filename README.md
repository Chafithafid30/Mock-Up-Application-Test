# Cara Menjalankan Project Mock-Up-Application-Test

 ## 1. Clone repository
git clone git@github.com:Chafithafid30/Mock-Up-Application-Test.git


## 2. Struktur project. Pastikan project memiliki 2 bagian utama

POS.API → backend .NET Core
pos-client → frontend React


## 3. Menjalankan Backend (POS.API)
- Masuk ke folder backend:
cd POS.API

- Pastikan .NET SDK sudah terpasang:
Cek versi: dotnet --version

- Restore dependency:
dotnet restore

- Cek file konfigurasi appsettings.json:
Pastikan konfigurasi seperti berikut sudah benar, terutama untuk database dan JWT, seperti berikut
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=pos.db"
  },
  "Jwt": {
    "Key": "your-secret-key",
    "Issuer": "POS.API",
    "Audience": "POS.Client"
  }
}

- Jalankan migration database:
dotnet ef database update

- Kalau dotnet ef belum tersedia:
dotnet tool install --global dotnet-ef

- Jalankan backend:
dotnet run

- Backend berjalan di:
http://localhost:5152

- Misal kalau backend gagal jalan
Cek: dotnet restore
Lalu kemudian: dotnet build
Kalau misal terjadi error migration, maka: dotnet ef database update


## 4. Akses Swagger
Swagger digunakan untuk melihat dan menguji endpoint API:
http://localhost:5152/swagger


## 5. Menjalankan Frontend (pos-client)
- Buka terminal baru lalu masuk ke folder frontend:
cd pos-client

- Pastikan Node.js sudah terpasang:
node -v
npm -v

- Install dependency frontend:
npm install

- Buat file .env di folder pos-client, lalu isi:
VITE_API_URL=http://localhost:5152/api
Kalau backend jalan di port lain, sesuaikan aja URL-nya

- Jalankan frontend:
npm run dev

- Frontend akan berjalan di:
http://localhost:5173


## 6. INFORMASI TAMBAHAN 
- Default Login:
Username: admin
Password: admin123

- Kalau port backend atau frontend bentrok, ubah:
backend di launchSettings.json, frontend lewat konfigurasi Vite, atau jalankan ulang di port lain

backend di launchSettings.json
frontend lewat konfigurasi Vite atau jalankan ulang di port lain
