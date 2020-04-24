import React from "react";
import "./security.css"
import { Tag } from 'antd';
import TradingViewWidget from 'react-tradingview-widget';
import axios from 'axios';
// import Redirect from "react-dom-router"
import {  Row, Col, Form, Button, Checkbox, Divider, Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';


class StockPage extends React.Component{

    state={up:"#FF8C00",down:"#FF8C00",max:0,min:0,beta:0,volatility:0}



    changeVote=(identity)=>{
        if(identity==="up"){
            this.state.up==="green"?this.setState({up:"#FF8C00",down:"#FF8C00"}):this.setState({up:"green",down:"#FF8C00"})
            axios.post(`http://35.238.192.112/vote/${this.props.match.params.stockid}`,{vote:1}).then(res=>{
                console.log(res);
            }).catch(res=>{
                console.log(res);
                this.setState({up:"#FF8C00",down:"#FF8C00"});
            })
        }else if(identity==="down"){
            this.state.down==="red"?this.setState({up:"#FF8C00",down:"#FF8C00"}):this.setState({up:"#FF8C00",down:"red"})
            axios.post(`http://35.238.192.112/vote/${this.props.match.params.stockid}`,{vote:-1}).then(res=>{
                console.log(res);
            }).catch(res=>{
                this.setState({up:"#FF8C00",down:"#FF8C00"})
            })
        }
    }

    componentDidMount(){
        axios.get(`http://35.238.192.112/vote/${this.props.match.params.stockid}`).then(res=>{
            console.log(res.data.vote);
            let vote = res.data.vote;
            if(vote==1){
                this.setState({up:"green",down:""})
            }else if(vote==(-1)){
                this.setState({up:"",down:"red"})
            }else{
                this.setState({up:"#FF8C00",down:"#FF8C00"})
            }
        }).catch(res=>{
            console.log(res)
        })

        axios.get(`http://35.238.192.112/stocks/data/${this.props.match.params.stockid}`).then(res=>{
        this.setState({max:res.data.max,min:res.data.min,volatility:res.data.volatility,beta:res.data.beta})
        }).catch(res=>{
            console.log(res)
        })
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
            <Button className="icons" onClick={()=>this.changeVote("up")} style={{backgroundColor: this.state.up}} ><ArrowUpOutlined /></Button>
            <Button className="icons" onClick={()=>this.changeVote("down")} style={{backgroundColor: this.state.down}} ><ArrowDownOutlined  /></Button>
            </Col>
        </Row><br/>
        <Row type="flex" justify="center" className="center">
            <Col className="center">
           
            <Card>
            <h3> <Tag color="volcano" className="metric">MIN</Tag></h3><br/>
               <h4>{this.state.min}</h4>
            </Card>
            </Col>
            <Col>
            
            <Card>
            <h3><Tag color="green" className="metric">Volatility</Tag></h3><br/>
            <h4> {this.state.volatility}</h4>
            </Card>
            </Col>
            <Col>
           
            <Card>
            <h3><Tag color="geekblue" className="metric">BETA</Tag></h3><br/>
             <h4> {this.state.beta}</h4>
            </Card>
            </Col>
            <Col>
           
            <Card>
            <h3><Tag color="purple" className="metric">MAX</Tag></h3><br/>
            <h4> {this.state.max}</h4>
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