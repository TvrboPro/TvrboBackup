Tvrbo Backups
---

1) Sign up on https://console.developers.google.com/apis?project=right-side-coffee
2) Create a project
3) Go to Credentials > Create Credentials > Service Account Key
4) Generate a JSON key file
5) Put it in the config folder
6) Update config/index.js to match your needs

***Notes***
* To perform a backup:

    node . backup  # all configurations
    node . backup db-weekly  # just this configuration

* To remove the older backups

    node . rotate  # all configurations
    node . rotate db-weekly  # just this configuration

* To do a backup, you'll need to generate a JSON key with Write permissions
* To rotate the stored backups, you'll need a Read/Write key
