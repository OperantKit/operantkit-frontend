declare module 'ExperimentData' {
  export interface BehaviorEvent {
    timestamp: number; // Unix timestamp or milliseconds since epoch
    type: 'response' | 'reinforcer' | 'stimulus_onset' | 'stimulus_offset';
    value?: any; // Additional data if needed
  }

  export interface Trial {
    trialNumber: number;
    startTime: number; // Timestamp
    endTime: number;   // Timestamp
    responses: number;
    reinforcers: number;
    events: BehaviorEvent[];
    // Other trial-specific metrics
  }

  export interface SessionData {
    sessionId: string;
    experimentId: string;
    participantId: string;
    startTime: number; // Timestamp
    endTime: number;   // Timestamp
    schedule: {
      type: 'FR' | 'VR' | 'FI' | 'VI';
      value: number;
    };
    totalResponses: number;
    totalReinforcers: number;
    trials: Trial[];
    // Raw event log might be too large, but can be a reference to an external log
    // rawEvents?: BehaviorEvent[];
  }

  // Interface for cumulative record chart data
  export interface CumulativeRecordData {
    time: number; // Time point (e.g., seconds from start)
    cumulativeResponses: number;
    cumulativeReinforcers: number;
  }

  // Interface for response rate chart data
  export interface ResponseRateData {
    time: number; // Time point (e.g., minutes or blocks from start)
    responseRate: number; // Responses per unit time
  }
}
