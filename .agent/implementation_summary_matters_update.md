---
title: "Matters Detail View Enhancements"
description: "Added Events and Reports tabs, fixed Billing crash, and verified Document Preview."
type: "implementation_plan"
---

# Matters Detail View Enhancements

## 1. Events Tab
- **Implementation**: Added a new "Events" sub-tab to the Matter Detail view.
- **Logic**: Filters global `events` (passed from `MOCK_DATA.calendar`) by `matterId`.
- **UI**: Displays events as `GlassCards` showing type, date, and title.

## 2. Reports Tab
- **Implementation**: Added a new "Reports" sub-tab.
- **Content**: Moved the "Digital Document Generation" suite (Fee Statement, Summary Report, Engagement Letter, FICA Form) from the Billing tab to this dedicated Reports tab for better organization.
- **UI**: Includes a placeholder for generated report history.

## 3. Billing Tab Fixes
- **Crash Fix**: Added defensive coding `(billingEntries || [])` to prevent the "Black Screen of Death" caused by undefined `billingEntries` during filter/reduce operations.
- **Cleanup**: Removed the document generation buttons (moved to Reports), refocusing the tab on Financial Data (WIP, Trust, Collection).

## 4. Navigation & Layout
- **Horizontal Scrolling**: Ensured the sub-tabs container (`overflow-x-auto`) allows for horizontal scrolling on mobile, with improved gap spacing (`gap-4`).
- **Tab Order**: Updated to `Overview` > `Events` > `Documents` > `Tasks` > `Billing` > `Reports` > `Team Discourse`.

## 5. Document Preview
- **Verification**: Confirmed `DocumentPreviewModal` is correctly instantiated within `MattersPage` and linked to `setPreviewDoc`. Clicking the "Eye" icon or the file row triggers the preview modal, consistent with the main Documents view.
