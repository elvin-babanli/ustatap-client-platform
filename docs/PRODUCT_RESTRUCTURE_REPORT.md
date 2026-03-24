# Product Restructure Report

## 1. Güncellenen sayfalar

| Sayfa / Bileşen | Değişiklik |
|-----------------|------------|
| **AppHeader** | Tek menü butonu, dil seçici, role-aware linkler (Favorites sadece Customer), click-outside ile kapanma |
| **HomeHero** | "Get started" / "Continue as guest" CTA’ları, "Create account to book and pay" alt metni |
| **HomeCategoriesSection** | "Popular categories" başlığı |
| **FeaturedMastersSection** | ProCard kullanımı, kategori + alan bilgisi |
| **ProCard** (yeni) | Ortak pro kartı: isim, kategori, fotoğraf, alan, fiyat, rating, availability, verified badge |
| **MasterProfileClient** | Guest için AuthGate (Book, Message), platform message CTA vurgusu |
| **CustomerSidebar** | My bookings, Favorites label’ları güncellendi |
| **MasterSidebar** | "My listing" (services), link sırası güncellendi |
| **SearchPageClient** | ProCard kullanımı, Distance "Coming soon" notu |
| **AuthGateModal** (yeni) | Book, Favorites, Payment, Message aksiyonları için auth gate |
| **i18n** | authGate, entry, nav (listYourService, myAccount, favorites, myBookings, myListing), popularCategories eklendi |

---

## 2. Guest / Customer / Pro flow hizalama

### Guest
- Ana sayfa: "Get started" ve "Continue as guest"
- Arama, kategoriler, pro profilleri gezinme: açık
- Book / Message tıklandığında AuthGate modal: "Log in to book" / "Create account to continue"
- Favorites: Backend yok, UI shell hazır; ileride AuthGate ile bağlanacak

### Customer
- Header: Favorites, My account (dashboard)
- Panel: My bookings, Favorites, Messages, Profile, Settings
- Booking flow mevcut
- Payment placeholder mevcut

### Pro
- Header: List your service, My account (master dashboard)
- Panel: My listing (services), Incoming bookings, Calendar, Earnings, Verification, vb.
- Availability toggle mevcut

---

## 3. Fully wired alanlar

- ✅ Header / nav (role-aware)
- ✅ Home hero entry (Get started, Continue as guest)
- ✅ Pro cards (name, category, photo, areas, price, rating, availability, verified)
- ✅ Pro profile page (AuthGate ile Book, Message)
- ✅ Customer panel (bookings, favorites, profile)
- ✅ Pro panel (My listing, incoming bookings, availability)
- ✅ Search (service type, location, filters)
- ✅ Register (customer / pro, minimum alanlar)
- ✅ Login (social "Coming soon" placeholders)
- ✅ Multilingual (EN, AZ, RU)

---

## 4. UI shell / Coming soon kalanlar

| Alan | Durum |
|------|-------|
| Favorites "Add to favorites" butonu | Backend API yok, şu an sadece shell |
| Distance filter (search) | "Coming soon" notu gösteriliyor |
| Social login (Google, Facebook) | Login sayfasında disabled + "Coming soon" |
| Real-time map/live tracking | Doc’ta defer edildi |
| Advanced map behavior | Doc’ta defer edildi |

---

## 5. Önerilen sonraki adımlar

1. **Favorites API**: Add/remove favorite pros endpoint’i ve ProCard’a kalp butonu eklenmesi
2. **Guest favorites**: Favorites butonunda AuthGate modal entegrasyonu
3. **Payment flow**: Placeholder’dan gerçek payment entegrasyonuna geçiş
4. **Messages**: Master profile’dan mesaj başlatma (thread oluşturma) akışı
5. **Distance filter**: Backend’de geo query varsa search’e bağlanması
