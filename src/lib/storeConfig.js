// src/lib/storeConfig.js
// ↑ Simpan di sini nomor rekening & e-wallet penjual.
// Ganti nilai di bawah dengan data aslimu.

export const paymentInfo = {
  bankAccounts: [
    {
      bank: "BCA",
      accountNumber: "1234567890",
      accountName: "Rico Coffee",
      note: "Cab. Jakarta"
    },
    {
      bank: "BRI",
      accountNumber: "777888999",
      accountName: "Rico Coffee",
      note: "Unit Pasar Minggu"
    },
    // Tambahkan jika perlu...
  ],
  ewallets: [
    {
      name: "DANA",
      number: "0812-3456-7890",
      accountName: "Rico Coffee"
    },
    {
      name: "OVO",
      number: "0813-2222-4444",
      accountName: "Rico Coffee"
    },
    // Tambahkan jika perlu...
  ],
  instructions: {
    transfer: [
      "Gunakan salah satu nomor rekening di bawah ini.",
      "Cantumkan No. Pesanan pada berita/remark transfer.",
      "Setelah transfer, upload bukti untuk percepat verifikasi."
    ],
    ewallet: [
      "Kirim ke nomor e-wallet di bawah ini.",
      "Tuliskan No. Pesanan di catatan/remark jika tersedia.",
      "Upload bukti setelah pembayaran."
    ]
  }
}