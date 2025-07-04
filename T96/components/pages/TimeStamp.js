import React from 'react';
import { Text } from 'react-native';
import moment from 'moment';

export default function TimeStamp({ date }) {
  if (!date) return null;

  const formatted = moment(date).fromNow();

  return (
    <Text style={{ color: '#6B7280', fontSize: 12 }}>{formatted}</Text>
  );
}
