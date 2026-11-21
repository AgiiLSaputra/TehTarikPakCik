<script setup>
import { computed, ref } from 'vue'
import { BRAND, GALLERY } from '@/data/images'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import { formatRupiah } from '@/utils/format'
import BaseIcon from '@/components/common/BaseIcon.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import CategoryFilter from '@/components/features/products/CategoryFilter.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ProductCard from '@/components/features/products/ProductCard.vue'

const productStore = useProductStore()
const categoryStore = useCategoryStore()

const query = ref('')
const categoryId = ref('')

const products = computed(() => productStore.activeProducts)

const counts = computed(() => {
  const map = {}
  products.value.forEach((product) => {
    map[product.category_id] = (map[product.category_id] || 0) + 1
  })
  return map
})

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return products.value.filter((product) => {
    const matchCategory = !categoryId.value || product.category_id === categoryId.value
    const matchQuery =
      !needle ||
      product.name.toLowerCase().includes(needle) ||
      String(product.description || '').toLowerCase().includes(needle)
    return matchCategory && matchQuery
  })
})

const cheapest = computed(() => {
  const prices = products.value.map((product) => product.price)
  return prices.length ? Math.min(...prices) : 0
})

const featured = computed(() => products.value.filter((product) => product.is_featured).slice(0, 3))

const signature = computed(
  () =>
    products.value.find((product) => product.name.toLowerCase() === 'teh tarik') ||
    featured.value[0] ||
    null
)

function resetFilters() {
  query.value = ''
  categoryId.value = ''
}
</script>

