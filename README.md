# ShiftFlow

ShiftFlow, personel ve vardiya yönetimini kolaylaştırmak için geliştirilmiş modern bir full-stack web uygulamasıdır.

## Kullanılan Teknolojiler
- **Backend:** .NET, Entity Framework Core (Code First & Migrations)
- **Frontend:** React, Vite, Tailwind CSS
- **Veritabanı:** Microsoft SQL Server (Docker veya Lokal)

---

## Kurulum ve Çalıştırma Rehberi

Projeyi bilgisayarınıza indirip backend ve frontend çevre değişkenleri, veritabanı bağlantı ayarları, migration'lar ve arayüz dahil tüm sistemi eksiksiz bir şekilde ayağa kaldırmak için aşağıdaki adımları sırasıyla uygulayabilirsiniz:

1. **Backend Çevre Değişkenini (.env) Ayarlayın:**
   Projenin ana klasöründe bulunan `.env.example` dosyasının adını `.env` olarak değiştirin ve içerisine veritabanı şifrenizi yazın:
   
       MSSQL_SA_PASSWORD=GucluSifreniz123!

2. **appsettings.json Dosyasını Düzenleyin:**
   Backend projesinin bulunduğu `ShiftFlow` klasöründeki `appsettings.json` dosyasını açın. `ConnectionStrings` kısmındaki şifrenin `.env` dosyasına yazdığınız şifreyle eşleştiğinden emin olun:
   
       "ConnectionStrings": {
         "DefaultConnection": "Server=localhost;Database=ShiftFlowDb;User Id=sa;Password=GucluSifreniz123!;TrustServerCertificate=True;"
       }

3. **Veritabanını Başlatın:**
   Docker kullanıyorsanız ana dizinde terminali açıp şu komutu çalıştırın:
   
       docker-compose up -d
   
   *(Alternatif olarak kendi lokal SQL Server'ınızı da kullanabilirsiniz.)*

4. **Veritabanı Migration ve Tablolarını Oluşturun:**
   Backend projesinin bulunduğu `ShiftFlow` klasörüne girin. Sunucuda `ShiftFlowDb` adında bir veritabanı henüz yoksa, EF Core otomatik olarak veritabanını oluşturacak ve ardından hazır migration'ları işleyerek tüm tabloları kuracaktır. Bunun için şu komutu çalıştırın:
   
       dotnet ef database update

5. **Backend'i Başlatın:**
   Aynı klasörde terminal üzerinden backend sunucusunu ayağa kaldırın:
   
       dotnet run

6. **Frontend Çevre Değişkenini (.env) Ayarlayın:**
   `frontend` klasörünün içinde bulunan `.env.example` dosyasının adını `.env` olarak değiştirin ve gerekli ayarları kendi ortamınıza göre düzenleyin.

7. **Frontend'i Başlatın:**
   Yeni bir terminal sekmesi açarak `frontend` klasörüne gidin, gerekli paketleri yükleyin ve arayüzü başlatın:
   
       cd frontend
       npm install
       npm run dev
