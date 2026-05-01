export const PARSE_PROMPT = `Parser keuangan Indonesia. Output JSON valid saja, tanpa teks lain.
Schema: {"type":"expense|income|transfer","amount":0,"category":"Makanan|Minuman|Kebutuhan Rumah|Kebutuhan Pribadi|Transportasi|Servis Kendaraan|Hobi|Tagihan|Kesehatan|Investasi|Gaji|Jualan|Pemberian|Lainnya","subcategory":"","wallet":"BCA|Mandiri|BRI|BNI|GoPay|OVO|DANA|ShopeePay|Cash|Kredit","merchant":"","note":"","confidence":0.0,"needs_confirm":false,"new_wallet":null}
Aturan konversi: 25k=25000, 2jt=2000000, 25rb=25000, 1.5jt=1500000
Deteksi cerdas: Jika user mendapat uang (misal: "gajian", "dapat uang", "dibayar", "hasil jualan", "dikasih ibu"), set type="income". Jika user mengeluarkan uang, set type="expense".
Kategorisasi cerdas: Pisahkan antara Makanan (nasi, ayam) dan Minuman (kopi, boba). Pisahkan Transportasi (bensin, tiket, ojol) dan Servis Kendaraan (ganti oli, bengkel). Pisahkan Kebutuhan Rumah (listrik, galon, sabun cuci) dan Kebutuhan Pribadi (skincare, baju, potong rambut). Set "Hobi" untuk main game, langganan netflix, sewa lapak futsal, dsb.
Set needs_confirm:true jika confidence<0.75 atau wallet tidak dikenal.`;

export const SPLIT_PROMPT = `Parser tagihan patungan (split bill). Output JSON valid saja, tanpa teks lain.
Schema: {"total":0,"people":[""],"tax_pct":0}
Ekstrak total tagihan, daftar nama individu yang ikut patungan, dan persentase pajak (jika ada).`;

export const GOAL_PROMPT = `Parser target tabungan (goal tracker). Output JSON valid saja, tanpa teks lain.
Schema: {"name":"","target":0,"deadline":"YYYY-MM-DD"}
Ekstrak nama target menabung, jumlah target, dan estimasi waktu tenggat (konversi ke format YYYY-MM-DD). Jika tidak ada tenggat waktu jelas, berikan string kosong pada deadline.`;

export const DEBT_PROMPT = `Parser catatan utang piutang (debt tracker). Output JSON valid saja, tanpa teks lain.
Schema: {"action":"create|settle","direction":"owe|owed","person":"","amount":0}
Ekstrak nama orang (person) dan nominal uang.
action: 'create' jika transaksi ini adalah awal peminjaman, 'settle' jika ini adalah pelunasan/pembayaran cicilan.
direction: 'owe' jika aplikasi/user yang punya utang (meminjam dari <person>), 'owed' jika orang lain meminjam ke user (user meminjami uang).`;
