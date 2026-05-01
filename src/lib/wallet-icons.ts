export const WALLET_PRESETS = {
  bank: [
    { id: 'bca', name: 'BCA', initial: 'BCA', color: '#005BAC', textColor: '#fff' },
    { id: 'mandiri', name: 'Mandiri', initial: 'MDR', color: '#003D7C', textColor: '#FFD700' },
    { id: 'bri', name: 'BRI', initial: 'BRI', color: '#003D7C', textColor: '#FF6B00' },
    { id: 'bni', name: 'BNI', initial: 'BNI', color: '#FF6600', textColor: '#fff' },
    { id: 'bsi', name: 'BSI', initial: 'BSI', color: '#4CAF50', textColor: '#fff' },
    { id: 'permata', name: 'Permata', initial: 'PMT', color: '#E91E63', textColor: '#fff' },
    { id: 'cimb', name: 'CIMB', initial: 'CIMB', color: '#CC0000', textColor: '#fff' },
    { id: 'danamon', name: 'Danamon', initial: 'DAN', color: '#FF4800', textColor: '#fff' },
    { id: 'other_bank', name: 'Bank Lain', initial: '🏦', color: '#607D8B', textColor: '#fff' },
  ],
  ewallet: [
    { id: 'gopay', name: 'GoPay', initial: 'GP', color: '#00880A', textColor: '#fff' },
    { id: 'ovo', name: 'OVO', initial: 'OVO', color: '#4C3494', textColor: '#fff' },
    { id: 'dana', name: 'DANA', initial: 'DNA', color: '#118EEA', textColor: '#fff' },
    { id: 'shopeepay', name: 'ShopeePay', initial: 'SPY', color: '#EE4D2D', textColor: '#fff' },
    { id: 'linkaja', name: 'LinkAja', initial: 'LA', color: '#E4022C', textColor: '#fff' },
    { id: 'jeniuspay', name: 'Jenius', initial: 'JNS', color: '#2F6EBA', textColor: '#fff' },
  ],
  other: [
    { id: 'cash', name: 'Cash', initial: '💵', color: '#4CAF50', textColor: '#fff' },
    { id: 'credit', name: 'Kredit', initial: '💳', color: '#9C27B0', textColor: '#fff' },
    { id: 'saving', name: 'Tabungan', initial: '🐷', color: '#FF9800', textColor: '#fff' },
  ]
}

export function getWalletPreset(name: string) {
  if (!name) return { initial: '💳', color: '#2A9D8F', textColor: '#fff' }
  const lower = name.toLowerCase()
  const all = [...WALLET_PRESETS.bank, ...WALLET_PRESETS.ewallet, ...WALLET_PRESETS.other]
  return all.find(p => lower.includes(p.id) || lower.includes(p.name.toLowerCase()))
    ?? { initial: name.slice(0,3).toUpperCase(), color: '#2A9D8F', textColor: '#fff' }
}
