#Process vote for one user for one stock at a time
import pika
import logging
import time
import datetime as datetime
import mysql.connector
#---------------------------------------------------------------
write = mysql.connector.connect(
host="mariadb-1-mariadb.mariadb.svc.cluster.local",
user="Suser",
passwd="<mwxe2H/3f8Kyb$N",
database='stockUser'
)
cursor = write.cursor()
#-------------------------------------------------------

credentials = pika.PlainCredentials('vcuser', 'mwxe2H3f8KybN')
parameters = pika.ConnectionParameters('rabbitmq-1-rabbitmq-svc.rabbitmq.svc.cluster.local',
                                   5672,
                                   'votehost',
                                   credentials)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()

channel.queue_declare(queue='voteprocessusers',durable=True)
#------------------------------------------------------------

#main function
def callback(ch, method, properties, body):
    print(" [x] Received %r" % body)
    data = body.decode().split(" ")
    email=data[0]
    stock=data[1]
    deciding_factor=data[2]
    scaling_factoring=data[3]
    vote=data[4]
    print(f"Update User set score=score+{scaling_factoring}, accuracy=(correct_predictions+1)/total_predictions, correct_predictions=correct_predictions+1 where email='{email}'")
    if int(deciding_factor)==1:
        cursor.execute(f"Update User set score=score+{scaling_factoring}, accuracy=(correct_predictions+1)/total_predictions*100, correct_predictions=correct_predictions+1 where email='{email}'")
        cursor.execute(f"Update Stock_Collection set recent_predictions={vote}, recent_correct=1, correct_predictions=correct_predictions+1 where User_email='{email}' and stock='{stock}'")
    else:
        cursor.execute(f"Update User set score=(score+{scaling_factoring}), accuracy=correct_predictions/total_predictions*100 where email='{email}'")
        cursor.execute(f"Update Stock_Collection set recent_predictions={vote}, recent_correct=-1 where User_email='{email}' and stock='{stock}' ")
    # response = cursor.fetchall()
    write.commit()
    print(cursor.rowcount, "record inserted.")
    # print(response)
    print(f"processed: "+body.decode())
    ch.basic_ack(delivery_tag = method.delivery_tag)
    print(" [x] Done")



#-------------------------------------------------------
channel.basic_consume(queue='voteprocessusers', on_message_callback=callback)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()

