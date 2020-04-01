import React from "react";
import "./security.css"
import { Tag } from 'antd';
import TradingViewWidget from 'react-tradingview-widget';

// import Redirect from "react-dom-router"
import {  Row, Col, Form, Button, Checkbox, Divider, Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';





class StockPage extends React.Component{

    componentDidMount(){
    }

    render(){
        console.log(`CURRENCYCOM:${this.props.match.params.stockid}`);
        return <div className="container">
        <Row type="flex" justify="center">
            <Col className="center">
    <h1><Tag className="stockname" color="magenta">{this.props.match.params.stockid}</Tag></h1>
            </Col>
            </Row>
            <Row type="flex" justify="center">
            <Col className="center" >
            <TradingViewWidget symbol={`CURRENCYCOM:${this.props.match.params.stockid}`}/>
            </Col>
            </Row>
            <Row type="flex" justify="center">
            <Col className="center">
            <Button className="icons" danger><ArrowUpOutlined /></Button>
            <Button className="icons" danger><ArrowDownOutlined  /></Button>
            </Col>
        </Row><br/>
        <Row type="flex" justify="center" className="center">
            <Col className="center">
           
            <Card>
            <h3> <Tag color="volcano" className="metric">MIN</Tag></h3><br/>
               <h4> 255</h4>
            </Card>
            </Col>
            <Col>
            
            <Card>
            <h3><Tag color="green" className="metric">Volatility</Tag></h3><br/>
            <h4> 255</h4>
            </Card>
            </Col>
            <Col>
           
            <Card>
            <h3><Tag color="geekblue" className="metric">BETA</Tag></h3><br/>
            <h4> 255</h4>
            </Card>
            </Col>
            <Col>
           
            <Card>
            <h3><Tag color="purple" className="metric">MAX</Tag></h3><br/>
            <h4> 255</h4>
            </Card>
            </Col>
        </Row>
        <br/>
        <Row type="flex" justify="center" className="center">
        <h3>Comments:</h3><br/>
        <Card>
                255
            </Card>
        </Row>
        <Row type="flex" justify="center" className="">
            <Col>
            <Card className="comment">
                <p>This is going to go up soon. Gooo Goo!</p>
                -@Jake
            </Card>
            </Col>
        </Row>
        </div>
    }
}

export default StockPage;