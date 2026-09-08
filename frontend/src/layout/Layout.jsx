import React from "react";
import NavBar from "../components/navigations/NavBar";
import Footer from "../components/navigations/Footer";

import "./Layout.css";

const Layout = (props) => {
  return (
    <React.Fragment>
      <NavBar />

      <main className="main-content">{props.children}</main>

      <Footer />
    </React.Fragment>
  );
};

export default Layout;
