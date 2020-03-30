import React from 'react'
import {  Layout} from 'antd';
const { Footer} = Layout;

class LayoutFooter extends React.Component {

    render() {
      return  <Footer style={{textAlign: 'center',position: "relative", bottom: "0"}}>Ant Design ©2018 Created by Ant UED</Footer>;
    }
  }

export default LayoutFooter;