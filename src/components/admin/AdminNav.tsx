import Link from 'next/link';
import React from 'react';

const AdminNav: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/admin/dashboard" className="text-white hover:text-gray-300">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/admin/users" className="text-white hover:text-gray-300">
            Users
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNav;