import logging
import boto3
from botocore.exceptions import ClientError
import os
import getpass
import json


ACCESS_KEY_ID = "AKIASPKNH26OPA4B6QG4"
SECRET_ACCESS_KEY = "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"
BUCKET_NAME = "ojastestbk1"
STORAGE_PATH = ""
S3_KEYS = []

# US West (Oregon) us-west-2
# ojastestbk1


def list_bucket():
    try:
        # Retrieve the list of existing buckets
        session = boto3.Session(
            aws_access_key_id=ACCESS_KEY_ID,
            aws_secret_access_key=SECRET_ACCESS_KEY)

        s3 = session.resource('s3')
        my_bucket = s3.Bucket(BUCKET_NAME)
        S3_KEYS.clear()
        # Output the bucket names
        for my_bucket_object in my_bucket.objects.all():
            print(my_bucket_object.key)
            S3_KEYS.append(my_bucket_object.key)

    except ClientError as e:
        logging.error(e)
        return False
    return True


def on_login():
    # get 3 creds
    # get uID
    STORAGE_PATH = os.path.join(
        "/home", getpass.getuser(), "cloud-storage", "s3", BUCKET_NAME)
    # create directory for uID
    isExist = os.path.exists(STORAGE_PATH)
    if not isExist:
        os.makedirs(STORAGE_PATH)
    # mock list
    s3Keys = []
    s3Keys.append("t1")
    s3Keys.append("t2")
    s3Keys.append("t3")
    jsonString = json.dumps(STORAGE_PATH)
    print(jsonString)
    return True


def is_valid_creds():
    try:
        # Retrieve the list of existing buckets
        session = boto3.Session(
            aws_access_key_id=ACCESS_KEY_ID,
            aws_secret_access_key=SECRET_ACCESS_KEY)

        s3 = session.resource('s3')
        if s3.Bucket(BUCKET_NAME) in s3.buckets.all():
            return True
    except ClientError as e:
        logging.error(e)
        return False
    return True


def download_file(key):
    try:
        # Retrieve the list of existing buckets
        session = boto3.Session(
            aws_access_key_id=ACCESS_KEY_ID,
            aws_secret_access_key=SECRET_ACCESS_KEY)

        s3 = session.resource('s3')
        my_bucket = s3.Bucket(BUCKET_NAME)
        STORAGE_PATH = os.path.join(
            "/home", getpass.getuser(), "cloud-storage", "s3", BUCKET_NAME)
        # create directory for uID
        isExist = os.path.exists(STORAGE_PATH)
        if not isExist:
            os.makedirs(STORAGE_PATH)

        path, filename = os.path.split(key)
        devcloud_file_path = os.path.join(STORAGE_PATH, filename)
        my_bucket.download_file(key, devcloud_file_path)
        print(devcloud_file_path)
    except ClientError as e:
        logging.error(e)
        return False
    return True


def upload_file():
    upload_src_path = "/home/ojjsaw/jupyter-explore/csp_storage/tsconfig.json"
    upload_dest_path = "https://ojastestbk1.s3.us-west-2.amazonaws.com/dir2/dir2file1.txt.txt"

    try:
        # Retrieve the list of existing buckets
        session = boto3.Session(
            aws_access_key_id=ACCESS_KEY_ID,
            aws_secret_access_key=SECRET_ACCESS_KEY)

        s3 = session.resource('s3')
        my_bucket = s3.Bucket(BUCKET_NAME)
        # create directory for uID
        isExist = os.path.exists(upload_src_path)
        if isExist:
            object_name = os.path.basename(upload_src_path)
            s3.meta.client.upload_file(upload_src_path, BUCKET_NAME, object_name)
            #my_bucket.upload_file(upload_src_path, BUCKET_NAME, object_name)

    except ClientError as e:
        logging.error(e)
        return False
    return True

# print(is_valid_creds())

print(list_bucket())
# on_login()
# download_file("dir2/dir2file1.txt.txt")
# upload_file()