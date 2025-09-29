import { useState, useEffect } from 'react';
import { UserPlus, Activity } from 'lucide-react';

// Users Component
export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockUsers = [
          { _id: '1', name: 'John Doe', email: 'john@example.com', createdAt: new Date('2024-01-15') },
          { _id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date('2024-02-10') },
          { _id: '3', name: 'Mike Johnson', email: 'mike@example.com', createdAt: new Date('2024-03-05') },
          { _id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', createdAt: new Date('2024-03-20') }
        ];
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg mb-6 w-32"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Users Management
        </h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <UserPlus className="w-4 h-4" />
          <span>{users.length} total users</span>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100">
                  Name
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100">
                  Email
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100">
                  Joined Date
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr 
                  key={user._id} 
                  className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{user.email}</td>
                  <td className="py-4 px-6 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                      <Activity className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
