interface SkeletonProps {
  className?: string;
  type?: 'text' | 'avatar' | 'card' | 'input';
}

export default function Skeleton({ className = '', type = 'text' }: SkeletonProps) {
  const baseClass = "animate-pulse bg-gray-200";
  
  const typeMap = {
    text: "h-4 w-full rounded",
    avatar: "h-12 w-12 rounded-full",
    card: "h-32 w-full rounded-2xl",
    input: "h-12 w-full rounded-xl"
  };

  return (
    <div className={`${baseClass} ${typeMap[type]} ${className}`} />
  );
}
