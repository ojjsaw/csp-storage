import json
from json import JSONEncoder

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado

import numpy
import getpass
import os
import boto3
from botocore.exceptions import ClientError
import logging

ACCESS_KEY_ID = ""
SECRET_ACCESS_KEY = ""
BUCKET_NAME = ""
STORAGE_PATH = ""
S3_KEYS = []
IS_VALID = False

class NumpyArrayEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, numpy.ndarray):
            return obj.tolist()
        return JSONEncoder.default(self, obj)

class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        # replace with is authenticated API
        numpyArrayOne = numpy.array([[11, 22, 33], [44, 55, 66], [77, 88, 99]])
        numpyData = {"array": numpyArrayOne}
        encodedNumpyData = json.dumps(numpyData, cls=NumpyArrayEncoder)
        self.finish(encodedNumpyData)

    @tornado.web.authenticated
    def post(self):
        # input_data is a dictionary with a key "name"
        input_data = self.get_json_body()
        global STORAGE_PATH, ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME, IS_VALID
        ACCESS_KEY_ID = input_data["ACCESS_KEY_ID"]
        SECRET_ACCESS_KEY = input_data["SECRET_ACCESS_KEY"]
        BUCKET_NAME = input_data["BUCKET_NAME"]
        try:
            # Retrieve the list of existing buckets
            session = boto3.Session( 
                aws_access_key_id=ACCESS_KEY_ID, 
                aws_secret_access_key=SECRET_ACCESS_KEY)
            
            s3 = session.resource('s3')
            if s3.Bucket(BUCKET_NAME) in s3.buckets.all():
                IS_VALID = True
        except ClientError as e:
            #logging.error(e)
            IS_VALID = False

        STORAGE_PATH = os.path.join("/home", getpass.getuser(), "cloud-storage", "s3",BUCKET_NAME)
        data = {"greetings": "Test full user Path {0} with creds {1}!".format(STORAGE_PATH, IS_VALID)}
        self.finish(json.dumps(data))

class ListHandler(APIHandler):

    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        global STORAGE_PATH, ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME, IS_VALID, S3_KEYS
        S3_KEYS.clear()
        if IS_VALID is True:
            try:
                # Retrieve the list of existing buckets
                session = boto3.Session( 
                aws_access_key_id=ACCESS_KEY_ID, 
                aws_secret_access_key=SECRET_ACCESS_KEY)
                
                s3 = session.resource('s3')
                my_bucket = s3.Bucket(BUCKET_NAME)
       
                for my_bucket_object in my_bucket.objects.all():
                    S3_KEYS.append(my_bucket_object.key)
            except ClientError as e:
                #logging.error(e)
                IS_VALID = False
        else:
            S3_KEYS.append(STORAGE_PATH)
            for i in range(30):
                S3_KEYS.append("mock/s3path/file" + str(i) + ".txt")
        self.finish(json.dumps(S3_KEYS))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        index = input_data["index"]
        global STORAGE_PATH, ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME, IS_VALID, S3_KEYS
        if IS_VALID is True:
            try:
                # Retrieve the list of existing buckets
                session = boto3.Session( 
                aws_access_key_id=ACCESS_KEY_ID, 
                aws_secret_access_key=SECRET_ACCESS_KEY)
        
                s3 = session.resource('s3')
                my_bucket = s3.Bucket(BUCKET_NAME)
                #STORAGE_PATH = os.path.join("/home", getpass.getuser(), "cloud-storage", "s3",BUCKET_NAME)
                # create directory for uID
                isExist = os.path.exists(STORAGE_PATH)
                if not isExist:
                    os.makedirs(STORAGE_PATH)

                path, filename = os.path.split(S3_KEYS[index])
                devcloud_file_path = os.path.join(STORAGE_PATH, filename)
                my_bucket.download_file(S3_KEYS[index], devcloud_file_path)
                data = {"greetings": "Downloaded index {0} with key {1}!".format(index, S3_KEYS[index])}
            except ClientError as e:
                IS_VALID = False
        else:
            # input_data is a dictionary with a key "name"
            data = {"greetings": "fake download msg for index {0} with key {1}!".format(index, S3_KEYS[index])}
        self.finish(json.dumps(data))

def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    handlers = [
        (url_path_join(base_url, "csp-storage", "init_s3_api"), RouteHandler),
        (url_path_join(base_url, "csp-storage", "list_api"), ListHandler)
        ]
    web_app.add_handlers(host_pattern, handlers)
