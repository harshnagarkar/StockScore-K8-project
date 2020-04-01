import React from "react";
import { Layout } from "antd";
const { Footer } = Layout;

class LayoutFooter extends React.Component {
  render() {
    return (
      <Footer
        style={{ textAlign: "center", position: "relative", bottom: "0" }}
      >
        Stock score ©2020
      </Footer>
    );
  }
}

export default LayoutFooter;