<template>
  <div class="home">
    <section class="hero">
      <div class="hero-bg" :style="{ backgroundImage: `url(${BRAND.hero})` }" />
      <div class="hero-shade" />
      <div class="container hero-inner">
        <div class="hero-copy">
          <span class="hero-eyebrow">
            <span class="pulse" />
            Warung teh tarik · {{ BRAND.location }}
          </span>
          <h1>
            Seduhan <em>teh tarik</em> khas Malaysia,
            <span>langsung dari gerobak.</span>
          </h1>
          <p class="hero-lead">
            Dimasak dadakan setiap pesanan, ditemani mie, nasi, dan camilan gorengan hangat.
            Mampir, pesan, lalu cek status pesananmu dari ponsel.
          </p>
          <div class="hero-actions">
            <a href="#menu" class="hero-btn hero-btn-primary">
              Lihat Menu
              <BaseIcon name="arrow-right" :size="18" />
            </a>
            <RouterLink to="/cek-pesanan" class="hero-btn hero-btn-ghost">
              <BaseIcon name="search" :size="17" />
              Cek Status Pesanan
            </RouterLink>
          </div>

          <ul class="hero-stats">
            <li>
              <strong>{{ products.length }}</strong>
              <span>menu pilihan</span>
            </li>
            <li>
              <strong>{{ formatRupiah(cheapest) }}</strong>
              <span>mulai dari</span>
            </li>
            <li>
              <strong>Fresh</strong>
              <span>dibuat dadakan</span>
            </li>
          </ul>
        </div>

        <div class="hero-visual">
          <div class="medallion">
            <span class="ring" />
            <img :src="BRAND.logo" alt="Logo Teh Tarik Pak Cik" />
          </div>
          <div v-if="signature" class="floating-card card-top">
            <span class="floating-icon"><BaseIcon name="coffee" :size="17" /></span>
            <div>
              <strong>{{ signature.name }}</strong>
              <small>Signature · {{ formatRupiah(signature.price) }}</small>
            </div>
          </div>
          <div class="floating-card card-bottom">
            <span class="floating-icon"><BaseIcon name="clock" :size="17" /></span>
            <div>
              <strong>Buka setiap hari</strong>
              <small>Pesan di tempat atau bungkus</small>
            </div>
          </div>
        </div>
      </div>

      <div class="hero-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
          <path d="M0 90V44c180 36 360 46 540 30s360-56 540-40 300 62 360 76v-20z" fill="#FFFBF3" />
        </svg>
      </div>
    </section>

    <section id="menu" class="section menu-section">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">Daftar menu</span>
            <h2 class="section-title">Pilih favoritmu hari ini</h2>
            <p class="section-sub">
              Semua harga sudah termasuk porsi warung. Menu dapat berubah, tanyakan langsung ke Pak Cik.
            </p>
          </div>

          <BaseInput v-model="query" placeholder="Cari menu..." class="menu-search">
            <template #icon>
              <BaseIcon name="search" :size="18" class="field-icon" />
            </template>
          </BaseInput>
        </div>

        <CategoryFilter v-model="categoryId" :categories="categoryStore.items" :counts="counts" />

        <div v-if="filtered.length" class="menu-grid">
          <ProductCard v-for="product in filtered" :key="product.id" :product="product" />
        </div>

        <EmptyState
          v-else
          icon="search"
          title="Menu tidak ditemukan"
          description="Coba kata kunci lain atau pilih kategori Semua."
        >
          <button type="button" class="reset-link" @click="resetFilters">Tampilkan semua menu</button>
        </EmptyState>

        <div v-if="featured.length" class="featured">
          <div class="featured-head">
            <span class="eyebrow">Paling dicari</span>
            <h3>Favorit pelanggan</h3>
          </div>
          <div class="featured-list">
            <div v-for="item in featured" :key="item.id" class="featured-item">
              <span class="f-emoji">{{ item.emoji }}</span>
              <div>
                <strong>{{ item.name }}</strong>
                <small>{{ formatRupiah(item.price) }}</small>
              </div>
              <BaseIcon name="sparkles" :size="17" class="f-spark" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="tentang" class="section about">
      <div class="container about-grid">
        <div class="about-visual">
          <figure class="about-photo about-photo-main">
            <img :src="BRAND.place" alt="Area lesehan Teh Tarik Pak Cik" loading="lazy" />
          </figure>
          <figure class="about-photo about-photo-small">
            <img :src="BRAND.heroNight" alt="Gerobak Teh Tarik Pak Cik saat malam" loading="lazy" />
          </figure>
          <div class="about-badge">
            <BaseIcon name="coffee" :size="20" />
            <div>
              <strong>Diseduh langsung</strong>
              <span>di depan mata</span>
            </div>
          </div>
        </div>

        <div class="about-copy">
          <span class="eyebrow">Tentang kami</span>
          <h2 class="section-title">Teh tarik ala Malaysia, rasa warung kampung.</h2>
          <p class="about-lead">
            Berawal dari satu gerobak kecil di {{ BRAND.location }}, Teh Tarik Pak Cik menyajikan
            minuman khas Malaysia dengan teknik tarik agar teksturnya lembut dan berbusa.
            Semua makanan dimasak dadakan setelah pesanan masuk.
          </p>

          <ul class="about-points">
            <li>
              <span class="point-icon"><BaseIcon name="coffee" :size="18" /></span>
              <div>
                <strong>Teh tarik otentik</strong>
                <p>Teh pekat diseduh lalu ditarik dengan susu hingga creamy.</p>
              </div>
            </li>
            <li>
              <span class="point-icon"><BaseIcon name="utensils" :size="18" /></span>
              <div>
                <strong>Dimasak dadakan</strong>
                <p>Mie, nasi, dan gorengan baru dimasak setelah dipesan.</p>
              </div>
            </li>
            <li>
              <span class="point-icon"><BaseIcon name="wallet" :size="18" /></span>
              <div>
                <strong>Harga ramah kantong</strong>
                <p>Mulai {{ formatRupiah(cheapest) }}. Bisa tunai, QRIS, atau transfer.</p>
              </div>
            </li>
          </ul>

          <RouterLink to="/cek-pesanan" class="about-link">
            Sudah pesan? Cek status pesanan
            <BaseIcon name="arrow-right" :size="17" />
          </RouterLink>
        </div>
      </div>
    </section>

    <section id="galeri" class="section gallery-section">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">Galeri</span>
            <h2 class="section-title">Suasana di gerobak</h2>
            <p class="section-sub">Lesehan santai, lampu hangat, dan gerobak yang selalu buka.</p>
          </div>
        </div>

        <div class="gallery-grid">
          <figure v-for="photo in GALLERY" :key="photo.caption" class="gallery-item">
            <img :src="photo.src" :alt="photo.alt" loading="lazy" />
            <figcaption>{{ photo.caption }}</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="section cta-section">
      <div class="container">
        <div class="cta-card">
          <div class="cta-copy">
            <img :src="BRAND.logo" alt="" class="cta-logo" aria-hidden="true" />
            <div>
              <span class="eyebrow">Mampir yuk</span>
              <h2>Pesan langsung di gerobak, atau cek pesananmu dari sini.</h2>
              <p>Terima pesanan di tempat dan dibungkus. Pembayaran tunai, QRIS, atau transfer.</p>
            </div>
          </div>
          <div class="cta-actions">
            <a href="#menu" class="hero-btn hero-btn-primary">
              <BaseIcon name="utensils" :size="17" />
              Lihat Menu
            </a>
            <RouterLink to="/cek-pesanan" class="hero-btn hero-btn-ghost">
              Cek Pesanan
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ------------------------------- HERO ------------------------------- */
.hero {
  position: relative;
  overflow: hidden;
  background: #23140a;
  color: #fff8ec;
  padding: clamp(48px, 7vw, 88px) 0 clamp(72px, 9vw, 112px);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 42%;
  transform: scale(1.03);
}

