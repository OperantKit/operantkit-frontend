// operantkit/apps/operantkit-frontend/types/data.ts

// Enum for different types of experiment events
export enum ExperimentEventType {
  Response = "RESPONSE",
  Reinforcement = "REINFORCEMENT",
  StimulusPresented = "STIMULUS_PRESENTED",
  TrialStart = "TRIAL_START",
  TrialEnd = "TRIAL_END",
  SessionStart = "SESSION_START",
  SessionEnd = "SESSION_END",
}

// Interface for a single experiment event
export interface ExperimentEvent {
  id: string; // Unique ID for the event
  timestamp: number; // Timestamp in milliseconds or seconds since epoch
  type: ExperimentEventType;
  details?: Record<string, any>; // Optional details about the event (e.g., response force, stimulus ID)
}

// Interface for data to be displayed in a generic table
export interface DataTableData {
  id: string; // Unique ID for the row
  [key: string]: any; // Arbitrary key-value pairs for columns
}

// Interface for data points in a Cumulative Record graph
export interface CumulativeRecordData {
  time: number; // Time in seconds/minutes/etc.
  cumulativeResponses: number; // Cumulative number of responses
  // Optionally include other lines like cumulative reinforcements
  cumulativeReinforcements?: number;
}

// Interface for data points in a Response Rate graph
export interface ResponseRateData {
  time: number; // Time in seconds/minutes/etc. (e.g., end of interval)
  responseRate: number; // Responses per minute/hour/etc.
}

// Interface to encapsulate all data for a single experiment session
export interface ExperimentSessionData {
  sessionId: string;
  experimentSettingsId: string; // Link to the settings used for this session
  subjectId: string;
  startTime: number;
  endTime: number;
  events: ExperimentEvent[];
  // Pre-processed data for visualizations (can be generated on demand or stored)
  cumulativeRecord?: CumulativeRecordData[];
  responseRates?: ResponseRateData[];
}

// --- Mock Data Generation Utilities ---

/**
 * Generates mock experiment events.
 * @param durationInSeconds - Total duration of the experiment session in seconds.
 * @param responseRatePerMinute - Average response rate per minute.
 * @param reinforcementRatePerMinute - Average reinforcement rate per minute.
 * @returns Array of mock ExperimentEvent.
 */
export const generateMockEvents = (
  durationInSeconds: number,
  responseRatePerMinute: number,
  reinforcementRatePerMinute: number
): ExperimentEvent[] => {
  const events: ExperimentEvent[] = [];
  const sessionStartTime = Date.now();

  events.push({
    id: `event-${events.length + 1}`,
    timestamp: sessionStartTime,
    type: ExperimentEventType.SessionStart,
  });

  // Generate responses
  const totalResponses = (responseRatePerMinute / 60) * durationInSeconds;
  for (let i = 0; i < totalResponses; i++) {
    const timestampOffset = Math.random() * durationInSeconds * 1000;
    events.push({
      id: `event-${events.length + 1}`,
      timestamp: sessionStartTime + timestampOffset,
      type: ExperimentEventType.Response,
      details: {
        responseNumber: i + 1,
      },
    });
  }

  // Generate reinforcements
  const totalReinforcements = (reinforcementRatePerMinute / 60) * durationInSeconds;
  for (let i = 0; i < totalReinforcements; i++) {
    const timestampOffset = Math.random() * durationInSeconds * 1000;
    events.push({
      id: `event-${events.length + 1}`,
      timestamp: sessionStartTime + timestampOffset,
      type: ExperimentEventType.Reinforcement,
      details: {
        reinforcementNumber: i + 1,
      },
    });
  }

  // Sort events by timestamp
  events.sort((a, b) => a.timestamp - b.timestamp);

  events.push({
    id: `event-${events.length + 1}`,
    timestamp: sessionStartTime + durationInSeconds * 1000,
    type: ExperimentEventType.SessionEnd,
  });

  return events;
};

/**
 * Processes raw events into cumulative record data.
 * @param events - Array of ExperimentEvent.
 * @returns Array of CumulativeRecordData.
 */
