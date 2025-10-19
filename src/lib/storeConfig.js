export const paymentInfo = {
  bankAccounts: [
    {
      bank: "BCA",
      accountNumber: "1234567890",
      accountName: "PT COFFESST",
      note: "Cab. Jakarta"
    },
    {
      bank: "BRI",
      accountNumber: "777888999",
      accountName: "PT COFFESST",
      note: "Unit Pasar Minggu"
    },
    {
      bank: "Mandiri",
      accountNumber: "9988776655",
      accountName: "PT COFFESST",
      note: "KCP Diponegoro"
    },

  ],
  ewallets: [
    {
      name: "DANA",
      number: "0812-3456-7890",
      accountName: "PT COFFESST"
    },
    {
      name: "OVO",
      number: "0813-2222-4444",
      accountName: "PT COFFESST"
    },
    {
      name: "GoPay",
      number: "0815-9999-2222",
      accountName: "PT COFFESST"
    },
  ],
  instructions: {
    transfer: [
      "Gunakan salah nomor rekening di atas ini.",
      "Cantumkan No. Pesanan pada berita/remark transfer.",
      "Setelah transfer, upload bukti untuk mempercepat verifikasi."
    ],
    ewallet: [
      "Kirim ke nomor e-wallet di atas ini.",
      "Tuliskan No. Pesanan di catatan/remark jika tersedia.",
      "Upload bukti setelah pembayaran."
    ]
  }
}
