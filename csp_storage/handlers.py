import json
from json import JSONEncoder

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado

import numpy
import getpass
import os

ACCESS_KEY_ID = ""
SECRET_ACCESS_KEY = ""
BUCKET_NAME = ""
STORAGE_PATH = ""
S3_KEYS = []

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
        global STORAGE_PATH, ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME
        ACCESS_KEY_ID = input_data["ACCESS_KEY_ID"]
        SECRET_ACCESS_KEY = input_data["SECRET_ACCESS_KEY"]
        BUCKET_NAME = input_data["BUCKET_NAME"]
        STORAGE_PATH = os.path.join("/home", getpass.getuser(), "cloud-storage", "s3",BUCKET_NAME)
        data = {"greetings": "Test full user Path {} with bucketname!".format(STORAGE_PATH)}
        self.finish(json.dumps(data))

class ListHandler(APIHandler):

    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        global S3_KEYS
        S3_KEYS.clear()
        S3_KEYS.append("mytest/path/t1.txt")
        S3_KEYS.append("someother/path/t2/")
        S3_KEYS.append("somepath/to/t3.txt")
        S3_KEYS.append(STORAGE_PATH)
        self.finish(json.dumps(S3_KEYS))

    @tornado.web.authenticated
    def post(self):
        global S3_KEYS
        # input_data is a dictionary with a key "name"
        input_data = self.get_json_body()
        index = input_data["index"]
        data = {"greetings": "Downlinding index {0} with key {1}!".format(index, S3_KEYS[index])}
        self.finish(json.dumps(data))

def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    handlers = [
        (url_path_join(base_url, "csp-storage", "init_s3_api"), RouteHandler),
        (url_path_join(base_url, "csp-storage", "list_api"), ListHandler)
        ]
    web_app.add_handlers(host_pattern, handlers)
