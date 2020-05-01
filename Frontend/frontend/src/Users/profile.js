import React from "react";
import { Row, Col, Form, Input, Button, Checkbox } from "antd";
import profile from "../assets/default.jpg";
import "./profile.css";
import { Progress, Tag, Divider } from "antd";
import { Table, Statistic } from "antd";
import StockTable from "./score";
import axios from "axios";

const Accuracy = (props) => (
  <Row type="flex" justify="center" className="center">
    <Col xs={30} sm={12} md={12} lg={7} xl={7} className="center">
      <h2>
        {" "}
        <Tag color="error" style={{ fontSize: "1.25em", padding: "0.25em" }}>
          Accuracy
        </Tag>
      </h2>
      <br />
      <Progress
        type="circle"
        strokeColor={{
          "0%": "#f5222d",
          "100%": "#ffa39e",
        }}
        percent={(props.accuracy*100).toFixed(2)}
      />
    </Col>
    &nbsp;&nbsp; &nbsp;&nbsp;
    <Col xs={30} sm={12} md={12} lg={7} xl={7} className="center">
      <h2>
        {" "}
        <Tag color="success" style={{ fontSize: "1.25em", padding: "0.25em" }}>
          Score
        </Tag>
      </h2>
      <br />
      <Progress
        type="circle"
        strokeColor={{
          "0%": "#108ee9",
          "100%": "#87d068",
        }}
        percent={100}
        format={(percent) => (
          <div style={{ color: "rgba(0, 0, 0, 0.65)" }}>{parseFloat(props.score).toFixed(2)} pts</div>
        )}
      />
    </Col>
    &nbsp;&nbsp; &nbsp;&nbsp;
    <Col xs={30} sm={12} md={12} lg={7} xl={7} className="center">
      <h2>
        <Tag color="default" style={{ fontSize: "1.25em", padding: "0.25em" }}>
          Predictions
        </Tag>
      </h2>
      <br />
      <Progress
        type="circle"
        strokeColor="rgba(0, 0, 0, 0.65)"
        percent={100}
        format={(percent) => (
        <div style={{ color: "rgba(0, 0, 0, 0.65)" }}>{props.total_predictions}</div>
        )}
      />
    </Col>
  </Row>
);

class Users extends React.Component {
  state={accuracy:0,correct_predictions:0,total_predictions:0,score:0,name:""}

  componentDidMount() {
    axios.get("/user/data").then(res=>{
      let acc=0;
      if(res.data.accuracy>0){
        acc=res.data.accuracy
      }
      this.setState({accuracy:acc,correct_predictions:res.data.correct_predictions,total_predictions:res.data.total_predictions,name:res.data.name,score:res.data.score})
    }).catch(res=>{
      console.log("Their is an error")
    })
  }

  render() {
    return (
      <div className="container">
        <Row type="flex" justify="start">
          <Col
            xs={30}
            sm={12}
            md={12}
            lg={6}
            xl={6}
            className="center"
            style={{}}
          >
            <img src={profile} className="profileImage" />
          </Col>
          <Col
            xs={30}
            sm={12}
            md={12}
            lg={18}
            xl={18}
            className="center"
            style={{}}
          >
            <h1>{this.state.name}</h1>
            <br />
            <Accuracy  accuracy={this.state.accuracy} score={this.state.score} total_predictions={this.state.total_predictions}/>
          </Col>
        </Row>
        <Divider />
        <br />
        <Row type="flex" justify="center">
          <Col>
            <StockTable />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Users;
