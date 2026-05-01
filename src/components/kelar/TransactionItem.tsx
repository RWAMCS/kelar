import { formatRupiah } from '@/lib/utils';
import CategoryIcon from './CategoryIcon';

interface TxProps {
  transaction: {
    id: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    category: string;
    merchant: string;
    wallet: string;
  }
}

export default function TransactionItem({ transaction }: TxProps) {
  const isIncome = transaction.type === 'income';
  const isExpense = transaction.type === 'expense';
  const isTransfer = transaction.type === 'transfer';
  
  return (
    <div className="bg-white px-3.5 py-3 rounded-2xl flex items-center gap-3 border border-gray-50 active:bg-gray-50 transition-colors">
      <CategoryIcon category={transaction.category} type={transaction.type} />
      
      <div className="flex-1 overflow-hidden min-w-0">
        <p className="font-bold text-[13px] text-gray-800 line-clamp-1">{transaction.merchant}</p>
        <p className="text-[11px] text-gray-400 font-medium line-clamp-1">{transaction.wallet}</p>
      </div>
      
      <div className="text-right flex-shrink-0">
        <p className={`font-black text-[13px] ${
          isIncome ? 'text-emerald-500' : 
          isExpense ? 'text-red-400' : 
          'text-blue-500'
        }`}>
          {isIncome ? '+' : isExpense ? '-' : '↔'}{formatRupiah(transaction.amount)}
        </p>
      </div>
    </div>
  );
}
