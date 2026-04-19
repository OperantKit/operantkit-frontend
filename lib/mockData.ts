import { SessionData, BehaviorEvent, CumulativeRecordData, ResponseRateData, Trial } from '../types/data.d';

// Helper to generate a random number within a range
const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate mock behavior events for a trial
const generateMockEvents = (startTime: number, endTime: number, numResponses: number, numReinforcers: number): BehaviorEvent[] => {
  const events: BehaviorEvent[] = [];
  const duration = endTime - startTime;

  for (let i = 0; i < numResponses; i++) {
    events.push({
      timestamp: startTime + getRandomInt(0, duration),
      type: 'response',
    });
  }

  for (let i = 0; i < numReinforcers; i++) {
    events.push({
      timestamp: startTime + getRandomInt(0, duration),
      type: 'reinforcer',
      value: 'food pellet'
    });
  }

  // Add some stimulus events
  events.push({ timestamp: startTime, type: 'stimulus_onset', value: 'light' });
  events.push({ timestamp: endTime, type: 'stimulus_offset', value: 'light' });

  events.sort((a, b) => a.timestamp - b.timestamp);
  return events;
};

// Generate mock session data
export const generateMockSessionData = (
  sessionId: string,
  experimentId: string,
  participantId: string,
  scheduleType: SessionData['schedule']['type'],
  scheduleValue: number,
  numTrials: number,
  sessionDurationMinutes: number
): SessionData => {
  const startTime = Date.now() - (sessionDurationMinutes * 60 * 1000); // Start some time ago
  const endTime = Date.now();
  const sessionDurationMs = endTime - startTime;

  const trials: Trial[] = [];
  let totalResponses = 0;
  let totalReinforcers = 0;

  for (let i = 0; i < numTrials; i++) {
    const trialStartTime = startTime + (i * sessionDurationMs / numTrials);
    const trialEndTime = startTime + ((i + 1) * sessionDurationMs / numTrials);
    const numResponses = getRandomInt(5, 20); // Random responses per trial
    const numReinforcers = getRandomInt(0, Math.floor(numResponses / scheduleValue)); // Simplified reinforcers

    totalResponses += numResponses;
    totalReinforcers += numReinforcers;

    trials.push({
      trialNumber: i + 1,
      startTime: trialStartTime,
      endTime: trialEndTime,
      responses: numResponses,
      reinforcers: numReinforcers,
      events: generateMockEvents(trialStartTime, trialEndTime, numResponses, numReinforcers),
    });
  }

  return {
    sessionId,
    experimentId,
    participantId,
    startTime,
    endTime,
    schedule: { type: scheduleType, value: scheduleValue },
    totalResponses,
    totalReinforcers,
    trials,
  };
};

// Generate mock data for Cumulative Record Chart
export const generateCumulativeRecordData = (session: SessionData): CumulativeRecordData[] => {
  const data: CumulativeRecordData[] = [];
  let cumulativeResponses = 0;
  let cumulativeReinforcers = 0;

  // Initial point at time 0
  data.push({ time: 0, cumulativeResponses: 0, cumulativeReinforcers: 0 });

  session.trials.forEach(trial => {
    trial.events.forEach(event => {
      const timeInSeconds = Math.floor((event.timestamp - session.startTime) / 1000);
      if (event.type === 'response') {
        cumulativeResponses++;
      } else if (event.type === 'reinforcer') {
        cumulativeReinforcers++;
      }
      // Add a data point only if cumulative values change
      if (data.length === 0 || data[data.length - 1].cumulativeResponses !== cumulativeResponses || data[data.length - 1].cumulativeReinforcers !== cumulativeReinforcers) {
         data.push({ time: timeInSeconds, cumulativeResponses, cumulativeReinforcers });
      } else {
        // Update the timestamp of the last point if only time changes without a new event type
        data[data.length - 1].time = timeInSeconds;
      }
    });
  });

  // Ensure the last point is at the end of the session
  const lastTime = Math.floor((session.endTime - session.startTime) / 1000);
  if (data[data.length - 1]?.time !== lastTime) {
      data.push({ time: lastTime, cumulativeResponses, cumulativeReinforcers });
  }


  return data;
};

// Generate mock data for Response Rate Chart
export const generateResponseRateData = (session: SessionData, timeIntervalMinutes: number = 1): ResponseRateData[] => {
  const data: ResponseRateData[] = [];
  const sessionDurationSeconds = (session.endTime - session.startTime) / 1000;
  const timeIntervalSeconds = timeIntervalMinutes * 60;

  let currentIntervalResponses = 0;
  let currentIntervalStartTime = session.startTime;

  // Ensure session.rawEvents is available for processing
  const allEvents = session.trials.flatMap(trial => trial.events).sort((a, b) => a.timestamp - b.timestamp);


  allEvents.forEach(event => {
    if (event.type === 'response') {
      // Check if event falls into the current interval
      while (event.timestamp >= currentIntervalStartTime + timeIntervalSeconds * 1000) {
        // Calculate response rate for the past interval
        data.push({
          time: Math.floor((currentIntervalStartTime - session.startTime) / 1000 / 60) + timeIntervalMinutes,
          responseRate: currentIntervalResponses / timeIntervalMinutes,
        });
        currentIntervalStartTime += timeIntervalSeconds * 1000;
        currentIntervalResponses = 0; // Reset for next interval
      }
      currentIntervalResponses++;
    }
  });

  // Add the last interval if any responses are left
  if (currentIntervalResponses > 0 || data.length === 0) {
    data.push({
      time: Math.floor((currentIntervalStartTime - session.startTime) / 1000 / 60) + timeIntervalMinutes,
      responseRate: currentIntervalResponses / timeIntervalMinutes,
    });
  }

  return data;
};

// Example usage:
export const mockSession = generateMockSessionData('s1', 'exp1', 'p1', 'FR', 5, 20, 60);

export const mockCumulativeRecordData = generateCumulativeRecordData(mockSession);
export const mockResponseRateData = generateResponseRateData(mockSession, 5); // 5-minute intervals
