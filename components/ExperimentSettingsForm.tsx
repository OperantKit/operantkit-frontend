'use client';

import React, { useState, useCallback, useEffect } from "react";
import {
  ExperimentSettings,
  ScheduleType,
  ScheduleConfig,
  FixedRatioConfig,
  VariableRatioConfig,
  FixedIntervalConfig,
  VariableIntervalConfig,
  ExtinctionConfig,
  TrialCondition,
  defaultExperimentSettings,
  defaultFixedRatioConfig,
  defaultVariableRatioConfig,
  defaultFixedIntervalConfig,
  defaultVariableIntervalConfig,
  defaultExtinctionConfig,
} from "../types/experiment";
import { useExperimentSettings, saveExperimentSettings } from "../lib/api/client";
import { useSWRConfig } from "swr"; // Import useSWRConfig for mutate

const ExperimentSettingsForm: React.FC = () => {
  const { data, error, isLoading } = useExperimentSettings();
  const { mutate } = useSWRConfig(); // Get the global mutate function
  const [settings, setSettings] = useState<ExperimentSettings>(
    defaultExperimentSettings
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  const validateField = useCallback(
    (
      name: string,
      value: string | number | undefined, // value can be undefined for optional fields
      conditionIndex?: number,
      scheduleParam?: string
    ) => {
      const currentErrors = { ...errors };
      let fieldError = "";

      if (
        (name === "totalTrials" || scheduleParam === "ratio" ||
        scheduleParam === "averageRatio" || scheduleParam === "interval" ||
        scheduleParam === "averageInterval" || name === "duration" ||
        name === "maxResponses")
      ) {
        // Only validate if value is not empty (for optional fields)
        if (value !== undefined && value !== "") {
          const numValue = parseInt(value as string, 10);
          if (isNaN(numValue) || numValue <= 0) {
            fieldError = "Must be a positive number.";
          }
        } else if (name === "totalTrials") { // totalTrials is not optional
           fieldError = "Total trials cannot be empty.";
        }
      }
      if (name === "experimentName" && typeof value === 'string' && value.trim() === "") {
        fieldError = "Experiment name cannot be empty.";
      }
      if (name === "subjectID" && typeof value === 'string' && value.trim() === "") {
        fieldError = "Subject ID cannot be empty.";
      }

      const getErrorKey = (n: string, cIdx?: number, sParam?: string) => {
        if (cIdx !== undefined && sParam) return `trialConditions[${cIdx}].schedule.${sParam}`;
        if (cIdx !== undefined) return `trialConditions[${cIdx}].${n}`;
        return n;
      };

      const key = getErrorKey(name, conditionIndex, scheduleParam);

      if (fieldError) {
        currentErrors[key] = fieldError;
      } else {
        delete currentErrors[key];
      }

      setErrors(currentErrors);
      return !fieldError;
    },
    [errors]
  );

  const handleGeneralChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setSettings((prev) => ({ ...prev, [name]: value }));
      validateField(name, value);
    },
    [validateField]
  );

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const numValue = value === "" ? undefined : parseInt(value, 10); // Handle empty string for optional numbers
      setSettings((prev) => ({ ...prev, [name]: numValue }));
      validateField(name, value);
    },
    [validateField]
  );

  const handleTrialConditionChange = useCallback(
    (
      index: number,
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setSettings((prev) => {
        const newTrialConditions = [...prev.trialConditions];
        if (name === "scheduleType") {
          let newSchedule: ScheduleConfig;
          switch (value as ScheduleType) {
            case ScheduleType.FixedRatio:
              newSchedule = { ...defaultFixedRatioConfig, id: `fr-${index + 1}` };
              break;
            case ScheduleType.VariableRatio:
              newSchedule = { ...defaultVariableRatioConfig, id: `vr-${index + 1}` };
              break;
            case ScheduleType.FixedInterval:
              newSchedule = { ...defaultFixedIntervalConfig, id: `fi-${index + 1}` };
              break;
            case ScheduleType.VariableInterval:
              newSchedule = { ...defaultVariableIntervalConfig, id: `vi-${index + 1}` };
              break;
            case ScheduleType.Extinction:
              newSchedule = { ...defaultExtinctionConfig, id: `ext-${index + 1}` };
              break;
            default:
              newSchedule = { ...defaultFixedRatioConfig, id: `fr-${index + 1}` };
          }
          newTrialConditions[index] = {
            ...newTrialConditions[index],
            schedule: newSchedule,
          };
        } else if (name === "duration" || name === "maxResponses") {
          newTrialConditions[index] = {
            ...newTrialConditions[index],
            [name]: value === "" ? undefined : parseInt(value, 10),
          };
        }
        return { ...prev, trialConditions: newTrialConditions };
      });
      validateField(name, value, index);
    },
    [validateField]
  );

  const handleScheduleParamChange = useCallback(
    (
      conditionIndex: number,
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const { name, value } = e.target;
      setSettings((prev) => {
        const newTrialConditions = [...prev.trialConditions];
        const currentSchedule = newTrialConditions[conditionIndex].schedule;
        let updatedSchedule: ScheduleConfig;

        const numValue = value === "" ? undefined : parseInt(value, 10); // Handle empty string for optional numbers

        if (currentSchedule.type === ScheduleType.FixedRatio) {
          updatedSchedule = { ...currentSchedule, ratio: numValue } as FixedRatioConfig;
        } else if (currentSchedule.type === ScheduleType.VariableRatio) {
          updatedSchedule = { ...currentSchedule, averageRatio: numValue } as VariableRatioConfig;
        } else if (currentSchedule.type === ScheduleType.FixedInterval) {
          updatedSchedule = { ...currentSchedule, interval: numValue } as FixedIntervalConfig;
        } else if (currentSchedule.type === ScheduleType.VariableInterval) {
          updatedSchedule = { ...currentSchedule, averageInterval: numValue } as VariableIntervalConfig;
        } else {
          updatedSchedule = currentSchedule;
        }

        newTrialConditions[conditionIndex] = {
          ...newTrialConditions[conditionIndex],
          schedule: updatedSchedule,
        };
        return { ...prev, trialConditions: newTrialConditions };
      });
      validateField(name, value, conditionIndex, name);
    },
    [validateField]
  );

  const addTrialCondition = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      trialConditions: [
        ...prev.trialConditions,
        {
          id: `trial-${prev.trialConditions.length + 1}`,
          schedule: { ...defaultFixedRatioConfig, id: `fr-${prev.trialConditions.length + 1}` },
          duration: 600,
        },
      ],
    }));
  }, [defaultFixedRatioConfig]);

  const removeTrialCondition = useCallback((index: number) => {
    setSettings((prev) => ({
      ...prev,
      trialConditions: prev.trialConditions.filter((_, i) => i !== index),
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      // Remove errors related to the deleted trial condition
      for (const key in newErrors) {
        if (key.startsWith(`trialConditions[${index}]`)) {
          delete newErrors[key];
        }
      }
      return newErrors;
    });
  }, []);

  const handleSaveProfile = async () => {
    // Perform a final validation of all fields before saving
    let formIsValid = true;
    const newErrors: { [key: string]: string } = {};

    if (settings.experimentName.trim() === "") {
      newErrors.experimentName = "Experiment name cannot be empty.";
      formIsValid = false;
    }
    if (settings.subjectID.trim() === "") {
      newErrors.subjectID = "Subject ID cannot be empty.";
      formIsValid = false;
    }
    if (settings.totalTrials === undefined || isNaN(settings.totalTrials) || settings.totalTrials <= 0) {
      newErrors.totalTrials = "Total trials must be a positive number.";
      formIsValid = false;
    }

    settings.trialConditions.forEach((condition, index) => {
      if (condition.duration !== undefined && (isNaN(condition.duration) || condition.duration <= 0)) {
        newErrors[`trialConditions[${index}].duration`] = "Duration must be a positive number.";
        formIsValid = false;
      }
      if (condition.maxResponses !== undefined && (isNaN(condition.maxResponses) || condition.maxResponses <= 0)) {
        newErrors[`trialConditions[${index}].maxResponses`] = "Max Responses must be a positive number.";
        formIsValid = false;
      }

      const schedule = condition.schedule;
      if (schedule.type === ScheduleType.FixedRatio && ((schedule as FixedRatioConfig).ratio === undefined || isNaN((schedule as FixedRatioConfig).ratio) || (schedule as FixedRatioConfig).ratio <= 0)) {
        newErrors[`trialConditions[${index}].schedule.ratio`] = "Ratio must be a positive number.";
        formIsValid = false;
      } else if (schedule.type === ScheduleType.VariableRatio && ((schedule as VariableRatioConfig).averageRatio === undefined || isNaN((schedule as VariableRatioConfig).averageRatio) || (schedule as VariableRatioConfig).averageRatio <= 0)) {
        newErrors[`trialConditions[${index}].schedule.averageRatio`] = "Average Ratio must be a positive number.";
        formIsValid = false;
      } else if (schedule.type === ScheduleType.FixedInterval && ((schedule as FixedIntervalConfig).interval === undefined || isNaN((schedule as FixedIntervalConfig).interval) || (schedule as FixedIntervalConfig).interval <= 0)) {
        newErrors[`trialConditions[${index}].schedule.interval`] = "Interval must be a positive number.";
        formIsValid = false;
      } else if (schedule.type === ScheduleType.VariableInterval && ((schedule as VariableIntervalConfig).averageInterval === undefined || isNaN((schedule as VariableIntervalConfig).averageInterval) || (schedule as VariableIntervalConfig).averageInterval <= 0)) {
        newErrors[`trialConditions[${index}].schedule.averageInterval`] = "Average Interval must be a positive number.";
        formIsValid = false;
      }
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.keys(newErrors).length > 0 || Object.keys(errors).length > 0 || !formIsValid) {
      console.error("Form has validation errors:", { ...errors, ...newErrors });
      alert("Please correct the errors in the form before saving.");
      return;
    }

    try {
      await saveExperimentSettings(settings);
      mutate('/api/settings'); // Revalidate SWR cache for this key
      alert("Experiment settings saved successfully!");
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      alert(`Failed to save experiment settings: ${err.info?.message || err.message}`);
    }
  };


  if (isLoading) return <div className="text-gray-600 dark:text-gray-400">Loading settings...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">Failed to load settings. {error.message}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Experiment Parameters
      </h2>
      <form className="space-y-6">
        {/* General Experiment Settings */}
        <div>
          <label
            htmlFor="experimentName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Experiment Name
          </label>
          <input
            type="text"
            name="experimentName"
            id="experimentName"
            value={settings.experimentName}
            onChange={handleGeneralChange}
            onBlur={(e) => validateField(e.target.name, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.experimentName && (
            <p className="mt-1 text-sm text-red-600">{errors.experimentName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            value={settings.description || ""}
            onChange={handleGeneralChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={3}
          ></textarea>
        </div>

        <div>
          <label
            htmlFor="totalTrials"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Total Trials
          </label>
          <input
            type="number"
            name="totalTrials"
            id="totalTrials"
            value={settings.totalTrials || ""} // Use "" for undefined to make controlled input happy
            onChange={handleNumberChange}
            onBlur={(e) => validateField(e.target.name, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.totalTrials && (
            <p className="mt-1 text-sm text-red-600">{errors.totalTrials}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="subjectID"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Subject ID
          </label>
          <input
            type="text"
            name="subjectID"
            id="subjectID"
            value={settings.subjectID}
            onChange={handleGeneralChange}
            onBlur={(e) => validateField(e.target.name, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.subjectID && (
            <p className="mt-1 text-sm text-red-600">{errors.subjectID}</p>
          )}
        </div>

        {/* Trial Conditions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Trial Conditions
          </h3>
          {settings.trialConditions.map((condition, index) => (
            <div
              key={condition.id}
              className="border border-gray-200 dark:border-gray-700 p-4 rounded-md mb-4 relative"
            >
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                Trial Condition {index + 1}
              </h4>

              {settings.trialConditions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTrialCondition(index)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="Remove trial condition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={`scheduleType-${index}`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Schedule Type
                  </label>
                  <select
                    name="scheduleType"
                    id={`scheduleType-${index}`}
                    value={condition.schedule.type}
                    onChange={(e) => handleTrialConditionChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {Object.values(ScheduleType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Schedule-specific parameters */}
                {condition.schedule.type === ScheduleType.FixedRatio && (
                  <div>
                    <label
                      htmlFor={`frRatio-${index}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Ratio (FR)
                    </label>
                    <input
                      type="number"
                      name="ratio"
                      id={`frRatio-${index}`}
                      value={(condition.schedule as FixedRatioConfig).ratio || ""}
                      onChange={(e) => handleScheduleParamChange(index, e)}
                      onBlur={(e) => validateField(e.target.name, e.target.value, index, e.target.name)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {errors[`trialConditions[${index}].schedule.ratio`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[`trialConditions[${index}].schedule.ratio`]}
                      </p>
                    )}
                  </div>
                )}

                {condition.schedule.type === ScheduleType.VariableRatio && (
                  <div>
                    <label
                      htmlFor={`vrAverageRatio-${index}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Average Ratio (VR)
                    </label>
                    <input
                      type="number"
                      name="averageRatio"
                      id={`vrAverageRatio-${index}`}
                      value={
                        (condition.schedule as VariableRatioConfig).averageRatio || ""
                      }
                      onChange={(e) => handleScheduleParamChange(index, e)}
                      onBlur={(e) => validateField(e.target.name, e.target.value, index, e.target.name)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {errors[`trialConditions[${index}].schedule.averageRatio`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[`trialConditions[${index}].schedule.averageRatio`]}
                      </p>
                    )}
                  </div>
                )}

                {condition.schedule.type === ScheduleType.FixedInterval && (
                  <div>
                    <label
                      htmlFor={`fiInterval-${index}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Interval (FI, seconds)
                    </label>
                    <input
                      type="number"
                      name="interval"
                      id={`fiInterval-${index}`}
                      value={
                        (condition.schedule as FixedIntervalConfig).interval || ""
                      }
                      onChange={(e) => handleScheduleParamChange(index, e)}
                      onBlur={(e) => validateField(e.target.name, e.target.value, index, e.target.name)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {errors[`trialConditions[${index}].schedule.interval`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[`trialConditions[${index}].schedule.interval`]}
                      </p>
                    )}
                  </div>
                )}

                {condition.schedule.type === ScheduleType.VariableInterval && (
                  <div>
                    <label
                      htmlFor={`viAverageInterval-${index}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Average Interval (VI, seconds)
                    </label>
                    <input
                      type="number"
                      name="averageInterval"
                      id={`viAverageInterval-${index}`}
                      value={
                        (
                          condition.schedule as VariableIntervalConfig
                        ).averageInterval || ""
                      }
                      onChange={(e) => handleScheduleParamChange(index, e)}
                      onBlur={(e) => validateField(e.target.name, e.target.value, index, e.target.name)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {errors[`trialConditions[${index}].schedule.averageInterval`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[`trialConditions[${index}].schedule.averageInterval`]}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label
                    htmlFor={`duration-${index}`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Duration (seconds, optional)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    id={`duration-${index}`}
                    value={condition.duration || ""}
                    onChange={(e) => handleTrialConditionChange(index, e)}
                    onBlur={(e) => validateField(e.target.name, e.target.value, index)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {errors[`trialConditions[${index}].duration`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`trialConditions[${index}].duration`]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`maxResponses-${index}`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Max Responses (optional)
                  </label>
                  <input
                    type="number"
                    name="maxResponses"
                    id={`maxResponses-${index}`}
                    value={condition.maxResponses || ""}
                    onChange={(e) => handleTrialConditionChange(index, e)}
                    onBlur={(e) => validateField(e.target.name, e.target.value, index)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {errors[`trialConditions[${index}].maxResponses`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`trialConditions[${index}].maxResponses`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addTrialCondition}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Add Trial Condition
          </button>
        </div>

        {/* Placeholder for Save/Load Profile buttons */}
        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={handleSaveProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExperimentSettingsForm;