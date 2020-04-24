import pika

import time


credentials = pika.PlainCredentials('puser', 'mwxe2H3f8KybN')
parameters = pika.ConnectionParameters('rabbitmq-1-rabbitmq-svc.rabbitmq.svc.cluster.local',
                                   5672,
                                   'stockvote',
                                   credentials)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()
channel.queue_declare(queue="voteusers",durable=True)

for i in range(0,4):
    channel.basic_publish(exchange='',
                        routing_key='voteusers',
                        body='M 1 -1 0.34')
    time.sleep(5)
    print(" [x] Sent 'Hello World!'")

