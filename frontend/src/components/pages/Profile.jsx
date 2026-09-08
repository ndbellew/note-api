import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchWithTokenRefresh } from "../../utils/utils";

const Profile = () => {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await fetchWithTokenRefresh(`/profile/${username}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load profile.");
        return;
      }

      setProfile(data);
    };

    void fetchProfile();
  }, [username]);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="container mt-4">
      <h2>{profile.username}</h2>

      <div className="card">
        <div className="card-body">
          <p>
            <strong>Email:</strong> {profile.email}
          </p>

          <p>
            <strong>Role:</strong> {profile.role}
          </p>

          <p>
            <strong>Member since:</strong>{" "}
            {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