.hero-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(100deg, rgba(24, 13, 5, 0.95) 0%, rgba(29, 16, 7, 0.85) 42%, rgba(29, 16, 7, 0.35) 72%, rgba(29, 16, 7, 0.55) 100%),
    radial-gradient(600px 320px at 82% 30%, rgba(217, 131, 36, 0.28), transparent 70%);
}

.hero-inner {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  align-items: center;
  gap: 48px;
}

.hero-copy {
  max-width: 620px;
  animation: fadeUp 0.7s var(--ease) both;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 7px 14px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 227, 184, 0.28);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffe3b8;
}

.pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #7fd6a4;
  box-shadow: 0 0 0 4px rgba(127, 214, 164, 0.18);
}

.hero h1 {
  margin-top: 22px;
  font-size: clamp(2.3rem, 1.5rem + 3.3vw, 4rem);
  line-height: 1.08;
  letter-spacing: -0.035em;
  color: #fff8ec;
  max-width: 15ch;
}

.hero h1 em {
  font-style: italic;
  color: #f2b46a;
}

.hero h1 span {
  display: block;
  color: rgba(255, 248, 236, 0.82);
}

.hero-lead {
  margin-top: 20px;
  max-width: 48ch;
  font-size: clamp(0.95rem, 0.9rem + 0.2vw, 1.05rem);
  line-height: 1.7;
  color: rgba(255, 248, 236, 0.72);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 50px;
  padding: 0 24px;
  border-radius: var(--radius-pill);
  font-size: 0.9rem;
  font-weight: 600;
  transition: transform 0.18s var(--ease), background 0.18s ease, box-shadow 0.18s ease;
}

.hero-btn:hover {
  transform: translateY(-2px);
}

.hero-btn-primary {
  background: linear-gradient(135deg, #e39a44, var(--color-accent));
  color: #2b1607;
  box-shadow: 0 18px 32px -18px rgba(217, 131, 36, 0.9);
}

.hero-btn-ghost {
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.08);
  color: #fff8ec;
  backdrop-filter: blur(6px);
}

.hero-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.16);
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 36px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}

.hero-stats li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-stats strong {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffe3b8;
}

.hero-stats span {
  font-size: 0.74rem;
  letter-spacing: 0.04em;
  color: rgba(255, 248, 236, 0.55);
}

.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 420px;
  animation: fadeIn 0.9s ease both;
}

.medallion {
  position: relative;
  display: grid;
  place-items: center;
  width: clamp(220px, 25vw, 300px);
  height: clamp(220px, 25vw, 300px);
  border-radius: 50%;
}

.medallion img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 30px 60px -24px rgba(0, 0, 0, 0.75);
  animation: float 6s ease-in-out infinite;
}

.ring {
  position: absolute;
  inset: -16px;
  border-radius: 50%;
  border: 1px dashed rgba(255, 227, 184, 0.35);
  animation: spinSlow 40s linear infinite;
}

.floating-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 14px;
  background: rgba(255, 251, 243, 0.94);
  color: #2b1b0e;
  box-shadow: 0 18px 36px -20px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
}

.floating-card strong {
  display: block;
  font-size: 0.78rem;
}

.floating-card small {
  font-size: 0.66rem;
  color: #7a6552;
}

.floating-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--color-secondary);
  color: var(--color-primary-dark);
}

.card-top {
  top: 8%;
  right: 0;
}

.card-bottom {
  bottom: 6%;
  left: 0;
}

.hero-wave {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  line-height: 0;
  z-index: 3;
}

.hero-wave svg {
  width: 100%;
  height: 70px;
  display: block;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@keyframes spinSlow {
  to { transform: rotate(360deg); }
}

/* ------------------------------- MENU ------------------------------- */
.menu-section {
  scroll-margin-top: 80px;
  padding-top: clamp(24px, 3vw, 40px);
}

.menu-search {
  width: min(340px, 100%);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 22px;
  margin-top: 26px;
}

.reset-link {
  border: none;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.featured {
  margin-top: 44px;
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border-strong);
  background: linear-gradient(120deg, rgba(245, 230, 204, 0.55), rgba(255, 251, 243, 0.4));
}

.featured-head h3 {
  margin-top: 4px;
  font-size: 1.1rem;
}

.featured-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.featured-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(236, 223, 201, 0.8);
}

.f-emoji {
  font-size: 26px;
}

.featured-item strong {
  display: block;
  font-size: 0.85rem;
}

