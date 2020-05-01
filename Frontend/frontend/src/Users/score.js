import { Table, Statistic, Button } from "antd";
import React from "react";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import axios from "axios";
const columnStock = [
  {
    title: "Name",
    dataIndex: "stock"
  },
  {
    title: "Accuracy (%)",
    dataIndex: "Accuracy",
    sorter: {
      compare: (a, b) => a.accuracy - b.accuracy,
      multiple: 3
    }
  },
  {
    title: "Last Pred",
    dataIndex: "previous"
  },
  {
    title: "Predict",
    dataIndex: "current"
  },
  {
    title: "Delete",
    dataIndex: "delete"
  }
];


function onChange(pagination, filters, sorter, extra) {
  console.log("params", pagination, filters, sorter, extra);
}

class StockTable extends React.Component {

  componentDidMount() {
    console.log("This is my message");
    this.getData()
  }
  state={
    dataStock:[]
  }

  getData=()=>{
    
    axios.get("http://35.238.192.112/stocks/collection").then(res=>{
      const requiredStock=res.data.map((eachStock,index)=>{
        let previousValue= ""
        let correct=""
        if(eachStock.recent_correct=="1"){
          correct=1
        }else{
          correct=0
        }
        if(eachStock.recent_predictions=="-1"){
          previousValue= (<div style={{ color: "#cf1322", fontSize: "1.25em" }}>
        <ArrowDownOutlined />
          {correct} pt
        </div>)
        }else if(eachStock.recent_predictions=="1"){
          previousValue= (<div style={{ color: "#3f8600", fontSize: "1.25em" }}>
          <ArrowUpOutlined />
        {correct} pt
        </div>)
        }

        return {
          key: index,
          stock: eachStock.stock,
          Accuracy: eachStock.correct_predictions/eachStock.total_predictions*100,
          previous: previousValue,
          current: (
            <div>
              <Button onClick={()=>{window.location.href = `/stock/${eachStock.stock}`}} danger>
                Predict
              </Button>
            </div>
          ),
          delete: (<div>
            <a onClick={() =>{ this.deleteStock(eachStock.stock); return false;}} href="#" >Remove</a>
          </div>)
        }
      })
      this.setState({dataStock:requiredStock})
    }).catch(res=>{
      console.log(res)
    })
  }

  
  deleteStock(stock){
    axios.get(`http://35.238.192.112/stocks/deletecollectionstock/${stock}`).then(res=>{
      window.location.reload(false);
    }).catch(res=>{
      console.log(res)
    })
  }

  render() {
    return (
      <Table columns={columnStock} dataSource={this.state.dataStock} onChange={onChange} />
    );
  }
}

export default StockTable;
