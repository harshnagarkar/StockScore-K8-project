import { Table, Statistic, Button } from "antd";
import React from "react";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
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
  }
];

const dataStock =
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
      key: "1",
      stock: "MSFT",
      Accuracy: 98,
      previous: (
        <div>
          <Statistic
            value={11.28}
            precision={2}
            valueStyle={{ color: "#3f8600" }}
            prefix={<ArrowUpOutlined />}
            suffix="%"
          />{" "}
          1 pt
        </div>
      ),
      current: (
        <div>
          <Button id="2u">
            <ArrowDownOutlined />
          </Button>
          &nbsp;
          <Button id="2d">
            <ArrowUpOutlined />
          </Button>
        </div>
      )
    },
    {
      key: "2",
      stock: "USTL",
      Accuracy: 90,
      previous: (
        <Statistic
          value={11.28}
          precision={2}
          valueStyle={{ color: "#cf1322" }}
          prefix={<ArrowDownOutlined />}
          suffix="%"
        />
      ),
      current: (
        <div>
          <Button id="2u">
            <ArrowDownOutlined />
          </Button>
          &nbsp;
          <Button id="2d">
            <ArrowUpOutlined />
          </Button>
        </div>
      )
    }
  ];

function onChange(pagination, filters, sorter, extra) {
  console.log("params", pagination, filters, sorter, extra);
}

class StockTable extends React.Component {
  componentDidMount() {
    console.log("This is my message");
  }

  render() {
    return (
      <Table columns={columnStock} dataSource={dataStock} onChange={onChange} />
    );
  }
}

export default StockTable;
