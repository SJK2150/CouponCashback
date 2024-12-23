import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import CouponCashback from "./CouponCashback";


const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          {/* Route for QR Payment */}
          
          <Route path="/coupon-redemption" element={<CouponCashback />} />
          
          
          {/* Route for About Page */}
          <Route
            path="/about"
            element={
              <div>
                <h2>About Page</h2>
                <p>Details about the QR Payment feature will go here.</p>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