.featured-item small {
  font-size: 0.74rem;
  color: var(--color-text-muted);
}

.f-spark {
  margin-left: auto;
  color: var(--color-accent);
}

/* ------------------------------- ABOUT ------------------------------- */
.about {
  background: linear-gradient(180deg, rgba(245, 230, 204, 0.35), transparent 70%);
}

.about-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(32px, 5vw, 72px);
  align-items: center;
}

.about-visual {
  position: relative;
  padding-bottom: 48px;
  padding-right: 44px;
}

.about-photo {
  margin: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.about-photo-main {
  aspect-ratio: 4 / 3.4;
}

.about-photo-main img,
.about-photo-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-photo-small {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 46%;
  aspect-ratio: 1 / 1;
  border: 6px solid var(--color-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.about-badge {
  position: absolute;
  top: 18px;
  left: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255, 251, 243, 0.94);
  box-shadow: var(--shadow-md);
  color: var(--color-primary-dark);
}

.about-badge strong {
  display: block;
  font-size: 0.78rem;
}

.about-badge span {
  font-size: 0.68rem;
  color: var(--color-text-muted);
}

.about-copy .section-title {
  margin-top: 10px;
}

.about-lead {
  margin-top: 14px;
  color: var(--color-text-muted);
  line-height: 1.75;
  font-size: 0.94rem;
}

.about-points {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 26px;
}

.about-points li {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.point-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: 11px;
  background: var(--color-secondary);
  color: var(--color-primary-dark);
}

.about-points strong {
  display: block;
  font-size: 0.9rem;
}

.about-points p {
  margin-top: 2px;
  font-size: 0.83rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.about-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 26px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-primary);
}

.about-link:hover {
  color: var(--color-accent);
}

/* ------------------------------- GALLERY ------------------------------- */
.gallery-section {
  scroll-margin-top: 80px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr 1fr;
  gap: 16px;
}

.gallery-item {
  position: relative;
  margin: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: var(--color-secondary);
}

.gallery-item:first-child {
  grid-row: span 2;
  aspect-ratio: auto;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease);
}

.gallery-item:hover img {
  transform: scale(1.06);
}

.gallery-item figcaption {
  position: absolute;
  left: 14px;
  bottom: 12px;
  padding: 5px 11px;
  border-radius: var(--radius-pill);
  background: rgba(43, 27, 14, 0.7);
  backdrop-filter: blur(4px);
  color: #fff5e6;
  font-size: 0.72rem;
  font-weight: 500;
}

/* ------------------------------- CTA ------------------------------- */
.cta-section {
  padding-top: 0;
}

.cta-card {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: clamp(28px, 4vw, 46px);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(520px 260px at 90% 20%, rgba(217, 131, 36, 0.35), transparent 70%),
    linear-gradient(120deg, #43280f 0%, #2a1707 100%);
  color: #fff6e6;
  overflow: hidden;
}

.cta-copy {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  max-width: 640px;
}

.cta-logo {
  width: 74px;
  height: 74px;
  object-fit: contain;
  flex: none;
}

.cta-copy h2 {
  margin-top: 8px;
  font-size: clamp(1.3rem, 1.1rem + 1vw, 1.75rem);
  color: #fff8ec;
  max-width: 24ch;
}

.cta-copy p {
  margin-top: 8px;
  font-size: 0.88rem;
  color: rgba(255, 248, 236, 0.66);
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.cta-actions .hero-btn {
  min-height: 46px;
  padding: 0 20px;
  font-size: 0.85rem;
}

/* ------------------------------- RESPONSIVE ------------------------------- */
@media (max-width: 980px) {
  .hero-inner {
    grid-template-columns: 1fr;
  }

  .hero-visual {
    display: none;
  }

  .hero h1 {
    max-width: 20ch;
  }

  .about-grid {
    grid-template-columns: 1fr;
  }

  .about-visual {
    max-width: 560px;
  }

  .gallery-grid {
    grid-template-columns: 1fr 1fr;
  }

  .gallery-item:first-child {
    grid-column: span 2;
    grid-row: auto;
    aspect-ratio: 16 / 9;
  }
}

@media (max-width: 640px) {
  .hero {
    padding-top: 40px;
  }

  .hero-stats {
    gap: 24px;
  }

  .section-head {
    align-items: flex-start;
  }

  .menu-search {
    width: 100%;
  }

  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .gallery-item:first-child {
    grid-column: auto;
  }

  .cta-copy {
    flex-direction: column;
    gap: 14px;
  }

  .about-visual {
    padding-right: 28px;
    padding-bottom: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .medallion img,
  .ring {
    animation: none;
  }
}
</style>
