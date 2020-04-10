import pika

import time


credentials = pika.PlainCredentials('suser', 'mwxe2H3f8KybN')
parameters = pika.ConnectionParameters('rabbitmq-1-rabbitmq-svc.rabbitmq.svc.cluster.local',
                                   5672,
                                   'stockhost',
                                   credentials)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()
channel.queue_declare(queue="stock",durable=False)

for i in range(0,10):
    channel.basic_publish(exchange='',
                        routing_key='hello',
                        body='Hello World!')
    time.sleep(2)
    print(" [x] Sent 'Hello World!'")

connection.close()