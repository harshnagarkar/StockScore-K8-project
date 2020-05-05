# Process stocks individually as they are received one by one from the stock fetch service
import pika
import logging
import time
from influxdb import InfluxDBClient
import json
import pandas as pd
import numpy as np
import pytz
import datetime as datetime
import threading
import urllib.request
#----------------------------------------------------------------------------------------------------
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
#-----------------------------------------------------------------------------------------------------
credentials2 = pika.PlainCredentials('puser', 'mwxe2H3f8KybN')
parameters2 = pika.ConnectionParameters('rabbitmq-1-rabbitmq-svc.rabbitmq.svc.cluster.local',
                                   5672,
                                   'stockvote',
                                   credentials2)

connection2 = pika.BlockingConnection(parameters2)
channel2 = connection2.channel()
channel2.queue_declare(queue="voteusers",durable=True)
#--------------------------------------------------------------------------------------------------------
def generate_Json(ticker,update,time,mins,maxs,stds,close,beta):
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
            'Close': close,
            'Betas':beta
        }
    }]
    return json_body

def heartbeat():
    while True:
        connection.process_data_events()
        connection2.process_data_events()
        time.sleep(30)
beat = threading.Thread(target=heartbeat)
beat.daemon=True
beat.start()

def generateAns(old_close,new_close):
    ans ={}
    if old_close<new_close:
        ans["correct"]=1
        ans["incorrect"]=(-1)
        ans["scale_factor"]=(new_close-old_close)/old_close*100
    else:
        ans["correct"]=(-1)
        ans["incorrect"]=(1)
        ans["scale_factor"]=(new_close-old_close)/old_close*100
    return ans


def getBeta(stock):
    beta=0
    try:
        url=f"https://cloud.iexapis.com/stable/stock/{stock}/stats?token=pk_30130b1429cc4960a527ba729ef868b5"
        with urllib.request.urlopen(url) as url:
            data = json.loads(url.read())
            beta = data['beta']
    except Exception as e:
        print("error fetching",stock)
        print(e)
    return beta

def getClose(stock):
    result = client.query(f'select Close from "{stock}_data" order by time desc limit 1')
    result=list(result.get_points())[0]
    close = result.pop("Close")
    return close

# Main processing function
def callback(ch, method, properties, body):
    print('--',body.decode(),'--')
    result = client.query(f'select * from "{body.decode()}" order by time desc limit 1')
    # print(list(result.get_points()))
    ddf_list=list(result.get_points())[0]
    time=ddf_list.pop("time")
    interval=ddf_list.pop("Interval")
    last_refresh=ddf_list.pop("Last_Refresh")
    # print(ddf_list)
    temp_data = {}
    for k,v in ddf_list.items():
        try:
            temp_data[k]= json.loads(v)
        except:
            pass
    df=pd.DataFrame.from_dict(temp_data, orient='index')
    mins = df['3. low'].min()
    maxs=df['2. high'].max()
    stds=np.std(df['4. close'].values.astype(float))
    close = float(df['4. close'].values[-1])
    beta=getBeta(body.decode())
    print(mins," ",maxs," ",stds," ",close," ",beta)
    old_close = getClose(body.decode())

    ans=generateAns(old_close,close)

    tries=3
    json_body=generate_Json(body.decode(),last_refresh,time,mins,maxs,stds,close,beta)
    confirmed=client.write_points(json_body)
    print(confirmed)
    while (not confirmed) and tries>=0:
        confirmed=client.write_points(json_body)
        tries=tries-1

    
    print("Updated the ticker for-"+body.decode()+str(datetime.datetime.now()))
    print(" [x] Done")

    print(ans)
    channel2.basic_publish(exchange='',
                    routing_key='voteusers',
                    body=f'{body.decode()} {ans["correct"]} {ans["incorrect"]} {ans["scale_factor"]}')
    print("The message is send")
    ch.basic_ack(delivery_tag = method.delivery_tag)

# channel2.basic_publish(exchange='',
#                 routing_key='voteusers',
#                 body=f'ABC -1 1 10')

# print(getBeta("MSFT"))
channel.basic_consume(queue='stock', on_message_callback=callback)
print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()

