WordMaster Web Challenge
📚 Hakkında
Bu proje, WordPecker isimli kelime öğrenme uygulamasının web tabanlı versiyonunu geliştirmek üzere hazırlanmış bir ekip çalışması projesidir. Uygulama Next.js, TypeScript ve Tailwind CSS teknolojileriyle geliştirilmiştir. Amaç, kullanıcıların kendi kelime listeleriyle etkili bir şekilde öğrenme ve tekrar yapmalarını sağlayan kişiselleştirilmiş bir deneyim sunmaktır.

🌟 Proje Özeti
WordPecker Web, kullanıcıların kendi içeriklerinden (kitaplar, makaleler, vs.) kelimeler çıkararak öğrenmelerini ve bu kelimeleri test etmelerini sağlar.

Uygulamanın sunduğu başlıca özellikler:

Kelime listeleri oluşturma ve yönetme

Öğrenme modülü ile kelime çalışmaları

Quiz modülü ile testler

Kaydedilen kelimeleri tekrar etme

Kullanıcı ilerlemesini takip etme

Sesli komut ve okuma desteği

🧩 Temel Özellikler
Kullanıcı Girişi – Giriş ve kayıt sistemi (/login)

Dashboard – Öğrenme durumunun genel görünümü

Kelime Listeleri – Kelimeleri listeler hâlinde yönetme

Öğrenme Modu – Etkileşimli kelime çalışmaları

Quiz Modu – Kelimeleri test etme

Kaydedilen Kelimeler – Zor/unutulmaması gereken kelimeleri tekrar etme

Ayarlar – Uygulama tercihlerini düzenleme

Mobil Destek – Mobil cihazlar için optimize edilmiş arayüz

Ses Özellikleri – Sesle tanıma ve metin okuma entegrasyonu

Toast Bildirimleri – Kullanıcıya hızlı görsel geri bildirim

🚀 Başlarken
Depoyu klonlayın

Bağımlılıkları yükleyin:

bash
Kopyala
Düzenle
npm install
# veya
yarn install
Geliştirme sunucusunu başlatın:

bash
Kopyala
Düzenle
npm run dev
# veya
yarn dev
Tarayıcıda http://localhost:3000 adresini açın

📁 Proje Yapısı
perl
Kopyala
Düzenle
wordpecker/
├── app/                   # Uygulama sayfaları (Next.js App Router)
│   ├── dashboard/         # Ana sayfa / genel görünüm
│   ├── learn/             # Öğrenme modülü
│   ├── lists/             # Kelime listeleri
│   ├── login/             # Giriş ve kayıt
│   ├── quiz/              # Quiz sayfası
│   ├── settings/          # Ayarlar
│   ├── layout.tsx         # Genel layout bileşeni
│   └── page.tsx           # Uygulama giriş noktası
│
├── components/
│   └── ui/                # Tekrar kullanılabilir arayüz bileşenleri
│       ├── app-layout.tsx
│       ├── saved-words.tsx
│       ├── theme-provider.tsx
│       ├── vocabulary-manager.tsx
│       └── word-list.tsx
│
├── hooks/                 # Özel React hook'ları
│   ├── use-mobile.tsx
│   ├── use-speech-recognition.ts
│   ├── use-speech-synthesis.ts
│   └── use-toast.ts
│
├── lib/                   # Yardımcı fonksiyonlar ve veri araçları
│   ├── data-utils.ts
│   └── utils.ts
│
├── public/                # Statik dosyalar (görseller, simgeler)
├── styles/                # Global stil dosyaları
│   └── globals.css
├── tailwind.config.ts     # Tailwind CSS yapılandırması
├── next.config.mjs        # Next.js yapılandırması
├── tsconfig.json          # TypeScript yapılandırması
└── package.json           # Proje tanımı ve script'ler
✅ Geliştirme Kuralları
Her ekip üyesi en az bir özelliği üstlenmeli

Hook yapısı kullanılarak tekrar edilebilir işlevler izole edilmeli

UI bileşenleri sade ve tutarlı bir tasarımla hazırlanmalı

TypeScript aktif olarak kullanılmalı ve tip güvenliği korunmalı

Kodlar okunabilir, dökümante edilmiş ve yeniden kullanılabilir olmalı

📝 Değerlendirme Kriterleri
Özelliklerin eksiksiz ve işlevsel olması

Kod kalitesi ve modüler yapı

Mobil uyumluluk ve kullanıcı deneyimi

Sesli özelliklerin yaratıcı kullanımı

Takım çalışması ve entegrasyon başarısı