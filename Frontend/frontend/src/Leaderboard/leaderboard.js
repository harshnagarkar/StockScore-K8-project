import React from "react";
import LeaderTable from "./leadertable"
import {  Row, Col} from 'antd';
class LeaderBoard extends React.Component{

    render() {
        return <div className="container">
            <Row type="flex" justify="center">
                <Col>
                    <LeaderTable />
                </Col>
            </Row>

        </div>
    }
}

export default LeaderBoard;