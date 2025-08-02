
interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newItem: { title: string; description: string }) => void;
}

export default function ItemModal({ isOpen, onClose, onSave }: ItemModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add New Item</h2>
        <input type="text" placeholder="Title" className="border p-2 mb-2 w-full" />
        <textarea placeholder="Description" className="border p-2 mb-4 w-full"></textarea>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={() => onSave({ title: "New Item", description: "Description" })} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
