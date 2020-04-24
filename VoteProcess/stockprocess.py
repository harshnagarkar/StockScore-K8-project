import pika
import logging
import time
from influxdb import InfluxDBClient
import json
import pandas as pd
import numpy as np

client = InfluxDBClient(host='influxdb-1-influxdb-svc.influxdb.svc.cluster.local', port=8086, username='suser', password='mwxe2H3f8KybN')
client.switch_database('stocks')

credentials = pika.PlainCredentials('puser', 'mwxe2H3f8KybN')
parameters = pika.ConnectionParameters('rabbitmq-1-rabbitmq-svc.rabbitmq.svc.cluster.local',
                                   5672,
                                   'stockhost',
                                   credentials)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()

channel.queue_declare(queue='stock')
def generate_Json(ticker,update,time,mins,maxs,stds,close):
    json_body =[{
        "measurement": f"{ticker}_data",
        "tags": {
            "time_updated": f"{update}"
        },
        "time": f"{time}",
        "fields": {
            'Min':mins,
            'Max': maxs,
            'Volatility': stds,
            'Close': close
        }
    }]
    return json_body


def callback(ch, method, properties, body):
    print('--',body.decode(),'--')
    result = client.query(f'select * from {body.decode()} order by time desc limit 1')
    ddf_list=list(result.get_points())[0]
    time=ddf_list.pop("time")
    interval=ddf_list.pop("Interval")
    last_refresh=ddf_list.pop("Last_Refresh")
    temp_data = {}
    for k,v in ddf_list.items():
        temp_data[k]= json.loads(v)
    df=pd.DataFrame.from_dict(temp_data, orient='index')
    mins = df['3. low'].min()
    maxs=df['2. high'].max()
    stds=np.std(df['4. close'].values.astype(float))
    close = float(df['4. close'].values[-1])
    print(mins," ",maxs," ",stds," ",close)
    tries=3
    json_body=generate_Json(body.decode(),last_refresh,time,mins,maxs,stds,close)
    confirmed=client.write_points(json_body)
    print(confirmed)
    while (not confirmed) and tries>=0:
        confirmed=client.write_points(json_body)
        tries=tries-1
    print("Updated the ticker for-",body.decode())
    print(" [x] Done")
    ch.basic_ack(delivery_tag = method.delivery_tag)




channel.basic_consume(queue='stock', on_message_callback=callback)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()

