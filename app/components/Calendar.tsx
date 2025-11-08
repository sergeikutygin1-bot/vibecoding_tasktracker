"use client";

import { Task, Priority } from "@/types";

interface CalendarProps {
  tasks: Task[];
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
}

export default function Calendar({ tasks, selectedDate, onDateSelect }: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth());
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get tasks for a specific date (excluding completed tasks)
  const getTasksForDate = (day: number): Task[] => {
    const dateStr = formatDate(currentYear, currentMonth, day);
    return tasks.filter(task => task.dueDate === dateStr && !task.completed);
  };

  // Calculate total time cost for a specific day in minutes
  const calculateDailyTime = (day: number): number => {
    const tasksForDay = getTasksForDate(day);
    return tasksForDay.reduce((total, task) => {
      return total + (task.timeCost ?? 30); // Default to 30 if undefined
    }, 0);
  };

  // Check if daily time exceeds 5 hours (300 minutes)
  const isOverTimeLimit = (day: number): boolean => {
    return calculateDailyTime(day) > 300;
  };

  // Get priority color for dots
  const getPriorityDotColor = (priority?: Priority): string => {
    switch (priority) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const formatDate = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (day: number): boolean => {
    const todayDate = new Date();
    return day === todayDate.getDate() &&
           currentMonth === todayDate.getMonth() &&
           currentYear === todayDate.getFullYear();
  };

  const isSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return selectedDate === formatDate(currentYear, currentMonth, day);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const dateStr = formatDate(currentYear, currentMonth, day);
    // Toggle selection: if clicking the same date, deselect it
    onDateSelect(selectedDate === dateStr ? null : dateStr);
  };

  // Generate calendar days
  const calendarDays = [];

  // Empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const tasksForDay = getTasksForDate(day);
    const isCurrentDay = isToday(day);
    const isSelectedDay = isSelected(day);
    const overLimit = isOverTimeLimit(day);

    calendarDays.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`
          aspect-square p-1 rounded-lg text-sm font-medium transition-all
          focus:outline-none focus:ring-2 focus:ring-cyan-500
          ${overLimit
            ? 'bg-red-100 text-red-800 hover:bg-red-200'
            : isCurrentDay
              ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-50'
              : 'text-slate-700 hover:bg-cyan-50'
          }
          ${isSelectedDay ? 'ring-2 ring-cyan-500' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <span>{day}</span>
          {tasksForDay.length > 0 && (
            <div className="flex gap-0.5 mt-0.5">
              {tasksForDay.slice(0, 3).map((task, index) => (
                <div
                  key={index}
                  className={`w-1 h-1 rounded-full ${getPriorityDotColor(task.priority)}`}
                />
              ))}
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-md h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Next month"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays}
      </div>

      {/* Legend */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Showing tasks for <span className="font-medium text-cyan-600">{selectedDate}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// Import React at the top
import React from "react";
