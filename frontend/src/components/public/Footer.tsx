
export default function Footer() {
  return (
    <footer className="w-full border-t bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
        © {new Date().getFullYear()} RentEase. All rights reserved.
      </div>
    </footer>
  );
}
