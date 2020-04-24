import urllib.request
import schedule
import time
import json
from influxdb import InfluxDBClient
import pytz
import datetime
import pika
import threading
credentials = pika.PlainCredentials('suser', 'mwxe2H3f8KybN')
parameters = pika.ConnectionParameters('rabbitmq-1-rabbitmq-svc.rabbitmq.svc.cluster.local',
                                   5672,
                                   'stockhost',
                                   credentials)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()
channel.queue_declare(queue="stock",durable=False)

CST=pytz.timezone('America/Chicago')

f = open("alphavantage.txt", "r")
alphavantageKey=f.readline()

f = open("s&p500.csv", "r")
line = f.readline()
line=line.replace("'","")
line=line.replace("\\s+","")
symbols=line.split(",")


client = InfluxDBClient(host='influxdb-1-influxdb-svc.influxdb.svc.cluster.local', port=8086, username='suser', password='mwxe2H3f8KybN')
client.switch_database('stocks')

def heartbeat():
    while True:
        connection.process_data_events()
        time.sleep(30)


beat = threading.Thread(target=heartbeat)
beat.daemon=True
beat.start()

def generateJSON(ticker,interval,last_refresh,time,feild_dict):
    json_body =[{
        "measurement": f"{ticker}",
        "tags": {
            "Interval": f"{interval}",
            "Last_Refresh": f"{last_refresh}"
        },
        "time": f"{time}",
        "fields": {
        }
    }]
    counter=0
    today=""
    currentdatetime=""
    # print(feild_dict.keys())
    k = list(feild_dict.keys())[0]
    print("today's date",k)
    continuingstocktime=datetime.datetime.strptime(k,"%Y-%m-%d %H:%M:%S")
    continuingstocktime = continuingstocktime.replace(hour=9,minute=30,second=0)
    haultingstocktime=datetime.datetime.strptime(k,"%Y-%m-%d %H:%M:%S")
    haultingstocktime = haultingstocktime.replace(hour=16,minute=0,second=0)
    for k,v in feild_dict.items():
        time = k.split(" ")
        currentdatetime=datetime.datetime.strptime(k, '%Y-%m-%d %H:%M:%S')
        if counter<1:
            today=time[0]
            counter+=1
        if today==time[0] and currentdatetime>=continuingstocktime and currentdatetime<=haultingstocktime:
            # print(time[0])
            json_body[0]['fields'][time[1]]=json.dumps(v)
    return json_body

def update_database():
    print("started updating")
    for symb in symbols:
        symb=symb.replace(" ","")
        try:
            url="https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+symb+"&interval=1min&apikey="+str(alphavantageKey)+"&outputsize=full"
            with urllib.request.urlopen(url) as url:
                data = json.loads(url.read())
                update_time = data['Meta Data']['3. Last Refreshed'].replace(" ",'T')+'Z'
                json_body=generateJSON(data['Meta Data']['2. Symbol'],data['Meta Data']['4. Interval'],data['Meta Data']['3. Last Refreshed'],update_time,data['Time Series (1min)'])
                # json_body=generateJSON("test",data['Meta Data']['4. Interval'],data['Meta Data']['3. Last Refreshed'],time,{"harsh":{"test":"test","harsh123":"maybe"}})
                # m=json.load(json_body[0])
                # client.drop_measurement(symb)
                tries=3
                # print(json_body)
                while (not client.write_points(json_body)) and tries>=0:
                    tries=tries-1
                print("Updated the ticker for-", symb,"-for-",data['Meta Data']['3. Last Refreshed']," updated on",datetime.datetime.now())
                channel.basic_publish(exchange='',
                        routing_key='stock',
                        body=f'{symb}')
        except Exception as e: print(e) 
        time.sleep(15) 
    
schedule.every().tuesday.at("02:00").do(update_database)
schedule.every().wednesday.at("02:00").do(update_database)
schedule.every().thursday.at("02:00").do(update_database)
schedule.every().friday.at("02:00").do(update_database)
schedule.every().saturday.at("02:00").do(update_database)

# update_database()



while True:
    schedule.run_pending()
    time.sleep(10)

# update_database()