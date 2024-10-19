import React from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import PropTypes from "prop-types";

const LandingWrapper = ({ children }) => {
  return (
    <div className=" bg-white dark:bg-gray-900 text-black dark:text-white ">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

LandingWrapper.propTypes = {
    children: PropTypes.node,
  };

export default LandingWrapper;
