import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Knotes</h1>

        <p className="lead">
          A simple note-taking application for creating, organizing, and
          managing your notes securely.
        </p>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <Link className="btn btn-primary btn-lg" to="/Notes">
            View My Notes
          </Link>

          <Link className="btn btn-outline-secondary btn-lg" to="/Register">
            Create an Account
          </Link>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title">Create Notes</h3>
              <p className="card-text">
                Quickly create new notes and start writing without unnecessary
                setup or distractions.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title">Edit and Organize</h3>
              <p className="card-text">
                Update existing notes, move between them easily, and keep your
                work organized in one place.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title">Secure Access</h3>
              <p className="card-text">
                Notes are tied to authenticated users and protected using JWT
                authentication and CSRF protection.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 text-center">
        <h2>Built as a RESTful Notes API</h2>

        <p className="text-muted">
          Knotes uses a Flask backend, PostgreSQL database, and a Vite-powered
          frontend running together with Docker.
        </p>
      </div>
    </div>
  );
}

export default Home;
