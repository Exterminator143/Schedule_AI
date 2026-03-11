const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const aiService = require('../services/aiService');
const researchService = require('../services/researchService');

// Create a new task manually
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update FCM Token for push notifications (simulating global token but attaching to tasks)
router.post('/register-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    // Update all pending tasks with the newest token for testing purposes
    await Task.updateMany({ status: 'pending' }, { fcmToken: token });
    
    res.json({ message: 'Token registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create tasks from AI-generated schedule input
router.post('/parse-schedule', async (req, res) => {
  try {
    const { scheduleText } = req.body;
    if (!scheduleText) return res.status(400).json({ error: 'Schedule text is required' });

    // Parse the unstructured text into structured tasks
    const parsedTasks = await aiService.parseSchedule(scheduleText);
    
    // Save all tasks to database
    const savedTasks = await Task.insertMany(parsedTasks);
    
    // Trigger background research for tasks with keywords
    savedTasks.forEach(task => {
      if (task.keyword) {
        researchService.enrichTaskWithResearch(task._id, task.keyword);
      }
    });

    res.status(201).json({ message: 'Schedule parsed and tasks created', tasks: savedTasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily stats and streak
router.get('/stats', async (req, res) => {
  console.log("Stats endpoint hit!");
  try {
    const tasks = await Task.find();
    
    // Calculate simple streak (mock logic: counts unique days any task was completed)
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const uniqueDays = new Set(completedTasks.map(t => {
      const d = new Date(t.updatedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }));
    const streak = uniqueDays.size;

    res.json({ streak });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate AI Daily Summary
router.get('/daily-summary', async (req, res) => {
  try {
    // In production we'd filter for just today's tasks
    const completedTasks = await Task.find({ status: 'completed' });
    const summary = await aiService.generateDailySummary(completedTasks);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI task suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const completedTasks = await Task.find({ status: 'completed' });
    const suggestions = await aiService.suggestFutureTasks(completedTasks);
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
