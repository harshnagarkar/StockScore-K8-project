import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "antd/dist/antd.css";
// import * as serviceWorker from './serviceWorker';
import Notfound from "./template/notfound";
import LayoutHeader from "./template/header";
import LayoutFooter from "./template/footer";
import Home from "./Home/login";
import Users from "./Users/profile";
import LeaderBoard from "./Leaderboard/leaderboard";
import StockDashboard from "./stocks/stockDashboard";
import { Route, Link, BrowserRouter as Router, Switch } from "react-router-dom";
import StockPage from "./stocks/security";
// import HttpsRedirect from 'react-https-redirect'

const routing = (
  // <HttpsRedirect>
  <Router>
    <div className="appbody">
      <div className="outlineDiv">
        <LayoutHeader />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/dashboard" component={Users} />
          <Route path="/leaderboard" component={LeaderBoard} />
          <Route exact path="/stock" component={StockDashboard} />
          <Route path="/stock/:stockid" component={StockPage} />
          <Route component={Notfound} />
        </Switch>
        {/* This is for footer */}
      </div>
      <LayoutFooter />
    </div>
  </Router>
  // </HttpsRedirect>
);

ReactDOM.render(routing, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
