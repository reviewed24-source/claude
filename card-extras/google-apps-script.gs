/**
 * Endura Pinnacle Vending: lead form receiver
 *
 * When someone fills in "Want a machine at your location?" on the card page,
 * this script adds a row to the Google Sheet it is attached to and emails you.
 *
 * Setup steps are in GUIDE.md, Part 4. The only line you might change is EMAIL_TO.
 */

var EMAIL_TO = "info@endurapinnaclellc.com";
var SHEET_NAME = "Leads";
var FIELDS = ["name", "company", "phone", "email", "people", "note"];

function doPost(e) {
  var p = (e && e.parameter) || {};

  // Spam trap: real people never fill in the hidden "website" box.
  if (p.website) return reply_("success");

  if (!p.name || !(p.phone || p.email)) return reply_("error", "Missing name or contact info");

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet_();
    var row = [new Date()].concat(FIELDS.map(function (f) { return clean_(p[f], 1000); }));
    row.push(clean_(p.page, 300));
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  try {
    var body =
      "New lead from your digital business card\n\n" +
      "Name:     " + (p.name || "") + "\n" +
      "Company:  " + (p.company || "") + "\n" +
      "Phone:    " + (p.phone || "") + "\n" +
      "Email:    " + (p.email || "") + "\n" +
      "People:   " + (p.people || "") + "\n" +
      "Note:     " + (p.note || "") + "\n\n" +
      "All leads: " + SpreadsheetApp.getActiveSpreadsheet().getUrl();
    var options = { name: "Business Card Leads" };
    if (p.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) options.replyTo = p.email;
    MailApp.sendEmail(EMAIL_TO, "New vending lead: " + (p.company || p.name), body, options);
  } catch (err) {
    // The row is already saved, so the visitor still sees "Thank you".
    console.error(err);
  }

  return reply_("success");
}

// Lets you open the web app address in a browser to check that it is live.
function doGet() {
  return reply_("success", "The lead form receiver is running.");
}

// Run this once from the editor to approve permissions and send yourself a test.
function testSetup() {
  doPost({ parameter: {
    name: "Test Person", company: "Test Company", phone: "555 555 5555",
    email: EMAIL_TO, people: "25 to 50", note: "This is a test. You can delete this row."
  }});
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Date", "Name", "Company", "Phone", "Email", "People on site", "Note", "Page"]);
    sheet.setFrozenRows(1);
    sheet.getRange("1:1").setFontWeight("bold");
  }
  return sheet;
}

// Trims long text and stops anything that looks like a spreadsheet formula.
function clean_(value, max) {
  var s = String(value || "").slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply_(result, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: result, message: message || "" }))
    .setMimeType(ContentService.MimeType.JSON);
}
