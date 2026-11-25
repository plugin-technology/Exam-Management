export const getExamStatus = (exam) => {
  if (!exam) return 'INACTIVE';
  if (exam.status) return exam.status;
  if (exam.isActive === false) return 'INACTIVE';

  const now = new Date();
  
  if (exam.startTime) {
    const start = new Date(exam.startTime);
    if (!isNaN(start.getTime()) && now < start) {
      return 'UPCOMING';
    }
  }

  if (exam.endTime) {
    const end = new Date(exam.endTime);
    if (!isNaN(end.getTime()) && now > end) {
      return 'CONCLUDED';
    }
  }

  return 'LIVE';
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatTime = (seconds) => {
  if (seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const calculatePercentage = (score, total) => {
  if (total === 0) return 0;
  return ((score / total) * 100).toFixed(2);
};
