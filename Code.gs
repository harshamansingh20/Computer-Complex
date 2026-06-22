/*
 * ═══════════════════════════════════════════════════════════════════
 *  DEPLOYMENT INSTRUCTIONS
 * ═══════════════════════════════════════════════════════════════════
 *
 *  1. Open the "Certificate Registry" Google Sheet.
 *  2. Click Extensions → Apps Script.
 *  3. Delete any existing code in the editor.
 *  4. Paste this entire file into Code.gs.
 *  5. Click Deploy → New deployment.
 *  6. Click the gear icon next to "Type" and choose Web app.
 *  7. Set:
 *       Description       : Certificate Verification API  (optional)
 *       Execute as        : Me  (your Google account)
 *       Who has access    : Anyone
 *  8. Click Deploy.
 *  9. Google will ask you to authorise — click "Authorise access" and
 *     sign in with the account that owns the sheet.
 * 10. Copy the Web App URL shown (looks like:
 *       https://script.google.com/macros/s/AKfyc.../exec )
 * 11. Open verify.html and replace 'PASTE_YOUR_DEPLOYED_URL_HERE'
 *     with that URL.
 *
 *  RE-DEPLOYING AFTER CHANGES:
 *  — Go to Deploy → Manage deployments → edit the existing deployment.
 *  — Change "Version" to "New version" and click Deploy.
 *  — The URL stays the same.
 * ═══════════════════════════════════════════════════════════════════
 */

var SHEET_NAME = 'Certificate Registry';

// Column indices (1-based, matching the spec)
var COL_REGNO   = 1;  // A — Registration No
var COL_CERTNO  = 2;  // B — Certificate No
var COL_NAME    = 3;  // C — Student Name
var COL_COURSE  = 4;  // D — Course Name
var COL_DATE    = 5;  // E — Issue Date
var COL_GRADE   = 6;  // F — Grade
var COL_STATUS  = 7;  // G — Status  (Active / Revoked)
// COL_NOTES = 8       H — internal only, never returned

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  var regno  = params.regno  ? params.regno.trim()  : '';
  var certno = params.certno ? params.certno.trim() : '';

  if (!regno && !certno) {
    return respond({ found: false, error: 'No ID provided' });
  }

  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return respond({ found: false, error: 'Sheet not found' });
    }

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return respond({ found: false });
    }

    var data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();

    var match = null;
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var sheetRegno  = String(row[COL_REGNO  - 1]).trim();
      var sheetCertno = String(row[COL_CERTNO - 1]).trim();

      if (regno) {
        if (sheetRegno.toLowerCase() === regno.toLowerCase()) { match = row; break; }
      } else {
        if (sheetCertno.toLowerCase() === certno.toLowerCase()) { match = row; break; }
      }
    }

    if (!match) {
      return respond({ found: false });
    }

    var status = String(match[COL_STATUS - 1]).trim().toLowerCase();

    if (status === 'revoked') {
      return respond({
        found:          true,
        status:         'revoked',
        registrationNo: String(match[COL_REGNO  - 1]).trim(),
        certificateNo:  String(match[COL_CERTNO - 1]).trim()
      });
    }

    return respond({
      found:          true,
      status:         'active',
      registrationNo: String(match[COL_REGNO  - 1]).trim(),
      certificateNo:  String(match[COL_CERTNO - 1]).trim(),
      studentName:    String(match[COL_NAME   - 1]).trim(),
      course:         String(match[COL_COURSE - 1]).trim(),
      issueDate:      String(match[COL_DATE   - 1]).trim(),
      grade:          String(match[COL_GRADE  - 1]).trim()
    });

  } catch (err) {
    return respond({ found: false, error: 'Server error: ' + err.message });
  }
}

function respond(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
