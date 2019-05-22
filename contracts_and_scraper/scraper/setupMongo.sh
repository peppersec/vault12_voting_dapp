# run mongo
mkdir -p mongodb/
mkdir -p logs/
mongod --port 21999 --bind_ip localhost,$(hostname) --dbpath mongodb/ --smallfiles --oplogSize 128 --fork --logpath logs/mongodb.log
