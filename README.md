Tvrbo Backup
---

* Sign up on https://console.developers.google.com/apis
* Create a project
* Go to Credentials > Create Credentials > Service Account Key
* Generate a JSON key file
* Put it in the config folder
* Update config/index.js to match your needs

## Notes

* To perform a backup:

```bash
    node . backup  # all configurations
    node . backup db-weekly  # just this configuration
```

* To remove the older backups

```bash
    node . rotate  # all configurations
    node . rotate db-weekly  # just this configuration
```

* To do a backup, you'll need to generate a JSON key with write permissions
* To rotate the stored backups, you'll need a read/write key
