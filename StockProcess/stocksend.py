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


credentials2 = pika.PlainCredentials('puser', 'mwxe2H3f8KybN')
parameters2 = pika.ConnectionParameters('rabbitmq-1-rabbitmq-svc.rabbitmq.svc.cluster.local',
                                   5672,
                                   'stockvote',
                                   credentials2)

connection2 = pika.BlockingConnection(parameters2)
channel2 = connection2.channel()
channel2.queue_declare(queue="voteusers",durable=True)

channel2.basic_publish(exchange='',
                routing_key='voteusers',
                body=f'ABC -1 1 10')