export const processForCumulativeRecord = (events: ExperimentEvent[]): CumulativeRecordData[] => {
  const data: CumulativeRecordData[] = [];
  let cumulativeResponses = 0;
  let cumulativeReinforcements = 0;
  const sessionStartTime = events[0]?.timestamp || Date.now();

  // Add an initial point for 0 time, 0 responses
  data.push({ time: 0, cumulativeResponses: 0, cumulativeReinforcements: 0 });

  events.forEach((event) => {
    const timeInSeconds = (event.timestamp - sessionStartTime) / 1000;
    if (event.type === ExperimentEventType.Response) {
      cumulativeResponses++;
      // Only add a point if there's a change or it's the last event
      if (data[data.length - 1]?.cumulativeResponses !== cumulativeResponses || data[data.length - 1]?.time !== timeInSeconds) {
         data.push({ time: timeInSeconds, cumulativeResponses, cumulativeReinforcements });
      }
    } else if (event.type === ExperimentEventType.Reinforcement) {
        cumulativeReinforcements++;
        if (data[data.length - 1]?.cumulativeReinforcements !== cumulativeReinforcements || data[data.length - 1]?.time !== timeInSeconds) {
            data.push({ time: timeInSeconds, cumulativeResponses, cumulativeReinforcements });
        }
    }
  });

  return data;
};

/**
 * Processes raw events into response rate data over intervals.
 * @param events - Array of ExperimentEvent.
 * @param intervalLengthInSeconds - Length of each interval for rate calculation.
 * @returns Array of ResponseRateData.
 */
export const processForResponseRate = (
  events: ExperimentEvent[],
  intervalLengthInSeconds: number = 60
): ResponseRateData[] => {
  const data: ResponseRateData[] = [];
  const sessionStartTime = events[0]?.timestamp || Date.now();
  const sessionEndTime = events[events.length - 1]?.timestamp || sessionStartTime + 1; // Avoid division by zero

  const totalDuration = (sessionEndTime - sessionStartTime) / 1000;
  if (totalDuration <= 0) return [{ time: 0, responseRate: 0 }];

  let currentIntervalResponses = 0;
  let currentIntervalStartTime = sessionStartTime;

  events.forEach((event) => {
    if (event.type === ExperimentEventType.Response) {
      // Check if event falls into the current interval
      if (event.timestamp < currentIntervalStartTime + intervalLengthInSeconds * 1000) {
        currentIntervalResponses++;
      } else {
        // Calculate rate for previous interval
        const intervalEndTime = currentIntervalStartTime + intervalLengthInSeconds * 1000;
        const rate = currentIntervalResponses / (intervalLengthInSeconds / 60); // Responses per minute
        data.push({ time: (intervalEndTime - sessionStartTime) / 1000, responseRate: parseFloat(rate.toFixed(2)) });

        // Move to next interval(s)
        currentIntervalResponses = 0;
        currentIntervalStartTime = intervalEndTime;

        // Handle cases where an event might be several intervals ahead
        while (event.timestamp >= currentIntervalStartTime + intervalLengthInSeconds * 1000) {
          const emptyIntervalEndTime = currentIntervalStartTime + intervalLengthInSeconds * 1000;
          data.push({ time: (emptyIntervalEndTime - sessionStartTime) / 1000, responseRate: 0 });
          currentIntervalStartTime = emptyIntervalEndTime;
        }
        currentIntervalResponses = 1; // This event starts the new interval's count
      }
    }
  });

  // Calculate rate for the last partial or full interval
  if (currentIntervalResponses > 0 || data.length === 0) {
    const lastIntervalDuration = (sessionEndTime - currentIntervalStartTime) / 1000;
    const rate = currentIntervalResponses / (lastIntervalDuration > 0 ? lastIntervalDuration / 60 : intervalLengthInSeconds / 60);
    data.push({ time: (sessionEndTime - sessionStartTime) / 1000, responseRate: parseFloat(rate.toFixed(2)) });
  }


  return data;
};

// --- Sample Mock Data ---
export const mockExperimentSessionData: ExperimentSessionData = (() => {
  const sessionDuration = 600; // 10 minutes
  const avgResponseRate = 20; // responses/min
  const avgReinforcementRate = 2; // reinforcements/min

  const events = generateMockEvents(sessionDuration, avgResponseRate, avgReinforcementRate);
  const cumulativeRecord = processForCumulativeRecord(events);
  const responseRates = processForResponseRate(events, 30); // 30-second intervals

  return {
    sessionId: "mock-session-123",
    experimentSettingsId: "mock-settings-abc",
    subjectId: "MockSubject-01",
    startTime: events[0].timestamp,
    endTime: events[events.length - 1].timestamp,
    events,
    cumulativeRecord,
    responseRates,
  };
})();

// Convert events to DataTableData format (example)
export const mockDataTableData: DataTableData[] = mockExperimentSessionData.events.map((event, index) => ({
    id: event.id,
    "Event Type": event.type,
    Timestamp: new Date(event.timestamp).toLocaleString(),
    Details: JSON.stringify(event.details || {}),
}));
