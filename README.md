# Financial Lab

## OFX/QFX to CSV

Some accounts can export OFX/QFX but do not have a Quicken license, therefore cannot be imported.  
By converting to Mint's CSV format, there is no license check stopping one from importing.

```
$ node ofx-to-csv.js --file ~/Downloads/file.qfx
```
The command above will generate a `~/Downloads/file.csv` file that can be imported.