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

        current_user = getpass.getuser()        
        if current_user == "build":
            STORAGE_PATH = os.path.join("/data", "cloud-storage", "s3",BUCKET_NAME)
        else:
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
                IS_VALID = IS_VALID
        else:
            S3_KEYS.append(STORAGE_PATH)
            for i in range(30):
                S3_KEYS.append("mock/s3path/file" + str(i) + ".txt")
        self.finish(json.dumps(S3_KEYS))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        msg_type = input_data["my_type"]
        global STORAGE_PATH, ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME, IS_VALID, S3_KEYS
        if msg_type == "download":
            index = input_data["index"]         
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
                    IS_VALID = IS_VALID
            else:
                # input_data is a dictionary with a key "name"
                data = {"greetings": "fake download msg for index {0} with key {1}!".format(index, S3_KEYS[index])}
            self.finish(json.dumps(data))
        else:
            upload_src_path = input_data["UPLOAD_FILE_PATH"]
            IS_VALIData = {"greetings": "fake mock upload file {0}!".format(os.path.basename(upload_src_path))}
            self.finish(json.dumps(data))

class ConfigDetailsHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        global ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME, IS_VALID, STORAGE_PATH        
        current_user = getpass.getuser() 
        if current_user == "build":
            CONFIG_PATH = os.path.join("/data", "cloud-storage", "s3")
        else:
            CONFIG_PATH = os.path.join("/home", getpass.getuser(), "cloud-storage", "s3")     
        config_path= os.path.join(CONFIG_PATH,"config.txt")
        containsConfig = False
        if os.path.exists(config_path):
            with open(config_path) as f:
                data = json.load(f)
            ACCESS_KEY_ID = data["ACCESS_KEY_ID"]
            SECRET_ACCESS_KEY = data["SECRET_ACCESS_KEY"]
            BUCKET_NAME = data["BUCKET_NAME"]
            containsConfig = True
            try:
                session = boto3.Session( 
                aws_access_key_id=ACCESS_KEY_ID, 
                aws_secret_access_key=SECRET_ACCESS_KEY)
                s3 = session.resource('s3')
                if s3.Bucket(BUCKET_NAME) in s3.buckets.all():
                    IS_VALID = True
            except ClientError as e:
                IS_VALID = False
            STORAGE_PATH = os.path.join(CONFIG_PATH,BUCKET_NAME)
        else:
            containsConfig = False
            IS_VALID = False
                    
        data = {"isValid":IS_VALID,"containsConfig":containsConfig}
           
        self.finish(json.dumps(data))

   
    @tornado.web.authenticated
    def post(self):        
        input_data = self.get_json_body()
        global ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME, STORAGE_PATH, IS_VALID
        ACCESS_KEY_ID = input_data["ACCESS_KEY_ID"]
        SECRET_ACCESS_KEY = input_data["SECRET_ACCESS_KEY"]
        BUCKET_NAME = input_data["BUCKET_NAME"]
        current_user = getpass.getuser() 
        if current_user == "build":
            CONFIG_PATH = os.path.join("/data", "cloud-storage", "s3")
        else:
            CONFIG_PATH = os.path.join("/home", getpass.getuser(), "cloud-storage", "s3")     
        config_path= os.path.join(CONFIG_PATH,"config.txt")
        os.makedirs(os.path.dirname(config_path), exist_ok=True)
        config_dict = {"ACCESS_KEY_ID":ACCESS_KEY_ID, "SECRET_ACCESS_KEY":SECRET_ACCESS_KEY,"BUCKET_NAME":BUCKET_NAME}
        config_json = json.dumps(config_dict)
        with open(config_path, "w") as f:
            f.write(config_json)
        try:
            
            session = boto3.Session( 
            aws_access_key_id=ACCESS_KEY_ID, 
            aws_secret_access_key=SECRET_ACCESS_KEY)
            s3 = session.resource('s3')
            if s3.Bucket(BUCKET_NAME) in s3.buckets.all():
                IS_VALID = True
        except ClientError as e:
            IS_VALID = False
        STORAGE_PATH = os.path.join(CONFIG_PATH,BUCKET_NAME)
        data = {"isValid":IS_VALID }
        self.finish(json.dumps(data))
    
def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    handlers = [
        (url_path_join(base_url, "csp-storage", "init_s3_api"), RouteHandler),
        (url_path_join(base_url, "csp-storage", "list_api"), ListHandler),
        (url_path_join(base_url, "csp-storage", "config_api"), ConfigDetailsHandler)
        ]
    web_app.add_handlers(host_pattern, handlers)
