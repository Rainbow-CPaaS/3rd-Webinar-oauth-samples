import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import App from "./App";
import Signed from "./Signed";

function AppRouter() {
    return (
        <Router>
            <Route path="/" exact component={App} />
            <Route path="/signed" component={Signed} />
        </Router>
    );
}

export default AppRouter;
