// Google Apps Script for Coffee and Beans Contact Form
// Setup Instructions:
// 1. Open Google Sheets -> Extensions -> Apps Script
// 2. Paste this code into Code.gs
// 3. Click 'Deploy' -> 'New deployment'
// 4. Select type: 'Web app'
// 5. Set 'Execute as': 'Me'
// 6. Set 'Who has access': 'Anyone'
// 7. Copy the Web App URL and use it in your frontend contact form fetch request.

function doPost(e) {
  try {
    // Open active spreadsheet or specified spreadsheet by ID
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse incoming JSON data or Form parameters
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    // Extract fields
    var timestamp = new Date();
    var name = data.name || "N/A";
    var email = data.email || "N/A";
    var phone = data.phone || "N/A";
    var subject = data.subject || "General Inquiry";
    var message = data.message || "N/A";

    // Append row to Google Sheet
    sheet.appendRow([timestamp, name, email, phone, subject, message]);

    // Send Email Notification to Cafe Admin (Optional)
    var adminEmail = "coffee@gmail.com"; // Change to your destination email
    var emailSubject = "New Contact Form Submission: " + subject;
    var emailBody = "You have received a new contact form message:\n\n" +
                    "Name: " + name + "\n" +
                    "Email: " + email + "\n" +
                    "Phone: " + phone + "\n" +
                    "Subject: " + subject + "\n\n" +
                    "Message:\n" + message + "\n\n" +
                    "Received at: " + timestamp;

    MailApp.sendEmail(adminEmail, emailSubject, emailBody);

    // Return JSON Success Response
    return ContentService.createTextOutput(JSON.stringify({
      "result": "success",
      "message": "Message submitted successfully!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "error": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Coffee & Beans Contact Form Apps Script service is active.");
}
