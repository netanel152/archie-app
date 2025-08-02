export default function ItemCardSkeleton() {
  return (
    <div className="bg-white border rounded-lg p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-5 bg-gray-200 rounded-full w-1/3"></div>
      </div>
    </div>
  );
}