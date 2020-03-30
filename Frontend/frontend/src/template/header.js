import React from 'react'
import {  Layout, Menu } from 'antd';
import "./header.css";
import {Redirect} from "react-router-dom";
import {Link} from 'react-router-dom';
import {refresh,logout} from "../Home/authapi";
class LayoutHeader extends React.Component {

    state={
      user:true
    }
  
  componentDidMount(){
    if (document.cookie.indexOf('token') === -1 && window.location.href!=="/") {
      console.log("1");
      this.setState({user:false})
      // Re-direct to this page
    }else{
      console.log("2");
      this.setState({user:true})
      console.log("refresh starting")

      setInterval(refresh(function(refresh,error){
        if(refresh){
          console.log("refreshed")
        }else{
          console.log("couldn't refresh",error)
        }
      }), 120000)
    }

  }

  logout=()=>{
    logout(function(value,error){
      if(value){
        this.setState({user:false})
        console.log("logged out")
      }else{
        console.log(error,"Couldnot logout")
      }
    })
  }
    render() {
      if(!this.state.user){
        return <Redirect to='/'/>
      }
      return  <Menu
        theme="white"
        mode="horizontal"
        defaultSelectedKeys={['2']}
        className="menu"
        style={{ lineHeight: '64px' }}
      >
        <Menu.Item key="1"><Link to="/leaderboard">Leaderboard</Link></Menu.Item>
        <Menu.Item key="2"><Link to="/dashboard">Dashboard</Link></Menu.Item>
        <Menu.Item key="3"><Link to="/stock">Stocks</Link></Menu.Item>
        <Menu.Item key="4" onClick={this.logout}>Logout</Menu.Item>
      </Menu>
    }
  }

export default LayoutHeader;