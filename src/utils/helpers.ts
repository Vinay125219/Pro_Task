import type { MotivationalQuote } from '../types';

export const motivationalQuotes: MotivationalQuote[] = [
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Dream bigger. Do bigger.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Little things make big days.", author: "Unknown" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "Don't wait for opportunity. Create it.", author: "Unknown" },
  { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Unknown" },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
  { text: "Dream it. Believe it. Build it.", author: "Unknown" },
  { text: "What seems impossible today will one day become your warm-up.", author: "Unknown" },
  { text: "Progress, not perfection.", author: "Unknown" }
];

export const getRandomQuote = (): MotivationalQuote => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getTaskStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return '#f39c12';
    case 'in-progress': return '#3498db';
    case 'completed': return '#27ae60';
    default: return '#95a5a6';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return '#e74c3c';
    case 'medium': return '#f39c12';
    case 'low': return '#27ae60';
    default: return '#95a5a6';
  }
};

export const exportData = (data: any, filename: string, format: 'json' | 'csv' = 'json') => {
  if (format === 'json') {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  } else if (format === 'csv') {
    // Convert to CSV format
    const csvContent = convertToCSV(data);
    const csvUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    
    const exportFileDefaultName = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', csvUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
};

const convertToCSV = (data: any[]): string => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};