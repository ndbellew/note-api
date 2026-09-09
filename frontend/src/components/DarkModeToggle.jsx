import { useEffect, useState } from "react";

function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";

    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  }, [darkMode]);

  return (
    <button
      className="btn btn-outline-secondary"
      onClick={() => setDarkMode((current) => !current)}
    >
      {darkMode ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

export default DarkModeToggle;
