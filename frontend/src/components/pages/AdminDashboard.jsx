// src/components/pages/AdminDashboard.js

const AdminDashboard = () => {
  return (
    <div className="container mt-5">
      <h1 className="mb-4">Admin Dashboard</h1>
      <div className="row">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3">
            <div className="card-header">Users</div>
            <div className="card-body">
              <h5 className="card-title">Manage Users</h5>
              <p className="card-text">
                Add, edit, or delete users from the system.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-secondary mb-3">
            <div className="card-header">Companies</div>
            <div className="card-body">
              <h5 className="card-title">Manage Companies</h5>
              <p className="card-text">
                Add, edit, or delete company information.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3">
            <div className="card-header">Reports</div>
            <div className="card-body">
              <h5 className="card-title">View Reports</h5>
              <p className="card-text">Generate and view reports.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
