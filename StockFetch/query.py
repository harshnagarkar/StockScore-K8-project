import urllib.request
import schedule
import time
import json
def myfunc(): print("Working")

f = open("alphavantage.txt", "r")
alphavantageKey=f.readline()

f = open("s&p500.csv", "r")
line = f.readline()
line=line.replace("'","")
line=line.replace("\\s+","")
symbols=line.split(",")
for symb in symbols:
    symb=symb.replace(" ","")
    url="https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+symb+"&interval=1min&apikey="+str(alphavantageKey)
    with urllib.request.urlopen(url) as url:
        data = json.loads(url.read())
        print(data) 
    time.sleep(15) 
    


# schedule.every(1).minutes.do(myfunc)

# while True:
#     schedule.run_pending()
#     time.sleep(1)
