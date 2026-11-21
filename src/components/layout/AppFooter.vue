<script setup>
import { BRAND } from '@/data/images'
import BaseIcon from '@/components/common/BaseIcon.vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="brand-row">
            <img :src="BRAND.logo" alt="Logo Teh Tarik Pak Cik" width="52" height="52" />
            <div>
              <strong>{{ BRAND.name }}</strong>
              <span>{{ BRAND.tagline }}</span>
            </div>
          </div>
          <p class="brand-note">
            Warung teh tarik dengan menu makanan rumahan dan camilan gorengan.
            Dibuat dadakan, disajikan hangat.
          </p>
          <a :href="BRAND.instagramUrl" target="_blank" rel="noopener" class="social-link">
            <BaseIcon name="instagram" :size="17" />
            {{ BRAND.instagram }}
          </a>
        </div>

        <div class="footer-col">
          <h4>Jelajahi</h4>
          <RouterLink :to="{ path: '/', hash: '#menu' }">Menu</RouterLink>
          <RouterLink :to="{ path: '/', hash: '#tentang' }">Tentang kami</RouterLink>
          <RouterLink :to="{ path: '/', hash: '#galeri' }">Galeri</RouterLink>
          <RouterLink to="/cek-pesanan">Cek status pesanan</RouterLink>
        </div>

        <div class="footer-col">
          <h4>Untuk Staf</h4>
          <RouterLink to="/login">Masuk sistem</RouterLink>
          <RouterLink to="/kasir">Kasir</RouterLink>
          <RouterLink to="/transaksi">Riwayat transaksi</RouterLink>
          <RouterLink to="/owner/dashboard">Dashboard pemilik</RouterLink>
        </div>

        <div class="footer-col">
          <h4>Kunjungi</h4>
          <span class="contact-row">
            <BaseIcon name="map-pin" :size="16" />
            {{ BRAND.location }}
          </span>
          <span class="contact-row">
            <BaseIcon name="clock" :size="16" />
            Buka setiap hari
          </span>
          <span class="contact-row">
            <BaseIcon name="cash" :size="16" />
            Tunai · QRIS · Transfer
          </span>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© {{ year }} {{ BRAND.name }}. Dibuat untuk tugas Pemrograman Berbasis Komponen.</p>
        <p class="footer-small">Data tersimpan lokal di perangkat ini (localStorage).</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 48px;
  padding-block: 56px 28px;
  background: linear-gradient(180deg, #3d2510 0%, #2a1808 100%);
  color: #f3e6d3;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 36px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.brand-row img {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.brand-row strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1.05rem;
}

.brand-row span {
  font-size: 0.8rem;
  color: rgba(243, 230, 211, 0.7);
}

.brand-note {
  max-width: 34ch;
  font-size: 0.86rem;
  line-height: 1.7;
  color: rgba(243, 230, 211, 0.68);
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 0.84rem;
  font-weight: 500;
  color: var(--color-accent-soft);
  transition: color 0.18s ease;
}

.social-link:hover {
  color: #fff;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.86rem;
}

.footer-col h4 {
  margin-bottom: 4px;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(243, 230, 211, 0.55);
  font-family: var(--font-body);
  font-weight: 600;
}

.footer-col a {
  color: rgba(243, 230, 211, 0.82);
  width: fit-content;
  transition: color 0.18s ease;
}

.footer-col a:hover {
  color: #fff;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(243, 230, 211, 0.72);
}

.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 44px;
  padding-top: 20px;
  border-top: 1px solid rgba(243, 230, 211, 0.14);
  font-size: 0.78rem;
  color: rgba(243, 230, 211, 0.55);
}

.footer-small {
  color: rgba(243, 230, 211, 0.4);
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
}

@media (max-width: 560px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
