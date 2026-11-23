// Data array berisi 3 objek produk
const produk = [
  { nama: "Kemeja Katun", harga: 85000 },
  { nama: "Sepatu Kulit", harga: 250000 },
  { nama: "Tas Ransel", harga: 150000 }
];

// Menggunakan method .map() untuk mengeluarkan kalimat promosi
const kalimatPromosi = produk.map((item) => {
  const label = item.harga > 100000 ? ' "barang mewah"' : '';
  return `Dapatkan ${item.nama} hanya dengan harga Rp${item.harga.toLocaleString('id-ID')}!${label}`;
});

// Menampilkan hasil ke console
kalimatPromosi.forEach((kalimat) => console.log(kalimat));