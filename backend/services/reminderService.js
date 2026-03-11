const cron = require('node-cron');
const Task = require('../models/Task');
const admin = require('firebase-admin');

/**
 * Validates tasks that are due soon and triggers push notifications.
 * Currently uses a simple hourly check placeholder.
 */
const startReminderJob = () => {
  // Check every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running task reminder cron job...');
      const pendingTasks = await Task.find({ status: 'pending' });
      
      const now = new Date();
      // Pseudo logic: check if task.time string approximately matches the current hour
      // For a production app we'd parse the time strictly into Dates.
      const currentHourStr = now.getHours().toString();

      pendingTasks.forEach(task => {
        // Mock matching logic: 
        // e.g., task.time contains "9:00 AM" and current hour is 9
        if (task.time.includes(currentHourStr)) {
          triggerPushNotification(task);
        }
      });
    } catch (error) {
      console.error('Error running reminder cron job:', error.message);
    }
  });

  console.log('Reminder cron job initialized.');
};

const triggerPushNotification = async (task) => {
  console.log(`[PUSH NOTIFICATION] Reminder: You have a scheduled task: "${task.title}" at ${task.time}.`);
  
  if (task.fcmToken && admin.apps.length > 0) {
    const message = {
      notification: {
        title: `Reminder: ${task.title}`,
        body: task.researchSummary ? task.researchSummary : `Scheduled for ${task.time}`
      },
      token: task.fcmToken
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  } else {
    console.log('Firebase not initialized or no FCM token available for this task.');
  }
};

module.exports = { startReminderJob };
