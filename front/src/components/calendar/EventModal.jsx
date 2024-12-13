import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';

const EventModal = ({ event, open, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      // 날짜와 시간 분리
      const start = new Date(event.start);
      const end = new Date(event.end);

      setStartDate(start.toISOString().split('T')[0]);
      setStartTime(start.toISOString().split('T')[1].substring(0, 5));
      setEndDate(end.toISOString().split('T')[0]);
      setEndTime(end.toISOString().split('T')[1].substring(0, 5));
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedEvent = {
      ...event,
      title,
      start: new Date(`${startDate}T${startTime}`),
      end: new Date(`${endDate}T${endTime}`)
    };
    onUpdate(updatedEvent);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('이 일정을 삭제하시겠습니까?')) {
      onDelete(event.id);
      onClose();
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>일정 상세</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="일정 제목"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <TextField
                label="시작 날짜"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </div>
            <div>
              <TextField
                label="시작 시간"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </div>
            <div>
              <TextField
                label="종료 날짜"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </div>
            <div>
              <TextField
                label="종료 시간"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} color="error">
            삭제
          </Button>
          <Button onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventModal;