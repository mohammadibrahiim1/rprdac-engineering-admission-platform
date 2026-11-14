interface Props {
  active: boolean;
  onClick?: () => void;
}

export default function StatusBadge({ active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition ${
        active
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </button>
  );
}
