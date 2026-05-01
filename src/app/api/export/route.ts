import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query transactions with wallet names
    const { data: txs, error } = await supabase
      .from('transactions')
      .select(`
        id,
        date,
        type,
        amount,
        category,
        subcategory,
        merchant,
        note,
        wallets ( name )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Prepare CSV header
    const headers = ['ID', 'Tanggal', 'Tipe', 'Nominal', 'Kategori', 'Subkategori', 'Merchant', 'Wallet', 'Catatan'];
    const csvRows = [headers.join(',')];

    // Populate rows
    (txs || []).forEach((row: any) => {
      const wName = row.wallets?.name || '';
      const safeMerchant = `"${(row.merchant || '').replace(/"/g, '""')}"`;
      const safeNote = `"${(row.note || '').replace(/"/g, '""')}"`;

      const values = [
        row.id,
        row.date,
        row.type,
        row.amount,
        row.category || '',
        row.subcategory || '',
        safeMerchant,
        wName,
        safeNote
      ];
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="kelar-export.csv"'
      }
    });

  } catch (error: any) {
    console.error("Export Error: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
