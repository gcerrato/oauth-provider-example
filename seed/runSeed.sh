mongoimport --host mongodb -c clients -d oauth seed/client.json
mongoimport --host mongodb -c users -d oauth seed/user.json
