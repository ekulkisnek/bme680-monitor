# Enable Google Drive API

## ⚠️ Required: Enable Google Drive API

The Google Sheets integration needs the **Google Drive API** enabled in your Google Cloud project.

### Quick Fix:

1. **Go to this URL** (replace with your project ID if different):
   https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=276650116148

2. **Click "Enable"**

3. **Wait 1-2 minutes** for it to propagate

4. **Restart the service**:
   ```bash
   sudo systemctl restart chickencam-bme680.service
   ```

### Why Drive API?

Even though we're only using Sheets, `gspread` needs Drive API scope to:
- List and open spreadsheets
- Access sheet metadata
- Append rows to sheets

This is normal and expected for Google Sheets integration.

### Verify It's Enabled:

After enabling, check logs:
```bash
journalctl -u chickencam-bme680.service -f
```

You should see:
- `✓ Data appended to Google Sheet` (instead of errors)

---

**Once enabled, your sensor will automatically start sending data to Google Sheets!** 🎉



