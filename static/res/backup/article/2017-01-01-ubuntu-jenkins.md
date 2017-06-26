- Download

[download](https://jenkins.io/index.html) jenkies

- Copy it into tomcat

```
cp jenkins.war ~/tool/tomcat/tomcat9/webapps/
```

- Rename it as ```ROOT.war```

```
mv jenkins.war ROOT.war
```

- Start tomcat

```
./startup.sh
```

- init

```
vi /home/hbb/.jenkins/secrets/initialAdminPassword
```

put the content into index of jenkies

- plugins

```
scp all_plugin.zip hbb@192.168.2.108:/home/hbb/.jenkins/plugins/
```

