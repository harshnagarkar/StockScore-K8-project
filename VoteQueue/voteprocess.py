#Just queue in users and votes to be process
import pika
import logging
import time
import datetime as datetime
import mysql.connector
from pytz import timezone
import os
import threading

#----------------------------------------------------------------
read = mysql.connector.connect(
host="mariadb-1-mariadb-secondary.mariadb.svc.cluster.local",
user="Suser",
passwd="<mwxe2H/3f8Kyb$N",
database='stockUser'
)
cursor = read.cursor()
#---------------------------------------------------------------------------------------
credentials2 = pika.PlainCredentials('vuser', 'mwxe2H3f8KybN')
parameters2 = pika.ConnectionParameters('rabbitmq-1-rabbitmq-svc.rabbitmq.svc.cluster.local',
                                   5672,
                                   'votehost',
                                   credentials2)

connection2 = pika.BlockingConnection(parameters2)
channel2 = connection2.channel()

channel2.queue_declare(queue='voteprocessusers',durable=True)
#-----------------------------------------------------------------------------------------

credentials = pika.PlainCredentials('vuser', 'mwxe2H3f8KybN')
parameters = pika.ConnectionParameters('rabbitmq-1-rabbitmq-svc.rabbitmq.svc.cluster.local',
                                   5672,
                                   'stockvote',
                                   credentials)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()

channel.queue_declare(queue='voteusers',durable=True)
#-----------------------------------------------------------------------------------------------------------

def heartbeat():
    while True:
        connection2.process_data_events()
        connection.process_data_events()
        time.sleep(30)
beat=threading.Thread(target=heartbeat)
beat.daemon=True
beat.start()



def getDate():
    times = datetime.datetime.now()
    if 24<=times.hour:
        return times.date().strftime('%y-%m-%d')
    else:
        return (datetime.datetime.now()-datetime.timedelta(days=1)).date().strftime('%y-%m-%d')

#-------------------------------------------------------------------
#Main function
def callback(ch, method, properties, body):
    print(" [x] Received %r" % body)
    data = body.decode().split(" ")
    stock=data[0]
    correct_vote = int(data[1])
    incorrect_vote= int(data[2])
    scale_fact= data[3]
    date = getDate()
    cursor.execute(f"SELECT User_email FROM Stock_Collection where stock='{stock}' and vote_datetime>='{date} 06:00:00' and vote={correct_vote}")
    correctusers = cursor.fetchall()
    print(correctusers)
    if correctusers:
        for email in correctusers:
            channel2.basic_publish(exchange='',
                            routing_key='voteprocessusers',
                            body=(f'{email[0]} {stock} 1 {scale_fact} {correct_vote}'))
            print("sent "+email[0])
    cursor.execute(f"SELECT User_email FROM Stock_Collection where stock='{stock}' and vote_datetime>='{date} 06:00:00' and vote={incorrect_vote}")
    incorrectusers = cursor.fetchall()
    print(incorrectusers)
    if incorrectusers:
        for email in incorrectusers:
            channel2.basic_publish(exchange='',
                            routing_key='voteprocessusers',
                            body=(f'{email[0]} {stock} 0 {scale_fact} {incorrect_vote}'))
            print("sent "+str(email[0]))
    print(" [x] Done")
    ch.basic_ack(delivery_tag = method.delivery_tag)


# ---------------------------------------------------
# cursor.execute(f"SELECT * FROM Stock_Collection ")
# correctusers = cursor.fetchall()
# print(correctusers)

# channel2.basic_publish(exchange='',
#                 routing_key='voteprocessusers',
#                 body=('edsfact@gmail.com AAPL -1 '+str(-3)+" -1"))

# print("Done")
#--------------------------------------------------------

channel.basic_consume(queue='voteusers', on_message_callback=callback)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()

