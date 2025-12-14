# Klipp 📎

Belgelerinizi dijital ortamda organize edin ve yönetin. Fatura, fiş, garanti belgesi ve daha fazlasını tarayın, kategorize edin ve güvenle saklayın.

## 🚀 Özellikler

- 📷 **Belge Tarama** - Kamera ile belge tarama ve OCR ile metin çıkarma
- 📁 **Klasör Yönetimi** - Özelleştirilebilir klasörlerle organize edin
- 🤝 **Paylaşım** - Klasörleri diğer kullanıcılarla paylaşın
- 🔔 **Bildirimler** - Push notification desteği
- 🔐 **Güvenli Giriş** - Apple ID ve Google ile giriş

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run start
```

## 🛠️ Geliştirme Komutları

| Komut | Açıklama |
|-------|----------|
| `npm run start` | Expo dev server başlat |
| `npm run start:clear` | Cache temizleyerek başlat |
| `npm run ios` | iOS simulatörde çalıştır |
| `npm run ios:device` | Fiziksel iOS cihazda çalıştır |
| `npm run android` | Android emulatörde çalıştır |
| `npm run lint` | ESLint kontrolü |
| `npm run generate-api` | Swagger'dan API client oluştur |

## 🏗️ Build Komutları

| Komut | Açıklama |
|-------|----------|
| `npm run build:dev` | iOS development build (test için) |
| `npm run build:dev:android` | Android development build |
| `npm run build:preview` | iOS TestFlight build |
| `npm run build:prod` | iOS App Store build |
| `npm run build:prod:android` | Android production build |
| `npm run submit:preview` | TestFlight'a gönder |
| `npm run submit:prod` | App Store'a gönder |
| `npm run credentials` | EAS credentials yönetimi |

## 📁 Proje Yapısı

```
klipp/
├── app/                    # Expo Router sayfaları
│   ├── (auth)/            # Auth ekranları (login, signup)
│   ├── (tabs)/            # Tab navigasyonu
│   │   ├── index.tsx      # Ana sayfa
│   │   ├── folders/       # Klasörler
│   │   ├── notifications.tsx
│   │   └── profile.tsx
│   ├── attachment/        # Belge detay
│   ├── picker/            # Klasör/tip seçici
│   └── scan.tsx           # Tarama ekranı
├── src/
│   ├── features/          # Feature modülleri
│   │   ├── attachments/   # Belge yönetimi
│   │   ├── auth/          # Kimlik doğrulama
│   │   ├── folders/       # Klasör yönetimi
│   │   ├── notifications/ # Bildirimler
│   │   └── sharing/       # Paylaşım
│   └── infrastructure/    # Altyapı
│       ├── api/           # API client
│       ├── config/        # Environment config
│       └── theme/         # Tema/renkler
├── components/            # Paylaşılan componentler
├── credentials/           # Sertifikalar (gitignore'da)
└── assets/               # Font ve görseller
```

## ⚙️ Environment

| Ortam | Açıklama |
|-------|----------|
| **development** | Lokal geliştirme ve test |
| **preview** | TestFlight beta test |
| **production** | App Store yayını |

Environment değişkenleri `eas.json`'da profile bazlı tanımlanır.

## 🔑 Credentials

```bash
# Push notification key ayarla
npm run credentials
# iOS > production > Push Notifications
```

## 📱 Test

### Lokal Test (Simulatör)
```bash
npm run start
# veya
npm run ios
```

### Fiziksel Cihaz Test
```bash
# Development build al
npm run build:dev

# Cihazına yükle ve test et
```

### TestFlight
```bash
npm run build:preview
npm run submit:preview
```

## 🔗 API

API client `swagger.json`'dan otomatik generate edilir:

```bash
npm run generate-api
```

## 📄 Lisans

MIT
