##For sqlalch

# You hackers out there, I'm going to change this! 
# What are you thinking? 
# Why haven't I deleted this from the repo yet? IDKKKKK
import os 
basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    SECRET_KEY="F9A722B3231A"
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'ROOM.db')

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    