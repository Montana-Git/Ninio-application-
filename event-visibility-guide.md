# Event Visibility Management Guide

This guide explains how to use the new Event Visibility Management feature in the Ninio application.

## Overview

The Event Visibility Manager allows administrators to control which events are visible to parents in their dashboard. This feature is useful for:

- Hiding events that are still in the planning phase
- Controlling the timing of event announcements
- Temporarily hiding events that might be rescheduled
- Managing the number of events shown to parents to avoid overwhelming them

## How to Access the Event Visibility Manager

1. Log in to the admin dashboard
2. Click on the "Events" tab in the main navigation
3. Click the "Manage Event Visibility" button at the top of the page

## Using the Event Visibility Manager

### Viewing Event Visibility Status

The Event Visibility Manager displays a list of all events with the following information:
- Event title
- Date
- Location
- Current visibility status (Visible or Hidden)
- Toggle switch to change visibility

### Changing Event Visibility

To change whether an event is visible to parents:

1. Find the event in the list
2. Toggle the switch in the "Actions" column
   - ON position (right): Event is visible to parents
   - OFF position (left): Event is hidden from parents

The change takes effect immediately. Parents will see or stop seeing the event in their dashboard as soon as they refresh their page or navigate to the events section.

### Refreshing the Data

To ensure you're seeing the most up-to-date information:

1. Click the "Refresh" button in the top-right corner of the Event Visibility Manager
2. The data will be updated and the "Last refreshed" timestamp will change

## How This Affects Parents

- Parents will only see events marked as "Visible" in their dashboard
- When you hide an event, it will no longer appear in any parent's dashboard
- When you make an event visible, it will appear in all parents' dashboards

## Best Practices

- Make events visible at least 2-4 weeks before they occur to give parents time to plan
- Hide events that are tentative or might change significantly
- Consider hiding past events that are no longer relevant
- Use this feature to create a "phased release" of information about major events

## Technical Details

The visibility settings are stored in the database and are applied whenever events are fetched for the parent dashboard. This feature uses a new column called `visible_to_parents` in the events table.
