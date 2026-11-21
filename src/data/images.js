import logo from '@/assets/images/logo.png'
import gerobak from '@/assets/images/gerobak.jpg'
import gerobakMalam from '@/assets/images/gerobak-malam.jpg'
import tempat from '@/assets/images/tempat.jpg'
import posterMenu from '@/assets/images/poster-menu.jpg'
import nasiAyamBlackPepper from '@/assets/images/products/nasi-ayam-black-pepper.jpg'
import nasiGorengKampung from '@/assets/images/products/nasi-goreng-kampung.jpg'
import nasiGorengDua from '@/assets/images/products/nasi-goreng-2.jpg'
import nasiLemak from '@/assets/images/products/nasi-lemak.jpg'
import martabakTelur from '@/assets/images/products/martabak-telur.jpg'

/**
 * Identitas usaha & aset visual.
 * Foto menu hanya dipakai bila tersedia; sisanya memakai ilustrasi
 * (emoji + gradasi) yang datanya berasal dari seed products.json.
 */
export const BRAND = {
  name: 'Teh Tarik Pak Cik',
  shortName: 'Teh Tarik',
  tagline: 'Seduhan khas Malaysia, dimasak dadakan di gerobak.',
  location: 'Kandis, Riau',
  instagram: '@tehtarik_pakcik',
  instagramUrl: 'https://instagram.com/tehtarik_pakcik',
  logo,
  hero: gerobak,
  heroNight: gerobakMalam,
  place: tempat,
  poster: posterMenu
}

export const GALLERY = [
  { src: gerobak, alt: 'Gerobak Teh Tarik Pak Cik saat buka malam hari', caption: 'Gerobak kami' },
  { src: gerobakMalam, alt: 'Meja dan peralatan seduh teh tarik', caption: 'Diseduh langsung' },
  { src: tempat, alt: 'Area tempat duduk lesehan Teh Tarik Pak Cik', caption: 'Lesehan santai' },
  { src: posterMenu, alt: 'Poster menu Teh Tarik Pak Cik', caption: 'Menu andalan' }
]

const PRODUCT_IMAGES = {
  'nasi-ayam-black-pepper': nasiAyamBlackPepper,
  'nasi-goreng-kampung': nasiGorengKampung,
  'nasi-goreng-2': nasiGorengDua,
  'nasi-lemak': nasiLemak,
  'martabak-telur': martabakTelur
}

export function getProductImage(product) {
  if (!product?.image) return null
  return PRODUCT_IMAGES[product.image] ?? null
}

export const EXTRA_PHOTOS = {
  nasiGorengDua,
  nasiLemak
}
