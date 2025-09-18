/**
 * NEW GOOGLE APPS SCRIPT WEBHOOK - FRESH DEPLOYMENT
 * 
 * Instructions:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Delete all default code
 * 4. Paste this entire script
 * 5. Save the project
 * 6. Deploy as "New version" with "Execute as: Me" and "Who has access: Anyone"
 * 7. Copy the new webhook URL and update mrd-brain-system.js
 */

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Handle different data types
    if (data.type === 'mrd_single_submit') {
      // Form submission data
      const submission = data.submission;
      
      // Prepare row data for all 16 columns
      const rowData = [
        submission.timestamp || new Date().toISOString(),
        submission.page_source || 'unknown',
        submission.name || '',
        submission.email || '',
        submission.phone || '',
        submission.course_interest || submission.service_interest || '',
        submission.message || '',
        'New',
        '0h',
        'Form submission',
        Date.now(),
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        submission.form_id || 'unknown',
        submission.session_id || 'unknown',
        '', // Column 15
        ''  // Column 16
      ];
      
      // Append to sheet
      sheet.appendRow(rowData);
      
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Form submission recorded successfully',
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (data.type === 'mrd_analytics') {
      // Analytics data
      const analytics = data.analytics;
      
      // Prepare row data for analytics sheet
      const rowData = [
        analytics.timestamp || new Date().toISOString(),
        analytics.event_type || 'unknown',
        analytics.session_id || 'unknown',
        analytics.page || 'unknown',
        analytics.user_agent || 'unknown',
        analytics.screen_size || 'unknown',
        analytics.referrer || '',
        JSON.stringify(analytics.event_data || {}),
        'Analytics Log',
        Date.now(),
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        '', // Column 12
        '', // Column 13
        '', // Column 14
        '', // Column 15
        ''  // Column 16
      ];
      
      // Append to sheet
      sheet.appendRow(rowData);
      
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Analytics data recorded successfully',
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Unknown data type
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Unknown data type: ' + data.type
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Error handling
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error processing request: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'MRD Webhook is working!',
      timestamp: new Date().toISOString(),
      method: 'GET'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
