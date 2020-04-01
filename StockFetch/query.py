import urllib.request
import schedule
import time
import json
from influxdb import InfluxDBClient
import pytz
import datetime

# CST=pytz.timezone('America/Chicago')

f = open("alphavantage.txt", "r")
alphavantageKey=f.readline()

f = open("s&p500.csv", "r")
line = f.readline()
line=line.replace("'","")
line=line.replace("\\s+","")
symbols=line.split(",")


client = InfluxDBClient(host='influxdb-1-influxdb-svc.influxdb.svc.cluster.local', port=8086, username='suser', password='mwxe2H3f8KybN')
client.switch_database('stocks')


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
    for k,v in feild_dict.items():
         json_body[0]['fields'][k]=json.dumps(v)
    return json_body

def update_database():
    print("started updating")
    for symb in symbols:
        symb=symb.replace(" ","")
        # try:
        url="https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+symb+"&interval=1min&apikey="+str(alphavantageKey)
        with urllib.request.urlopen(url) as url:
            data = json.loads(url.read())
            update_time = data['Meta Data']['3. Last Refreshed'].replace(" ",'T')+'Z'
            json_body=generateJSON(data['Meta Data']['2. Symbol'],data['Meta Data']['4. Interval'],data['Meta Data']['3. Last Refreshed'],update_time,data['Time Series (1min)'])
            # json_body=generateJSON("test",data['Meta Data']['4. Interval'],data['Meta Data']['3. Last Refreshed'],time,{"harsh":{"test":"test","harsh123":"maybe"}})
            # m=json.load(json_body[0])
            # client.drop_measurement(symb)
            tries=3
            print(json_body)
            while client.write_points(json_body) and tries>=0:
                tries=tries-1
            print("Updated the tocker for-", symb,"-for-",data['Meta Data']['3. Last Refreshed']," updated on",datetime.datetime.now())
        # except Exception as e: print(e) 
        time.sleep(15) 
    
schedule.every().tuesday.at("06:00").do(update_database)
schedule.every().wednesday.at("06:00").do(update_database)
schedule.every().thursday.at("06:00").do(update_database)
schedule.every().friday.at("06:00").do(update_database)
schedule.every().saturday.at("06:00").do(update_database)

while True:
    schedule.run_pending()
    time.sleep(10)
    print("printing")
