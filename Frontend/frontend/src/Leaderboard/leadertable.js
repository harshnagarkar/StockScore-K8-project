import { Table,Statistic, Button } from 'antd';
import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
const columnleader = [
  {
    title: 'Name',
    dataIndex: 'Name',
  },
  {
    title: 'Accuracy (%)',
    dataIndex: 'Accuracy',
    sorter: {
      compare: (a, b) => a.accuracy - b.accuracy,
      multiple: 3,
    },
  },
  {
    title: 'Points',
    dataIndex: 'points',
  },
];

const dataleader =
// data.map((eachD)=>{
//     return {
//         key: '1',
//         stock: 'MSFT',
//         Accuracy: 98,
//         previous:           <Statistic
//         value={deacgD.value}
//         precision={2}
//         valueStyle={{ color: '#3f8600' }}
//         prefix={<ArrowUpOutlined />}
//         suffix="%"
//       />,
//         current: 1,
//       }
// })

[
  {
    key: '1',
    Name: <div style={{fontSize: "2em"}}>Harsh Nagarkar</div>,
    Accuracy: <div style={{color: "green", fontSize: '2em' ,fontWeight: "800m"}}>98</div>,
    points:  <div style={{color: "gray", fontSize: '2em' ,fontWeight: "800m"}}>100</div>
  },
  {
    key: '2',
    Name:  <div style={{fontSize: "2em"}}>Harsh Nagarkar</div>,
    Accuracy:  <div style={{color: "green", fontSize: '2em' ,fontWeight: "800m"}}>70</div>,
    points:  <div style={{color: "gray", fontSize: '2em' ,fontWeight: "800m"}}>30</div>
  },
];

function onChange(pagination, filters, sorter, extra) {
  console.log('params', pagination, filters, sorter, extra);
}


class LeaderTable extends React.Component{

    componentDidMount(){
        console.log("This is my message")
    }

    render (){
        return <Table columns={columnleader} dataSource={dataleader} onChange={onChange} />
    }
}

export default LeaderTable;