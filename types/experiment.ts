// Enum for different schedule types
export enum ScheduleType {
  FixedRatio = "FR",
  VariableRatio = "VR",
  FixedInterval = "FI",
  VariableInterval = "VI",
  Extinction = "EXT", // Added Extinction for completeness
}

// Base interface for all schedule configurations
interface BaseScheduleConfig {
  type: ScheduleType;
  id: string; // Unique identifier for the schedule instance
}

// Specific configurations for each schedule type
export interface FixedRatioConfig extends BaseScheduleConfig {
  type: ScheduleType.FixedRatio;
  ratio: number; // Number of responses required
}

export interface VariableRatioConfig extends BaseScheduleConfig {
  type: ScheduleType.VariableRatio;
  averageRatio: number; // Average number of responses required
}

export interface FixedIntervalConfig extends BaseScheduleConfig {
  type: ScheduleType.FixedInterval;
  interval: number; // Fixed time interval in seconds
}

export interface VariableIntervalConfig extends BaseScheduleConfig {
  type: ScheduleType.VariableInterval;
  averageInterval: number; // Average time interval in seconds
}

export interface ExtinctionConfig extends BaseScheduleConfig {
  type: ScheduleType.Extinction;
  // No specific parameters for extinction, but can be added if needed (e.g., duration)
}

// Union type for all possible schedule configurations
export type ScheduleConfig =
  | FixedRatioConfig
  | VariableRatioConfig
  | FixedIntervalConfig
  | VariableIntervalConfig
  | ExtinctionConfig;

// Interface for a single experiment trial condition
export interface TrialCondition {
  id: string; // Unique ID for the trial condition
  schedule: ScheduleConfig;
  duration?: number; // Optional duration for the trial in seconds
  maxResponses?: number; // Optional max responses for the trial
  stimuli?: string[]; // Optional list of stimuli presented
}

// Main interface for overall experiment settings
export interface ExperimentSettings {
  experimentName: string;
  description?: string;
  totalTrials: number;
  subjectID: string;
  trialConditions: TrialCondition[];
  // Add other global experiment parameters as needed
  // For example:
  // sessionDuration?: number; // Total session duration
  // reinforcementMagnitude?: number; // Magnitude of reinforcer
}

// Default values for initial form state
export const defaultFixedRatioConfig: FixedRatioConfig = {
  id: "fr-1",
  type: ScheduleType.FixedRatio,
  ratio: 10,
};

export const defaultVariableRatioConfig: VariableRatioConfig = {
  id: "vr-1",
  type: ScheduleType.VariableRatio,
  averageRatio: 20,
};

export const defaultFixedIntervalConfig: FixedIntervalConfig = {
  id: "fi-1",
  type: ScheduleType.FixedInterval,
  interval: 30, // seconds
};

export const defaultVariableIntervalConfig: VariableIntervalConfig = {
  id: "vi-1",
  type: ScheduleType.VariableInterval,
  averageInterval: 60, // seconds
};

export const defaultExtinctionConfig: ExtinctionConfig = {
  id: "ext-1",
  type: ScheduleType.Extinction,
};

export const defaultTrialCondition: TrialCondition = {
  id: "trial-1",
  schedule: defaultFixedRatioConfig,
  duration: 600, // 10 minutes
};

export const defaultExperimentSettings: ExperimentSettings = {
  experimentName: "New Experiment",
  totalTrials: 100,
  subjectID: "Subject-001",
  trialConditions: [defaultTrialCondition],
};
