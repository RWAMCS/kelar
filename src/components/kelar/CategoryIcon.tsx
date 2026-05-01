import { 
  Coffee, Utensils, Home, User, Car, Wrench, Gamepad2, 
  ShoppingBag, Receipt, HeartPulse, TrendingUp, DollarSign, 
  Store, Gift, ArrowRightLeft, CircleEllipsis 
} from 'lucide-react';

interface Props {
  category: string;
  type: string;
}

export default function CategoryIcon({ category, type }: Props) {
  const cat = (category || '').toLowerCase();
  
  let Icon = DollarSign;
  let bgClass = "bg-gray-100";
  let textClass = "text-gray-600";
  
  if (cat === 'makanan' || cat === 'makan' || cat === 'food') { Icon = Utensils; bgClass = "bg-orange-100"; textClass = "text-orange-600"; }
  else if (cat === 'minuman') { Icon = Coffee; bgClass = "bg-amber-100"; textClass = "text-amber-600"; }
  else if (cat === 'kebutuhan rumah') { Icon = Home; bgClass = "bg-indigo-100"; textClass = "text-indigo-600"; }
  else if (cat === 'kebutuhan pribadi' || cat === 'belanja' || cat === 'shopping') { Icon = ShoppingBag; bgClass = "bg-pink-100"; textClass = "text-pink-600"; }
  else if (cat === 'transportasi' || cat === 'transport') { Icon = Car; bgClass = "bg-blue-100"; textClass = "text-blue-600"; }
  else if (cat === 'servis kendaraan') { Icon = Wrench; bgClass = "bg-slate-200"; textClass = "text-slate-700"; }
  else if (cat === 'hobi' || cat === 'hiburan') { Icon = Gamepad2; bgClass = "bg-purple-100"; textClass = "text-purple-600"; }
  else if (cat === 'tagihan') { Icon = Receipt; bgClass = "bg-red-100"; textClass = "text-red-600"; }
  else if (cat === 'kesehatan') { Icon = HeartPulse; bgClass = "bg-rose-100"; textClass = "text-rose-600"; }
  else if (cat === 'investasi') { Icon = TrendingUp; bgClass = "bg-emerald-100"; textClass = "text-emerald-600"; }
  else if (cat === 'gaji' || cat === 'salary') { Icon = DollarSign; bgClass = "bg-green-100"; textClass = "text-green-600"; }
  else if (cat === 'jualan') { Icon = Store; bgClass = "bg-teal-100"; textClass = "text-teal-600"; }
  else if (cat === 'pemberian') { Icon = Gift; bgClass = "bg-fuchsia-100"; textClass = "text-fuchsia-600"; }
  else if (cat === 'transfer') { Icon = ArrowRightLeft; bgClass = "bg-gray-200"; textClass = "text-gray-700"; }
  else { Icon = CircleEllipsis; bgClass = "bg-gray-100"; textClass = "text-gray-500"; }
  
  return (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} ${textClass}`}>
      <Icon size={24} />
    </div>
  );
}
