import urllib.request
import schedule
import time
import json

f = open("alphavantage.txt", "r")
alphavantageKey=f.readline()

f = open("s&p500.csv", "r")
line = f.readline()
line=line.replace("'","")
line=line.replace("\\s+","")
symbols=line.split(",")


client = InfluxDBClient(host='influxdb-1-influxdb-svc.influxdb.svc.cluster.local', port=8086, username='suser', password='mwxe2H3f8KybN', ssl=True, verify_ssl=True)
client.switch_database('stocks')


# json_body = [
#     {
#         "measurement": "brushEvents",
#         "tags": {
#             "user": "Carol",
#             "brushId": "6c89f539-71c6-490d-a28d-6c5d84c0ee2f"
#         },
#         "time": "2018-03-28T8:01:00Z",
#         "fields": {
#             "duration": 127
#         }
#     },
#     {
#         "measurement": "brushEvents",
#         "tags": {
#             "user": "Carol",
#             "brushId": "6c89f539-71c6-490d-a28d-6c5d84c0ee2f"
#         },
#         "time": "2018-03-29T8:04:00Z",
#         "fields": {
#             "duration": 132
#         }
#     },
#     {
#         "measurement": "brushEvents",
#         "tags": {
#             "user": "Carol",
#             "brushId": "6c89f539-71c6-490d-a28d-6c5d84c0ee2f"
#         },
#         "time": "2018-03-30T8:02:00Z",
#         "fields": {
#             "duration": 129
#         }
#     }
# ]



for symb in symbols[0:1]:
    symb=symb.replace(" ","")
    try:
        url="https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+symb+"&interval=1min&apikey="+str(alphavantageKey)
        with urllib.request.urlopen(url) as url:
            data = json.loads(url.read())
            json_body ={
                "measurement": data['Meta Data']['2. Symbol'],
                "tags": {
                    "Interval": data['Meta Data']['4. Interval'],
                    "Last_Refresh": data['Meta Data']['3. Last Refreshed']
                },
                "time": "2018-03-30T8:02:00Z",
                "fields": {
                    "Time_Series": list(dict(data['Time Series (1min)']).values())
                }
            }
            client.drop_measurement(symb)
            tries=3
            while client.write_points(json_body) and tries>=0:
                tries=tries-1
    except:
        print("error")    
    time.sleep(15) 
    


# schedule.every(1).minutes.do(myfunc)

# while True:
#     schedule.run_pending()
#     time.sleep(1)
