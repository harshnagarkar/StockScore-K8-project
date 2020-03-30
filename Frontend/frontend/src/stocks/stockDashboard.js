import React from "react";
import {Link} from "react-router-dom";
import "./stockDashboard.css"
import {  Row, Col, Form, Button, Checkbox, Divider } from 'antd';
import { Input } from 'antd';
import axios from "axios"
const { Search } = Input;



class StockDashboard extends React.Component{
    state={
      searchValue:"",
      searchData:[],
      defaultData:[]
    }

    componentDidMount=()=>{
      const url=`http://35.238.192.112/stocks/search/?term=}`
      axios.get(url)
          .then(res => {
            if(res.status==200){
              this.setState({defaultData:res.stocks})
            }else{
              console.log(res)
            }
          }).catch(res=>{
              console.log(res)
          })

     
    }

    storeSearchData=async (word)=>{
          
          const url=`http://35.238.192.112/stocks/search/search?term=${word.toUpperCase()}`
          await axios.get(url)
              .then(res => {
                if(res.status==200){
                  this.setState({searchValue:word,searchData:res.stocks})
                  if(res && res.stocks.length===0){
                    alert("No stock similar to name found, loading the default values");
                  }
                }else{
                  console.log(res)
                }
              }).catch(res=>{
                  console.log(res)
              })
          
    }

    render(){
      let searchDiv=null
      if(this.state.searchData.length!==0){
       searchDiv=this.state.searchData.map((data,index)=><div key={index}><a href={`/stock/${data}`} >{data}</a><Divider/></div>)
      }else{
        searchDiv=this.state.defaultData.map((data,index)=><div key={index}><a href={`/stock/${data}`} >{data}</a><Divider/></div>)
      }
       return <div className="container"><Row type="flex" justify="center">
            <Col >
            <div className="container">
    <Search
      placeholder="input search text"
      enterButton="Search"
      size="large"
      value={this.state.searchValue}
      onChange={(e) => {this.storeSearchData(e.target.value)}}
    />
  </div></Col>
        </Row>
        <Row type="flex" justify="center" className="container">
          <Col className="center">
          {searchDiv}
          </Col>
        </Row>
        </div>
    }
}

export default StockDashboard;