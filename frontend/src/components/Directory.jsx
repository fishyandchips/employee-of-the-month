import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Directory = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("name");
  const [error, setError] = useState("");

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/employees`, {
        params: {
          search,
          status: statusFilter,
          sort,
          page,
          pageLimit: 25,
        },
        withCredentials: true,
      });

      setEmployees(data.employees);
      setTotalPages(data.totalPages);
      setError("");
    } catch (err) {
      setError(err.response.data.error);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, [page]);

  return (
    <>
      <div className="flex flex-col w-full px-10 py-5 gap-5">
        <h1 className="text-xl font-bold">Employee Directory</h1>

        {error && (
          <div className="p-4 text-red-700 bg-red-100 rounded-md">
            Error: {error}
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchEmployees();
          }}
          className="flex justify-between gap-4"
        >
          <input 
            type="search" 
            placeholder="Search..." 
            className="flex-1 px-5 py-3 rounded-md border"
            onChange={(e) => setSearch(e.target.value)} 
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`border rounded-md px-5 py-3 cursor-pointer ${statusFilter === "" && "text-black/50"}`}
          >
            <option value="" className="text-black/50">Status</option>
            <option value="casual" className="text-black">Casual</option>
            <option value="part-time" className="text-black">Part-time</option>
            <option value="full-time" className="text-black">Full-time</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded-md px-5 py-3 cursor-pointer"
          >
            <option value="name">Name</option>
            <option value="position">Position</option>
            <option value="email">Email</option>
            <option value="status">Status</option>
          </select>

          <button 
            type="submit" 
            className="text-white px-5 py-3 rounded-md bg-blue-500 cursor-pointer hover:bg-blue-600"
          >
            Submit Query
          </button>
        </form>

        <div className="flex justify-center">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Position</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-t">
                  <td className="p-4">
                    <Link
                      to={`/profile/${employee.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {employee.name}
                    </Link>
                  </td>
                  <td className="p-4">{employee.position}</td>
                  <td className="p-4">{employee.email}</td>
                  <td className="p-4">{employee.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center gap-2">
          {page > 3 && (
            <button
              disabled={page <= 2}
              onClick={() => setPage(1)}
              className="text-xl w-10 h-10"
            >
              &lt;&lt;
            </button>
          )}

          {page !== 1 && (
            <button
              onClick={() => setPage(page - 1)}
              className="text-xl w-10 h-10"
            >
              &lt;
            </button>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), Math.min(page + 2, totalPages))
            .map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={`w-10 h-10 rounded-md ${
                  page === number && "bg-blue-500 text-white"
                }`}
              >
                {number}
              </button>
            ))}

          {page < totalPages && (
            <button
              onClick={() => setPage(page + 1)}
              className="text-xl w-10 h-10"
            >
              &gt;
            </button>
          )}

          {page < totalPages - 2 && (
            <button
              onClick={() => setPage(totalPages)}
              className="text-xl w-10 h-10"
            >
              &gt;&gt;
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Directory;
