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
        numpyArrayOne = numpy.array([[11, 22, 33], [44, 55, 66], [77, 88, 99]])
        numpyData = {"array": numpyArrayOne}
        encodedNumpyData = json.dumps(numpyData, cls=NumpyArrayEncoder)
        self.finish(encodedNumpyData)

    @tornado.web.authenticated
    def post(self):
        # input_data is a dictionary with a key "name"
        input_data = self.get_json_body()
        ACCESS_KEY_ID = input_data["ACCESS_KEY_ID"]
        SECRET_ACCESS_KEY = input_data["SECRET_ACCESS_KEY"]
        BUCKET_NAME = input_data["BUCKET_NAME"]
        STORAGE_PATH = os.path.join("/home", getpass.getuser(), "cloud-storage", "s3",BUCKET_NAME)
        data = {"greetings": "Test full user Path {} with bucketname!".format(STORAGE_PATH)}

        s3Keys = []
        s3Keys.append("mytest/path/t1.txt")
        s3Keys.append("someother/path/t2/")
        s3Keys.append("somepath/to/t3.txt")
        s3Keys.append(STORAGE_PATH)
        self.finish(json.dumps(s3Keys))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "csp-storage", "get_example")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
